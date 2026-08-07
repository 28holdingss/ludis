"use client";

import { useState } from "react";
import {
  parseProductDescription,
  type ProductDetailSection,
} from "@/lib/parse-product-description";

export function ProductDetails({ description }: { description: string }) {
  const sections = parseProductDescription(description);
  const [openId, setOpenId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  if (sections.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border">
      {sections.map((section) => {
        const open = openId === section.id;
        return (
          <div key={section.id} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : section.id)}
              className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold tracking-wide uppercase"
              aria-expanded={open}
            >
              {section.title}
              <span className="text-lg font-normal text-fg-muted" aria-hidden>
                {open ? "−" : "+"}
              </span>
            </button>
            {open && (
              <div className="pb-5 text-sm leading-relaxed text-fg-muted">
                <SectionBody section={section} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionBody({ section }: { section: ProductDetailSection }) {
  if (section.kind === "list" && Array.isArray(section.content)) {
    return (
      <ul className="list-disc space-y-1.5 pl-5">
        {section.content.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (section.kind === "table" && section.rows && section.sizes) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border text-fg">
              <th className="py-2 pr-3 font-semibold">Measurement</th>
              {section.sizes.map((size) => (
                <th key={size} className="px-2 py-2 font-semibold">
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr key={row.label} className="border-b border-border/70">
                <td className="py-2.5 pr-3 font-medium text-fg">{row.label}</td>
                {section.sizes!.map((size) => (
                  <td key={size} className="px-2 py-2.5 whitespace-nowrap">
                    {row.values[size] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const text = Array.isArray(section.content)
    ? section.content.join("\n")
    : section.content;

  return (
    <div className="space-y-2 whitespace-pre-line">
      {text.split("\n").map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
