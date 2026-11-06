# Podsumowanie - dzień 2, 5 listopada 2026

## Przegląd

Drugi dzień otwartego szkolenia JSystems z Codex, prowadzonego przez Łukasza Matuszewskiego, koncentrował się na praktycznej pracy z agentem: konfiguracji środowiska, dostępie do GitHub, korzystaniu ze skills, automatyzacji przeglądarki oraz przygotowaniu specyfikacji i planu aplikacji. Zajęcia prowadzono na maszynach wirtualnych.

Przykładem projektowym był syntetyczny proof of concept aplikacji do zgłaszania zwrotów i reklamacji elektroniki. Praca obejmowała doprecyzowanie wymagań, analizę materiałów, przygotowanie dokumentacji i planowanie implementacji.

### Kluczowe koncepcje i pytania

Główne pojęcia porządkowały sześć obszarów pracy:

- Personalizacja i pamięć agenta: gdzie przechowywać instrukcje i jak dobierać ich zakres?
- Sandbox i uwierzytelnianie: jak umożliwić potrzebne operacje bez niepotrzebnego rozszerzania dostępu?
- Skills: jak instalować, uruchamiać i sprawdzać instrukcje oraz narzędzia pochodzące z zewnętrznych repozytoriów?
- Automatyzacja przeglądarki: jak obserwować działania agenta i kontrolować dostęp do zalogowanych sesji?
- Spec Driven Development, PRD i ADR: jak oddzielić wymagania produktu od decyzji technicznych i planu wykonania?
- Context7 i dokumentacja: skąd agent powinien pobierać aktualne informacje o używanych narzędziach?

## Temat 1: Konfiguracja agenta, personalizacja i obsługa środowiska

### Instrukcje i pamięć

Omówiono instrukcje na poziomie użytkownika, projektu, konta i organizacji oraz różnicę między informacjami zapisanymi lokalnie a ustawieniami powiązanymi z kontem. W pracy projektowej znaczenie ma zakres instrukcji i ich położenie względem katalogu roboczego. Instrukcje projektu nie zastępują nadrzędnych ograniczeń bezpieczeństwa. Zakres ustawień zależy od używanego klienta i sesji.

Dla Codex używano nazwy `AGENTS.md`; wspomniano również o `CLAUDE.md` w kontekście innych agentów. Dokumenty ładowane do kontekstu powinny zawierać informacje potrzebne w danym środowisku, a nie rozbudowane opisy technologii, które model już zna. Na przykładzie instrukcji dotyczących GitHub CLI i Tailwind pokazano potrzebę skracania zbędnych zapisów oraz usuwania szczegółów z niewłaściwego poziomu konfiguracji.

Preferowany styl odpowiedzi był zwięzły, swobodny, ale profesjonalny: krótkie instrukcje krok po kroku, bez powtarzania treści, z odróżnianiem opinii od faktów i otwartym wskazywaniem niewiedzy. Zalecono niski poziom szczegółowości odpowiedzi. W podejściu do kodu podkreślono YAGNI i KISS oraz unikanie zbędnych abstrakcji, zależności i implementacji.

### Środowisko, głos i narzędzia pomocnicze

Checklista konfiguracji obejmowała Windows i WSL, wybór terminala między PowerShell, Git Bash i WSL oraz ustawienia języka, głosu i słownika własnych wyrażeń.

Wskazano polecenia diagnostyczne i aktualizacyjne:

```text
codex doctor
codex update
```

Pokazywano także wyszukiwanie, transkrypcję i pracę w zewnętrznym edytorze. Skróty i polecenia używane podczas zajęć obejmowały:

- `/resume`: powrót do wcześniejszych sesji.
- `Ctrl+Shift+P`: wyszukiwanie w aplikacji desktopowej.
- Dwukrotne `Esc`: wejście w pokazywany tryb transkrypcji; kolejne `Esc` pozwalało z niego wyjść.
- `Esc`: zatrzymanie pracy agenta w zwykłym trybie interakcji.
- `Ctrl+G`: otwarcie promptu w skonfigurowanym edytorze.
- `Ctrl+W`: usunięcie słowa podczas edycji wejścia.
- `Enter`: sterowanie bieżącą pracą agenta, określane jako steer mode.
- `Tab`: dodanie wiadomości do kolejki.
- `Shift` ze strzałką w górę lub w dół: zmiana poziomu rozumowania w pokazywanym interfejsie.

Jako prosty edytor terminalowy przedstawiono `micro` oraz konfigurację edytora przez zmienną `$EDITOR`. W pokazie używano sekwencji `Ctrl+G`, `Ctrl+V`, `Ctrl+S`, `Ctrl+Q` do otwarcia, wklejenia, zapisania i zamknięcia edytowanego promptu. Skróty należy odnosić do konkretnej aplikacji i jej wersji.

Materiały:

- Micro: https://micro-editor.github.io/
- Przykład konfiguracji Bash i edytora: https://github.com/LucasMatuszewski/jsystems-codex-2026-11/blob/main/course-materials/agent-configs/.bashrc-agents
- ChatGPT, wskazany przy pracy z ustawieniami i narzędziami: https://chatgpt.com/
- Tmux, wspomniany jako narzędzie terminalowe: https://github.com/tmux/tmux/wiki

## Temat 2: GitHub CLI, uprawnienia i sandbox

### Przygotowanie dostępu do repozytorium

Na maszynach wirtualnych używano GitHub CLI, czyli `gh`. Pokazano uwierzytelnianie poleceniem:

```text
gh auth login
```

Nacisk położono na ograniczanie uprawnień do potrzebnych repozytoriów i operacji, z wykorzystaniem fine-grained personal access token oraz odpowiedniego terminu wygaśnięcia. Pokazywano dostęp tylko do odczytu i dostęp umożliwiający zapis. Sam wybór logowania przez przeglądarkę albo terminal nie określa pełnego zakresu uprawnień; znaczenie mają przyznane zgody i sposób udostępnienia poświadczeń agentowi.

W konfiguracji szkoleniowej wskazano następujące uprawnienia:

- Actions: odczyt.
- Variables: odczyt i zapis.
- Contents: odczyt i zapis.
- Metadata: odczyt.
- Pull requests: odczyt i zapis.

Pokazano ustawienie protokołu Git:

```text
gh config set -h github.com git_protocol https
```

Zadania obejmowały sprawdzenie dostępu agenta do `gh`, konfigurację danych autora commitów na podstawie informacji dostępnych w GitHub CLI oraz sklonowanie repozytorium szkoleniowego na dysk D. Docelowy katalog używany w późniejszych ćwiczeniach to:

```text
D:\jsystems-codex-2026-11
```

Wspomniano `git worktree` jako mechanizm rozdzielania katalogów roboczych. Pojawił się również przykład pozostawiania pushowania po stronie człowieka, aby ograniczyć ryzyko nadpisania ręcznych zmian przez agenta.

### Diagnostyka dostępu z sandboxa

Podczas ćwiczeń występowały problemy z dostępem do poświadczeń i wykonywaniem operacji GitHub z sandboxa. Rozważano uprawnienia wykonania, dostęp do magazynu poświadczeń, sieć oraz wyjątki dla ograniczonych operacji. Nie każdy komunikat o nieprawidłowym tokenie oznaczał ten sam problem. Zgłaszano również odmowę dostępu z Windows Credential Manager oraz niemożność wykonania push i utworzenia pull requestu.

Uruchomienie z rozszerzonym dostępem pomogło w jednym z ćwiczeń, lecz później nadal pojawiały się trudności z GitHub.

W demonstracjach używano między innymi:

```text
codex -C D:\jsystems-codex-2026-11 --sandbox danger-full-access --ask-for-approval on-request --no-daemon
```

Pokazano też wariant bez `--no-daemon`. Tryb `danger-full-access` był przedstawiany jako wariant bez ochrony sandboxa, wymagający świadomej oceny ryzyka, a nie jako domyślna konfiguracja do codziennej pracy.

W przykładach konfiguracji pojawiły się zapisy:

```toml
sandbox_mode = "danger-full-access"
```

oraz, osobno, ustawienie dostępu do sieci dla trybu zapisu w workspace:

```toml
[sandbox_workspace_write]
network_access = true
```

Są to różne aspekty konfiguracji. Dostęp do sieci nie jest tym samym co dostęp do poświadczeń, a wpis w `AGENTS.md` nie zastępuje technicznych ustawień uprawnień. W instrukcjach wspólnych wystarcza krótka informacja, że `gh` jest dostępny i uwierzytelniony, bez szczegółowego opisywania całej procedury.

Przy zarządzaniu projektem pokazano również tryb powłoki `!` i przykład polecenia:

```text
! git push origin app-implementation
```

## Temat 3: Skills, bezpieczeństwo i ekonomia tokenów

### Instalacja i używanie skills

Skills przedstawiono jako pakiety instrukcji i materiałów opisujących sposób wykonania określonego zadania. Mogą zawierać pliki Markdown, dodatkowe referencje i skrypty. Agent może wybierać je na podstawie opisu zastosowania albo otrzymać jawne polecenie użycia.

Rozróżniono instalację na poziomie użytkownika i projektu. Skills projektowe ułatwiają współdzielenie sposobu pracy w zespole. Przy korzystaniu z różnych agentów trzeba sprawdzić obsługiwany format, narzędzia i wymagania danego skilla; przenośność instrukcji nie oznacza identycznego działania każdego środowiska.

Pokazano wyszukiwarkę i narzędzie instalacyjne skills.sh oraz polecenia:

```text
npx skills add https://github.com/dietrichgebert/ponytail --skill ponytail
npx --yes skills@latest add EdukeyTeam/agent-toolbox
```

Jawne wywołanie ilustrowano zapisem `$nazwa-skilla`, między innymi `$create-design-system`, `$write-prd` i `$write-adr`.

### Caveman, Ponytail i własne instrukcje

Caveman służy do zwięzłego formułowania odpowiedzi agenta. Ponytail przedstawiono jako zestaw zasad sprzyjających prostym rozwiązaniom i ograniczaniu zbędnego kodu oraz zależności. Deklarowane oszczędności zależą od zadania i sposobu pomiaru.

Publiczne skills mogą wymagać dopasowania do własnego procesu. Wskazano możliwość tworzenia własnych wariantów na podstawie istniejących materiałów. Repozytorium prowadzącego obejmowało między innymi pracę z dużymi i starszymi bazami kodu oraz obsługę code review i odpowiedzi na komentarze w pull requestach.

### Audyt bezpieczeństwa

Poruszono ryzyko prompt injection, odczytu plików z sekretami i wykonywania działań niezgodnych z zamiarem użytkownika. Zaproponowano analizę całego repozytorium skryptami wyszukującymi charakterystyczne elementy, zamiast osobnego czytania każdego pliku. Taki audyt jest pomocą w wykrywaniu ryzyka, a nie dowodem jego całkowitego braku.

Zgłoszono wstępny przykład, w którym trzy z pięciu analizowanych publicznych skills miały odczytywać `.env` zawierający token. Była to obserwacja dotycząca konkretnej próby, nie statystyka dla całego ekosystemu. Zadano także pytanie o narzędzia do skanowania bezpieczeństwa skills, w tym rozwiązania NVIDIA.

Materiały dotyczące skills:

- Wyszukiwarka: https://www.skills.sh/
- Caveman: https://github.com/juliusbrussee/caveman
- Caveman w katalogu skills: https://www.skills.sh/juliusbrussee/caveman/caveman
- Ponytail: https://github.com/dietrichgebert/ponytail
- Ponytail w katalogu skills: https://www.skills.sh/dietrichgebert/ponytail/ponytail
- Repozytorium prowadzącego: https://github.com/EdukeyTeam/agent-toolbox
- Katalog jego skills: https://www.skills.sh/edukeyteam/agent-toolbox
- Praca ze starszą bazą kodu: https://github.com/EdukeyTeam/agent-toolbox/tree/main/skills/legacy-codebase-workflows

Wskazano także materiały do samodzielnego sprawdzenia, bez utożsamiania ich z przeprowadzeniem osobnych ćwiczeń z każdej metody:

- Pytania oparte na dokumentacji: https://www.skills.sh/mattpocock/skills/grill-with-docs
- TDD: https://www.skills.sh/mattpocock/skills/tdd
- Frontend design: https://www.skills.sh/anthropics/skills/frontend-design
- DDD: https://www.skills.sh/codewithmukesh/dotnet-claude-kit/ddd

## Temat 4: Playwright, Chrome DevTools i wydobywanie design systemu

Ćwiczenie z `$create-design-system` dotyczyło analizy istniejącej strony jako podstawy do przygotowania spójnego interfejsu. Jako stronę referencyjną użyto x-kom:

```text
$create-design-system https://www.x-kom.pl/ użyj Playwright i pokaż widoczny Chrome
```

Istotne było pokazanie okna przeglądarki, aby można było obserwować działania agenta. Omawiano Playwright, rozszerzenie przeglądarkowe, Chrome DevTools oraz Computer Use. Narzędzia te nie są tożsame: automatyzacja strony, sterowanie przez narzędzia deweloperskie i obsługa pulpitu mogą mieć różne wymagania i zakres dostępu.

Rozdzielono sposób wyświetlania przeglądarki, wybór profilu i uprawnienia procesu. Headless nie oznacza automatycznie wyłączenia sandboxa, a widoczne okno nie jest samo w sobie gwarancją bezpieczeństwa. Korzystanie z profilu zawierającego zalogowane sesje zwiększa konsekwencje ewentualnych niepożądanych działań. Odradzano eksperymentowanie z automatyzacją na kontach bankowych i w innych wrażliwych usługach.

Podczas ćwiczeń występowały problemy z uruchomieniem narzędzi na maszynach wirtualnych i z uprawnieniami. Rozważano wpływ aktualizacji oraz współdziałania Computer Use i PowerShell, ale nie ustalono jednoznacznej przyczyny wszystkich problemów. W jednym przypadku rozszerzone uprawnienia umożliwiły dalszą pracę z ćwiczeniem design systemu.

Materiały:

- Skill: https://www.skills.sh/edukeyteam/agent-toolbox/create-design-system
- Strona referencyjna: https://www.x-kom.pl/
- Rozszerzenie Playwright: https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm
- Chrome DevTools CLI: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/cli.md
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/main

## Temat 5: Spec Driven Development, PRD, ADR i plan aplikacji

### Od wymagań do decyzji technicznych

Przedstawiono podejście Spec Driven Development: najpierw doprecyzowanie problemu i zakresu, potem dokumentacja wymagań, decyzje techniczne oraz plan, a następnie implementacja. Celem było ograniczenie sytuacji, w których agent sam uzupełnia istotne luki w założeniach.

PRD służyło opisaniu funkcji, użytkowników, przepływów, zachowania w sytuacjach niejasnych oraz granic PoC. ADR służyło dokumentowaniu decyzji technicznych, ich uzasadnienia i alternatyw. Wskazano oddzielne skills `$write-prd` i `$write-adr` oraz przykłady promptów dla obu etapów.

PRD omówiono w całości. Pracę nad ADR dopiero rozpoczęto; dokończenie ADR było zadaniem domowym. Udostępniono prompt do planu i zachęcono do uruchomienia agenta oraz wykorzystania dostępnego limitu przed kolejnymi zajęciami. Ukończone ADR i plan prowadzącego nie oznaczają, że cała grupa zakończyła te etapy.

Ustalona lokalizacja PRD to `docs/PRD.md` wewnątrz repozytorium szkoleniowego, a nie niezależny katalog poza projektem. Jeśli agent proponuje inne miejsce, należy sprawdzić jego katalog roboczy i wskazany zakres zadania.

Materiały:

- Brief i prompt PRD: https://github.com/LucasMatuszewski/jsystems-codex-2026-11/blob/main/course-materials/Prompt%20examples/PRD-electronics-returns-decision-model-app.md
- Przykład generowania ADR: https://github.com/LucasMatuszewski/jsystems-codex-2026-11/blob/main/course-materials/Prompt%20examples/ADR-generation-typescript-vercel-ai-sdk-decisions.md

### Interaktywne pytania i tryb planowania

Próbowano prowadzić doprecyzowanie wymagań przez interaktywny formularz z wybieranymi odpowiedziami. Kolejna odpowiedź miała wpływać na dalsze pytania i rekomendacje, wraz z wyjaśnieniem powodu takiej rekomendacji. Agent miał zadawać pytania po kolei i czekać na odpowiedź, bez odliczania czasu.

Występowały problemy: formularze znikały zbyt szybko albo pytania nie pojawiały się zgodnie z oczekiwaniem. Stosowano ponawianie instrukcji i kopiowanie odpowiedzi jako obejścia. Do dalszego sprawdzenia pozostawiono Question mode w aplikacji desktopowej; lepsze działanie tego wariantu było oczekiwaniem, nie potwierdzonym wynikiem.

Tryb planowania pokazywano przez `Shift+Tab` oraz `/plan`. Służył do analizy i przygotowania dokumentu planu bez zmian implementacyjnych.

Wskazano również inne materiały i narzędzia SDD:

- https://specs.md/ - wspomniano między innymi FIRE.
- https://github.com/github/spec-kit
- PRD: https://www.skills.sh/?q=prd
- ADR: https://www.skills.sh/?q=adr
- Plan: https://www.skills.sh/?q=plan
- SDD: https://www.skills.sh/?q=sdd
- Spec: https://www.skills.sh/?q=spec

### Zakres PoC zwrotów i reklamacji elektroniki

Projekt ćwiczeniowy zakładał formularz zgłoszenia, możliwość dodania zdjęcia oraz czat pomagający doprecyzować opis sytuacji. Projekt miał charakter syntetycznego PoC.

Przewidziany przepływ obejmował:

1. Zebranie danych zgłoszenia i zdjęcia.
2. Jedną wstępną, ograniczoną ocenę przez model decyzyjny, rozważany jako Jev albo GPT-6 Luna Decisions.
3. Dalszą rozmowę przez zwykły model konwersacyjny LLM.
4. Wstępną rekomendację oraz możliwość oznaczenia niepewnego przypadku do eskalacji.

Reguły polityki i routingu miały należeć do kodu aplikacji, a nie wynikać wyłącznie ze swobodnej wypowiedzi modelu. Samo zdjęcie nie rozstrzyga uprawnienia do reklamacji lub zwrotu.

Na etapie PoC przekazanie sprawy pracownikowi miało pozostać wstępną rekomendacją przedstawianą w czacie. Rzeczywisty moduł przekazywania spraw do obsługi klienta odłożono na później.

### OpenRouter, modele i konfiguracja aplikacji

Planowano użycie OpenRouter dla modelu konwersacyjnego i początkowego modelu decyzyjnego. Polecono agentowi przeprowadzić research aktualnych identyfikatorów modeli, obsługi obrazów, typowanych odpowiedzi i odpowiednich API. Przed wyborem integracji należało porównać możliwości modeli oraz formaty wywołań oceny decyzyjnej i strumieniowego czatu.

Zakres researchu obejmował oficjalny przewodnik Jev, dokumentację multimodalnych Decisions, referencję Decisions API oraz semantykę odpowiedzi, w tym Noul i confidence.

Zaproponowano znalezienie gotowego boilerplate lub szablonu aplikacji czatowej, aby wykorzystać istniejące elementy i dostosować je do PoC. Omawiano również instalację zależności i dostępność zmiennych środowiskowych. Nazwa zmiennej wskazanej dla integracji to `OPENROUTER_API_KEY`; rozważano konfigurację przez środowisko użytkownika albo `.env`. W materiałach wspomniano również wzorzec `.env.example`. Plików zawierających rzeczywiste sekrety nie należy dołączać do publicznych zmian.

Dokumentacja wskazana podczas zajęć:

https://openrouter.ai/docs/api_reference/responses/overview

### Plan, zależności i delegowanie

Wskazano prompt do przygotowania planu z podziałem pracy, macierzą zadań i mapą zależności:

https://github.com/LucasMatuszewski/jsystems-codex-2026-11/blob/main/course-materials/Prompt%20examples/Plan-SubAgents-matrix-dependency-map-LUNA.md

Pokazano polecenie rozpoczęcia realizacji celu na podstawie pliku planu:

```text
/goal implement the plan from file @docs/plan.md
```

`/goal` przedstawiano jako mechanizm pilnowania realizacji celu. `/status` służyło sprawdzeniu stanu i momentu odnowienia limitu. Zaproponowano także opcjonalny skrypt Bash monitorujący czas odnowienia limitu i pomagający wznowić pracę.

### AG-UI i CopilotKit jako rozszerzenia

AG-UI i CopilotKit przedstawiono jako materiały dotyczące bardziej zaawansowanego łączenia agentów z interfejsem aplikacji.

Materiały:

- https://docs.ag-ui.com/introduction
- https://www.copilotkit.ai/ag-ui
- https://www.copilotkit.ai/
- SDK: https://github.com/ag-ui-protocol/ag-ui/tree/main/sdks
- SDK społeczności: https://github.com/ag-ui-protocol/ag-ui/tree/main/sdks/community

## Temat 6: Context7, dokumentacja i lokalny retrieval

Context7 przedstawiono jako narzędzie wspierające pobieranie dokumentacji używanych bibliotek i technologii, dostępne w integracjach CLI lub MCP. Omawiano jego zastosowanie do pracy z aktualnymi informacjami zamiast polegania wyłącznie na wiedzy modelu. Podczas konfiguracji pojawiły się również trudności z uwierzytelnianiem.

Pokazano polecenie:

```text
npx ctx7 setup
```

Zalecono przygotowanie konfiguracji na poziomie użytkownika, jeśli narzędzie ma być dostępne w różnych projektach. Rozmawiano także o RAG i możliwości przygotowania lokalnego dostępu do własnej dokumentacji oraz repozytoriów. Wskazane materiały lokalnego retrieval należy odróżniać od korzystania z usługi zewnętrznej. Ocenę danych przekazywanych poza środowisko trzeba oprzeć na konkretnej konfiguracji i polityce organizacji.

Materiały:

- https://context7.com/
- Prywatny retrieval: https://github.com/EdukeyTeam/agent-toolbox/blob/main/skills/legacy-codebase-workflows/references/private-retrieval.md
- Lokalna konfiguracja: https://github.com/EdukeyTeam/agent-toolbox/blob/main/skills/legacy-codebase-workflows/references/local-context7-setup.md

## Tematy uzupełniające: narzędzia agentowe, gry i demonstracje

Poza głównym ćwiczeniem poruszono rozwój języków i interfejsów sprzyjających pracy agentów oraz pomysły na kontrolę wersji inną niż tradycyjny Git. Nie wskazano konkretnego języka jako przyjętego rozwiązania projektowego. Udostępniono materiał badawczy:

https://www.anthropic.com/research/redesigning-source-control

W rozmowie o tworzeniu gier, reverse engineering, niezależnym rozwoju produktów i bootstrappingu pojawiły się także kwestie piractwa i warunków rynkowych.

Wskazano:

- Polskojęzyczne demo związane ze Światem Dysku: https://01a1a77e-f6c8-7932-b201-3b139a9b8bbb.arena.site/
- Unity MCP: https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.0/manual/unity-mcp-overview.html
- Babylon.js, silnik 3D dla aplikacji webowych i gier: https://www.babylonjs.com/
- REA, Reverse Engineer Anything: https://github.com/morluto/rea
- Demo Battlefield: https://bf1942.pieter.com/
- Demo Doom: https://doom.pieter.com/
- Strona z projektami i demonstracjami: https://pieter.com/

Wspomniano NVIDIA Audio2Face w kontekście animacji twarzy i synchronizacji ruchu ust z głosem. Pokazano też materiały o WebMCP i wykorzystaniu narzędzi agentowych w aplikacjach webowych oraz grach:

- Demo: https://play.devpowers.com/
- Wyzwanie WebMCP: https://openai.com/pl-PL/webmcp-challenge/
- Dokumentacja Chrome: https://developer.chrome.com/docs/ai/webmcp?hl=pl

Jako narzędzie do kopii zapasowych wskazano Restic:

https://restic.net/

## Kolejne kroki i zadania

1. Dokończyć diagnostykę dostępu do GitHub CLI, w tym problemów poświadczeń w sandboxie i Windows Credential Manager. Sprawdzić zakres i ważność tokenu oraz potrzebne operacje zamiast automatycznie rozszerzać wszystkie uprawnienia.
2. Skonfigurować krótkie instrukcje personalizacyjne na właściwym poziomie użytkownika i projektu oraz niski poziom szczegółowości odpowiedzi.
3. Zainstalować i przetestować potrzebne skills, szczególnie projektowe skills do design systemu, PRD, ADR i code review. Przejrzeć ich instrukcje i skrypty pod kątem bezpieczeństwa.
4. Dokończyć ADR w ramach pracy domowej, wykorzystując research agenta i udostępniony prompt. PRD zostało omówione w całości; następne etapy to plan i implementacja.
5. Sprawdzić Question mode w aplikacji desktopowej i nadal diagnozować znikające formularze oraz oczekiwanie na odpowiedź użytkownika.
6. Przygotować Context7 i dodać krótką zasadę wyszukiwania: dla CLI najpierw wbudowane `--help`, na przykład `gh --help`; następnie Context7, a wyszukiwanie webowe dopiero wtedy, gdy wcześniejsze źródła nie wystarczą. Dla dokumentacji bibliotek zaczynać od Context7. Wykonać też jawne polecenie wyszukania w sieci lub przeczytania wskazanego URL.
7. Przygotować plan pracy z wieloma subagentami i doborem Luna lub Terra przez orkiestratora zależnie od złożoności zadania. Opcjonalnie uwzględnić OpenCode w trybie headless z Xiaomi MiMo oraz krótką instrukcję delegowania.
8. Przed rozpoczęciem realizacji zlecić niezależnemu agentowi bez odziedziczonej historii przegląd spójności PRD, ADR, AGENTS.md i planu oraz poprawić wykryte rozbieżności.

Na 6 listopada zapowiedziano kontynuację pracy z ADR, uruchamianiem aplikacji i delegowaniem zadań.

## Materiały szkoleniowe

- Repozytorium kursu: https://github.com/LucasMatuszewski/jsystems-codex-2026-11
- Podsumowania dni i historia czatu: https://github.com/LucasMatuszewski/jsystems-codex-2026-11/tree/main/course-materials/zoom-summary-chat-history
