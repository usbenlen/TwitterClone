/** @format */

interface TweetContentProps {
  content: string;
}

export default function TweetContent({ content }: TweetContentProps) {
  return <p className="mt-1 wrap-break-words whitespace-pre-wrap">{content}</p>;
}
