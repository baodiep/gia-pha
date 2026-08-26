"use client";

import React, { useState } from "react";
import { ContributionSettings } from "@/types/domain";
import {
  HeartHandshake,
  QrCode,
  Building2,
  CreditCard,
  User,
  Copy,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

interface ContributionQrViewProps {
  settings: ContributionSettings | null;
}

export function ContributionQrView({ settings }: ContributionQrViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  if (!settings || !settings.is_active) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-gray-200 rounded-2xl text-center space-y-4 shadow-sm">
        <HeartHandshake className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Quỹ Dòng Họ Tạm Chưa Mở</h2>
        <p className="text-base text-gray-600">
          Hiện tại Ban Quản trị dòng họ chưa kích hoạt thông tin nhận đóng góp trực tuyến. Vui lòng liên hệ trực tiếp Trưởng ban hoặc Thủ quỹ dòng tộc.
        </p>
        <div className="pt-4 flex justify-center">
          <BackButton fallbackHref="/" label="Về Cây Gia Phả" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <HeartHandshake className="w-8 h-8 text-emerald-600" />
          Đóng Góp Xây Dựng Dòng Họ
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
          Chung tay tôn tạo nhà thờ họ, khuyến học, phụng dưỡng tiền nhân và tổ chức ngày hội truyền thống.
        </p>
      </div>

      {/* Security notice for 40+ friendly UX */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-gray-800">
        <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm sm:text-base text-emerald-950">
          <p className="font-bold">Kênh tiếp nhận chính thức:</p>
          <p className="text-gray-700 leading-relaxed">
            Mọi khoản đóng góp chỉ được chuyển trực tiếp vào tài khoản đại diện dòng họ dưới đây. Ứng dụng không xử lý thanh toán trung gian. Sau khi chuyển, Thủ quỹ sẽ cập nhật vào sổ ghi nhận công đức.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* QR Card */}
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Mã QR Chuyển Khoản Nhanh
          </span>

          {settings.qr_code_url ? (
            <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-inner max-w-[280px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.qr_code_url}
                alt="QR Code Quỹ Dòng Họ"
                className="w-full h-auto rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-4 text-gray-400 space-y-2">
              <QrCode className="w-16 h-16 text-gray-300" />
              <span className="text-sm text-center">Chưa có ảnh mã QR (Chuyển khoản thủ công bên cạnh)</span>
            </div>
          )}

          <p className="text-sm text-gray-500 max-w-xs">
            Mở ứng dụng Ngân hàng trên điện thoại và quét mã QR để điền tự động số tài khoản.
          </p>
        </div>

        {/* Bank Account Info Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mục đích quỹ</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              {settings.fund_purpose_title}
            </h2>
            {settings.fund_description && (
              <p className="text-base text-gray-600 mt-2 leading-relaxed">
                {settings.fund_description}
              </p>
            )}
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            {/* Bank Name */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>Ngân hàng thụ hưởng:</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{settings.bank_name}</p>
            </div>

            {/* Account Number */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-emerald-800 font-semibold">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Số tài khoản:</span>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tracking-wider">
                  {settings.account_number}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(settings.account_number, "accNum")}
                className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow text-sm min-h-[44px] flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedField === "accNum" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Account Holder */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <User className="w-4 h-4 text-gray-400" />
                <span>Chủ tài khoản (Đại diện dòng họ):</span>
              </div>
              <p className="text-lg font-bold text-gray-900 uppercase">{settings.account_holder}</p>
            </div>

            {/* Transfer Syntax Guide */}
            {settings.transfer_syntax_guide && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-amber-900 font-bold">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>Cú pháp nội dung chuyển khoản gợi ý:</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-amber-950 font-mono">
                    {settings.transfer_syntax_guide}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.transfer_syntax_guide!, "syntax")}
                    className="text-amber-800 hover:text-amber-950 text-xs font-bold underline px-2 py-1"
                  >
                    {copiedField === "syntax" ? "Đã sao chép" : "Sao chép cú pháp"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="pt-6 flex justify-center">
        <BackButton fallbackHref="/" label="Về Cây Gia Phả" />
      </div>
    </div>
  );
}
