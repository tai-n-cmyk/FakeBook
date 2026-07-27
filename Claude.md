# Ngữ cảnh & Hướng dẫn dành cho AI: Dự án FakeBook

## Tổng quan Dự án
Bạn đang hỗ trợ phát triển "FakeBook", một ứng dụng mạng xã hội đơn giản. 
Ngôn ngữ giao tiếp chính để làm việc và viết tài liệu là **Tiếng Việt**.

## Yêu cầu & Ràng buộc về Công nghệ (Tech Stack)
- **Frontend (FE):**
  - **Framework:** Next.js (sử dụng App Router).
  - **Container hóa:** KHÔNG SỬ DỤNG Docker cho frontend.
   Frontend phải được chạy trực tiếp bằng Node/npm (`npm run dev` / `npm start`).
- **Backend (BE):**
  - **Môi trường:** Node.js.
  - **Cơ sở dữ liệu:** MongoDB.
  - **Container hóa:** Sử dụng Docker và `docker-compose` để chạy MongoDB (và Backend Node.js nếu cần).

## Giới hạn Phạm vi Tính năng (Scope)
Tuyệt đối tuân thủ các tính năng sau đây. Không tự ý triển khai hoặc đề xuất các tính năng ngoài danh sách này trừ khi được người dùng yêu cầu mở rộng:
1.  **Xác thực (Auth):** Đăng ký (xác minh qua mã gửi về email - sử dụng dummy code "123456" để minh họa), Đăng nhập, Quên mật khẩu.
2.  **Bảng tin (Newsfeed):** Tương tự như bảng tin của Facebook.
3.  **Bài viết (Posts):** CHỈ cho phép tải lên văn bản và hình ảnh (không hỗ trợ video/tài liệu). Cho phép tạo, chỉnh sửa và xóa bài viết của chính mình.
4.  **Tương tác (Interactions):** Kết bạn, Theo dõi, Thích (Like), Bình luận (Comment), Chia sẻ (Share).
5.  **Quyền riêng tư:** "Khóa trang cá nhân".
6.  **Trang cá nhân (Profile):** Chỉnh sửa avatar, ảnh bìa, tên hiển thị, tiểu sử (bio).
7.  **Tìm kiếm:** Tìm kiếm người dùng qua tên.

## Hướng dẫn Phát triển
- Ưu tiên viết code sạch (clean), dễ đọc và phân chia module hợp lý.
- Đảm bảo xử lý lỗi (error handling) chặt chẽ ở cả frontend và backend.
- Sử dụng các phương pháp bảo mật tiêu chuẩn cho xác thực (ví dụ: JWT, bcrypt để băm mật khẩu) và lưu các thông tin nhạy cảm trong biến môi trường (environment variables).
- Đối với tính năng upload hình ảnh, sử dụng một chiến lược lưu trữ ổn định (như Cloudinary, S3 hoặc thư mục tĩnh cấu hình tốt).
- Code (tên biến, hàm, v.v.) có thể viết bằng tiếng Anh, nhưng toàn bộ tài liệu, bình luận (comments) giải thích quan trọng và giao tiếp với người dùng luôn phải sử dụng **Tiếng Việt**.
