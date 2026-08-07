export type ProductDetailSection = {
  id: string;
  title: string;
  content: string | string[];
  kind?: "text" | "list" | "table";
  rows?: { label: string; values: Record<string, string> }[];
  sizes?: string[];
};

const SKIP_KEYS = new Set([
  "item number",
  "item no",
  "sku",
  "gender",
  "notes",
  "note",
]);

const SECTION_ALIASES: { match: RegExp; id: string; title: string }[] = [
  { match: /^care\s*instructions?$/i, id: "care", title: "Care Instructions" },
  { match: /^fabric$/i, id: "fabric", title: "Fabric & Materials" },
  { match: /^main\s*fabric$/i, id: "fabric", title: "Fabric & Materials" },
  { match: /^contrast\s*fabric$/i, id: "fabric", title: "Fabric & Materials" },
  { match: /^fabric\s*weight$/i, id: "specs", title: "Details" },
  { match: /^fabric\s*thickness$/i, id: "specs", title: "Details" },
  { match: /^features?$/i, id: "features", title: "Features" },
  { match: /^description$/i, id: "about", title: "About" },
];

const SIZE_METRIC_KEYS = [
  "length",
  "shoulder",
  "chest",
  "bust",
  "waist",
  "hip",
  "hips",
  "sleeve",
  "sleeve length",
  "inseam",
  "rise",
];

function normalizeKey(key: string) {
  return key.replace(/\s+/g, " ").trim();
}

function splitLabeledFields(raw: string) {
  const text = raw
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const labelPattern =
    /(Item Number|Item No|SKU|Gender|Fabric Weight|Fabric Thickness|Main Fabric|Contrast Fabric|Care Instructions|Features|Notes?|Description|Sleeve length|Length|Shoulder|Chest|Bust|Waist|Hips|Hip|Inseam|Rise|Sleeve|Fabric)\s*:/gi;


  const matches = [...text.matchAll(labelPattern)];
  if (matches.length === 0) {
    return [{ key: "Description", value: text }];
  }

  const fields: { key: string; value: string }[] = [];

  // Leading prose before first label
  const firstIndex = matches[0].index ?? 0;
  if (firstIndex > 0) {
    const lead = text.slice(0, firstIndex).trim();
    if (lead) fields.push({ key: "Description", value: lead });
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const key = normalizeKey(match[1]);
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    const value = text.slice(start, end).trim().replace(/^[,;\-–—]\s*/, "");
    if (value) fields.push({ key, value });
  }

  return fields;
}

function parseSizeValue(value: string) {
  // e.g. (S) 16.93" / 43cm, (M) 17.52" / 44.5cm
  const entries = [...value.matchAll(/\(([A-Za-z0-9]+)\)\s*([^,(]+?)(?=\s*\(|$)/g)];
  const map: Record<string, string> = {};
  for (const entry of entries) {
    map[entry[1].toUpperCase()] = entry[2].replace(/\s+/g, " ").trim();
  }
  return map;
}

function cleanFeatureList(value: string) {
  const noisy = new Set(
    [
      "basics",
      "casual",
      "sexy",
      "sporty",
      "street",
      "daily casual",
      "gym",
      "sport",
      "outdoor",
      "autumn",
      "spring",
      "summer",
      "winter",
    ].map((s) => s.toLowerCase()),
  );

  return value
    .split(/[,;/|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !noisy.has(part.toLowerCase()))
    .slice(0, 8);
}

export function parseProductDescription(
  description: string,
): ProductDetailSection[] {
  if (!description?.trim()) return [];

  const fields = splitLabeledFields(description);
  const usefulFields = fields.filter(
    (f) => !SKIP_KEYS.has(f.key.toLowerCase()),
  );

  // If nothing useful parsed, show a short about blurb only
  if (usefulFields.length === 0) {
    return [
      {
        id: "about",
        title: "About",
        content: description.trim().slice(0, 280),
        kind: "text",
      },
    ];
  }

  const buckets = new Map<
    string,
    { title: string; lines: string[]; list?: string[] }
  >();
  const sizeRows: { label: string; values: Record<string, string> }[] = [];
  const sizeSet = new Set<string>();

  for (const field of usefulFields) {
    const keyLower = field.key.toLowerCase();

    if (SIZE_METRIC_KEYS.includes(keyLower)) {
      const values = parseSizeValue(field.value);
      if (Object.keys(values).length > 0) {
        Object.keys(values).forEach((s) => sizeSet.add(s));
        sizeRows.push({ label: field.key, values });
        continue;
      }
    }

    const alias = SECTION_ALIASES.find((a) => a.match.test(field.key));
    if (!alias) {
      // Unknown labeled field — skip to reduce clutter
      continue;
    }

    if (alias.id === "features") {
      const features = cleanFeatureList(field.value);
      if (features.length === 0) continue;
      buckets.set(alias.id, {
        title: alias.title,
        lines: [],
        list: features,
      });
      continue;
    }

    const existing = buckets.get(alias.id) ?? {
      title: alias.title,
      lines: [],
    };

    if (alias.id === "fabric" || alias.id === "specs") {
      existing.lines.push(`${field.key}: ${field.value}`);
    } else if (alias.id === "care") {
      existing.list = field.value
        .split(/[;•\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      existing.lines.push(field.value);
    }

    buckets.set(alias.id, existing);
  }

  const order = ["about", "fabric", "care", "features", "specs"];
  const sections: ProductDetailSection[] = [];

  for (const id of order) {
    const bucket = buckets.get(id);
    if (!bucket) continue;

    if (bucket.list?.length) {
      sections.push({
        id,
        title: bucket.title,
        content: bucket.list,
        kind: "list",
      });
    } else if (bucket.lines.length) {
      sections.push({
        id,
        title: bucket.title,
        content: bucket.lines.join("\n"),
        kind: "text",
      });
    }
  }

  if (sizeRows.length > 0) {
    sections.push({
      id: "size-guide",
      title: "Size Guide",
      content: "",
      kind: "table",
      rows: sizeRows,
      sizes: [...sizeSet],
    });
  }

  // Fallback: if we only skipped everything, keep a short about from raw text
  if (sections.length === 0) {
    const plain = description.replace(/\s+/g, " ").trim().slice(0, 220);
    if (plain) {
      sections.push({
        id: "about",
        title: "About",
        content: plain,
        kind: "text",
      });
    }
  }

  return sections;
}
