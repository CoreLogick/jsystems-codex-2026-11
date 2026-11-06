"use client";

import { FormEvent, useState } from "react";

import { createSessionInputSchema, type CreateSessionInput } from "@/domain";
import { dictionaries, type Locale } from "@/i18n/dictionaries";
import { ProductShell } from "@/components/shell/product-shell";
import { ExampleMaterials } from "./example-materials";

type CreateSession = (input: CreateSessionInput) => Promise<{ id: string }>;

const submitSession: CreateSession = async (input) => {
  const response = await fetch("/api/sessions", {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("CREATE_SESSION_FAILED");
  return response.json() as Promise<{ id: string }>;
};

export function NewDeckForm({ createSession = submitSession, initialLocale = "en" }: { createSession?: CreateSession; initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "created" | "failed">("idle");
  const dictionary = dictionaries[locale];

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    document.cookie = `emg_locale=${nextLocale}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = createSessionInputSchema.safeParse({
      locale,
      subject: "english",
      book: data.get("book"),
      chapter: data.get("chapter"),
      grade: Number(data.get("grade")),
      deckType: data.get("deckType"),
      focus: data.get("focus") || undefined,
    });

    if (!result.success) {
      const nextErrors: Record<string, boolean> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (field === "book" || field === "chapter" || field === "grade" || field === "deckType" || field === "focus") {
          nextErrors[field] = true;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      await createSession(result.data);
      setStatus("created");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <ProductShell dictionary={dictionary} locale={locale} onLocaleChange={changeLocale}>
      <main className="new-deck-page">
        <section className="intro-block">
          <p className="eyebrow">{dictionary.pageEyebrow}</p>
          <h1>{dictionary.pageTitle}</h1>
          <p>{dictionary.pageDescription}</p>
        </section>

        <div className="workspace-grid">
          <form aria-label={dictionary.formName} className="form-card" onSubmit={onSubmit}>
            <div className="field">
              <span className="field-label">{dictionary.subject}</span>
              <output>English</output>
            </div>
            <FieldError id="book" label={dictionary.book} error={errors.book ? dictionary.errors.book : undefined}>
              <input aria-invalid={errors.book || undefined} aria-describedby={errors.book ? "book-error" : undefined} id="book" name="book" maxLength={200} />
            </FieldError>
            <FieldError id="chapter" label={dictionary.chapter} error={errors.chapter ? dictionary.errors.chapter : undefined}>
              <input aria-invalid={errors.chapter || undefined} aria-describedby={errors.chapter ? "chapter-error" : undefined} id="chapter" name="chapter" maxLength={200} />
            </FieldError>
            <div className="field-row">
              <FieldError id="grade" label={dictionary.grade} error={errors.grade ? dictionary.errors.grade : undefined}>
                <select aria-invalid={errors.grade || undefined} aria-describedby={errors.grade ? "grade-error" : undefined} defaultValue="2" id="grade" name="grade">
                  <option value="">{dictionary.chooseGrade}</option>
                  {[1, 2, 3, 4].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                </select>
              </FieldError>
              <FieldError id="deckType" label={dictionary.materialType} error={errors.deckType ? dictionary.errors.deckType : undefined}>
                <select aria-invalid={errors.deckType || undefined} aria-describedby={errors.deckType ? "deckType-error" : undefined} defaultValue="summary" id="deckType" name="deckType">
                  <option value="">{dictionary.chooseType}</option>
                  <option value="flashcards">{dictionary.flashcards}</option>
                  <option value="summary">{dictionary.summary}</option>
                  <option value="quiz_practice">{dictionary.quiz}</option>
                </select>
              </FieldError>
            </div>
            <FieldError id="focus" label={dictionary.focus} error={errors.focus ? dictionary.errors.focus : undefined}>
              <textarea aria-invalid={errors.focus || undefined} aria-describedby={errors.focus ? "focus-error" : undefined} id="focus" maxLength={2000} name="focus" placeholder={dictionary.focusPlaceholder} rows={4} />
            </FieldError>
            {status === "failed" && <p role="alert">{dictionary.errors.request}</p>}
            {status === "created" && <p className="success" role="status">{dictionary.created}</p>}
            <button className="primary-button" disabled={status === "submitting"} type="submit">{dictionary.create}</button>
          </form>
          <ExampleMaterials dictionary={dictionary} />
        </div>
      </main>
    </ProductShell>
  );
}

function FieldError({ children, error, label, id }: { children: React.ReactNode; error?: string; label: string; id: string }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
      {error && <span id={`${id}-error`} role="alert">{error}</span>}
    </div>
  );
}
