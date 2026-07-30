/** @format */

interface FeedHeaderProps {
  title: string;
}

export default function FeedHeader({ title }: FeedHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    </header>
  );
}
