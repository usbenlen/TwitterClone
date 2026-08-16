interface Props {
  errors: {
    id: string;
    message: string;
  }[];
}

export default function TweetComposerErrors({ errors }: Props) {
  if (errors.length === 0) return null;

  return (
    <div className="space-y-1">
      {errors.map((error) => (
        <div
          key={error.id}
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error.message}
        </div>
      ))}
    </div>
  );
}
