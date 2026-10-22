# AGENTS.md: quy ước cho người và AI khi sửa USAC SimLab

Đọc [BRIEF.md](BRIEF.md) để nắm bối cảnh. Tệp này ghi lại các quy ước kỹ thuật bắt buộc.

## 1. Vật lý nằm trong `packages/sim-core`

- Chỉ viết hàm thuần (pure), chạy được trên Node, **không import React, Three hay DOM**.
- Mọi tính toán dùng float64. Shader GPU (float32) chỉ được dùng để vẽ, không bao giờ là nguồn của số liệu hiển thị cho người học.
- Ghi rõ đơn vị trong JSDoc của từng hàm, ví dụ SI, au/ngày, hoặc đơn vị hình học G = c = M = 1. Không trộn đơn vị trong cùng một hàm.
- Mọi hằng số đặt trong `src/units/constants.ts` kèm nguồn.
- Mọi phương trình mới phải kèm trích dẫn (sách hoặc bài báo) ở đầu file. Chỗ nào không chắc, ghi `TODO: cần xác minh`, không được đoán.
- Viết test cùng lúc với code, trong `packages/sim-core/test/*.test.ts`. Test đối chiếu giá trị tham chiếu có nguồn hoặc golden vectors trong `reference/`.

## 2. Giao diện nằm trong `apps/web`

- Module UI chỉ **đọc** kết quả từ `sim-core` rồi **vẽ**, không tự cài công thức vật lý.
- Mỗi module là một thư mục `src/modules/<id>/` có `index.tsx` (export default), đi kèm `lesson: Lesson` và `card: ModelCard` (xem `modules/types.ts`). Đăng ký module trong `modules/registry.ts`.
- Dùng khung chung `SimLayout`, gồm thanh công cụ, Bài học, Model Card, chia sẻ, chụp ảnh và toàn màn hình.
- Tham số mô phỏng đặt trong URL qua `useParam`, để link chia sẻ khôi phục đúng trạng thái.
- Chuỗi hiển thị phải song ngữ: dùng `t('key')` cho UI chung (`i18n/ui.ts`) và `tx({ vi, en })` cho nội dung module.
- Gắn nhãn độ trung thực A, B, C cho từng phần trong `card.parts`. Hình phóng đại hoặc không theo tỉ lệ phải có ghi chú `scale-note`.
- Đại lượng tương đối tính phải ghi rõ hệ quy chiếu và loại thời gian (`frame=` trong `Readout`).
- Canvas lấy màu từ `usePalette()` để hỗ trợ cả giao diện sáng và tối.

## 3. Lệnh

```bash
npm test           # test vật lý (Vitest)
npm run typecheck  # tsc strict
npm run dev        # Vite dev server
npm run build      # bản tĩnh
```

## 4. Tiêu chí hoàn thành một module (brief §13)

- [ ] Có test cho mọi phép tính mới.
- [ ] Model Card đầy đủ, gồm phương trình, giả định, miền hợp lệ, sai số, kiểm chứng, giới hạn và tài liệu.
- [ ] Có nhãn A/B/C và không trình bày hình Mức C như Mức A hoặc B.
- [ ] Có đủ ba cấp độ, hoặc ghi rõ lý do không áp dụng.
- [ ] Có bài học, hoạt động "Hãy thử" và câu hỏi kiểm tra.
- [ ] Có tiếng Việt và tiếng Anh.
- [ ] Trạng thái khôi phục được qua URL.
- [ ] Dùng được trên điện thoại và bằng bàn phím.
- [ ] Đã có người chuyên môn rà soát nội dung khoa học.

## 5. Giấy phép và mã phái sinh

Dự án theo GNU GPL-2.0-or-later (xem `LICENSE`, `NOTICE.md`). Khi đưa mã hoặc dữ liệu từ nguồn khác vào, kiểm tra giấy phép có tương thích GPL không, ghi nguồn và thay đổi ở đầu tệp, và thêm vào `NOTICE.md` hoặc `CREDITS.md`. Không đưa mã không rõ giấy phép vào kho.
