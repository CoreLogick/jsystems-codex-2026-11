# Windows: start kursu i diagnostyka Codex (instrukcja dla uczestników)

## Zrób to podczas kursu — krok po kroku

1. **Używaj PowerShella w Windows**, w katalogu swojego forka. Na czas ćwiczeń nie przełączaj środowiska między Windows, WSL i zdalnym kontenerem: każda z tych lokalizacji ma osobny system plików, logowanie `gh`, przeglądarkę i konfigurację Codex.
2. **Zaktualizuj `main` swojego forka** zgodnie z instrukcją prowadzącego, a potem pracuj na własnej gałęzi. Nie kopiuj całego `config.toml` do ustawień globalnych. Konfiguracja projektu `.codex/config.toml` ma już profil `course-tools` jako domyślny.
3. **Po zmianie konfiguracji zrestartuj również serwer działający w tle.** Zakończ aktywne zadania i zamknij interfejsy Codex korzystające z tego samego serwera. Restart rozłącza także inne sesje i agentów tego użytkownika. W zwykłym PowerShellu Windows, poza poleceniami wykonywanymi przez agenta, przejdź do katalogu swojego repozytorium i uruchom kolejno:

   ```powershell
   $env:Path = "$env:APPDATA\npm;$env:Path"
   codex app-server daemon restart
   codex app-server daemon version
   codex
   ```

   Sprawdź, czy restart zakończył się powodzeniem, zanim uruchomisz następne polecenie. Pierwszy wiersz udostępnia zainstalowany Playwright CLI tylko temu oknu PowerShell i jego procesom potomnym. Ostatni wiersz uruchamia **nową sesję** ze zwykłym daemonem. Do sprawdzenia nowych ustawień nie wybieraj wznowienia starej rozmowy, która może przywrócić zapisany profil uprawnień. Zaufaj projektowi po przejrzeniu jego konfiguracji: lokalne reguły projektu wymagają zaufanej warstwy konfiguracji. Samo zamknięcie TUI nie zatrzymuje serwera. Flaga `--no-daemon` pomija serwer i służy do osobnego testu diagnostycznego; nie jest standardowym sposobem startu kursu.

4. **Sprawdź aktywną konfigurację** w Codex: `/permissions` i `/status`; opcjonalnie w PowerShellu `codex doctor --all`. Oczekujemy `course-tools`, Windows `elevated`, `prefer_mxc = false`, `approval_policy = on-request`. Wynik `doctor` opisuje konfigurację/diagnostykę, a nie dowodzi sam w sobie, że każde polecenie działa na hoście.
5. **Korzystaj domyślnie z profilu `course-tools`.** Daje zapis w workspace i publiczny dostęp sieciowy zgodny z profilem `:workspace`; umożliwia kwalifikujące się eskalacje do narzędzi Windows. Reguły `allow` uruchamiają pasujące odczytowe komendy `gh` oraz podstawowe `playwright-cli open`, `snapshot` i `close` poza sandboxem, z dostępem hostowego użytkownika. Zwykłe polecenia nadal podlegają sandboxowi. Zmiany w GitHubie, API, logowanie, merge, publish i dowolny kod przeglądarki nie są tymi wyjątkami.
6. **Jeśli potrzebujesz dokumentacji bibliotek, używaj Context7 najpierw.** Wybierz identyfikator biblioteki przez `resolve-library-id`, następnie pobierz potrzebne strony przez `query-docs`. W ustawieniach kursu jest zdalny serwer Context7 bez wymaganego klucza. Jeśli serwer nie pojawia się po ponownym uruchomieniu Codex, sprawdź `/mcp`, sieć i komunikat startowy; nie wklejaj klucza do repozytorium.
7. **Sprawdź GitHub CLI w PowerShellu** (read-only): `gh auth status`, potem `gh repo view OWNER/REPO`. Nie drukuj tokena, nie uruchamiaj `gh auth token` i nie wklejaj wyniku zawierającego dane konta do promptu. `gh auth status` sprawdza logowanie, a `gh repo view` sprawdza dostęp do konkretnego repozytorium.
8. **Sprawdź Playwright CLI** na pustej stronie, z własną nazwą sesji, np. `course-demo-<inicjały>`:

   ```powershell
   $pw = Join-Path $env:APPDATA 'npm/playwright-cli.cmd'
   & $pw -s=course-demo open about:blank --browser=chrome --headed
   & $pw -s=course-demo snapshot
   & $pw -s=course-demo close
   ```

   Test używa własnej sesji i nie zmienia profilu Chrome. Jeśli `playwright-cli` nie jest zainstalowany, pomiń test i poproś prowadzącego o sprawdzenie środowiska; nie instaluj narzędzi globalnie bez instrukcji.
9. **W Codex sprawdź Playwright w domyślnej sesji CLI:** uruchom osobno polecenia playwright-cli open about:blank --browser=chrome --headed, playwright-cli snapshot i playwright-cli close. Nie dodawaj opcji -s w tym teście, aby dopasować wąską regułę poleceń. Poza Codex możesz używać własnego identyfikatora sesji jak w kroku 8.
10. **W Codex rób odczytowe testy narzędzi.** Reguły pozwalają na ograniczone polecenia. Gdy Windows prosi o zgodę na eskalację, sprawdź dokładne polecenie i zatwierdź je tylko wtedy, gdy rozumiesz jego skutek. Przy odmowie sandboxa nie obchodź jej przez `--dangerously-bypass-approvals-and-sandbox`, `--yolo`, `approval_policy = "never"` ani usuwanie reguł.
11. **Jeśli któryś test nie działa:** zanotuj komendę, exit code, wersję Codex (`codex --version`), aktywny profil i niesekretny komunikat błędu. Nie wysyłaj tokenów, pełnego środowiska, prywatnych ścieżek ani danych klienta. Przekaż te informacje prowadzącemu.
12. **Pracuj wyłącznie na syntetycznych danych.** Nie twórz prawdziwych kluczy w repozytorium. Profile `course-root` i `course-workspace` są dostępne jako bardziej restrykcyjne warianty do ćwiczeń: można uruchomić nową sesję z `codex -c 'default_permissions="course-root"'`, ale wtedy odczyty chronionych plików są blokowane i eskalacja do hostowych narzędzi może się nie powieść.

## Co to oznacza i dlaczego

### Profile

| Profil | Zastosowanie | Skutek |
|---|---|---|
| `course-tools` (domyślny) | Codzienna praca na warsztacie Windows | Workspace-write, publiczna sieć oraz możliwość wąskiej eskalacji hostowej; brak OS-owych reguł deny-read dla `.env`/`secrets`. |
| `course-workspace` | Profil ścisły | Zapis w workspace i temp, sieć włączona; blokady odczytu wskazanych plików .env i katalogów secrets. W zmierzonym teście pełna eskalacja hostowa nie wystartowała. |
| `course-root` | Alias zgodności | Dokładnie ten sam profil co course-workspace; nie daje dodatkowej ochrony. |
| `course-review` | Przegląd kodu | Workspace tylko do odczytu; dziedziczone blokady sekretów. Katalogi tymczasowe pozostają zapisywalne. |
| `course-docs` | Praca nad dokumentacją | Jak course-review, ale docs/ można edytować; temp nadal zapisywalne. |
| `course-jetbrains` | Opcjonalny przykład sieciowy | Zapis w workspace i blokady sekretów; lista dwóch domen działa tylko przy aktywnym proxy sieciowym. Proxy nie jest włączane przez kursową konfigurację projektu. |

Domyślny profil jest kompromisem kursowym, nie granicą do pracy z produkcyjnymi sekretami. Nie umieszczaj sekretów w repozytorium ani nie dodawaj ich do promptów. Reguły poleceń ograniczają konkretne wzorce, a nie wszystkie możliwe warianty składni czy skrypty. Kwalifikująca się eskalacja może uruchomić dozwolone narzędzie jako interaktywny użytkownik Windows, więc może użyć jego logowania i przeglądarki. Nie zatwierdzaj nieznanych skryptów.


### Profil course-tools i „Approve for me”

To dwa niezależne ustawienia. Profil wybiera granice plików i sieci; recenzent zgód decyduje, kto ocenia prośby o dodatkowy dostęp. Kursowa konfiguracja ma jednocześnie:

```toml
default_permissions = "course-tools"
approval_policy = "on-request"
approvals_reviewer = "auto_review"
```

Ta kombinacja w CLI włącza automatycznego recenzenta przy własnym profilu uprawnień. Sam napis course-tools w menu /permissions nie dowodzi wyłączenia auto-review. Zmiana profilu i wybór gotowego trybu w interfejsie mogą zmienić ustawienia rozmowy; jeśli masz wątpliwość, sprawdź efektywną konfigurację bieżącej rozmowy, nie tylko plik na dysku. Wznowiona rozmowa lub polityka administratora może mieć inne wartości.

- Zwykła dozwolona praca w sandboxie nie potrzebuje dodatkowej recenzji.
- Pasująca reguła allow już zezwala na określone polecenie poza sandboxem; nie wywołuje recenzenta przy każdym użyciu.
- Reguła prompt lub kwalifikująca się prośba o eskalację trafia do auto-review.
- Reguła forbidden nadal blokuje polecenie. Auto-review nie przyznaje dowolnego dostępu i może odmówić działania.

Automatyczny recenzent nie zastępuje wyraźnej zgody prowadzącego, jeśli zadanie wymaga jej przed publikacją na main. [Oficjalne ustawienia Auto-review](https://learn.chatgpt.com/docs/sandboxing/auto-review).

### Co oznacza „low integrity”

Windows przypisuje procesom poziomy uprawnień. Zwykły PowerShell zwykle ma poziom „medium”, a uruchomiony jako administrator „high”. „Low” oznacza dodatkowe ograniczenie: taki proces nie może normalnie zmieniać zasobów oznaczonych wyższym poziomem, np. plików zwykłych aplikacji. To etykieta ochrony systemowej, a nie ocena jakości programu ani informacja o awarii. AppContainer dodaje własne ograniczenia do tego poziomu. Sam odczyt „low” nie dowodzi, dlaczego gh nie widzi logowania lub dlaczego Chrome nie startuje; te zachowania trzeba sprawdzić osobno. [Opis Microsoft](https://learn.microsoft.com/en-us/windows/win32/secauthz/mandatory-integrity-control).

### Restart, aktualizacja i sprawdzenie serwera

Komendy powyżej sprawdzono w pomocy zainstalowanego Codex CLI 0.166.0. Alternatywa w otwartym TUI: wpisz `/daemon` i wybierz **Restart background server**. Interfejs ostrzega o pracy, którą restart może przerwać. [Dokumentacja Codex](https://learn.chatgpt.com/docs/developer-commands).

Jeśli komenda restartu zwróci błąd, zapisz niesekretny komunikat. Możesz wykonać osobno `codex app-server daemon stop`, następnie `codex app-server daemon start` i ponownie `codex app-server daemon version`. Nie używaj zbiorczego zabijania wszystkich procesów node.exe/codex.exe. Jeżeli serwer nadal nie startuje, przekaż błąd prowadzącemu.

Po **aktualizacji samego CLI** pakiet serwera może wymagać wyrównania do wersji CLI. W zwykłym PowerShellu, po zakończeniu zadań, wykonaj:

```powershell
codex app-server daemon update --from-cli
codex app-server daemon restart
codex app-server daemon version
```

`--from-cli` kopiuje i przypina pakiet serwera z obecnie zainstalowanego CLI; sprawdź pytanie o zastąpienie pakietu. Tego kroku nie potrzeba po zwykłej edycji config.toml lub pliku .rules. Polecenie `version` wypisuje wersje CLI i działającego serwera. Zgodne wersje nie dowodzą jeszcze poprawności profilu: po uruchomieniu nowej sesji sprawdź `/permissions`, `/status` i `/mcp` oraz testy narzędzi z instrukcji.

Restart uruchamia ponownie proces serwera; sam w sobie nie gwarantuje, że użyto oczekiwanej konfiguracji. Zaufanie do projektu, zapisane ustawienia wznowionej rozmowy i polityka administratora nadal mogą wpływać na wynik. Reguły pozwalające narzędziom działać poza sandboxem są opisane w [dokumentacji reguł](https://learn.chatgpt.com/docs/agent-configuration/rules).

### Jak czytać wynik testu

`codex doctor`, nazwa backendu i reguła `allow` nie są dowodem, że proces działa poza kontenerem. Test diagnostyczny sprawdza token procesu (`AppContainer`, token ograniczony i poziom integralności), syntetyczny plik, `gh`, Context7 i osobną sesję Playwright. Test nie czyta sekretów ani nie zmienia globalnej konfiguracji. Raport nie zapisuje surowych outputów narzędzi ani tokenów.

W dniu 5.11.2026 test wykonany poza Codex przez PowerShell potwierdził: hostowe `gh`, Context7 i osobne polecenia Playwright `open/snapshot/close` zadziałały. Rzeczywista eskalacja Codex z tymczasowym profilem workspace bez deny-read wykonała te same pięć prób na hoście, a profil `course-root` zakończył się `sandbox_setup_failed` przed uruchomieniem poleceń. To dowód dla tej maszyny i wersji, nie twierdzenie, że MXC zawsze zawodzi. Testy backendów w poprzednim raporcie miały dodatkowe confoundery (m.in. tymczasowy katalog i profil sieci); odczytaj pełny [raport badawczy](../../Research/codex-windows-sandbox-compatibility-2026-11-05.md).

### GitHub, Context7 i Playwright

- Narzędzia hostowe dziedziczą sesję Windows i mogą widzieć jej logowanie `gh`; środowisko sandboxa może nie widzieć Windows Credential Managera. Dostęp zależy również od repozytorium, token scope, polityki organizacji i sieci.
- Context7 jest osobnym zdalnym MCP, a nie wyszukiwarką web ani poleceniem `gh`. Jest włączony w konfiguracji kursowej. Najpierw rozwiązuj nazwę biblioteki na dokładny Context7 library ID, potem pytaj o konkretne API.
- Playwright CLI działa w osobnych poleceniach połączonych identyfikatorem sesji. MCP Playwright pozostaje wyłączony. Wyjątki allow nie obejmują run-code, upload ani dowolnych skryptów. Prefiks open nie ogranicza adresu URL: pozwala otworzyć także inne strony. Reguły są dopasowaniem prefiksów poleceń, a nie pełnym firewallem.

### WezTerm

WezTerm jest opcjonalnym emulatorem terminala. Nie wybiera sandboxa i nie naprawia dostępu do poświadczeń, Chrome, sieci, MCP ani procesów potomnych. Test tej maszyny nie wykrył `wezterm` na `PATH`, więc nie ma tu potwierdzonego wyniku działania ani porównania stabilności. Na kursie używaj PowerShella i terminala dostarczonego na VM. Informacje o WezTerm w materiale są orientacyjne; instalację i konfigurację testuj osobno po kursie.

## Po kursie

Jeśli potrzebujesz własnego profilu, skopiuj tylko wybrane ustawienia do `~/.codex/config.toml`, zweryfikuj dokumentację dla aktualnej wersji Codex i przetestuj konfigurację na repozytorium bez sekretów. Nie kopiuj domyślnego `course-tools` do pracy z wrażliwym kodem bez świadomej oceny konsekwencji braku deny-read. Dla pracy z sekretami wybierz udokumentowany profil, który egzekwuje deny-read, i zaakceptuj, że dostęp do narzędzi hostowych może wtedy wymagać innej, osobno sprawdzonej architektury.
