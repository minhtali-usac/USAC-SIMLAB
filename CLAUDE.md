# CLAUDE.md

Đọc [docs/AGENTS.md](docs/AGENTS.md), tệp quy ước chung cho mọi tác nhân, và [docs/BRIEF.md](docs/BRIEF.md), tệp định hướng sản phẩm.

Các điểm quan trọng nhất:

- Vật lý chỉ nằm trong `packages/sim-core`, dùng float64 và kèm nguồn trích dẫn.
- Viết test cùng lúc với code (`npm test`). Chạy `npm run typecheck` trước khi kết thúc.
- Mọi chuỗi giao diện phải có cả tiếng Việt và tiếng Anh. Mọi tham số mô phỏng phải nằm trong URL (`useParam`).
- Không bịa công thức hay hằng số. Chỗ nào không chắc, ghi `TODO: cần xác minh`.
