# Podsumowanie - dzień 1, 4 listopada 2026

## Charakter i cele szkolenia

Był to pierwszy dzień otwartego kursu JSystems "Codex - od zera do zespołu agentów AI", prowadzonego przez Łukasza Matuszewskiego. Głównym tematem była praca z agentami AI w programowaniu i automatyzacji: sposoby dostępu do Codex, przygotowanie środowiska, bezpieczeństwo, uprawnienia, kontekst i tokeny oraz wybór narzędzi i modeli. Codex był głównym narzędziem kursu; ChatGPT Desktop, środowiska chmurowe, wtyczki IDE oraz rozwiązania takie jak Zed i Cursor pojawiały się w porównaniach. Claude Code i GitHub Copilot omawiano jako punkty odniesienia, nie jako główny temat kursu.

Wprowadzenie pomogło powiązać temat z różnymi potrzebami zawodowymi: administracją Windows i testowaniem, tworzeniem aplikacji frontendowych w TypeScript, pracą z Javą, Springiem i Pythonem oraz analizą danych. Pojawiły się cele takie jak automatyzowanie testów i zadań powtarzalnych, kontrola kodu i tworzenie testów, dzielenie backlogu na mniejsze zadania oraz łączenie procesów i pipeline'ów. Były to przykłady oczekiwań i możliwych zastosowań agentów.

## Środowisko pracy: CLI, aplikacja i zdalne maszyny

Omówiono kilka sposobów pracy z agentami: CLI, aplikację desktopową, Codex w chmurze i wtyczki IDE. Pokazano Fresh IDE w terminalu oraz wspomniano o edytorach agentowych, takich jak Zed i Cursor. Rozmawiano też o projektach w aplikacji desktopowej, które pomagają porządkować pracę i wiązać ją z wybranymi folderami. Aplikacja desktopowa i CLI korzystają z powiązanych ustawień i tego samego środowiska agenta.

Część wprowadzająca obejmowała logowanie do środowiska kursowego oraz połączenia ze zdalnymi maszynami przez RDP. Wystąpiły problemy z zaproszeniami, dostępem do kont i połączeniami; omawiano też sytuację, w której sieć firmowa ogranicza dostęp do narzędzi AI. Do łączenia z maszynami wskazano Remmina, FreeRDP oraz aplikacje Windows i macOS. Wśród rozważanych środowisk pracy znalazły się Windows, WSL i zdalne serwery; pojawiły się również Vim i Neovim.

Pokazano uwierzytelnianie Codex CLI przez urządzenie. W czacie udostępniono `codex login --device-auth` i stronę autoryzacji. Przydatne wskazówki z demonstracji CLI obejmowały wznowienie sesji (`codex resume`), użycie `!` do przejścia do trybu powłoki oraz zakończenie Codex CLI przez dwukrotne `Ctrl+C`.

## Uprawnienia i bezpieczeństwo agentów

Ważną zasadą była praca z minimalnymi uprawnieniami: agent może pomagać w wykonaniu zadania, ale nie należy przyznawać mu nieograniczonego dostępu do systemu ani bezkrytycznie ufać jego wynikom. Rozważano używanie kontrolowanych narzędzi, które agent może wywoływać, zamiast bezpośredniego dostępu do systemów wrażliwych. Omówiono też prompt injection - ryzyko, że treść przetwarzana przez agenta zawiera instrukcje, które próbują skłonić go do niepożądanego działania.

Porównano zatwierdzanie działań ręcznie z bardziej automatycznym trybem pracy. W Codex pokazano `/permissions` i opcję "Approve for me"; wśród porównań padły tryb Auto w Claude oraz eksperymentalne Assisted Permissions w GitHub Copilot. Wygoda automatyzacji nie usuwa potrzeby ograniczania dostępu i sprawdzania rezultatów.

Windows Sandbox omawiano jako sposób izolowania pracy. W demonstracji pojawiła się konfiguracja MXC dla Windows Sandbox oraz polecenie testowe Codex z profilem uprawnień ograniczonym do workspace. Zaznaczono, że obsługa `prefer_mxc` była funkcją w fazie rozwoju i mogła zachowywać się nieprzewidywalnie. Wspomniano również o `bubblewrap` jako rozwiązaniu sandboxowym dla Linuksa. Odrębne zagadnienia do dalszego omówienia obejmowały konfigurację sandboxa z odczytem, zapisem i internetem oraz różnice między środowiskiem Windows i WSL.

Jako materiały związane z bezpieczeństwem udostępniono dokumentację Windows Sandbox i publiczne opisy incydentów lub ekspozycji danych.

## Modele decyzyjne, modele językowe i ich ocena

Rozmowa dotyczyła dopasowania modelu do zadania oraz ograniczeń generatywnej AI. Model może tworzyć użyteczne odpowiedzi, ale może też się mylić; jego wyniki wymagają weryfikacji, szczególnie gdy dotyczą bezpieczeństwa. Poruszono temat modeli decyzyjnych i klasyfikacyjnych jako narzędzi do konkretnych osądów lub klasyfikacji. Nie należy ich utożsamiać z ogólnym modelem językowym ani automatycznie z modelami rozumującymi: wybór zależy od rodzaju zadania.

Udostępniono Typesafe, Jevbench i Benchmark Heaven jako punkty odniesienia dla modeli decyzyjnych. Wśród przykładów związanych z językiem polskim i lokalnym kontekstem wymieniono Bielik oraz modele oparte na Gemma 4. Pytanie o używanie modeli lokalnych ze względu na prywatność danych prowadziło do rozmowy o kompromisie: lokalne rozwiązanie może ograniczać przekazywanie danych do usług zewnętrznych, ale dostępne modele i ich możliwości mogą się różnić.

Do porównywania modeli wskazano Arena oraz Artificial Analysis. Wspomniano o odrębnych rankingach modeli agentowych i modeli do zadań programistycznych/webowych. Udostępnione wyniki Arena są przykładami porównań lub demonstracji, a nie uniwersalnym rozstrzygnięciem, który model będzie najlepszy dla każdego zadania. W rozmowie pojawiły się m.in. nazwy modeli widoczne przy udostępnionych wynikach: `claude-opus-5.5-max`, `deepseek-v4.1-flash-high` i `gpt-6.1-sol-max`.

## Tokeny, okno kontekstowe, koszty i analityka

Token to jednostka, na której model przetwarza tekst; model uczy się zależności statystycznych między tokenami i generuje kolejne elementy sekwencji. Okno kontekstowe obejmuje informacje dostępne modelowi w danej sesji, w tym wiadomości, instrukcje i wyniki narzędzi. Wraz z rozrostem kontekstu mogą zmieniać się koszty i warunki przetwarzania, dlatego przydatne są statystyki użycia oraz świadome zarządzanie historią.

Jako przybliżenie podano około 1,8 tokena na słowo po polsku i 1,2 po angielsku. To przybliżenie, a nie stały przelicznik dla każdego tekstu. Na spotkaniu sprawdzano tokenizację i omawiano jej wpływ na wykorzystanie kontekstu i koszty. Dla GPT-6.1 Sol w API żądania przekraczające 272 tys. tokenów wejściowych mają stawki wejścia i cache zwiększone dwukrotnie, a wyjścia 1,5-krotnie dla całego żądania. Użycie w ramach subskrypcji Codex nie ma tej dopłaty za długi kontekst. [Dokumentacja modelu](https://developers.openai.com/api/docs/models/gpt-6.1-sol).

Pokazano ręczne wywołanie `/compact`, czyli kompresję historii sesji, która może ułatwić kontynuowanie pracy po rozbudowaniu kontekstu. Wspomniano też o cache jako sposobie ponownego wykorzystania wcześniej przetworzonych treści i ograniczania kosztów; udostępniono też materiał o ["Cache forever"](https://x.com/thsottiaux/status/2112712984644784534). Szczegółowe warunki cache zależą od usługi i nie należy zakładać, że każdy cache jest bezterminowy. W CLI pokazano również `/statusline`, `/usage` i `/experimental`; wskazano, że historia Analytics plan może zbierać więcej danych statystycznych.

## Głos, transkrypcja i interfejsy

W Codex pokazano komendę `/voice`; pojawiło się pytanie, czy rozpoznawanie mowy działa lokalnie. Wskazano Handy jako narzędzie do transkrypcji oraz Canary 1B v2 jako model STT dla języka polskiego. Udostępniono też przykładowe prompty do Handy. Wśród dalszych tematów do personalizacji wymieniono domyślny język i głos oraz własny słownik wyrażeń.

## Projekty, zadania cykliczne i ćwiczenie

Pokazano organizowanie pracy w projekcie powiązanym z katalogiem domowym i Dev Drive. Przykładowe zadanie polegało na sprawdzeniu wolnego miejsca i powiadomieniu o jego niedoborze; inny przykład zakładał codzienną kontrolę zapełnienia dysku D: o 7:15 i powiadomienie w aplikacji. Wspomniano o zmiennej `CODEX_HOME` oraz dokumentacji Windows Dev Drive.

Jako ćwiczenie zaproponowano wymyślenie aplikacji lub gry, która powinna istnieć - przykładowo związanej z ulubioną postacią. W czacie pokazano gotowy rezultat Arena: mapę satelitów i samolotów z regulacją szybkości animacji.

## Materiały i kierunki dalszej pracy

Materiały i odnośniki udostępnione podczas dnia:

- Materiały kursu: https://devpowers.com/szkolenia/jsystems/codex-2026-11/ oraz slajd wprowadzający: https://devpowers.com/szkolenia/jsystems/codex-2026-11/Prezentacja_01_Start_kursu.html#1
- Indeks materiałów: https://devpowers.com/szkolenia/jsystems/codex-2026-11/index.html; repozytorium: https://github.com/LucasMatuszewski/jsystems-codex-2026-11
- Baza wiedzy i linków: https://github.com/LucasMatuszewski/jsystems-codex-2026-11/blob/main/course-materials/Course%20INDEX%20-%20AI%20in%20Programming.md; polecane profile: https://github.com/LucasMatuszewski/jsystems-codex-2026-11/blob/main/course-materials/Course%20INDEX%20-%20AI%20in%20Programming.md#people-and-accounts-to-follow-in-ai
- Logowanie i narzędzia: https://auth.openai.com/codex/device, https://codex.sadmin.cloud/#/, https://atuin.sh/, https://getfresh.dev/, https://remmina.org/, https://www.freerdp.com/, https://apps.microsoft.com/detail/9n1f85v9t8bn?hl=pl-PL&gl=PT oraz https://apps.apple.com/us/app/windows-app/id1295203466?mt=12
- Bezpieczeństwo i konfiguracja: https://learn.chatgpt.com/docs/windows/windows-sandbox, https://github.com/openai/codex oraz https://learn.microsoft.com/en-us/windows/dev-drive/
- Incydenty omawiane jako materiały: https://www.bold.security/blog/grok-build-data-exposure-what-happened-and-how-to-respond, https://medium.com/@sathishkumar.babu89/grok-build-went-open-source-after-a-data-breach-heres-the-full-story-6da266f7c765 i https://openai.com/pl-PL/index/hugging-face-incident-and-the-road-ahead/
- Modele i dokumentacja: https://typesafe.ai/, https://github.com/fstandhartinger/jevbench, https://benchmarkheaven.com/jev-models, https://huggingface.co/Remek/basal-omni-1.0-ultra, https://www.bielik.ai/, https://huggingface.co/google/gemma-4-E2B, https://huggingface.co/Remek/basal-2.0-mini oraz https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro
- Tokeny, ceny i porównania: https://platform.openai.com/tokenizer, https://developers.openai.com/api/docs/pricing?cyber-context-length=short, https://arena.ai/, https://arena.ai/leaderboard/agent, https://arena.ai/leaderboard/code/webdev i https://artificialanalysis.ai/
- Udostępnione wyniki demonstracyjne: https://01a1a6cc-f9ce-730a-bfba-1f01c1a60026.arena.site/, https://01a1a6cf-aeb8-7b42-8819-be3316d6d283.arena.site/, https://01a1a6cf-aeb8-79f3-b4db-e932878179b0.arena.site/, https://01a1a6cd-7e67-70f2-8505-817efd0366cf.arena.site/ oraz https://01a1a6cd-7e67-70fb-a576-92feedda9781.arena.site/
- Głos i statusy usług: https://handy.computer/, https://github.com/LucasMatuszewski/jsystems-claude-codex-gis-2026-11/blob/main/course-materials/Prompt%20examples/Handy.computer%20-%20transcription%20prompts.md, https://status.openai.com/ i https://status.claude.com/
- Przykładowe źródła branżowe: https://www.youtube.com/@t3dotgg, https://x.com/karpathy oraz https://www.youtube.com/watch?v=w20lk3OyLMI&t=2s

Na dalsze dni kursu planowano kontynuację pracy z agentami, m.in. tematy OpenRouter, Skills i aplikacji demonstracyjnej, a także zagadnienia głosowe, bezpieczeństwo i bardziej zaawansowana automatyzacja. Wśród punktów do dalszego omówienia znalazły się personalizacja Codex na poziomie pamięci i instrukcji dla konta, organizacji lub projektu oraz porównanie PowerShell, Git Bash i WSL.
