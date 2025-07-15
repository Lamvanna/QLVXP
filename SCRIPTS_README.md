# Scripts Hướng dẫn cho Windows

## Scripts có sẵn

### `start-dev.bat` - Khởi chạy Development Server
```bash
./start-dev.bat
```
- Tự động kiểm tra và dừng process cũ trên port 5000
- Khởi chạy development server
- Hiển thị thông báo rõ ràng

### `stop-dev.bat` - Dừng Development Server
```bash
./stop-dev.bat
```
- Dừng tất cả process đang chạy trên port 5000
- An toàn và không ảnh hưởng process khác

### `kill-port.bat` - Dừng process trên port 5000
```bash
./kill-port.bat
```
- Hiển thị chi tiết process đang chạy
- Dừng từng process một cách có kiểm soát

## Cách sử dụng khuyến nghị

### Khởi chạy lần đầu:
```bash
./start-dev.bat
```

### Dừng server:
- Nhấn `Ctrl + C` trong terminal đang chạy server
- Hoặc chạy: `./stop-dev.bat`

### Nếu gặp lỗi port:
```bash
./kill-port.bat
./start-dev.bat
```

## Lưu ý

- Scripts được tối ưu cho Windows
- Tự động xử lý port conflicts
- Thông báo rõ ràng về trạng thái server
- An toàn và không ảnh hưởng system processes khác
