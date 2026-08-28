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
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/95 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 shadow-md backdrop-blur hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100 min-h-[40px]"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
          <span>Tìm kiếm</span>
        </button>
      ) : (
        <div className="fixed inset-x-2 top-2 sm:absolute sm:inset-auto sm:top-0 sm:right-0 z-50 w-auto sm:w-96 rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="flex flex-1 items-center gap-2.5">
              <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={handleSearch}
                placeholder="Tìm tên cụ, con cháu, năm sinh..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
              />
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setQuery("");
                setResults([]);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-bold"
              aria-label="Đóng tìm kiếm"
            >
              <X className="h-5 w-5" />
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
                        {p.lifeStatus === "DECEASED" && <span className="text-[10px] text-slate-400 font-medium">(Đã mất)</span>}
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
