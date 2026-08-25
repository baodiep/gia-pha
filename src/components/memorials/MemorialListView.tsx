"use client";

import React, { useState, useTransition, useEffect } from "react";
import { getDeceasedMembers, MemorialPerson } from "@/features/memorials/actions";
import { formatAnniversaryDisplay } from "@/features/memorials/formatter";
import { Search, Flower2, Calendar, MapPin, User } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export function MemorialListView() {
  const [members, setMembers] = useState<MemorialPerson[]>([]);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [generationFilter, setGenerationFilter] = useState<number | undefined>();
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      try {
        const data = await getDeceasedMembers({
          search: search || undefined,
          branchCode: branchFilter || undefined,
          generationNo: generationFilter,
        });
        setMembers(data);
      } catch (err) {
        console.error("Failed to load memorials:", err);
      }
    });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchFilter, generationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      {/* Header & Back Button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/" label="Quay lại Cây gia phả" />
          <div>
            <div className="flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tưởng niệm & Ngày giỗ
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Danh sách tiền nhân đã khuất và các ngày kỵ nhật trong dòng họ
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên thành viên..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Tất cả các chi/nhánh</option>
            <option value="ROOT">Nhánh gốc (Root)</option>
            <option value="CHI_1">Chi 1</option>
            <option value="CHI_2">Chi 2</option>
          </select>

          <select
            value={generationFilter ?? ""}
            onChange={(e) => setGenerationFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Tất cả các đời</option>
            <option value="1">Đời thứ 1</option>
            <option value="2">Đời thứ 2</option>
            <option value="3">Đời thứ 3</option>
            <option value="4">Đời thứ 4</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Lọc
          </button>
        </form>
      </div>

      {/* List / Cards */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải danh sách tưởng niệm...</div>
      ) : members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 dark:border-slate-800">
          Không tìm thấy thành viên đã mất nào theo bộ lọc đã chọn.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((person) => {
            const { solarText, lunarText } = formatAnniversaryDisplay(person);

            return (
              <div
                key={person.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-amber-400/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with Deceased Mark */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {person.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={person.avatarUrl}
                        alt={person.fullName}
                        className="h-full w-full rounded-full object-cover grayscale"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-slate-800 px-1 py-0.2 text-[10px] text-white">
                      ✝
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                      {person.fullName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {person.generationNo && <span>Đời thứ {person.generationNo}</span>}
                      {person.branchCode && <span>• {person.branchCode}</span>}
                    </div>
                  </div>
                </div>

                {/* Memorial Details */}
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  {lunarText && (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Ngày giỗ: {lunarText}</span>
                    </div>
                  )}

                  {solarText && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Ngày mất: {solarText}</span>
                    </div>
                  )}

                  {person.hometown && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Quê quán: {person.hometown}</span>
                    </div>
                  )}

                  {person.deathAnniversaryNote && (
                    <p className="mt-2 rounded-lg bg-amber-50/60 p-2 text-[11px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                      {person.deathAnniversaryNote}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
