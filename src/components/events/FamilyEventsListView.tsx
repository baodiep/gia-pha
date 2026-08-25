"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getFamilyEvents, FamilyEvent } from "@/features/events/actions";
import { Calendar, MapPin, Clock, Users, ShieldAlert, Sparkles } from "lucide-react";

export function FamilyEventsListView() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [scope, setScope] = useState<"all" | "upcoming" | "past">("upcoming");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getFamilyEvents({ scope });
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    });
  }, [scope]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sự kiện dòng họ
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lịch giỗ tổ, họp họ, khánh thành từ đường và các hoạt động cộng đồng gia tộc
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          onClick={() => setScope("upcoming")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            scope === "upcoming"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Sắp diễn ra
        </button>
        <button
          onClick={() => setScope("all")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            scope === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Tất cả sự kiện
        </button>
        <button
          onClick={() => setScope("past")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            scope === "past"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Đã qua
        </button>
      </div>

      {/* Events List */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải lịch sự kiện...</div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 dark:border-slate-800">
          Chưa có sự kiện nào trong danh mục này.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => {
            const startDate = new Date(event.starts_at);
            const isDraft = event.status === "DRAFT";

            return (
              <div
                key={event.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-400/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {event.title}
                      </h3>
                      {isDraft && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Bản nháp
                        </span>
                      )}
                    </div>

                    {/* Visibility badge */}
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {event.visibility === "ALL_MEMBERS" && (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Users className="h-3.5 w-3.5" /> Toàn thể dòng họ
                        </span>
                      )}
                      {event.visibility === "BRANCH" && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Users className="h-3.5 w-3.5" /> Sự kiện nhánh ({event.root_person?.full_name || "Nhánh"})
                        </span>
                      )}
                      {event.visibility === "ADMIN_ONLY" && (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                          <ShieldAlert className="h-3.5 w-3.5" /> Nội bộ Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-3 dark:text-slate-300">
                    {event.description}
                  </p>
                )}

                {/* Time & Location */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>
                      {startDate.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>
                      {startDate.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {event.ends_at &&
                        ` - ${new Date(event.ends_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
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
