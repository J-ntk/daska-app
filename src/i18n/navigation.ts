import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Use these instead of next/link's Link and next/navigation's redirect/
// useRouter/usePathname anywhere inside src/app/[locale]/** — they
// automatically keep the current locale prefix in the URL.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
