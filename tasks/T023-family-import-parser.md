# T023 — Family Excel import template & parser

## Goal
Cho phép Admin dùng file Excel chuẩn để chuẩn bị dữ liệu gia phả số lượng lớn.

## Work
- Cung cấp file/template mô tả cột: external_id, họ tên, giới tính, ngày sinh/mất, cha, mẹ, vợ/chồng, đời, chi, quê quán, ghi chú.
- Parser Excel server-side; không tin dữ liệu client.
- Normalize text/date/phone nếu có; validate enum và required fields.
- Không dùng UUID bắt buộc trong file nguồn; quan hệ tham chiếu bằng external_id.
- UI upload mobile-friendly, có hướng dẫn 3–5 bước, link tải file mẫu, giới hạn dung lượng/dòng rõ ràng.

## Acceptance
- Parse được file mẫu hợp lệ.
- File sai định dạng/cột bắt buộc cho lỗi dễ hiểu theo dòng/cột.
- Không ghi DB trong task này.
- UI tuân thủ `docs/mvp2/02-mobile-ux-40plus.md`.
