"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}) {
  useEffect(() => {
    document.title = "Something went wrong — CircuitKit";
  }, []);

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-page items-center px-page-gutter py-24 sm:py-32">
      <div className="max-w-xl border-l-2 border-caution pl-7">
        <p className="utility-label">Connection fault</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-ink">
          This page could not be rendered.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-ink">
          Your input has not been changed. Try loading this route again.
        </p>
        <Button className="mt-8" onClick={reset} type="button">
          <RotateCcw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      </div>
    </main>
  );
}
