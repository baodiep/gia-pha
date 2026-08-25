"use client";

import React, { useState, useTransition } from "react";
import { searchPersons, SearchPersonResult } from "@/features/tree/search-actions";
import { Search, MapPin, X, ArrowRight, User } from "lucide-react";

interface TreeSearchOverlayProps {
  onFocusPerson: (personId: string) => void;
}

export function TreeSearchOverlay({ onFocusPerson }: TreeSearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPersonResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length === 0) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      try {
        const data = await searchPersons(val);
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      }
    });
  };

  const handleSelect = (personId: string) => {
    onFocusPerson(personId);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Tìm thành viên...</span>
        </button>
      ) : (
        <div className="absolute top-0 right-0 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={handleSearch}
                placeholder="Nhập tên, năm sinh, đời, chi..."
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
              />
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setQuery("");
                setResults([]);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isPending && (
            <div className="py-4 text-center text-xs text-slate-400">Đang tìm kiếm...</div>
          )}

          {!isPending && results.length > 0 && (
            <div className="mt-2 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className="group flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-900 dark:text-white">
                        <span>{p.fullName}</span>
                        {p.lifeStatus === "DECEASED" && <span className="text-[10px] text-slate-400">✝</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.generationNo && <span>Đời {p.generationNo} • </span>}
                        {p.branchCode && <span>{p.branchCode} • </span>}
                        {p.birthDate && <span>Sinh {new Date(p.birthDate).getFullYear()}</span>}
                      </div>
                    </div>
                  </div>

                  <button className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Đến</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!isPending && query.trim() !== "" && results.length === 0 && (
            <div className="py-4 text-center text-xs text-slate-400">
              Không tìm thấy thành viên nào phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
}
