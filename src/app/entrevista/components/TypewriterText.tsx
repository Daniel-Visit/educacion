"use client";
import React, { useState, useEffect } from "react";

type Props = {
  text: string;
  active?: boolean;
  className?: string;
};

export default function TypewriterText({ text, active = true, className = "" }: Props) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text, active]);
  return <span className={className}>{displayed}</span>;
} 