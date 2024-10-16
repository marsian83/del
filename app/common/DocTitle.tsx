import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

export default function DocTitle(props: {
  title?: string;
  children?: React.ReactNode;
}) {
  const [seed, setSeed] = useState(1);
  const title = props.title || props.children;

  useEffect(() => {
    setSeed(seed + 1);
  }, []);

  return (
    <Helmet key={seed}>
      <title>{`JustInsure | Web3 Insurance ${title && "| " + title}`}</title>
    </Helmet>
  );
}
