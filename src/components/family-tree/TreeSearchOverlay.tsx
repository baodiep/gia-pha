"use client";

import React, { useState, useTransition, useEffect } from "react";
import { searchPersons, SearchPersonResult } from "@/features/tree/search-actions";
import { Search, X, ArrowRight, User } from "lucide-react";

interface TreeSearchOverlayProps {
  onFocusPerson: (personId: string) => void;
}

export function TreeSearchOverlay({ onFocusPerson }: TreeSearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPersonResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
    <>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-300 bg-white/95 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-800 shadow-md backdrop-blur hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100 min-h-[36px] sm:min-h-[40px] cursor-pointer"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
          <span>Tìm kiếm</span>
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-slate-900/60 backdrop-blur-sm p-3 sm:p-0 sm:absolute sm:inset-auto sm:top-0 sm:right-0 sm:bg-transparent sm:backdrop-blur-none">
          {/* Backdrop click on mobile to close */}
          <div
            className="fixed inset-0 sm:hidden"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
              setResults([]);
            }}
          />

          <div className="relative z-10 w-full max-w-lg mt-14 sm:mt-0 sm:w-96 rounded-2xl border border-slate-300 bg-white p-3.5 sm:p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5 sm:pb-3 dark:border-slate-800">
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 stroke-[2.5] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  enterKeyHint="search"
                  value={query}
                  onChange={handleSearch}
                  placeholder="Tìm tên cụ, con cháu, năm sinh..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
                />
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-bold cursor-pointer"
                aria-label="Đóng tìm kiếm"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {isPending && (
              <div className="py-4 text-center text-xs text-slate-400">Đang tìm kiếm...</div>
            )}

            {!isPending && results.length > 0 && (
              <div className="mt-2 max-h-[50vh] sm:max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className="group flex items-center justify-between py-2.5 sm:py-2 px-1.5 cursor-pointer hover:bg-indigo-50/60 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-8 w-8 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <User className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          <span>{p.fullName}</span>
                          {p.lifeStatus === "DECEASED" && (
                            <span className="text-[10px] font-normal text-slate-400 shrink-0">(Đã mất)</span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                          {p.generationNo && <span>Đời {p.generationNo} • </span>}
                          {p.branchCode && <span>{p.branchCode} • </span>}
                          {p.birthDate && <span>Sinh {new Date(p.birthDate).getFullYear()}</span>}
                        </div>
                      </div>
                    </div>

                    <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 shrink-0 px-2 py-1 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                      <span>Xem</span>
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
        </div>
      )}
    </>
  );
}
