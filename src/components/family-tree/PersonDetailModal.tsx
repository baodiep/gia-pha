"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getPersonById, updatePerson, softDeletePerson } from "@/features/persons/actions";
import { updateParentChildOrder } from "@/features/relationships/actions";
import { Person, Gender, LifeStatus } from "@/types/domain";
import { AvatarUploadControl } from "@/components/storage/AvatarUploadControl";
import {
  User,
  Heart,
  Calendar,
  MapPin,
  FileText,
  Trash2,
  Save,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Edit3,
} from "lucide-react";

interface PersonDetailModalProps {
  personId: string | null;
  isEditable?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PersonDetailModal({
  personId,
  isEditable = false,
  onClose,
  onSuccess,
}: PersonDetailModalProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>("LIVING");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [deathLunarDay, setDeathLunarDay] = useState<number | undefined>();
  const [deathLunarMonth, setDeathLunarMonth] = useState<number | undefined>();
  const [deathLunarIsLeapMonth, setDeathLunarIsLeapMonth] = useState(false);
  const [deathAnniversaryNote, setDeathAnniversaryNote] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [hometown, setHometown] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [generationNo, setGenerationNo] = useState<number | undefined>();
  const [branchCode, setBranchCode] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!personId) return;

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const data = await getPersonById(personId!);
        if (data) {
          setPerson(data);
          setFullName(data.full_name || "");
          setGender(data.gender || "MALE");
          setLifeStatus(data.life_status || "LIVING");
          setBirthDate(data.birth_date ? data.birth_date.slice(0, 10) : "");
          setDeathDate(data.death_date ? data.death_date.slice(0, 10) : "");
          setDeathLunarDay(data.death_lunar_day || undefined);
          setDeathLunarMonth(data.death_lunar_month || undefined);
          setDeathLunarIsLeapMonth(data.death_lunar_is_leap_month || false);
          setDeathAnniversaryNote(data.death_anniversary_note || "");
          setBirthPlace(data.birth_place || "");
          setHometown(data.hometown || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || null);
          setGenerationNo(data.generation_no || undefined);
          setBranchCode(data.branch_code || "");
        }
      } catch (err) {
        console.error("Load person error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [personId]);

  if (!personId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const payload = {
        fullName,
        gender,
        lifeStatus,
        birthDate: birthDate || undefined,
        deathDate: deathDate || undefined,
        deathLunarDay: deathLunarDay || undefined,
        deathLunarMonth: deathLunarMonth || undefined,
        deathLunarIsLeapMonth,
        deathAnniversaryNote: deathAnniversaryNote.trim() || undefined,
        birthPlace: birthPlace.trim() || undefined,
        hometown: hometown.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        generationNo: generationNo || undefined,
        branchCode: branchCode.trim() || undefined,
      };

      const [res] = await Promise.all([
        updatePerson(personId, payload),
        updateParentChildOrder(personId, displayOrder),
      ]);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Cập nhật thành viên thành công!" });
        setIsEditing(false);
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setMessage({ type: "error", text: res.error || "Cập nhật thất bại" });
      }
    });
  };

  const handleDelete = () => {
    if (!person) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa thành viên "${person.full_name}" vào Thùng rác? Thành viên có thể được khôi phục lại trong Trung tâm Quản trị.`
      )
    )
      return;

    startTransition(async () => {
      const res = await softDeletePerson(personId);
      if (res.success) {
        alert("Đã chuyển thành viên vào Thùng rác");
        onSuccess();
        onClose();
      } else {
        alert(res.error || "Xóa thất bại");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "Đang tải thông tin..." : person?.full_name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                {generationNo && <span>Đời thứ {generationNo}</span>}
                {branchCode && <span>• {branchCode}</span>}
                {lifeStatus === "DECEASED" && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Đã khuất ✝
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isEditable && !isEditing && !isLoading && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300"
              >
                <Edit3 className="h-4 w-4" />
                <span>Chỉnh sửa</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 font-bold"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">Đang tải chi tiết thành viên...</div>
          ) : isEditing ? (
            /* FORM CHỈNH SỬA */
            <form id="edit-person-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload Control */}
              <div className="flex justify-center mb-2">
                <AvatarUploadControl
                  personId={personId}
                  currentAvatarUrl={avatarUrl}
                  personName={fullName}
                  onAvatarUpdated={(url) => setAvatarUrl(url)}
                />
              </div>

              {/* Họ và tên & Giới tính */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên đầy đủ *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Đời & Chi & Thứ tự con cái */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thuộc đời thứ
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={generationNo || ""}
                    onChange={(e) => setGenerationNo(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ví dụ: 1, 2, 3..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thuộc Chi / Nhánh
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="Ví dụ: Chi Trưởng, Chi 2..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thứ tự con (trái → phải)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    placeholder="1, 2, 3..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    title="Số nhỏ hơn sẽ xếp bên trái, số lớn hơn xếp bên phải"
                  />
                </div>
              </div>

              {/* Tình trạng sống/đã mất & Ngày sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tình trạng
                  </label>
                  <select
                    value={lifeStatus}
                    onChange={(e) => setLifeStatus(e.target.value as LifeStatus)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="LIVING">Còn sống</option>
                    <option value="DECEASED">Đã qua đời (Đã khuất)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày / Năm sinh
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Nếu đã khuất -> Ngày giỗ Âm lịch & Dương lịch */}
              {lifeStatus === "DECEASED" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 space-y-3">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span>Thông tin Ngày Giỗ & Kỵ nhật</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ngày giỗ Âm lịch
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={deathLunarDay || ""}
                        onChange={(e) => setDeathLunarDay(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Ngày (1-30)"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tháng giỗ Âm lịch
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={deathLunarMonth || ""}
                        onChange={(e) => setDeathLunarMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Tháng (1-12)"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex items-center pt-5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deathLunarIsLeapMonth}
                          onChange={(e) => setDeathLunarIsLeapMonth(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span>Tháng Nhuận</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ngày mất theo Dương lịch
                    </label>
                    <input
                      type="date"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nơi an táng / Ghi chú ngày giỗ
                    </label>
                    <input
                      type="text"
                      value={deathAnniversaryNote}
                      onChange={(e) => setDeathAnniversaryNote(e.target.value)}
                      placeholder="Ví dụ: Mộ tại nghĩa trang quê nhà, khu A hàng 3..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Quê quán & Nơi sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quê quán gốc
                  </label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    placeholder="Ví dụ: Làng Đông, xã..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nơi sinh / Cư trú hiện tại
                  </label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Ví dụ: Hà Nội, TP.HCM..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Tiểu sử / Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiểu sử & Sự nghiệp
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ghi chép công đức, học vấn, chức vị, đóng góp cho dòng họ..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {message && (
                <div
                  className={`flex items-start gap-2 rounded-xl p-3 text-xs sm:text-sm font-semibold ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}
            </form>
          ) : (
            /* VIEW CHI TIẾT (CHẾ ĐỘ XEM) */
            <div className="space-y-4 text-slate-800 dark:text-slate-200 text-sm">
              {/* Avatar Large */}
              <div className="flex flex-col items-center justify-center gap-2 pb-2">
                <div className="h-24 w-24 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden shadow-md dark:border-slate-700 dark:bg-slate-800">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/50 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px]">Giới tính:</span>
                  <span className="font-bold">{gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tình trạng:</span>
                  <span className="font-bold">{lifeStatus === "LIVING" ? "Còn sống" : "Đã qua đời ✝"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Năm / Ngày sinh:</span>
                  <span className="font-bold">{birthDate ? new Date(birthDate).toLocaleDateString("vi-VN") : "Chưa rõ"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Đời / Chi:</span>
                  <span className="font-bold">
                    {generationNo ? `Đời ${generationNo}` : ""} {branchCode ? `• ${branchCode}` : ""}
                  </span>
                </div>
              </div>

              {lifeStatus === "DECEASED" && (deathLunarDay || deathLunarMonth || deathDate) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 text-xs sm:text-sm space-y-1.5">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày kỵ nhật (Giỗ họ):</span>
                  </div>
                  {(deathLunarDay || deathLunarMonth) && (
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      Ngày {deathLunarDay ? `${deathLunarDay}` : "..."} tháng {deathLunarMonth ? `${deathLunarMonth}` : "..."} (Âm lịch)
                      {deathLunarIsLeapMonth && " [Tháng Nhuận]"}
                    </div>
                  )}
                  {deathDate && (
                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                      Dương lịch: {new Date(deathDate).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                  {deathAnniversaryNote && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                      Nơi an táng: {deathAnniversaryNote}
                    </div>
                  )}
                </div>
              )}

              {(hometown || birthPlace) && (
                <div className="flex items-start gap-2 text-xs sm:text-sm">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    {hometown && <div>Quê quán: <span className="font-semibold">{hometown}</span></div>}
                    {birthPlace && <div>Nơi sinh/cư trú: <span className="font-semibold">{birthPlace}</span></div>}
                  </div>
                </div>
              )}

              {bio && (
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40 text-xs sm:text-sm">
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Tiểu sử & Công đức:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{bio}</p>
                </div>
              )}

              {!isEditable && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Bạn chỉ có quyền xem thành viên này. Để chỉnh sửa, bạn cần được Admin phân quyền quản lý nhánh trực hệ tương ứng.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa vào Thùng rác</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Hủy sửa
                </button>
                <button
                  type="submit"
                  form="edit-person-form"
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
                >
                  <Save className="h-4 w-4" />
                  <span>{isPending ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 min-h-[44px]"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
