import { APP_NAME, APP_ROUTES } from "@/constants";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Image,
  MessageCircle,
  Repeat2,
  Search,
  UsersRound,
} from "lucide-react";

import { RightSidebarFooterLinks } from "@/components/layout/desktop/rightSidebar/index";

import { HeartIcon } from "@/shared/icons";
import { AppLogo, Avatar } from "@/ui";
import { cn } from "@/utils/cn";

interface PreviewPostProps {
  name: string;
  username: string;
  time: string;
  children: string;
  replies: number;
  reposts: number;
  likes: number;
}

function PreviewPost({
  name,
  username,
  time,
  children,
  replies,
  reposts,
  likes,
}: PreviewPostProps) {
  const navigate = useNavigate();
  const [reposted, setReposted] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <article className="flex gap-3 border-t border-border px-4 py-4 text-left">
      <Avatar name={name} fallbackName={username} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1 text-sm">
          <span className="truncate font-bold text-foreground">{name}</span>
          <span className="truncate text-muted-foreground">@{username}</span>
          <span className="text-muted-foreground">·</span>
          <span className="shrink-0 text-muted-foreground">{time}</span>
        </div>
        <p className="mt-1 text-sm leading-5 text-foreground">{children}</p>
        <div className="mt-3 flex max-w-xs items-center justify-between text-muted-foreground">
          <button
            type="button"
            onClick={() => navigate(APP_ROUTES.LOGIN)}
            aria-label="Прокоментувати"
            className={cn(
              "flex items-center gap-1.5 rounded-full p-0.5 text-xs transition-colors hover:text-primary",
            )}
          >
            <MessageCircle className="size-4" />
            {replies}
          </button>
          <button
            type="button"
            onClick={() => setReposted((value) => !value)}
            aria-label="Поширити"
            aria-pressed={reposted}
            className={cn(
              "flex items-center gap-1.5 rounded-full p-0.5 text-xs transition-colors hover:text-emerald-500",
              reposted && "text-emerald-500",
            )}
          >
            <Repeat2 className="size-4" />
            {reposts + Number(reposted)}
          </button>
          <button
            type="button"
            onClick={() => setLiked((value) => !value)}
            aria-label="Вподобати"
            aria-pressed={liked}
            className={cn(
              "flex items-center gap-1.5 rounded-full p-0.5 text-xs transition-colors hover:text-rose-500",
              liked && "text-rose-500",
            )}
          >
            <HeartIcon className="size-4" filled={liked} />
            {likes + Number(liked)}
          </button>
        </div>
      </div>
    </article>
  );
}

const features = [
  {
    icon: MessageCircle,
    title: "Говоріть про важливе",
    description:
      "Діліться короткими думками, фото й опитуваннями у момент, коли вони з’являються.",
  },
  {
    icon: UsersRound,
    title: "Знаходьте своїх людей",
    description:
      "Стежте за авторами, друзями й спільнотами, чиї ідеї вам близькі.",
  },
  {
    icon: Search,
    title: "Будьте в центрі подій",
    description:
      "Відкривайте нові теми та долучайтеся до розмов, що відбуваються просто зараз.",
  },
] as const;

export default function LandingPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");

  const publishDraft = () => {
    if (!draft.trim()) return;
    navigate(APP_ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <AppLogo to={APP_ROUTES.LANDING} />

          <nav
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Авторизація"
          >
            <Link
              to={APP_ROUTES.LOGIN}
              className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Увійти
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative">
          <div
            className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-primary/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-40 top-0 size-96 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
                Діліться тим, що{" "}
                <span className="text-primary">має значення.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground text-pretty sm:text-xl lg:mx-0">
                {APP_NAME} - простір для живих розмов, нових знайомств і думок,
                якими хочеться ділитися.
              </p>

              <div className="mx-auto mt-9 flex max-w-md flex-col gap-3 lg:mx-0">
                <Link
                  to={APP_ROUTES.REGISTER}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Створити акаунт
                  <ArrowRight className="size-5" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div
                className="absolute -inset-5 -rotate-3 rounded-4xl bg-primary/10"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <span className="text-lg font-extrabold">Головна</span>
                </div>
                <div className="flex gap-3 px-4 py-4">
                  <Avatar name="Ви" />
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={1}
                      maxLength={40}
                      aria-label="Що нового?"
                      placeholder="Що нового?"
                      className="min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <Image className="cursor-pointer size-5 text-primary" />
                      <button
                        type="button"
                        onClick={publishDraft}
                        disabled={!draft.trim()}
                        className="cursor-pointer rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
                      >
                        Опублікувати
                      </button>
                    </div>
                  </div>
                </div>
                <PreviewPost
                  name="Стас Даруйщук"
                  username="darye_schyk"
                  time="12 хв"
                  replies={18}
                  reposts={42}
                  likes={286}
                >
                  Найкращі ідеї починаються з простої розмови. Розкажіть, над
                  чим працюєте сьогодні ✨
                </PreviewPost>
                <PreviewPost
                  name="Артік Кривчановський"
                  username="artik_codes"
                  time="1 год"
                  replies={9}
                  reposts={16}
                  likes={124}
                >
                  Маленький прогрес щодня все одно залишається прогресом.
                  Продовжуємо 🚀
                </PreviewPost>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-border bg-muted/35">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                Ваш простір
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-balance sm:text-4xl">
                Усе потрібне для справжнього спілкування
              </h2>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border bg-card p-6 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <AppLogo to={APP_ROUTES.LANDING} className="text-5xl" />
          <RightSidebarFooterLinks className="text-center [&>div]:justify-center sm:text-right sm:[&>div]:justify-end" />
        </div>
      </footer>
    </div>
  );
}
