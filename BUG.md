# Danh sách Bug & Tính năng cần hoàn thiện (BUG.md)

## BUG (Backend / Logic)
- [x] Khóa/Mở trang cá nhân: Bạn bè (bb) hiện tại vẫn có thể xem được nội dung khi trang bị khóa, cần kiểm tra lại logic hiển thị.
- [x] Không được share chính bài post của mình (chặn hành động tự share bài của bản thân).
- [x] Chỉnh sửa bài viết: Hỗ trợ người dùng có thể chỉnh sửa lại trạng thái (nội dung/hình ảnh) sau khi đã đăng bài.
- [x] Trả lời bình luận: Bổ sung tính năng cho phép người dùng có thể Reply (phản hồi) lại bình luận của người khác.

## FE (Giao diện / Client-side)
- [x] Preview hình ảnh: Khi nhập/chọn ảnh cần thêm bước hiển thị Preview (xem trước) trước khi người dùng nhấn Đăng.
- [x] Revalidate Data: Giao diện (FE) phải tự động cập nhật/tải lại (revalidate) khi có data mới cập nhật ở bài post (ví dụ như có người vừa like, comment hoặc share).

## Lỗi / Tính năng bổ sung đợt 2
- [x] Lỗi hiển thị tên: Khi comment/reply bài viết, FE không hiện tên người trả lời (có thể do thiếu bước populate dữ liệu user lúc trả về).
- [x] Quyền riêng tư: Sau khi đổi trạng thái bài viết thành "Chỉ Mình Tôi", cần đảm bảo người khác không thể xem được bài post đó trên bảng tin hoặc trang cá nhân.
- [x] Tự động cập nhật: Sau khi có lượt Like hay bình luận, FE phải tự động cập nhật/tải lại giao diện ngay lập tức mà không cần F5.
- [x] Vô hiệu hoá UI nút Share: Đảm bảo người dùng không thể nhấn nút Share trên UI đối với bài viết do chính họ đăng tải.

## Lỗi / Tính năng bổ sung đợt 3
- [x] Tự động cập nhật / Revalidate thời gian thực: Bổ sung cơ chế tự động quét dữ liệu theo chu kỳ (Auto-polling) và tự động làm mới khi Focus cửa sổ giúp bài post (Likes, Comments, Shares) luôn tự động tải lại mà không cần bấm F5 hay chờ người dùng tương tác.
