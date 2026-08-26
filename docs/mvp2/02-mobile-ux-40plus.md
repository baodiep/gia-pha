# MVP2 — Mobile UX cho người dùng 40+

## Mục tiêu

Ứng dụng được sử dụng chủ yếu trên điện thoại và hướng tới thành viên từ khoảng 40 tuổi trở lên. Ưu tiên rõ ràng, dễ đọc, dễ bấm, ít thao tác, ít thuật ngữ kỹ thuật.

## Quy tắc bắt buộc

### Typography
- Body mặc định tối thiểu 16px; ưu tiên 17–18px ở màn hình member.
- Label/form field tối thiểu 16px để tránh trình duyệt mobile tự zoom.
- Tiêu đề màn hình rõ ràng, ưu tiên 24px trở lên.
- Không dùng chữ xám quá nhạt hoặc font-weight quá mảnh cho nội dung chính.
- Dòng văn bản dài phải có line-height thoáng, khoảng 1.5 trở lên.

### Touch targets
- Nút/action chính có vùng bấm tối thiểu khoảng 44x44px; ưu tiên chiều cao 48–52px.
- Khoảng cách giữa hai action dễ nhầm phải đủ lớn.
- Không đặt icon nhỏ đơn độc cho action quan trọng; phải có text hoặc accessible label rõ ràng.
- Các thao tác phá hủy như Xóa/Từ chối phải tách khỏi action chính và có xác nhận.

### Forms
- Mỗi field có label hiển thị cố định, không chỉ dùng placeholder.
- Input quan trọng dùng bàn phím phù hợp: phone/tel, number/decimal, date khi phù hợp.
- Lỗi phải hiển thị ngay gần field, mô tả bằng ngôn ngữ dễ hiểu và hướng dẫn cách sửa.
- Form dài chia thành nhóm/step thay vì dồn một màn hình.
- Sau submit phải chống double-click và hiển thị trạng thái `Đang xử lý...`.

### Navigation
- Mobile-first; action chính phải nằm trong vùng dễ chạm bằng ngón cái khi có thể.
- Menu không được phụ thuộc hover.
- Luôn có đường quay lại rõ ràng ở màn hình chi tiết/phức tạp.
- Breadcrumb chỉ là bổ sung; không thay thế nút quay lại trên mobile.
- Tránh quá nhiều action cùng một hàng; có thể dùng menu `Thêm` nếu action thứ cấp.

### Trạng thái và phản hồi
- Không dùng chỉ màu để phân biệt trạng thái; phải có text/icon kèm theo.
- Loading, empty, success, warning, error đều phải có trạng thái rõ ràng.
- Sau mutation phải báo thành công/thất bại bằng nội dung cụ thể.
- Không dùng toast ngắn làm nơi duy nhất chứa thông tin quan trọng.

### Hướng dẫn chức năng nâng cao
Các luồng sau bắt buộc có hướng dẫn ngay trong giao diện:
- Import gia phả Excel.
- Import đóng góp Excel.
- Tra cứu quan hệ nếu cần chọn hai người.
- Bật Browser Notification.
- Quên/reset/đổi mật khẩu tạm.
- Claim “Đây là tôi” và đề nghị chỉnh sửa hồ sơ.

Hướng dẫn nên theo dạng:
1. Mục đích ngắn gọn.
2. Các bước thực hiện.
3. Ví dụ nếu cần.
4. Cảnh báo dữ liệu/permission.
5. Link/tải file mẫu nếu có.

Không dùng đoạn mô tả dài nếu có thể thay bằng step/card ngắn.

## Bảng dữ liệu trên mobile
- Không ép bảng nhiều cột tràn ngang nếu có thể chuyển thành card/list.
- Với đóng góp, lịch sử request, event attendees: desktop có thể dùng table; mobile ưu tiên card với nhãn rõ ràng.
- Search/filter phải có nút mở/bật bộ lọc rõ ràng và hiển thị filter đang áp dụng.
- Action của từng dòng/card phải dễ bấm, không đặt sát nhau.

## Family tree trên mobile
- Không làm node quá nhỏ chỉ để hiển thị nhiều người.
- Node phải ưu tiên họ tên, trạng thái sống/mất và action chính.
- Zoom/pan phải giữ được thao tác touch.
- Khi mở chi tiết person trên mobile, ưu tiên bottom sheet/full screen detail thay vì popup nhỏ khó đọc.

## Accessibility tối thiểu
- Keyboard navigation trên desktop cho action chính.
- Focus state rõ ràng.
- Form control có label semantic.
- Button dùng `button`, link dùng `a`/Link đúng ngữ nghĩa.
- Icon quan trọng có accessible name.
- Contrast đủ rõ cho nội dung và nút chính.

## Viewport kiểm thử bắt buộc
Task có UI phải kiểm tra ít nhất:
- Mobile khoảng 360x800.
- Mobile khoảng 390x844.
- Tablet khoảng 768px rộng.
- Desktop khoảng 1280px rộng.

Không được đánh dấu DONE nếu chức năng chỉ dùng được tốt trên desktop.

## Acceptance UX chung cho từng task UI
- Không có text chính nhỏ hơn quy định trên mobile trừ metadata phụ.
- Nút chính dễ bấm bằng một tay.
- Không có horizontal overflow ngoài khu vực được thiết kế rõ ràng (ví dụ family tree canvas).
- Form không bị che bởi bàn phím/mobile viewport ở luồng chính.
- Có hướng dẫn cho thao tác nâng cao.
- Error message nói rõ người dùng cần làm gì tiếp theo.