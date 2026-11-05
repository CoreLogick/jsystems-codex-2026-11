# Codex na Windows: ustawienia użytkownika i kursu

## 1. Ustaw konfigurację użytkownika

Otwórz **zwykły PowerShell Windows**. Znajdź plik używany przez Codex:

```powershell
if ($env:CODEX_HOME) {
    $codexSettings = Join-Path $env:CODEX_HOME 'config.toml'
} else {
    $codexSettings = Join-Path $env:USERPROFILE '.codex/config.toml'
}
notepad $codexSettings
```

Na VM prowadzącego jest to `D:\AI\labuser\.codex\config.toml`. Zrób kopię pliku przed edycją. **Scal poniższe wpisy z istniejącym plikiem**; zachowaj pozostałe ustawienia i nie dodawaj drugiej tabeli `[windows]` ani `[features]`.

```toml
# Przykład do demonstracji: wyłącza lokalny sandbox. Pozostaw zakomentowany.
# sandbox_mode = "danger-full-access"

# Normalny sandbox i automatyczny recenzent próśb o dodatkowy dostęp.
default_permissions = ":workspace"
approval_policy = "on-request"
approvals_reviewer = "auto_review"

[windows]
sandbox = "elevated"

[features]
prefer_mxc = false
```

Zakomentuj inne aktywne `sandbox_mode` i usuń aktywną tabelę `[sandbox_workspace_write]`, jeśli przechodzisz na ten system profili. Nie łącz obu systemów konfiguracji. `prefer_mxc = false` wraz z wyborem `elevated` ustawia kursowy wariant Windows. Polityka administratora lub jawne nadpisanie ustawień nadal może mieć wyższy priorytet.

## 2. Zrestartuj serwer i rozpocznij nową rozmowę

Zakończ zadania agentów i zamknij interfejsy Codex. Restart serwera rozłącza wszystkie korzystające z niego sesje tego użytkownika. W zwykłym PowerShellu, w katalogu swojego repozytorium, wykonaj kolejno:

```powershell
codex app-server daemon restart
codex app-server daemon version
$env:Path = "$env:APPDATA\npm;$env:Path"
codex
```

Sprawdź, czy restart się udał. Wiersz z PATH udostępnia zainstalowany Playwright CLI w tym oknie i uruchamianym z niego Codexie; nie instaluje narzędzia. Uruchom nową rozmowę, aby sprawdzić nowe domyślne ustawienia. Wznowiona rozmowa może przywrócić zapisany profil. Nie używaj `--no-daemon` w standardowym teście kursu.

Po aktualizacji **samego CLI**, gdy chcesz użyć tej samej wersji serwera, wykonaj przed restartem `codex app-server daemon update --from-cli` i zatwierdź zastąpienie pakietu. Nie potrzeba tego po zwykłej edycji konfiguracji. Komendy sprawdzono w pomocy CLI 0.166.0. W TUI alternatywą jest `/daemon` i **Restart background server**.

## 3. Wybierz, gdzie ma obowiązywać profil kursowy

- **Tylko w repozytorium kursowym:** pozostaw globalne `default_permissions = ":workspace"`. Zaufana konfiguracja `.codex/config.toml` tego repozytorium wybiera `course-tools` i definiuje profil oraz reguły w `.codex/rules/course.rules`.
- **Dla wszystkich swoich projektów:** scal definicje `[permissions]` z [permissions.toml](permissions.toml) albo [config.toml](config.toml) do konfiguracji użytkownika. Następnie ustaw w niej `default_permissions = "course-tools"` i skopiuj przejrzany [rules/course.rules](rules/course.rules) do `$CODEX_HOME/rules/course.rules` (domyślnie `~/.codex/rules/course.rules`). Reguły będą wtedy obowiązywać użytkownika w innych projektach. Konfiguracja konkretnego projektu może wybrać inny profil.

Samo wpisanie nazwy `course-tools` globalnie nie wystarczy: definicja profilu musi być dostępna również poza repozytorium kursu. Nie kopiuj całego pliku na istniejącą konfigurację bez przejrzenia; scal potrzebne sekcje. Pełny przykład zawiera też opcjonalne modele i MCP.

## 4. Sprawdź działanie

W nowej sesji sprawdź `/permissions`, `/status` i `/mcp`. W repozytorium kursowym oczekujemy `course-tools` i połączenia Context7. Profil plików/sieci i recenzent zgód są oddzielnymi ustawieniami: kombinacja `on-request` + `auto_review` włącza „Approve for me” także z własnym profilem.

Poproś agenta kolejno o:
1. Context7: `resolve-library-id` dla Tailwind CSS, potem `query-docs` przez zwrócony identyfikator.
2. `gh repo view OWNER/REPO --json name` dla swojego repozytorium.
3. Osobne `playwright-cli open about:blank --browser=chrome --headed`, `playwright-cli snapshot`, `playwright-cli close`.

W tym teście użyj domyślnej sesji Playwright i komendy przed opcjami, aby pasowała reguła prefiksu. Jeśli narzędzie nie działa, przekaż prowadzącemu komendę i niesekretny błąd. 401 z sandboxa nie oznacza automatycznie wylogowania użytkownika. Nie drukuj tokenów ani całego środowiska.

## Jak to działa

Sandbox ogranicza zwykłe polecenia. `:workspace` pozwala zapisywać w workspace i katalogach tymczasowych. `course-tools` dodatkowo włącza sieć i nie dodaje OS-owych blokad odczytu .env/secrets: używaj go wyłącznie na syntetycznych danych kursowych. Lista domen nie ogranicza bezpośrednich połączeń bez aktywnego proxy sieciowego.

Reguły `allow` pozwalają wskazanym odczytowym poleceniom gh oraz Playwright open/snapshot/close działać **poza sandboxem**, z uprawnieniami użytkownika Windows. To daje im dostęp do logowania i przeglądarki. Prefiks open nie ogranicza URL. Inne działania podlegają zwykłej polityce; `prompt` trafia do recenzenta, a `forbidden` blokuje. Auto-review nie recenzuje każdej dozwolonej komendy.

| Profil | Zastosowanie |
|---|---|
| `course-tools` | Domyślny w kursowym repo: edycja, sieć, wyjątki hostowe z reguł; bez deny-read sekretów. |
| `course-workspace` | Ścisła edycja: blokady wskazanych .env/secrets; może ograniczać eskalację hostową. |
| `course-root` | Alias zgodności dla course-workspace; bez dodatkowych uprawnień. |
| `course-review` | Workspace tylko do odczytu; ścisłe blokady; temp zapisywalne. |
| `course-docs` | Jak review, lecz docs/ można edytować. |
| `course-jetbrains` | Opcjonalny przykład listy domen; wymaga osobno aktywnego proxy, aby ją egzekwować. |

„Low integrity” to etykieta ograniczeń procesu Windows. Zwykły PowerShell zwykle ma poziom medium, administrator high, a low ogranicza m.in. zapis do zasobów zwykłych aplikacji. To nie jest komunikat o uszkodzeniu programu. AppContainer nakłada dodatkowe ograniczenia; sam poziom low nie rozstrzyga przyczyny błędu narzędzia.

WezTerm jest opcjonalnym terminalem. Nie wybiera sandboxa. Nie wykonano tu testu jego działania ani porównania stabilności.

Szczegóły i wyniki pomiarów: [raport dla agentów](../../Research/codex-windows-sandbox-compatibility-2026-11-05.md). Źródła: [profile](https://learn.chatgpt.com/docs/permissions), [Auto-review](https://learn.chatgpt.com/docs/sandboxing/auto-review), [Windows](https://learn.chatgpt.com/docs/windows/windows-sandbox), [reguły](https://learn.chatgpt.com/docs/agent-configuration/rules).
