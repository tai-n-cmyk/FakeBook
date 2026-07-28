# FakeBook - Data Flows (Luồng giao tiếp FE - BE - DB)

Tài liệu này trình bày chi tiết các luồng giao tiếp (Communication Flows) giữa Frontend (Giao diện), Backend (Máy chủ) và Database (Cơ sở dữ liệu) cho từng chức năng cụ thể trong ứng dụng FakeBook.

---

## 1. Luồng Xác thực (Authentication Flows)

### a. Tạo tài khoản (Register)
1. **FE (Client)**: Người dùng nhập `name`, `email`, `password` vào form Đăng ký và nhấn Submit. FE gửi request `POST /api/auth/register` với body chứa thông tin.
2. **BE (Express)**:
   - Nhận request, kiểm tra xem `email` đã tồn tại trong DB chưa.
   - Nếu chưa: Mã hóa (hash) `password` bằng `bcrypt`.
   - Tạo mã xác thực (OTP/Verification Token) để gửi qua email (nếu có tích hợp gửi mail).
3. **DB (MongoDB)**: `User.create()` lưu bản ghi người dùng mới với trạng thái chưa xác minh (hoặc lưu thẳng tùy cấu hình).
4. **BE (Express)**: Trả về HTTP 201 (Created) cùng với thông báo yêu cầu xác minh email.
5. **FE (Client)**: Hiển thị thông báo thành công và chuyển hướng người dùng sang trang Xác thực hoặc Đăng nhập.

### b. Đăng nhập (Login)
1. **FE (Client)**: Người dùng nhập `email`, `password` và nhấn Login. Gửi request `POST /api/auth/login`.
2. **BE (Express)**:
   - Tìm user theo `email` trong DB.
   - So sánh (compare) `password` nhập vào với chuỗi hash trong DB bằng `bcrypt`.
3. **DB (MongoDB)**: Trả về kết quả tìm kiếm user.
4. **BE (Express)**: Nếu mật khẩu khớp, tạo mã `JWT (JSON Web Token)` chứa `userId` và trả về JSON gồm Token và thông tin User cơ bản.
5. **FE (Client)**: 
   - Lưu Token vào `Cookie` (hoặc `localStorage`).
   - Cập nhật Context (`AuthContext`) để toàn bộ ứng dụng biết user đã đăng nhập.
   - Chuyển hướng sang trang chủ (Newsfeed).

### c. Quên mật khẩu & Đặt lại mật khẩu (Forgot/Reset Password)
1. **FE (Client)**: Nhập email gửi yêu cầu quên mật khẩu `POST /api/auth/forgot-password`.
2. **BE (Express)**: Tìm user theo email. Tạo ra một mã OTP hoặc Token đặt lại mật khẩu ngẫu nhiên, lưu tạm vào DB và gửi Token này qua Email của người dùng.
3. **FE (Client)**: Chuyển sang màn hình nhập mã OTP/Token và Mật khẩu mới. Nhấn lưu sẽ gửi `POST /api/auth/reset-password`.
4. **BE (Express)**: Kiểm tra Token có hợp lệ/hết hạn không. Nếu đúng, mã hóa mật khẩu mới và cập nhật vào DB.
5. **DB (MongoDB)**: `User.updateOne()` lưu mật khẩu mới, xóa mã Token cũ.
6. **FE (Client)**: Nhận thông báo thành công và điều hướng về trang Đăng nhập.

---

## 2. Luồng Tương tác Bài viết (Post Flows)

### a. Đăng bài viết (Create Post kèm Hình ảnh)
1. **FE (Client)**: Người dùng nhập text, chọn ảnh (tạo URL xem trước trên FE), chọn quyền riêng tư. Khi Submit, FE đóng gói dữ liệu vào `FormData` (để gửi file) và gọi `POST /api/posts`.
2. **BE (Express)**: 
   - Middleware `protect` giải mã JWT lấy `req.user._id`.
   - Middleware `multer` nhận các file ảnh, lưu xuống ổ đĩa vật lý `/backend/uploads/` và trả về mảng đường dẫn file.
3. **DB (MongoDB)**: `Post.create()` lưu thông tin bài viết gồm: `user`, `content`, `privacy`, và mảng `images` (chứa các URL ảnh).
4. **FE (Client)**: Nhận HTTP 201. Đóng Modal đăng bài. FE gọi hàm revalidate (`fetchPosts`) với cờ `cache: 'no-store'` để lấy bản tin mới nhất mà không bị vướng Cache của Next.js.

### b. Tương tác: Thích (Like) & Bình luận (Comment/Reply)
1. **FE (Client)**: 
   - **Thích**: FE lập tức dùng `useState` cộng thêm 1 Like, đổi màu nút (Optimistic Update) để trải nghiệm không bị khựng. Sau đó gọi `POST /api/posts/:id/like` ngầm.
   - **Bình luận**: Gửi text lên `POST /api/posts/:id/comment`.
2. **BE (Express)**: 
   - **Xác thực (Middleware `protect`)**: Tương tự mọi tác vụ khác, API phải đi qua middleware `protect` để kiểm tra Token. Nếu hợp lệ, gán `req.user._id` (đây là lý do Backend biết chính xác ai đang Like/Comment mà FE không cần truyền ID của người đang thao tác lên).
   - **Thích**: Kiểm tra DB xem `req.user._id` đã like chưa. Nếu có thì xóa (Unlike), nếu chưa thì thêm vào mảng `likes`.
   - **Bình luận**: Thêm object comment chứa `req.user._id` và `text` vào mảng `comments`. Gọi `populate` để đính kèm Name và Avatar của người bình luận lúc trả về.
3. **DB (MongoDB)**: Cập nhật Document bài viết tương ứng bằng `post.save()`.
4. **FE (Client)**: 
   - FE gọi hàm `onUpdate()` kích hoạt lấy lại danh sách bài viết.
   - Khi nhận cục data mới, hook `useEffect` trong Component bài viết sẽ đồng bộ lại số Like và danh sách Comment/Reply chính xác 100% từ Database.

### c. Luồng Chia sẻ bài viết (Share Post Flow)
1. **FE (Client)**: 
   - Kiểm tra xem bài viết có thuộc về chính mình hay không. Nếu là bài của mình, nút "Chia sẻ" sẽ bị mờ/khoá (disabled).
   - Nếu là bài của người khác, người dùng nhấn "Chia sẻ", nhập cảm nghĩ (optionally) và nhấn "Chia sẻ ngay" -> Gọi `POST /api/posts/:id/share`.
2. **BE (Express)**:
   - **Xác thực (Middleware `protect`)**: Kiểm tra JWT Token lấy `req.user._id`.
   - **Kiểm tra bài gốc (Root Post)**: Lấy `originalPostId` (nếu share một bài vốn đã là bài share, hệ thống sẽ tự trỏ về ID của bài viết gốc đầu tiên).
   - **Kiểm tra quyền (Validation)**:
     - Tự share bài của chính mình ➜ Trả về lỗi `HTTP 400 (Bad Request)`.
     - Bài gốc để `only_me` ➜ Trả về lỗi `HTTP 403 (Forbidden)`.
     - Bài gốc để `friends` nhưng người share không phải bạn bè của tác giả bài gốc ➜ Trả về lỗi `HTTP 403 (Forbidden)`.
   - **Tạo bài viết mới**: Tạo một Document Post mới với `user = req.user._id` và `sharedFrom = originalPostId`.
   - **Tăng chỉ số & Thông báo**:
     - Tăng chỉ số `shareCount` của bài viết gốc lên 1 (`$inc: { shareCount: 1 }`).
     - Bổ sung một bản ghi vào bảng `Notification` gửi tới tác giả bài viết gốc.
3. **DB (MongoDB)**: `Post.create()` bài share mới và `Post.findByIdAndUpdate()` cập nhật `shareCount` bài gốc.
4. **Hiển thị & Bảo mật khi Xem (Rendering)**:
   - Khi FE gọi lấy danh sách bài viết (Newsfeed/Profile), BE `.populate('sharedFrom')`.
   - Nếu bài gốc sau đó bị tác giả gốc đổi thành `only_me` hoặc bị **Xóa**, BE sẽ gán `sharedFrom = null`.
   - FE nhận dữ liệu và hiển thị khung bài share lồng bên trong. Nếu `sharedFrom === null`, FE render ô thông báo: *"Bài viết này không còn hiển thị do bị giới hạn quyền riêng tư hoặc đã bị xóa"*.

---

## 3. Luồng Xã hội (Social Flows)

### a. Kết bạn (Add Friend & Accept)
1. **FE (Client)**: Bấm "Thêm bạn bè" -> `POST /api/users/friends/request/:id`.
2. **BE (Express)**: Thêm ID của người gửi vào mảng `friendRequests` của người nhận trong DB.
3. **FE (Client)**: Bấm "Chấp nhận" (Accept) -> `POST /api/users/friends/accept/:id`.
4. **BE (Express)**: 
   - Lấy ID ra khỏi `friendRequests`.
   - Thêm ID của nhau vào mảng `friends` của cả 2 User.
5. **DB (MongoDB)**: Lệnh `User.save()` chạy 2 lần cho 2 tài khoản.

### b. Lấy Bảng tin (Newsfeed Algorithm)
1. **FE (Client)**: Trang chủ gọi `GET /api/posts/newsfeed`.
2. **BE (Express)**:
   - Truy vấn DB: Lấy bài của **chính mình**, bài của **bạn bè** (public/friends), và bài của **người mình theo dõi** (public).
   - Gọi hàm `.populate()` để chèn thông tin Name/Avatar của Tác giả, Người chia sẻ, Người bình luận.
   - Duyệt qua từng bài viết chia sẻ (Share) để kiểm tra: Nếu bài gốc đang cài đặt "Chỉ mình tôi" hoặc "Bạn bè" nhưng người đang xem không phải bạn, thì ẩn bài gốc đi (trả về null).
3. **FE (Client)**: Render danh sách bài viết. Các bài bị ẩn gốc sẽ hiện khung thông báo "Bài viết bị giới hạn quyền riêng tư".

---

## 4. Luồng Thông báo & Tin nhắn (Notification & Chat)

### a. Thông báo (Notification)
- Mỗi khi BE xử lý thành công Like, Comment, hoặc Gửi lời mời kết bạn, BE sẽ tự động tạo một `Notification Document` vào DB với trạng thái `isRead: false`.
- FE có thể định kỳ gọi API lấy thông báo hoặc dùng WebSockets (nếu có) để hiển thị chấm đỏ trên biểu tượng quả chuông.

### b. Tin nhắn (Messaging)
1. **FE (Client)**: Mở hộp thoại chat, gọi API lấy lịch sử nhắn tin với User B.
2. **DB (MongoDB)**: Truy vấn các Message có `sender` là A và `receiver` là B (và ngược lại).
3. **FE (Client)**: Khi gửi tin nhắn mới, FE gửi qua API (hoặc Socket). BE lưu tin nhắn vào DB, đồng thời gửi thông báo tin nhắn mới cho User B nếu họ đang online.
