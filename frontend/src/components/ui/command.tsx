"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

export const Command = forwardRef<ElementRef<typeof CommandPrimitive>, ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  function Command({ className, ...props }, ref) {
    return (
      <CommandPrimitive
        ref={ref}
        className={cn("flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-transparent", className)}
        {...props}
      />
    );
  }
);

export const CommandInput = forwardRef<
  ElementRef<typeof CommandPrimitive.Input>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-200/80 px-4 py-4">
      <Search className="h-4 w-4 text-ink-500" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-10 w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-500",
          className
        )}
        {...props}
      />
    </div>
  );
});

export const CommandList = forwardRef<
  ElementRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className, ...props }, ref) {
  return <CommandPrimitive.List ref={ref} className={cn("max-h-[420px] overflow-auto p-3", className)} {...props} />;
});

export const CommandEmpty = CommandPrimitive.Empty;
export const CommandGroup = CommandPrimitive.Group;
export const CommandItem = CommandPrimitive.Item;
export const CommandSeparator = CommandPrimitive.Separator;

