# Chi tiết Dự án: FakeBook

## 1. Tổng quan
FakeBook là một ứng dụng mạng xã hội đơn giản được thiết kế nhằm mô phỏng các chức năng cốt lõi của Facebook. Dự án tập trung vào các tương tác xã hội thiết yếu như đăng bài, bình luận, kết bạn và quản lý trang cá nhân người dùng.

## 2. Tech Stack (Công nghệ sử dụng)
- **Frontend (FE):** Next.js (sử dụng App Router). **Lưu ý:** Không sử dụng Docker cho Frontend.
- **Backend (BE):** Node.js (Express.js hoặc framework tương tự).
- **Database:** MongoDB (Chạy trong container Docker cùng với Backend).

## 3. Các tính năng cốt lõi (Phạm vi dự án)
*Lưu ý: Bất kỳ tính năng nào không được liệt kê rõ ràng ở đây đều nằm ngoài phạm vi của giai đoạn này và sẽ được xem xét phát triển sau.*

### 3.1. Xác thực & Phân quyền (Authentication)
- **Đăng ký (Registration):** Người dùng có thể đăng ký tài khoản. Bắt buộc phải xác thực email bằng mã (code) được gửi về địa chỉ email (phần gửi email chỉ cần dummy code "123456" để minh họa).
- **Đăng nhập (Login):** Đăng nhập tiêu chuẩn bằng email và mật khẩu.
- **Quên mật khẩu (Forgot Password):** Chức năng đặt lại mật khẩu khi bị quên.

### 3.2. Quản lý Trang cá nhân (Profile)
- **Chỉnh sửa Profile:** Người dùng có thể cập nhật thông tin cá nhân của mình, bao gồm:
  - Ảnh đại diện (Avatar)
  - Ảnh bìa (Cover Photo)
  - Tên hiển thị (Display Name)
  - Tiểu sử ngắn (Bio)
- **Quyền riêng tư:** Tính năng "Khóa trang cá nhân" nhằm hạn chế quyền xem nội dung trên profile đối với những người không phải là bạn bè hoặc người theo dõi.

### 3.3. Kết nối Xã hội (Social Graph)
- **Hệ thống Bạn bè:** Người dùng có thể gửi, chấp nhận hoặc từ chối lời mời kết bạn.
- **Hệ thống Theo dõi (Follow):** Người dùng có thể theo dõi người khác để xem các bài đăng công khai của họ.
- **Tìm kiếm (Search):** Người dùng có thể tìm kiếm người khác bằng tên.

### 3.4. Nội dung & Tương tác (Newsfeed)
- **Trang tin (Newsfeed):** Bảng tin trung tâm hiển thị các bài viết từ bạn bè và những người đang theo dõi, tương tự như feed của Facebook.
- **Quản lý Bài viết (Post):**
  - Đăng bài viết chứa văn bản và có thể kèm theo hình ảnh (chỉ cho phép tải lên hình ảnh, không hỗ trợ video hay tài liệu).
  - Chỉnh sửa bài viết của chính mình.
  - Xóa bài viết của chính mình.
- **Tương tác Bài viết:**
  - **Thích (Like):** Người dùng có thể thả like vào bài viết.
  - **Bình luận (Comment):** Người dùng có thể để lại bình luận trên bài viết.
  - **Chia sẻ (Share):** Người dùng có thể chia sẻ bài viết lên trang cá nhân của mình.
