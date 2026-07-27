# Kế hoạch Phát triển theo Giai đoạn: FakeBook

## Giai đoạn 1: Thiết lập Dự án & Cơ sở hạ tầng
- [ ] **BE:** Khởi tạo dự án Node.js (thiết lập Express, xử lý lỗi, cấu trúc thư mục).
- [ ] **BE/DB:** Tạo file `docker-compose.yml` cho MongoDB.
- [ ] **FE:** Khởi tạo dự án Next.js với App Router (thiết lập cấu trúc routing, Tailwind CSS nếu cần, state management).
- [ ] **Hạ tầng:** Thiết lập cấu hình lưu trữ hình ảnh (có thể dùng AWS S3, Cloudinary hoặc lưu trữ local).

## Giai đoạn 2: Hệ thống Xác thực (Authentication)
- [ ] **BE:** Tạo User Schema trong MongoDB.
- [ ] **BE:** Tích hợp Nodemailer (chỉ cần dummy code "123456" để minh họa) để gửi mã xác nhận qua email.
- [ ] **BE:** Phát triển các API cho Đăng ký (tạo & xác minh mã code), Đăng nhập (tạo JWT), và Quên/Đặt lại mật khẩu.
- [ ] **FE:** Xây dựng giao diện (UI): Đăng ký, Xác minh Email, Đăng nhập và Quên mật khẩu.
- [ ] **FE:** Xây dựng Authentication Context/State và bảo vệ các route (Middleware).

## Giai đoạn 3: Trang cá nhân & Kết nối
- [ ] **BE:** Phát triển API để cập nhật Profile (avatar, cover, tên, bio).
- [ ] **BE:** Phát triển API cho tính năng "Khóa trang cá nhân".
- [ ] **BE:** Thiết kế schema và API cho Lời mời kết bạn (Gửi, Chấp nhận, Từ chối, Hủy kết bạn) và Theo dõi (Follow, Unfollow).
- [ ] **BE:** Phát triển API Tìm kiếm (Search) người dùng theo tên.
- [ ] **FE:** Xây dựng giao diện trang Profile (Header, Thông tin, Nút Kết bạn/Theo dõi).
- [ ] **FE:** Tích hợp UI cho việc chỉnh sửa Profile và bật/tắt "Khóa trang cá nhân".
- [ ] **FE:** Xây dựng thanh Tìm kiếm (Search bar) và trang/dropdown kết quả tìm kiếm.

## Giai đoạn 4: Quản lý Bài viết & Newsfeed
- [ ] **BE:** Tạo Post Schema (tác giả, nội dung, URLs hình ảnh, thời gian).
- [ ] **BE:** Phát triển API cho việc tạo bài viết (xử lý upload hình ảnh), chỉnh sửa và xóa bài viết.
- [ ] **BE:** Phát triển API Newsfeed (tổng hợp bài viết từ bạn bè, người theo dõi và bản thân, sắp xếp theo thời gian mới nhất).
- [ ] **FE:** Xây dựng Component tạo bài viết (khung nhập text, preview hình ảnh tải lên).
- [ ] **FE:** Xây dựng Component hiển thị Bài viết đơn lẻ (hiển thị tác giả, thời gian, nội dung, hình ảnh).
- [ ] **FE:** Xây dựng trang Newsfeed để gọi API và hiển thị bảng tin.

## Giai đoạn 5: Tương tác (Like, Comment, Share)
- [ ] **BE:** Tạo Schema/Model cho Likes, Comments và Shares.
- [ ] **BE:** Phát triển API để thực hiện thao tác Like bài viết.
- [ ] **BE:** Phát triển API để tạo, chỉnh sửa và xóa bình luận.
- [ ] **BE:** Phát triển API để chia sẻ (Share) bài viết.
- [ ] **FE:** Tích hợp UI cho nút Like (sử dụng optimistic updates để tăng trải nghiệm).
- [ ] **FE:** Xây dựng khu vực Bình luận (khung nhập, danh sách bình luận) cho mỗi bài viết.
- [ ] **FE:** Tích hợp UI và logic cho chức năng Chia sẻ.

## Giai đoạn 6: Hoàn thiện & Sửa lỗi (Fix bug)
- [ ] **FE/BE:** Kiểm thử (Testing) toàn bộ các luồng chức năng chính.
- [ ] **FE:** Hoàn thiện UI/UX, thêm các trạng thái loading, hiển thị thông báo lỗi (toast notifications).
- [ ] **BE:** Tối ưu hóa truy vấn MongoDB (đánh index cho tên người dùng, thời gian tạo bài viết).
- [ ] **FE/BE:** Kiểm tra bảo mật lần cuối (validate đầu vào dữ liệu, giới hạn rate limit cho việc gửi email).
