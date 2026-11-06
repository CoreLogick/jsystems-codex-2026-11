import { z } from "zod";

export const publicHttpUrlSchema = z.url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}, "Only public HTTP(S) URLs are allowed");
