import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

type Option = { value: string | number; label: string };
type Props = { value: string | number; options: Option[]; placeholder: string; onChange: (value: string) => void };

export default function SearchableSelect({ value, options, placeholder, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((x) => String(x.value) === String(value));
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("es");
    return q ? options.filter((x) => x.label.toLocaleLowerCase("es").includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div ref={root} className="relative">
    <button type="button" onClick={() => { setOpen((x) => !x); setQuery(""); }} className="flex h-10 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-white px-3 text-left text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
      <span className={selected ? "truncate text-[var(--text)]" : "text-[var(--text-secondary)]"}>{selected?.label ?? placeholder}</span>
      <ChevronDown size={16} className="ml-2 shrink-0 text-[var(--text-secondary)]" />
    </button>
    {open && <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-xl">
      <div className="relative border-b border-[var(--border)] p-2">
        <Search className="absolute left-4 top-4 h-4 w-4 text-[var(--text-secondary)]" />
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Escribir para buscar..." className="h-8 w-full rounded-md bg-[var(--surface-muted)] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
      </div>
      <div className="max-h-52 overflow-y-auto p-1">
        {filtered.length === 0 ? <div className="px-3 py-5 text-center text-sm text-[var(--text-secondary)]">Sin coincidencias</div> :
          filtered.map((x) => <button key={String(x.value)} type="button" onClick={() => { onChange(String(x.value)); setOpen(false); setQuery(""); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--surface-muted)]">
            <Check size={15} className={String(x.value) === String(value) ? "text-[var(--primary)]" : "invisible"} />
            <span>{x.label}</span>
          </button>)}
      </div>
    </div>}
  </div>;
}
