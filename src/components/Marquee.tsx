const PHRASES = [
  "Performance First",
  "No Compromise",
  "Train Harder",
  "Ludis Aqtive",
  "Built Different",
  "Move With Purpose",
];

export function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <div className="overflow-hidden border-y border-border bg-bg-elevated py-4">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {items.map((phrase, i) => (
          <span
            key={`${phrase}-${i}`}
            className="font-display text-2xl tracking-[0.12em] text-fg/90 sm:text-3xl"
          >
            {phrase}
            <span className="ml-10 text-fg-muted">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
