# Kỹ thuật authentication

Authentication là việc xác thực danh tính người dùng

### Server hiện tại có 2 kiểu

-   Session based authentication
-   Token based authentication

### Token based authentication

Token based authentication là cơ chế xác minh danh tính thông qua việc tạo token. Server sẽ tạo ra một chuỗi ký tự được gọi là token để định danh người dùng, Client sẽ lưu token này ở bộ nhớ, mỗi lần gọi request sẽ gửi token này lên để server xác nhận. Server có thể lưu hoặc không lưu token này tùy usercase.

### Luồng hoạt động

1. Thưc hiện login ở client (web), username & password sẽ được gửi lên server

2. Server kiểm tra trong database, nếu tồn tại thì tạo 1 token gửi về cho client

3. Client sẽ lưu trữ token trong local storage hoặc cookie,...

4. Client quản lý đăng nhập bằng việc kiểm tra có token hay chưa trong bộ nhớ máy tính. Nếu không có token nghĩa là chưa đăng nhập

5. Client muốn truy cập đến những tài nguyên cần xác thực danh tính thì client sẽ phải gửi token lên server thông HTTP Header Authorization

6. Server nhận được token sẽ tiến hành kiểm tra và giải mã.

### JWT

Một số đặc điểm:

1. Một chuỗi JWT có 3 phần tách nhau bằng dấu chấm: `header.payload.signature`
   header chứa thông tin thuật toán mã hóa. Nó được tạo ra bằng thuật toán và dễ dàng giải mã
2. payload chứa thông tin người dùng và thời gian hết hạn token. Nó cũng được tạo ra bằng thuật toán và dễ dàng giải mã.
3. signature là chữ ký, phần quan trọng nhất. Cái này không thể giải mã, vì nó là mã hóa 1 chiều. Chỉ có thể kiểm tra nó có đúng hay không bằng cách mã hóa header, payload kết hợp với một private key (private key thì thường server sẽ lưu trữ). Vậy nên nếu header hoặc payload thay đổi thì signature sẽ thay đổi.

### access token và refresh token

-   Access token là token dùng cho authentication
-   Refresh token là token dùng cho việc tạo một access token khi access token hết hạn.

`Authorization: Bearer <access token>`
