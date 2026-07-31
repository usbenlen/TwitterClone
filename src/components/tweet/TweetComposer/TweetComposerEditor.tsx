/** @format */

interface TweetComposerEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TweetComposerEditor({
  value,
  onChange,
}: TweetComposerEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Що відбувається?"
      rows={3}
      className="w-full resize-none bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
    />
  );
}
