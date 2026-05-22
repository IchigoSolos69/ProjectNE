import Link from "next/link";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { BRAND_NAME } from "@/lib/constants";

export const metadata = {
  title: "FAQ",
  description: `Frequently asked questions about ${BRAND_NAME} bedding, towels, shipping, and returns.`,
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Help</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-stone-600">
          Everything you need to know about our linens, care instructions, returns,
          and Delhivery shipping across India.
        </p>
      </div>

      <div className="mt-12">
        <FaqAccordion multiple={false} collapsible keepRendered={false} showArrow />
      </div>

      <p className="mt-12 text-sm text-stone-500">
        Still need help?{" "}
        <Link
          href="mailto:hello@atelierhome.in"
          className="text-stone-900 underline underline-offset-4"
        >
          Contact our concierge
        </Link>
        .
      </p>
    </div>
  );
}
