import React from "react";

interface QuoteProps {
  text: string;
}

export function Quote(props: QuoteProps) {
  return (
    <blockquote className="mx-md-2 pushbot-quote">
      <p>{props.text}</p>
    </blockquote>
  );
}
