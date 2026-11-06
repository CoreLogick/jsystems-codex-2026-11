import { NewDeckForm } from "@/components/new-deck/new-deck-form";
import { cookies } from "next/headers";

export default async function NewDeckPage() {
  const locale = (await cookies()).get("emg_locale")?.value;
  return <NewDeckForm initialLocale={locale === "pl" ? "pl" : "en"} />;
}
