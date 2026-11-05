# UPDATES !!!

## Po dniu 2 (5.11)

- Dokumentacja i gałąź implementacji projektu: [PR #6](https://github.com/LucasMatuszewski/jsystems-codex-2026-11/pull/6), gałąź `feature/hardware-service-copilot` - PRD, ADR i plan.
- Design system x-kom: [PR #3](https://github.com/LucasMatuszewski/jsystems-codex-2026-11/pull/3).
- Gałąź `main` pozostaje bazą startową kursu z materiałami i aktualizacjami.
- Dzień 2: [podsumowanie](course-materials/zoom-summary-chat-history/day-2-summary.md) i [historia czatu](course-materials/zoom-summary-chat-history/day-2-chat-history.md).

## Po dniu 1 (4.11)

- Projekt zaczniemy od wyboru pomysłu, PRD, ADR i planu; kodu aplikacji jeszcze nie ma.
- Dzień 1: [podsumowanie](course-materials/zoom-summary-chat-history/day-1-summary.md) i [historia czatu](course-materials/zoom-summary-chat-history/day-1-chat-history.md).
- [Przykład PRD z modelem decyzyjnym](course-materials/Prompt%20examples/PRD-electronics-returns-decision-model-app.md) i [prompt do ADR](course-materials/Prompt%20examples/ADR-generation-typescript-vercel-ai-sdk-decisions.md) rozwijają zwykły formularz i chat o wstępną ocenę danych.
- [Tryb głosowy Codex i aplikacji desktopowej a Handy](course-materials/Research/codex-voice-queue-enterprise-chat-credits-2026-10-30.md#3-voice-dictation-and-local-transcription).

---

# Codex - od zera do zespołu agentów AI (JSystems)

**Materiały szkoleniowe: [devpowers.com/szkolenia/jsystems/codex-2026-11](https://devpowers.com/szkolenia/jsystems/codex-2026-11/)**

- [Zakres i wszystkie materiały](https://devpowers.com/szkolenia/jsystems/codex-2026-11/index.html#prezentacje)
- [Slajdy](https://devpowers.com/szkolenia/jsystems/codex-2026-11/index.html#prezentacje)
- [Biblioteka promptów](https://devpowers.com/szkolenia/jsystems/codex-2026-11/prompty.html) | [Ćwiczenia](https://devpowers.com/szkolenia/jsystems/codex-2026-11/cwiczenia.html) | [Checklisty](https://devpowers.com/szkolenia/jsystems/codex-2026-11/checklisty.html) | [Słownik AI](https://devpowers.com/szkolenia/jsystems/codex-2026-11/slownik-ai.html)
- [Wyniki ankiety przed szkoleniem](https://devpowers.com/szkolenia/jsystems/codex-2026-11/raport-przed.html) | [Odpowiedzi na pytania z kursu](https://devpowers.com/szkolenia/jsystems/codex-2026-11/pytania.html) (uzupełniamy po każdym dniu)


Repozytorium uczestnika szkolenia otwartego JSystems (4-6.11.2026, online, 09:00-16:00). W czasie szkolenia (3 dni) przechodzimy pełny cykl wytwarzania oprogramowania z agentami AI: od pomysłu i wymagań (PRD), przez decyzje architektoniczne (ADR), plan, implementację i testy, po code review, bezpieczeństwo i CI/CD.

Głównym narzędziem warsztatu jest **OpenAI Codex**: CLI, aplikacja desktopowa, rozszerzenie IDE i Codex Cloud. Na koniec porównujemy go z **Claude Code**. Przykład prowadzącego powstaje w TypeScript; możesz pracować w swoim stosie.

Głównym projektem grupy jest **AI Chat**: prosta aplikacja czatu z backendem i frontendem w TypeScript, zbudowana na **Vercel AI SDK** (streaming odpowiedzi, `useChat` w React), rozwijana według PRD uzgodnionego podczas zajęć. Aplikację budujesz w `app/` na własnej gałęzi swojego forka, z zespołem podagentów (backend, frontend, QA) i metodą TDD. Możesz też pracować nad własnym pomysłem, stosując ten sam proces. Po PRD omów architekturę i biblioteki, zapisz decyzje w ADR, ułóż plan i zależności zadań, a potem implementuj, testuj i przeglądaj zmiany przed utworzeniem PR. Przykładowy prompt PRD w `course-materials/` nie zastępuje dokumentu poprawionego z grupą.

## Start na maszynie Windows 11

Utwórz [własny fork na GitHubie](https://github.com/LucasMatuszewski/jsystems-codex-2026-11/fork). W swoim forku kliknij **Code**, wybierz **HTTPS** i skopiuj adres. Otwórz PowerShell w katalogu, w którym chcesz trzymać projekt, i wykonaj kolejno:

```powershell
$forkUrl = Read-Host "Wklej adres HTTPS swojego forka"
```

```powershell
git clone $forkUrl jsystems-codex-2026-11
```

```powershell
Set-Location jsystems-codex-2026-11
```

```powershell
git switch -c feat/ai-chat
```

```powershell
codex
```

Codex uruchamiasz w katalogu głównym repozytorium. Przejrzyj komunikat zaufania do projektu i zaakceptuj przygotowane repozytorium. Wspólne ustawienia są w `.codex/config.toml`; domyślny profil `course-root` pozwala edytować projekt i korzystać z sieci, w tym instalować zależności. Zarządzana polityka maszyny może dodatkowo ograniczać dostęp.

`app/` zawiera na razie tylko instrukcję. Podczas zajęć agent utworzy tam aplikację według PRD i ADR; dopiero wtedy instalujemy zależności i uruchamiamy komendy z jej `package.json`. Context7 i Playwright MCP są początkowo wyłączone w konfiguracji Codex. Włączymy je w ćwiczeniu MCP, a role `be-developer`, `fe-developer` i `qa-engineer` dodamy w ćwiczeniu podagentów. Codex czyta konfigurację MCP z `.codex/config.toml`; `.mcp.json` jest przykładem dla Claude Code.

Testy jednostkowe i integracyjne AI SDK korzystają z syntetycznego modelu testowego, bez klucza API. Klucz serwerowy jest potrzebny do rozmowy z prawdziwym modelem i pełnego E2E. `.env.example` zawiera wyłącznie nazwy zmiennych; wartości i sposób ładowania środowiska ustalamy przy konfiguracji aplikacji. Nie wklejaj kluczy do rozmowy z agentem ani do plików śledzonych przez Git.

## Biblioteka dodatkowa

`course-materials/` zawiera szeroką bibliotekę pełnych promptów, danych syntetycznych, checklist, przykładów konfiguracji i materiałów o innych agentach. To zasób do późniejszego czytania, nie lista narzędzi wymaganych na warsztacie. [Pełne prompty historyczne](course-materials/Prompt%20examples/) zachowano bez skracania; starsze twierdzenia o produktach, licencjach i komendach wymagają ponownego sprawdzenia. Podczas pracy z wybraną aplikacją agent nie powinien sam przeszukiwać `course-materials/`: zawarte tam PRD, ADR i instrukcje są przykładami, a nie wymaganiami tego projektu. Otwórz konkretny materiał dopiero wtedy, gdy go o to poprosisz.

W bibliotece znajdują się również **archiwalne materiały z wcześniejszego kursu o Claude Code**: [notatki](course-materials/Course%20INDEX%20-%20AI%20in%20Programming.md), [quiz](course-materials/quizzes/day-1-anonymous-ai-basics-quiz.md), [przykłady konfiguracji](course-materials/agent-configs/claude/) i [słownik PDF](course-materials/AI%20dla%20Programist%C3%B3w%20-%20S%C5%82ownik%20przed%20szkoleniem.pdf). Zachowano je jako źródła do ponownego wykorzystania, **nie jako aktualną konfigurację tego warsztatu**. Przykłady ustawień i skrypty należy dostosować i sprawdzić przed użyciem. `course-materials/exercise-data/hidden-patterns.md` jest archiwalnym kluczem trenerskim do danych syntetycznych.

Wybierz materiał do zadania:

- **Prompty i planowanie:** [PRD (przykład z innej aplikacji)](course-materials/Prompt%20examples/PRD-electronics-returns-complains-app.md), [ADR](course-materials/Prompt%20examples/ADR-generation-typescript-vercel-ai-sdk.md), [plan implementacji](course-materials/Prompt%20examples/Plan-SubAgents-matrix-dependency-map.md), [propozycja skilla planowania](https://github.com/EdukeyTeam/agent-toolbox/pull/28) (otwarty PR).
- **Konfiguracje agentów:** [ustawienia, uprawnienia, profile i skróty Bash/PowerShell](course-materials/agent-configs/).
- **Hooki i zgody:** [ochrona plików i przykłady hooków](course-materials/hooks-example/), [Context7](course-materials/hooks-example/context7/), [permissions a hooki](course-materials/hooks-example/context7/permissions-vs-hooks.md).
- **CI/CD i code review:** [przegląd przykładów](course-materials/cicd-headless/), [agent review dla różnych CI](course-materials/cicd-headless/agent-review/), [PR-Agent i Qodo](course-materials/cicd-headless/PR-Agent-Qodo/), [Codex i Bitbucket](course-materials/cicd-headless/codex-bitbucket/).
- **Ćwiczenia i dalsza lektura:** [dane syntetyczne](course-materials/exercise-data/), [workflow agentów i oszczędzanie tokenów](course-materials/Research/agent-workflows-and-token-budget-2026-10-24.md).

Przykłady są opcjonalne: skopiowanie repozytorium nie instaluje hooków ani profili. Przed uruchomieniem sprawdź instrukcję danego materiału, wersję narzędzia i politykę organizacji.

## Granice

Używaj wyłącznie danych syntetycznych. Przed przekazaniem kontekstu agentowi sprawdź politykę organizacji i zakres dostępu. Przejrzyj każdy diff, wynik testów i uprawnienia proponowanych narzędzi. Testów nie zmieniaj po to, by ukryć nieukończone zachowanie.

Możliwość użycia agenta chmurowego, MCP, CLI i pul AI Credits zależy od planu oraz ustawień organizacji. Agent w IDE i agent chmurowy to osobne środowiska. Funkcje edytora mogą się różnić od CLI i od innych IDE. [Stan narzędzi i źródła](docs/tool-facts.md) wymagają ponownego sprawdzenia przed zajęciami.

Trener: Łukasz Matuszewski · [LinkedIn](https://www.linkedin.com/in/lukaszmatuszewski/) · [X](https://x.com/mrLumatic)
