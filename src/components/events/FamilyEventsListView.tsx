"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getFamilyEvents, FamilyEvent } from "@/features/events/actions";
import { getCurrentUser } from "@/features/auth/actions";
import { Profile } from "@/types/domain";
import { Calendar, MapPin, Clock, Users, ShieldAlert, Sparkles, PlusCircle, Edit3 } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { EventFormModal } from "@/components/events/EventFormModal";

export function FamilyEventsListView() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [scope, setScope] = useState<"all" | "upcoming" | "past">("upcoming");
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FamilyEvent | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadEvents = () => {
    startTransition(async () => {
      try {
        const [data, user] = await Promise.all([
          getFamilyEvents({ scope }),
          getCurrentUser(),
        ]);
        setEvents(data);
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    });
  };

  useEffect(() => {
    loadEvents();
  }, [scope]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      {/* Back Button & Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/" label="Quay lại Cây gia phả" />
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sự kiện dòng họ
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Lịch giỗ tổ, họp họ, khánh thành từ đường và hoạt động gia tộc
            </p>
          </div>
        </div>

        {/* Nút Tạo sự kiện mới cho Admin / Thành viên đã đăng nhập */}
        {currentUser && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowFormModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all min-h-[44px]"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Tạo sự kiện mới</span>
          </button>
        )}
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
            const canEdit = currentUser?.is_admin || currentUser?.id === event.created_by;

            return (
              <div
                key={event.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-400/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                        {event.title}
                      </h3>
                      {isDraft && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
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

                  {canEdit && (
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowFormModal(true);
                      }}
                      title="Chỉnh sửa sự kiện"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-3 dark:text-slate-300">
                    {event.description}
                  </p>
                )}

                {/* Time & Location */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
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

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={showFormModal}
        eventToEdit={editingEvent}
        onClose={() => {
          setShowFormModal(false);
          setEditingEvent(null);
        }}
        onSuccess={() => {
          loadEvents();
        }}
      />
    </div>
  );
}

