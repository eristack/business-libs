"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchItem } from "@/lib/search-index";
import { cn } from "@/lib/utils";

type CommandMenuProps = {
  items: SearchItem[];
};

const groups: SearchItem["group"][] = [
  "Navigation",
  "Packages",
  "Docs",
  "Blog",
];

export function CommandMenu({ items }: CommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [shortcut, setShortcut] = useState("⌘K");

  useEffect(() => {
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    setShortcut(isApple ? "⌘K" : "Ctrl K");

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-muted px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground",
          )}
          aria-label="Open search"
        >
          <span className="hidden sm:inline">Search…</span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {shortcut}
          </kbd>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 dark:bg-black/70" />
        <Dialog.Content className="fixed top-[18%] left-1/2 z-50 w-[min(100%-1.5rem,36rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search documentation, packages, and pages
          </Dialog.Description>
          <Command
            filter={(value, search, keywords) => {
              const haystack = `${value} ${keywords?.join(" ") ?? ""}`.toLowerCase();
              const query = search.toLowerCase().trim();
              if (!query) return 1;
              return haystack.includes(query) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Search docs, packages, pages…" />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              {groups.map((group) => {
                const groupItems = items.filter((item) => item.group === group);
                if (groupItems.length === 0) return null;
                return (
                  <CommandGroup key={group} heading={group}>
                    {groupItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.title}
                        keywords={(item.keywords ?? "").split(/\s+/)}
                        onSelect={() => onSelect(item.href)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.title}</p>
                          {item.description ? (
                            <p className="truncate text-[12px] text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
