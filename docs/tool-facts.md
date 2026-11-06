# Codex i AI SDK - sprawdzone fakty

Sprawdzono 04.11.2026 na `codex-cli 0.166.0`. Aplikacja w `app/` powstanie podczas zajęć; nie ma jeszcze zainstalowanych pakietów ani ustalonego frameworka. Dostęp do modeli i usług zależy od konta oraz polityki organizacji.

## Codex CLI

- `codex` otwiera tryb interaktywny; `codex exec` uruchamia zadanie bez interaktywnego interfejsu. `codex --help` potwierdza też `review`, `resume`, `fork`, `cloud` i `mcp`. `codex fork` dotyczy sesji agenta; fork repozytorium wykonujesz na GitHubie.
- Konfiguracja projektu jest w `.codex/config.toml`. Domyślny `course-tools` dziedziczy `:workspace`: zapis w workspace i temp, sieć włączona, brak OS-owych blokad odczytu plików .env/secrets. Profile `course-workspace` i `course-root` zachowują wariant ścisły. Zarządzana polityka i konfiguracja użytkownika mogą zmienić wynik; sprawdź efektywne uprawnienia na VM. [Dokumentacja konfiguracji](https://developers.openai.com/codex/config-reference).
- `approval_policy = "on-request"` i `approvals_reviewer = "auto_review"` kierują kwalifikujące się prośby o zgodę do automatycznego recenzenta. Nie oznacza to ręcznego pytania uczestnika przy każdej operacji ani dowolnego dostępu do plików. [Opis recenzenta zgód](https://developers.openai.com/codex/config-reference).
- `codex execpolicy check --rules .codex/rules/course.rules npm install` sprawdza reguły bez instalacji. Brak dopasowanej reguły oznacza, że komenda nadal podlega sandboxowi i polityce zgód. Prefiksy nie obejmują wszystkich aliasów i wariantów polecenia. [Reguły Codex](https://developers.openai.com/codex/rules).
- `--strict-config` istnieje, ale w tej wersji nie działa z `debug`, `features`, `mcp` ani `execpolicy`. `codex app-server --strict-config --print-startup-config` sprawdza konfigurację startową bez sesji modelu; sam wynik nie dowodzi załadowania ustawień projektu. Historyczny odczyt `config/read` z `cwd` repozytorium z 04.11.2026 potwierdził ówczesny profil `course-root`, politykę zgód, serwery MCP i flagi projektu. To wynik sprzed zmiany domyślnego profilu. Po aktualizacji, restarcie daemona i rozpoczęciu nowej rozmowy oczekiwany profil tego projektu to `course-tools`; sprawdź go ponownie na swojej VM.
- Context7 jest włączony; najpierw rozwiąż library ID i odpytaj dokumentację. Playwright MCP pozostaje wyłączony; kursowy test UI używa Playwright CLI. Codex korzysta z tabel `mcp_servers`; `.mcp.json` dotyczy innego klienta. Role podagentów dodajemy do `.codex/agents/` podczas zajęć. Nie kopiuj ustawień użytkownika ani kluczy do repozytorium.

## Vercel AI SDK 7

- Wersję wybieramy w ADR i sprawdzamy zgodność `ai`, `@ai-sdk/react` oraz providera przed instalacją. Nie mieszaj przykładów dla różnych głównych wersji SDK.
- W SDK 7 `streamText` udostępnia `result.stream`. Odpowiedź dla UI tworzy się przez `toUIMessageStream({ stream: result.stream })` i `createUIMessageStreamResponse(...)`. Starsze `result.toUIMessageStreamResponse()` nadal działa w wersji 7, ale jest przestarzałe. Zmieniono też `system` na `instructions`, zachowując stary parametr jako przestarzały. [Migracja do SDK 7](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0).
- React używa `useChat` z `@ai-sdk/react`, transportu `DefaultChatTransport` z `ai` i `sendMessage`. Stan formularza przechowujesz osobno; wiadomości renderujesz z `message.parts`. Na serwerze przekształcasz je przez `await convertToModelMessages(messages)`. [Czat i streaming](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot).
- Dla SDK 7 model testowy to `MockLanguageModelV4` z `ai/test`, a `simulateReadableStream` pochodzi z `ai`. Testy jednostkowe i integracyjne mogą działać bez wywołania providera i klucza. Pełne E2E z prawdziwym modelem wymaga konfiguracji serwerowej. [Testowanie SDK](https://ai-sdk.dev/docs/ai-sdk-core/testing).

Źródła SDK sprawdzono również przez Context7, w dokumentacji wersji `/vercel/ai/ai_7.0.0`. Te fakty nie zastępują sprawdzenia faktycznie zainstalowanych wersji podczas tworzenia aplikacji.
