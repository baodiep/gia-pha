import React from "react";

interface HeritageFrameOverlayProps {
  opacity?: number;
  showCenterWatermark?: boolean;
  watermarkUrl?: string | null;
}

/**
 * Component khung viền mỹ thuật truyền thống Việt Nam / Đông Á (9-slice vector)
 * Tự động co giãn theo mọi kích thước màn hình PC & Mobile, không bị vỡ nét hoa văn góc.
 */
export function HeritageFrameOverlay({
  opacity = 0.85,
  showCenterWatermark = true,
  watermarkUrl,
}: HeritageFrameOverlayProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[5] overflow-hidden select-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* 1. Lớp màu nền giấy cổ / parchment nhẹ nhàng */}
      <div className="absolute inset-0 bg-[#fdfbf7]/40 dark:bg-slate-950/40" />

      {/* 2. Đường viền bao ngoài 4 cạnh (Outer & Inner Stroke Lines) */}
      <div className="absolute inset-2 sm:inset-4 border border-[#c5a059]/40 dark:border-[#e5c158]/30 rounded-lg pointer-events-none" />
      <div className="absolute inset-3 sm:inset-5 border-2 border-[#8c6239]/60 dark:border-[#cca055]/50 rounded pointer-events-none" />

      {/* 3. Bốn Góc Hoa Văn Mỹ Thuật (Traditional Corner Ornaments) */}
      {/* Góc Trên - Trái */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-12 h-12 sm:w-20 sm:h-20 text-[#8c6239] dark:text-[#cca055]">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M5 5 H45 C45 20, 20 45, 5 45 Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path
            d="M5 5 H95 V20 H20 V95 H5 Z"
            fill="currentColor"
          />
          <path
            d="M25 25 H75 V35 H35 V75 H25 Z"
            fill="currentColor"
            fillOpacity="0.75"
          />
          <circle cx="55" cy="55" r="8" fill="currentColor" fillOpacity="0.6" />
          <path
            d="M40 40 Q55 25, 70 40 Q55 55, 40 40"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Góc Trên - Phải */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-20 sm:h-20 text-[#8c6239] dark:text-[#cca055] scale-x-[-1]">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M5 5 H45 C45 20, 20 45, 5 45 Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path
            d="M5 5 H95 V20 H20 V95 H5 Z"
            fill="currentColor"
          />
          <path
            d="M25 25 H75 V35 H35 V75 H25 Z"
            fill="currentColor"
            fillOpacity="0.75"
          />
          <circle cx="55" cy="55" r="8" fill="currentColor" fillOpacity="0.6" />
          <path
            d="M40 40 Q55 25, 70 40 Q55 55, 40 40"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Góc Dưới - Trái */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-12 h-12 sm:w-20 sm:h-20 text-[#8c6239] dark:text-[#cca055] scale-y-[-1]">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M5 5 H45 C45 20, 20 45, 5 45 Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path
            d="M5 5 H95 V20 H20 V95 H5 Z"
            fill="currentColor"
          />
          <path
            d="M25 25 H75 V35 H35 V75 H25 Z"
            fill="currentColor"
            fillOpacity="0.75"
          />
          <circle cx="55" cy="55" r="8" fill="currentColor" fillOpacity="0.6" />
          <path
            d="M40 40 Q55 25, 70 40 Q55 55, 40 40"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Góc Dưới - Phải */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-12 h-12 sm:w-20 sm:h-20 text-[#8c6239] dark:text-[#cca055] scale-x-[-1] scale-y-[-1]">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M5 5 H45 C45 20, 20 45, 5 45 Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path
            d="M5 5 H95 V20 H20 V95 H5 Z"
            fill="currentColor"
          />
          <path
            d="M25 25 H75 V35 H35 V75 H25 Z"
            fill="currentColor"
            fillOpacity="0.75"
          />
          <circle cx="55" cy="55" r="8" fill="currentColor" fillOpacity="0.6" />
          <path
            d="M40 40 Q55 25, 70 40 Q55 55, 40 40"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* 4. Họa tiết trung tâm đỉnh và đáy (Top & Bottom Center Emblem) */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 h-5 sm:h-7 px-4 bg-[#fdfbf7] dark:bg-slate-950 flex items-center justify-center text-[#8c6239] dark:text-[#cca055]">
        <svg viewBox="0 0 120 20" className="h-full w-auto fill-current">
          <path d="M0 10 Q30 0, 60 10 Q90 20, 120 10 Q90 0, 60 10 Q30 20, 0 10 Z" fillOpacity="0.3" />
          <circle cx="60" cy="10" r="5" />
          <circle cx="45" cy="10" r="2.5" />
          <circle cx="75" cy="10" r="2.5" />
          <circle cx="30" cy="10" r="1.5" />
          <circle cx="90" cy="10" r="1.5" />
        </svg>
      </div>

      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 h-5 sm:h-7 px-4 bg-[#fdfbf7] dark:bg-slate-950 flex items-center justify-center text-[#8c6239] dark:text-[#cca055] rotate-180">
        <svg viewBox="0 0 120 20" className="h-full w-auto fill-current">
          <path d="M0 10 Q30 0, 60 10 Q90 20, 120 10 Q90 0, 60 10 Q30 20, 0 10 Z" fillOpacity="0.3" />
          <circle cx="60" cy="10" r="5" />
          <circle cx="45" cy="10" r="2.5" />
          <circle cx="75" cy="10" r="2.5" />
          <circle cx="30" cy="10" r="1.5" />
          <circle cx="90" cy="10" r="1.5" />
        </svg>
      </div>

      {/* 5. Hình nền chìm trung tâm (Watermark Trống đồng hoặc Logo tùy chỉnh) */}
      {showCenterWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] dark:opacity-[0.08]">
          {watermarkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={watermarkUrl}
              alt="Họa tiết chìm"
              className="max-h-[60vh] max-w-[60vw] object-contain filter grayscale"
            />
          ) : (
            <svg
              viewBox="0 0 200 200"
              className="w-[min(65vw,65vh)] h-[min(65vw,65vh)] text-[#8c6239] dark:text-[#cca055] fill-current animate-[spin_240s_linear_infinite]"
            >
              {/* Vector biểu tượng Trống đồng Đông Sơn */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="100" r="15" fill="currentColor" fillOpacity="0.4" />
              
              {/* Các tia mặt trời ở tâm */}
              {Array.from({ length: 14 }).map((_, i) => (
                <polygon
                  key={i}
                  points="100,75 96,95 104,95"
                  transform={`rotate(${i * (360 / 14)} 100 100)`}
                  fill="currentColor"
                />
              ))}

              {/* Vòng chim Lạc bay */}
              {Array.from({ length: 8 }).map((_, i) => (
                <path
                  key={`bird-${i}`}
                  d="M100 22 C106 20, 112 25, 118 20 C114 28, 108 26, 100 28 Z"
                  transform={`rotate(${i * 45} 100 100)`}
                  fill="currentColor"
                />
              ))}
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
