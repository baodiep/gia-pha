"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPerson } from "@/features/persons/actions";
import { addParentChild, addUnion, getPersonUnions } from "@/features/relationships/actions";
import { Gender, LifeStatus, Person } from "@/types/domain";
import {
  UserPlus,
  User,
  Heart,
  Calendar,
  MapPin,
  FileText,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Users2,
} from "lucide-react";

interface AddPersonModalProps {
  isOpen: boolean;
  relatedPerson?: Person | null;
  relationType?: "CHILD" | "SPOUSE" | "PARENT" | "ROOT" | null;
  onClose: () => void;
  onSuccess: (newPerson: Person) => void;
}

export function AddPersonModal({
  isOpen,
  relatedPerson,
  relationType = "ROOT",
  onClose,
  onSuccess,
}: AddPersonModalProps) {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>(relationType === "SPOUSE" && relatedPerson?.gender === "MALE" ? "FEMALE" : "MALE");
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>("LIVING");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [deathLunarDay, setDeathLunarDay] = useState<string>("");
  const [deathLunarMonth, setDeathLunarMonth] = useState<string>("");
  const [deathLunarIsLeapMonth, setDeathLunarIsLeapMonth] = useState(false);
  const [deathAnniversaryNote, setDeathAnniversaryNote] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [hometown, setHometown] = useState(relatedPerson?.hometown || "");
  const [bio, setBio] = useState("");
  const [generationNo, setGenerationNo] = useState<string>(
    relationType === "CHILD" && relatedPerson?.generation_no
      ? String(relatedPerson.generation_no + 1)
      : relationType === "PARENT" && relatedPerson?.generation_no && relatedPerson.generation_no > 1
      ? String(relatedPerson.generation_no - 1)
      : relatedPerson?.generation_no
      ? String(relatedPerson.generation_no)
      : "1"
  );
  const [branchCode, setBranchCode] = useState(relatedPerson?.branch_code || "Chi 1");

  // Multi-spouse context state
  const [unionsList, setUnionsList] = useState<Array<{
    unionId: string;
    spouseId: string;
    spouseName: string;
    spouseGender: string;
    status?: string;
  }>>([]);
  const [selectedUnionId, setSelectedUnionId] = useState<string>("");
  const [actualParentId, setActualParentId] = useState<string>("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen || !relatedPerson) {
      setUnionsList([]);
      setSelectedUnionId("");
      setActualParentId("");
      return;
    }

    if (relationType === "CHILD") {
      getPersonUnions(relatedPerson.id).then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setUnionsList(res.data);
          // Nếu relatedPerson là Nữ (Vợ/Dâu), người cha trực hệ chính là spouseId trong union!
          if (relatedPerson.gender === "FEMALE") {
            const firstUnion = res.data[0];
            setActualParentId(firstUnion.spouseId); // Cha là chồng
            setSelectedUnionId(firstUnion.unionId);
          } else {
            // relatedPerson là Nam (Cha), mặc định chọn union đầu tiên hoặc để trống
            setActualParentId(relatedPerson.id);
            setSelectedUnionId(res.data[0].unionId);
          }
        } else {
          setActualParentId(relatedPerson.id);
          setSelectedUnionId("");
        }
      });
    }
  }, [isOpen, relatedPerson, relationType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập họ và tên thành viên" });
      return;
    }

    startTransition(async () => {
      // 1. Create Person record
      const res = await createPerson({
        fullName: fullName.trim(),
        gender,
        lifeStatus,
        birthDate: birthDate || null,
        deathDate: deathDate || null,
        deathLunarDay: deathLunarDay ? Number(deathLunarDay) : null,
        deathLunarMonth: deathLunarMonth ? Number(deathLunarMonth) : null,
        deathLunarIsLeapMonth,
        deathAnniversaryNote: deathAnniversaryNote.trim() || null,
        birthPlace: birthPlace.trim() || null,
        hometown: hometown.trim() || null,
        bio: bio.trim() || null,
        generationNo: generationNo ? Number(generationNo) : null,
        branchCode: branchCode.trim() || null,
      });

      if (!res.success || !res.data) {
        setMessage({ type: "error", text: res.error || "Không thể thêm thành viên" });
        return;
      }

      const newPerson = res.data;

      // 2. Link relationship if relatedPerson exists
      if (relatedPerson) {
        if (relationType === "CHILD") {
          // Parent-child linkage:
          // If relatedPerson is Female (Wife/Dâu), link child to husband as lineage parent
          const effectiveParentId = actualParentId || relatedPerson.id;
          await addParentChild({
            parentId: effectiveParentId,
            childId: newPerson.id,
            relationshipType: "BIOLOGICAL",
            isLineageRelation: true,
            displayOrder: 1,
            unionId: selectedUnionId || null,
          });
        } else if (relationType === "PARENT") {
          // newPerson is Parent -> relatedPerson is Child
          await addParentChild({
            parentId: newPerson.id,
            childId: relatedPerson.id,
            relationshipType: "BIOLOGICAL",
            isLineageRelation: true,
            displayOrder: 1,
          });
        } else if (relationType === "SPOUSE") {
          // Spouse union
          await addUnion({
            partner1Id: relatedPerson.id,
            partner2Id: newPerson.id,
            status: "MARRIED",
          });
        }
      }

      setMessage({ type: "success", text: "Đã thêm thành viên mới vào gia phả thành công!" });
      setTimeout(() => {
        onSuccess(newPerson);
      }, 700);
    });
  };

  const getRelationLabel = () => {
    if (!relatedPerson) return "Thêm người mới vào gia phả";
    if (relationType === "CHILD") return `Thêm con cho: ${relatedPerson.full_name}`;
    if (relationType === "SPOUSE") return `Thêm vợ/chồng cho: ${relatedPerson.full_name}`;
    if (relationType === "PARENT") return `Thêm cha/mẹ cho: ${relatedPerson.full_name}`;
    return "Thêm thành viên";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-emerald-50/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base sm:text-lg font-bold text-slate-900">{getRelationLabel()}</h3>
              <p className="truncate text-[11px] sm:text-xs text-slate-500">Nhập đầy đủ thông tin thành viên dòng họ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mx-6 mt-4 p-4 rounded-2xl flex items-start gap-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-rose-50 text-rose-900 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Họ và tên <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
            />
          </div>

          {/* Chọn mẹ / cuộc hôn nhân nếu thêm con cho người cha có nhiều vợ */}
          {relationType === "CHILD" && unionsList.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
              <label className="block text-xs font-bold text-rose-950 mb-1.5 flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-600 fill-rose-500" />
                <span>
                  {relatedPerson?.gender === "FEMALE"
                    ? `Người mẹ: ${relatedPerson.full_name} (Hôn phối với cha: ${unionsList[0]?.spouseName})`
                    : "Chọn người mẹ (Cuộc hôn nhân sinh ra con):"}
                </span>
              </label>
              {relatedPerson?.gender !== "FEMALE" && (
                <select
                  value={selectedUnionId}
                  onChange={(e) => setSelectedUnionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold border border-rose-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                >
                  <option value="">-- Chưa xác định / Không rõ người mẹ --</option>
                  {unionsList.map((u, idx) => (
                    <option key={u.unionId} value={u.unionId}>
                      Vợ {idx + 1}: {u.spouseName} ({u.status === "MARRIED" ? "Đang kết hôn" : u.status})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Gender & Life Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
                <option value="UNKNOWN">Chưa rõ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tình trạng</label>
              <select
                value={lifeStatus}
                onChange={(e) => setLifeStatus(e.target.value as LifeStatus)}
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
              >
                <option value="LIVING">Còn sống</option>
                <option value="DECEASED">Đã qua đời</option>
                <option value="UNKNOWN">Chưa rõ</option>
              </select>
            </div>
          </div>

          {/* Generation No & Branch Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Đời thứ (Thế hệ)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={generationNo}
                onChange={(e) => setGenerationNo(e.target.value)}
                placeholder="1, 2, 3..."
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Chi / Nhánh</label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                placeholder="Ví dụ: Chi 1, Nhánh Trưởng..."
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          {/* Birth Date & Death Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ngày / Năm sinh</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Ngày / Năm mất (Dương lịch)
              </label>
              <input
                type="date"
                disabled={lifeStatus === "LIVING"}
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 min-h-[48px]"
              />
            </div>
          </div>

          {/* Lunar Death Date (If Deceased) */}
          {lifeStatus === "DECEASED" && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
              <span className="text-sm font-bold text-amber-950 block">
                Ngày kỵ nhật (Giỗ Âm lịch):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">Ngày âm</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={deathLunarDay}
                    onChange={(e) => setDeathLunarDay(e.target.value)}
                    placeholder="1 - 30"
                    className="w-full p-2.5 text-sm border border-amber-300 rounded-xl bg-white min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">Tháng âm</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={deathLunarMonth}
                    onChange={(e) => setDeathLunarMonth(e.target.value)}
                    placeholder="1 - 12"
                    className="w-full p-2.5 text-sm border border-amber-300 rounded-xl bg-white min-h-[44px]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deathLunarIsLeapMonth}
                      onChange={(e) => setDeathLunarIsLeapMonth(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Tháng nhuận</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Nơi an táng / Mộ phần
                </label>
                <input
                  type="text"
                  value={deathAnniversaryNote}
                  onChange={(e) => setDeathAnniversaryNote(e.target.value)}
                  placeholder="Ví dụ: Nghĩa trang quê nhà, Lăng mộ chi 1..."
                  className="w-full p-2.5 text-sm border border-amber-300 rounded-xl bg-white min-h-[44px]"
                />
              </div>
            </div>
          )}

          {/* Hometown & Birthplace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Quê quán</label>
              <input
                type="text"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                placeholder="Ví dụ: Làng An Truyền, Phú Vang, Huế"
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nơi sinh / Cư trú</label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          {/* Bio & Merits */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tiểu sử & Công đức</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ghi chú về học vị, chức vụ, đóng góp nổi bật cho dòng họ..."
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-3 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 min-h-[48px] cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow min-h-[48px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="h-5 w-5" />
              <span>{isPending ? "Đang lưu..." : "Lưu thành viên"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
