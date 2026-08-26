# MVP2 — Phạm vi sản phẩm

## Mục tiêu

MVP2 chuyển ứng dụng từ một cây gia phả có thể quản trị thành một ứng dụng dòng họ có thể sử dụng thường xuyên trên điện thoại: đưa dữ liệu thật vào nhanh, thành viên tự tham gia cập nhật, tra cứu quan hệ, theo dõi ngày giỗ/sự kiện, xem tư liệu và minh bạch đóng góp.

Đối tượng sử dụng chính là thành viên dòng họ từ khoảng 40 tuổi trở lên, phần lớn truy cập bằng điện thoại. Mọi chức năng phải ưu tiên dễ đọc, dễ bấm, ít bước, thông báo rõ ràng và có hướng dẫn cho thao tác nâng cao.

## Trong phạm vi MVP2

1. Import gia phả từ Excel: template, parse, validate, preview, phát hiện trùng/lỗi, import transaction.
2. Thành viên gửi yêu cầu xác nhận “Đây là tôi” và đề nghị sửa hồ sơ; Admin/người quản lý phù hợp duyệt hoặc từ chối.
3. Quên mật khẩu: người dùng nhập tài khoản + CAPTCHA phép tính đơn giản để gửi yêu cầu; Admin nhận notification và quản lý danh sách yêu cầu reset.
4. Admin reset mật khẩu theo hai cách: tạo ngẫu nhiên 8 chữ số hoặc nhập tay. Mật khẩu ngẫu nhiên bắt buộc đổi ở lần đăng nhập kế tiếp.
5. Tra cứu quan hệ giữa hai thành viên trên cây và hiển thị đường quan hệ dễ hiểu.
6. Lịch âm/ngày giỗ theo từng năm và lịch dòng họ.
7. Trang chủ thành viên: việc sắp tới, ngày giỗ, sự kiện, thông báo, lối tắt đóng góp.
8. Tư liệu dòng họ/album ảnh dưới dạng liên kết ngoài (Google Drive, YouTube, website khác...) kèm tên, mô tả, loại và trạng thái. Không upload file trực tiếp.
9. Sự kiện nâng cao: RSVP và danh sách tham dự.
10. Notification trong ứng dụng; tùy chọn bật Browser Push Notification sau khi người dùng chủ động yêu cầu quyền.
11. Đóng góp dòng họ: cấu hình QR/thông tin tài khoản nhận; danh sách đóng góp do Admin thêm/sửa/xóa; người khác chỉ xem/tìm kiếm.
12. Tìm kiếm đóng góp theo SĐT, họ tên, khoảng thời gian, khoảng tiền và mục đích dạng text contains; thống kê theo kết quả lọc.
13. Import danh sách đóng góp bằng Excel, preview, validate, cảnh báo trùng và gợi ý map tài khoản theo SĐT.

## Ngoài phạm vi MVP2

- SMS, OTP, xác thực SĐT hoặc thông báo SMS.
- GEDCOM và export gia phả.
- Upload album/tài liệu lịch sử vào storage của hệ thống.
- Thu tiền/thanh toán trực tiếp trong ứng dụng; QR chỉ hiển thị thông tin để người dùng tự chuyển khoản.
- Tự động đọc giao dịch ngân hàng hoặc tự động đối soát đóng góp.
- Chat, comment/like, mạng xã hội dòng họ.
- Native Android/iOS.
- Multi-tenant nhiều dòng họ.
- Graph DB, Redis, Kafka hoặc tách microservice nếu không có yêu cầu mới.

## Nguyên tắc quyền

- Admin quản trị toàn bộ chức năng MVP2.
- Branch Manager chỉ được thao tác dữ liệu thuộc phạm vi nhánh nếu task cụ thể cho phép và permission server-side xác nhận.
- Member chỉ được đọc dữ liệu được phép và tạo các request của chính mình.
- Danh sách đóng góp: Admin CRUD/import; Member chỉ read/search/filter.
- Mọi mutation phải kiểm tra quyền server-side và các bảng mới phải có RLS phù hợp.
- Xóa nghiệp vụ mặc định là soft delete nếu dữ liệu cần audit/khôi phục.

## Nguyên tắc dữ liệu nhạy cảm

- Không lưu plaintext password trong database, notification hoặc audit log.
- CAPTCHA phải được kiểm tra server-side; không gửi đáp án đúng xuống client.
- Trang quên mật khẩu không được làm lộ việc một tài khoản có tồn tại hay không.
- SĐT trong danh sách đóng góp được xem theo chính sách của ứng dụng; không sử dụng làm thông tin xác thực mới trong MVP2.

## Quality gates chung

Mỗi task phải chạy kiểm tra phù hợp và trước release phải đạt tối thiểu:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Mọi task có UI phải tuân thủ `docs/mvp2/02-mobile-ux-40plus.md`.