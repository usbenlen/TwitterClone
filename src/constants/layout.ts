import { APP_ROUTES } from "@/constants/routes";

export const SIDEBAR = { TRENDS_LIMIT: 4, RECOMMENDED_USERS_LIMIT: 3 } as const;
export const FOOTER_LINKS = [
  { label: "Про нас", to: APP_ROUTES.ABOUT },
  { label: "Конфіденційність", to: APP_ROUTES.PRIVACY },
  { label: "Умови", to: APP_ROUTES.TERMS },
  { label: "Допомога", to: APP_ROUTES.HELP },
] as const;
export const FOOTER_TECHNOLOGIES = "ASP.NET · TypeScript · React";
