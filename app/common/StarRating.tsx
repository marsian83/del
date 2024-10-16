import React from "react";

interface StarRatingProps {
  rating: number;
  total?: number;
  symbol?: string;
  colors?: {
    background: string;
    foreground: string;
  };
}

export default function StarRating(props: StarRatingProps) {
  const symbol = props.symbol || "★";

  const starString = symbol.repeat(props.total || 5);

  const ratingTotal = props.total || 5;
  const ratingPercentage = (props.rating / ratingTotal) * 100;

  return (
    <figure className="relative flex items-center justify-center text-front">
      <span style={{ color: props.colors?.background || "inherit" }}>
        {starString}
      </span>
      <div className="text-yellow-500">
        <span
          className="absolute-cover flex items-center justify-center"
          style={{
            color: props.colors?.foreground || "inherit",
            clipPath: `polygon(0% 0%, 0% 100%, ${ratingPercentage}% 100%, ${ratingPercentage}% 0%)`,
          }}
        >
          {starString}
        </span>
      </div>
    </figure>
  );
}
