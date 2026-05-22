"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/animate-ui/components/radix/accordion";
import { FAQ_ITEMS } from "@/lib/faq-content";

type FaqAccordionProps = {
  multiple?: boolean;
  collapsible?: boolean;
  keepRendered?: boolean;
  showArrow?: boolean;
  className?: string;
};

export function FaqAccordion({
  multiple = false,
  collapsible = true,
  keepRendered = false,
  showArrow = true,
  className = "w-full max-w-2xl",
}: FaqAccordionProps) {
  return (
    <Accordion
      type={multiple ? "multiple" : "single"}
      collapsible={collapsible}
      className={className}
    >
      {FAQ_ITEMS.map((item, index) => (
        <AccordionItem key={item.title} value={`item-${index + 1}`}>
          <AccordionTrigger showArrow={showArrow}>{item.title}</AccordionTrigger>
          <AccordionContent keepRendered={keepRendered}>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
