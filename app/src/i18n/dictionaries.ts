export type Locale = "pl" | "en";

export type Dictionary = {
  productName: string;
  newDeck: string;
  history: string;
  navigation: string;
  interfaceLanguage: string;
  photoCount: string;
  pageEyebrow: string;
  pageTitle: string;
  pageDescription: string;
  subject: string;
  book: string;
  chapter: string;
  grade: string;
  materialType: string;
  focus: string;
  focusPlaceholder: string;
  create: string;
  flashcards: string;
  summary: string;
  quiz: string;
  chooseGrade: string;
  chooseType: string;
  errors: { book: string; chapter: string; grade: string; deckType: string; focus: string; request: string };
  examplesTitle: string;
  examplesDescription: string;
  formName: string;
  created: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    productName: "Deck Copilot",
    newDeck: "New Deck",
    history: "History",
    navigation: "Primary navigation",
    interfaceLanguage: "Interface language",
    photoCount: "5 photos",
    pageEyebrow: "English exam materials",
    pageTitle: "Create a revision deck",
    pageDescription: "Define the book and chapter. You will review and refine the English content before a PDF is created.",
    subject: "Subject",
    book: "Book name",
    chapter: "Chapter name or number",
    grade: "Grade",
    materialType: "Material type",
    focus: "Special focus (optional)",
    focusPlaceholder: "For example: device vocabulary and short descriptions",
    create: "Create deck",
    flashcards: "Flashcard Slides",
    summary: "Summary Deck",
    quiz: "Quiz & Practice Deck",
    chooseGrade: "Select a grade",
    chooseType: "Select a material type",
    errors: {
      book: "Enter a book name.",
      chapter: "Enter a chapter.",
      grade: "Select a grade.",
      deckType: "Select a material type.",
      focus: "Use at most 2000 characters for special focus.",
      request: "The deck could not be created. Try again.",
    },
    examplesTitle: "Example visual material",
    examplesDescription: "Approved sample photos that can be used in the generated learning deck.",
    formName: "New deck",
    created: "Session created.",
  },
  pl: {
    productName: "Deck Copilot",
    newDeck: "Nowa prezentacja",
    history: "Historia",
    navigation: "Nawigacja główna",
    interfaceLanguage: "Język interfejsu",
    photoCount: "5 zdjęć",
    pageEyebrow: "Materiały do powtórki z angielskiego",
    pageTitle: "Utwórz prezentację powtórkową",
    pageDescription: "Podaj podręcznik i rozdział. Przed utworzeniem PDF sprawdzisz i poprawisz angielską treść.",
    subject: "Przedmiot",
    book: "Nazwa podręcznika",
    chapter: "Rozdział - nazwa lub numer",
    grade: "Klasa",
    materialType: "Typ materiału",
    focus: "Dodatkowe wskazówki (opcjonalnie)",
    focusPlaceholder: "Na przykład: słownictwo dotyczące urządzeń i krótkie opisy",
    create: "Utwórz prezentację",
    flashcards: "Slajdy z fiszkami",
    summary: "Prezentacja podsumowująca",
    quiz: "Quiz i ćwiczenia",
    chooseGrade: "Wybierz klasę",
    chooseType: "Wybierz typ materiału",
    errors: {
      book: "Wpisz nazwę podręcznika.",
      chapter: "Wpisz rozdział.",
      grade: "Wybierz klasę.",
      deckType: "Wybierz typ materiału.",
      focus: "Dodatkowe wskazówki mogą mieć najwyżej 2000 znaków.",
      request: "Nie udało się utworzyć prezentacji. Spróbuj ponownie.",
    },
    examplesTitle: "Przykładowy materiał wizualny",
    examplesDescription: "Zatwierdzone zdjęcia, których można użyć w wygenerowanej prezentacji edukacyjnej.",
    formName: "Nowa prezentacja",
    created: "Sesja została utworzona.",
  },
};
