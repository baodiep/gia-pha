# T025 — Transactional family import

## Goal
Ghi dữ liệu gia phả đã preview vào database một cách toàn vẹn.

## Work
- Import server-side trong transaction: persons -> parent_child -> unions -> audit.
- Resolve external_id sang UUID trong transaction.
- Có idempotency/import batch id để tránh double submit.
- Nếu bất kỳ bước bắt buộc lỗi thì rollback toàn bộ batch.
- Ghi audit summary; không log dữ liệu nhạy cảm không cần thiết.
- Sau import trả summary: số person/relationship/union tạo mới, warning, lỗi.

## Acceptance
- Không có trạng thái import nửa chừng khi transaction lỗi.
- Double click/retry không tạo bản ghi duplicate ngoài rule đã duyệt.
- Cây hiển thị đúng dữ liệu mới sau import.
- Permission/RLS không bị bypass ngoài server flow được kiểm soát.
- Test transaction/rollback PASS.
