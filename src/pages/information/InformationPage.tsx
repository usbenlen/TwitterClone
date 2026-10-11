import type { ReactNode } from "react";

interface InformationPageProps {
  title: string;
  description: string;
  sections: { title: string; content: ReactNode }[];
  gif: { src: string; width: number; height: number; cropBottom?: boolean };
}

export function InformationPage({
  title,
  description,
  sections,
  gif,
}: InformationPageProps) {
  const gifAspectRatio = gif.width / (gif.height * (gif.cropBottom ? 0.9 : 1));

  return (
    <article>
      <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">
        {description}
      </p>

      <div className="mt-10 space-y-8 border-t border-border pt-8">
        {sections.map(({ title: sectionTitle, content }) => (
          <section key={sectionTitle}>
            <h2 className="text-xl font-bold">{sectionTitle}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{content}</p>
          </section>
        ))}
      </div>

      <div
        className="mx-auto mt-10 overflow-hidden rounded-2xl"
        style={{
          aspectRatio: gifAspectRatio,
          width: `min(100%, 20rem, ${20 * gifAspectRatio}rem)`,
        }}
      >
        <img
          src={gif.src}
          width={gif.width}
          height={gif.height}
          alt=""
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
    </article>
  );
}
