"use client";

import React, { useState } from "react";
import { FamilyResource, ResourceType } from "@/types/domain";
import {
  FolderOpen,
  Image,
  FileText,
  BookOpen,
  Video,
  ExternalLink,
  Search,
  ShieldCheck,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

interface FamilyResourcesViewProps {
  initialResources: FamilyResource[];
}

export function FamilyResourcesView({ initialResources }: FamilyResourcesViewProps) {
  const [selectedType, setSelectedType] = useState<ResourceType | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filteredResources = initialResources.filter((r) => {
    const matchType = selectedType === "ALL" || r.resource_type === selectedType;
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase().trim()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase().trim()));
    return matchType && matchSearch;
  });

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case "ALBUM":
        return <Image className="w-6 h-6 text-blue-600" />;
      case "DOCUMENT":
        return <FileText className="w-6 h-6 text-amber-600" />;
      case "WEBSITE":
        return <BookOpen className="w-6 h-6 text-emerald-600" />;
      case "VIDEO":
        return <Video className="w-6 h-6 text-red-600" />;
      default:
        return <FolderOpen className="w-6 h-6 text-purple-600" />;
    }
  };

  const getTypeName = (type: ResourceType) => {
    switch (type) {
      case "ALBUM":
        return "Album Ảnh";
      case "DOCUMENT":
        return "Tài Liệu / Gia Phả Cổ";
      case "WEBSITE":
        return "Sử Ký / Website";
      case "VIDEO":
        return "Video Dòng Họ";
      default:
        return "Tư Liệu Khác";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          Tư Liệu & Lịch Sử Dòng Họ
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
          Lưu trữ các album ảnh, sách gia phả scan, video ngày hội và sử ký truyền thống của dòng tộc.
        </p>
      </div>

      {/* Notice on External Links */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-sm sm:text-base text-emerald-900 space-y-1">
          <p className="font-bold">Liên kết ngoài an toàn:</p>
          <p className="text-gray-700">
            Để đảm bảo chất lượng hình ảnh và dung lượng cao nhất, các tư liệu được lưu trữ trên Google Drive, Google Photos, YouTube hoặc kho số hóa của Ban Quản trị. Bấm vào nút để mở xem trực tiếp.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search (40+ friendly buttons) */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên tư liệu, album, mô tả..."
            className="w-full pl-11 pr-4 py-3 text-base sm:text-lg border border-gray-300 rounded-xl min-h-[48px] focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {(["ALL", "ALBUM", "DOCUMENT", "WEBSITE", "VIDEO", "OTHER"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-base min-h-[44px] cursor-pointer transition-colors ${
                selectedType === t
                  ? "bg-emerald-700 text-white shadow"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t === "ALL" ? "Tất cả tư liệu" : getTypeName(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-lg">
          Không tìm thấy tư liệu nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                      {getTypeIcon(res.resource_type)}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
                      {getTypeName(res.resource_type)}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {res.title}
                </h3>

                {res.description && (
                  <p className="text-base text-gray-600 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base sm:text-lg rounded-xl shadow min-h-[48px] transition-colors"
                >
                  <span>Mở xem tư liệu</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="pt-6 flex justify-center">
        <BackButton fallbackHref="/" label="Về Trang Chủ" />
      </div>
    </div>
  );
}
