"use client";

import { useEffect, useRef, useState } from "react";
import { storyChapters } from "@/lib/marketing-content";
import { cn } from "@/lib/cn";

export function StoryScroll() {
  const [active, setActive] = useState<string>(storyChapters[0].id);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.2, 0.5, 0.8] },
    );

    for (const chapter of storyChapters) {
      const el = sectionRefs.current.get(chapter.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="container-page grid gap-10 py-16 lg:grid-cols-[220px_1fr] lg:gap-16">
      <nav
        className="lg:sticky lg:top-20 lg:self-start"
        aria-label="Story chapters"
      >
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {storyChapters.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={cn(
                  "block shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active === chapter.id
                    ? "bg-secondary/15 text-secondary"
                    : "text-muted hover:text-foreground",
                )}
              >
                {chapter.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-24">
        {storyChapters.map((chapter) => (
          <section
            key={chapter.id}
            id={chapter.id}
            ref={(node) => {
              if (node) sectionRefs.current.set(chapter.id, node);
            }}
            className="scroll-mt-24"
          >
            <p className="text-sm font-medium text-primary">{chapter.label}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {chapter.title}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              {chapter.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
