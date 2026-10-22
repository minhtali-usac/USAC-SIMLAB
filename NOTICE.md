# NOTICE: giấy phép và mã phái sinh từ Celestia

*English summary at the end.*

## Giấy phép của USAC SimLab

USAC SimLab là phần mềm tự do, phát hành theo **Giấy phép Công cộng GNU (GNU GPL) phiên bản 2, hoặc (tuỳ chọn của bạn) bất kỳ phiên bản mới hơn** (SPDX: `GPL-2.0-or-later`). Toàn văn nằm trong [LICENSE](LICENSE). Chương trình được phân phối với hy vọng hữu ích nhưng **không có bất kỳ bảo đảm nào**, kể cả bảo đảm về tính thương mại hay phù hợp cho một mục đích cụ thể.

Lý do: mô-đun **E1 - Hệ Mặt Trời 3D** chứa mã phái sinh từ **Celestia** (xem bên dưới), phát hành theo cùng giấy phép. GPL yêu cầu tác phẩm phái sinh, và tác phẩm kết hợp phân phối cùng nó, cũng phát hành theo GPL. Mã của USAC SimLab và mã của Celestia được biên dịch chung thành một ứng dụng web, nên toàn bộ mã nguồn của dự án (thư mục `apps/`, `packages/`, `reference/`) theo GPL-2.0-or-later.

**Mã nguồn.** Mã nguồn đầy đủ, tương ứng với trang web đang chạy, có ở https://github.com/minhtali-usac/USAC-SIMLAB (liên kết cũng nằm ở trang Giới thiệu của web). Bạn được quyền sao chép, sửa đổi và phân phối lại theo các điều khoản của GPL; mọi bản sửa đổi phân phối lại cũng phải theo GPL và kèm mã nguồn.

## Tác phẩm gốc: Celestia

- **Celestia**, phần mềm mô phỏng không gian thời gian thực. Bản quyền (C) 2001-nay, Celestia Development Team (tác giả ban đầu: Chris Laurel; danh sách đầy đủ trong tệp `AUTHORS` của Celestia). Phát hành theo GNU GPL phiên bản 2 hoặc mới hơn. Trang chủ: https://celestiaproject.space · Mã nguồn: https://github.com/CelestiaProject/Celestia
- **Phiên bản đã dùng:** nhánh `master`, mã phiên bản `1.7.0` (theo `CMakeLists.txt`), tải về ngày 2026-10-21. Để tái lập đúng đầu vào của các script dưới đây, SHA-256 của các tệp nguồn đã dùng là:

| Tệp trong Celestia | SHA-256 |
|---|---|
| `src/celephem/vsop87.cpp` | `0c53fe022ca6c838c212d39d493800f4cfa7357725498c4d98a841ac26433382` |
| `src/celephem/customorbit.cpp` | `607b7caeef9bab179f0f7238d42d33b3af969b5cd69e97b8bf70ad40db344f16` |
| `src/celephem/customrotation.cpp` | `c45df5ab813a17e71a14bef1b9c0fe3fb6f16c699ba309b65f2a3fadf2bbe73d` |
| `src/celengine/shadermanager.cpp` | `c94e065eb5eef7976212607e110b5c396a64d59df146c0c0c0f8a2ebaa281032` |

Dự án **không** đưa toàn bộ cây mã nguồn Celestia vào kho này, chỉ các phần phái sinh bên dưới. Bản gốc luôn lấy được từ địa chỉ trên.

## Các tệp phái sinh từ Celestia và những thay đổi

Theo mục 2(a) của GPL, các thay đổi và ngày thực hiện được nêu ở đây và ở đầu từng tệp. Ngày thay đổi: **2026-10-22**, bởi nhóm USAC SimLab.

| Tệp trong USAC SimLab | Phái sinh từ (Celestia 1.7.0) | Bản quyền gốc | Thay đổi |
|---|---|---|---|
| `packages/sim-core/src/ephemeris/vsop87Data.ts` | `src/celephem/vsop87.cpp` (các bảng số hạng VSOP87 rút gọn) | (C) 2002 Chris Laurel và Celestia Development Team | Chuyển các mảng C++ sang mảng số TypeScript bằng `reference/extract_celestia_vsop87.mjs`; con số giữ nguyên. |
| `packages/sim-core/src/ephemeris/vsop87.ts` | `src/celephem/vsop87.cpp` (công thức tính) | như trên | Viết lại bằng TypeScript; đổi toạ độ cầu sang toạ độ vuông góc trong hệ hoàng đạo J2000 thay cho trục nội bộ của Celestia; thêm đạo hàm giải tích; đo sai số với JPL Horizons. |
| `packages/sim-core/src/ephemeris/satelliteTheories.ts` | `src/celephem/customorbit.cpp` (lý thuyết Io…Callisto, Mimas…Iapetus, chuỗi Mặt Trăng chương 47, bảng GUST86) | (C) 2001 Chris Laurel và Celestia Development Team | Dịch cú pháp C++ sang TypeScript bằng `reference/extract_celestia_satellites.mjs`; mọi hệ số và biểu thức giữ nguyên. |
| `packages/sim-core/src/ephemeris/satellites.ts` | `src/celephem/customorbit.cpp` (GUST86, Triton, đổi hệ quy chiếu Mặt Trăng) | như trên | Viết lại GUST86 và Triton bằng TypeScript; hệ quy chiếu các lý thuyết được xác định lại và kiểm chứng với JPL Horizons; **loại** Phobos, Deimos, Miranda, Hyperion vì sai số lớn. |
| `packages/sim-core/src/ephemeris/iauRotationData.ts` | `src/celephem/customrotation.cpp` (mô hình quay IAU) | (C) 2008-2009 Celestia Development Team | Dịch cú pháp bằng `reference/extract_celestia_rotation.mjs`; chọn 27 thiên thể. |
| `packages/sim-core/src/ephemeris/rotation.ts` | `src/celephem/customrotation.cpp` (cách dùng) | như trên | Ma trận quay IAU chuẩn, chu kỳ và chiều quay, thay cho quaternion của Celestia. |
| `apps/web/src/lib/celestiaShaders.ts` | `src/celengine/shadermanager.cpp` | (C) 2001-nay Celestia Development Team (tác giả gốc: Chris Laurel) | Viết lại bằng GLSL cho WebGL2/three.js: mô hình lunar-Lambert, bóng nhật/nguyệt thực (diện tích giao chính xác thay cho suy giảm tuyến tính), bóng vành đai, khí quyển tán xạ một lần, sao dạng PSF. |
| `apps/web/src/modules/e1-solarsystem/bodies.tsx`, `scene.tsx`, `index.tsx` | cách tổ chức hiển thị của Celestia | như trên | Mã mới dùng react-three-fiber; chỉ mượn ý tưởng và mô hình ánh sáng. |
| `packages/sim-core/src/celestial/eclipse.ts` | ý tưởng bóng nhật/nguyệt thực của Celestia | như trên | Hàm thuần, kiểm chứng với nhật thực 8/4/2024 và 14/10/2023. |

Các tệp sinh tự động (`vsop87Data.ts`, `satelliteTheories.ts`, `iauRotationData.ts`) có thể tạo lại bằng các script trong `reference/` khi có bản Celestia ở đường dẫn tương ứng; xem phần đầu mỗi script.

Một số lý thuyết trong mã của Celestia xuất phát từ các công bố khoa học mà USAC SimLab ghi nguồn riêng trong Model Card E1: Bretagnon & Francou (1988) cho VSOP87, Meeus (1998) cho chuỗi Mặt Trăng và vệ tinh Sao Mộc, Sao Thổ, Laskar & Jacobson (1987) cho GUST86, Emelyanov & Samorodov (2015) cho Triton, báo cáo IAU WGCCRE cho các mô hình quay, McEwen (1996) cho mô hình ánh sáng.

## Các thành phần khác và giấy phép riêng của chúng

Các thành phần dưới đây **không** phái sinh từ Celestia, giữ giấy phép riêng và được phân phối cùng chương trình như tác phẩm tách biệt (xem thêm [CREDITS.md](CREDITS.md)):

- **Thư viện mã nguồn mở** (cài qua npm, không nằm trong kho): React, three.js, @react-three/fiber, @react-three/drei, KaTeX, zustand, Vite, Vitest: giấy phép MIT, tương thích với GPL.
- **Texture bề mặt thiên thể** (Solar System Scope, dựa trên dữ liệu NASA): CC BY 4.0. **Ảnh toàn cảnh Ngân Hà** (ESO/S. Brunier): CC BY 4.0. **Ảnh minh hoạ trên thẻ module**: Wikimedia Commons, giấy phép ghi từng ảnh. **Phông chữ**: SIL Open Font License. Đây là dữ liệu, không phải mã; chúng giữ giấy phép riêng và yêu cầu ghi công của giấy phép đó.
- **`lss-lab/`** (bộ công cụ trực quan hoá cấu trúc lớn của TS. Nguyễn Nhật Minh, https://github.com/MinhMPA/lss-lab): kho gốc ghi giấy phép là "TBD". Các mô-đun F1 đến F3 phát triển dựa trên đó.

---

## English summary

**USAC SimLab is licensed under the GNU GPL, version 2 or (at your option) any later version** (`GPL-2.0-or-later`; full text in [LICENSE](LICENSE)). Module E1 includes code derived from **Celestia** (Copyright (C) 2001-present, the Celestia Development Team; GNU GPL v2 or later; https://github.com/CelestiaProject/Celestia, `master` snapshot of 2026-10-21, version 1.7.0), so the combined work is distributed under the same licence. The complete corresponding source is at https://github.com/minhtali-usac/USAC-SIMLAB and is linked from the site's About page.

Derived files, the upstream files they come from, and the modifications made (translation from C++ to TypeScript/GLSL, change of coordinate frames, measurement against JPL Horizons, removal of poorly performing satellite theories) are listed in the table above; every derived file also carries a notice of the change and its date (2026-10-22). Textures, imagery and fonts keep their own licences (CC BY 4.0, CC BY-SA, SIL OFL) as separate works; npm dependencies are MIT. The `lss-lab` toolkit that modules F1-F3 are developed from declares its licence as "TBD": its author's written consent to GPL distribution is still to be obtained.
