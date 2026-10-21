# USAC SimLab

**USAC Astronomy Simulation Laboratory**: phòng thí nghiệm thiên văn ảo. Người học có thể chơi như một trò chơi, nhưng nội dung chính xác như một giáo trình.

Nền tảng web mở để học thiên văn học và vật lý thiên thể qua mô phỏng tương tác. Hệ thống lấy cảm hứng sư phạm từ NAAP, dùng dữ liệu thật, có phương trình kèm trích dẫn và ghi rõ sai số. Định hướng đầy đủ nằm trong [docs/BRIEF.md](docs/BRIEF.md).

## Chạy thử

Yêu cầu Node.js ≥ 20.

```bash
npm install
npm run dev        # mở http://localhost:5173
npm test           # 247 test vật lý đối chiếu giá trị tham chiếu
npm run typecheck  # TypeScript strict cho lõi và web
npm run build      # bản tĩnh trong apps/web/dist (triển khai lên bất kỳ host tĩnh nào)
npm run validate:moon   # báo cáo sai số A3 so với JPL Horizons → docs/validation/A3-moon.json
npm run validate:exo    # báo cáo kiểm định A4 → docs/validation/A4-exoplanets.json
npm run validate:kepler # B1: phần dư Kepler/Barker, bảo toàn, định luật II–III, preset JPL/SBDB → docs/validation/B1-kepler.json
npm run validate:transfer # B2: Hohmann, ngày pha, bi-elliptic, Lambert (Curtis 5.2), C₃ cơ hội 2026 → docs/validation/B2-transfer.json
npm run validate:cr3bp  # B3: điểm Lagrange, C tới hạn, ổn định, giữ cân bằng, hội tụ DOPRI5/RK4 → docs/validation/B3-cr3bp.json
npm run validate:var    # A5: GLS so với nghiệm dạng đóng, khôi phục chu kỳ, khoảng cách δ Cep → docs/validation/A5-variable.json
npm run validate:hz     # A6: biên Kopparapu 2014 cho Mặt Trời, T_eq Trái Đất → docs/validation/A6-habitable.json
npm run validate:shadow # D3: rìa bóng của shader (port float32) so với góc Synge → docs/validation/D3-shadow.json
npm run validate:ephem  # A1 + E1: Mặt Trời, mọc/lặn, 8 hành tinh so với JPL Horizons DE441 → docs/validation/A1-sun.json, E1-planets.json
npm run validate:nbody  # B4: bậc hội tụ, hình số 8, năng lượng 1000 năm, bài toán Pythagoras (DOPRI5) → docs/validation/B4-nbody.json
npm run validate:sr     # C1–C4: γ, khoảng bất biến, cộng vận tốc, cặp song sinh, muon, quang sai & Doppler → docs/validation/C-special-relativity.json
npm run validate:gr     # D2: tiến động cận điểm số so với tích phân elliptic chính xác, Sao Thuỷ, ISCO → docs/validation/D2-geodesics.json
npm run validate:lens   # D5: độ phóng đại bắn tia so với nghiệm giải tích, rìa Mặt Trời 1,751″ → docs/validation/D5-lensing.json
npm run validate:cosmicweb # F6: tỉ số Kaiser, phổ P(k) từ hạt, danh mục quầng → docs/validation/F6-cosmic-web.json
npm run validate:cosmology # D8: tuổi, a(t) so với nghiệm giải tích, Vụ Co Lớn, biên mặt phẳng Ωm-ΩΛ, mốc gia tốc → docs/validation/D8-cosmology.json
npm run validate:sn     # F8: μ(z) nhanh so với tích phân thích nghi, khớp Union2.1, độ phủ vùng 68% trên dữ liệu giả lập → docs/validation/F8-sn-inference.json
npm run validate        # chạy tất cả các báo cáo trên
```

Dữ liệu tham chiếu được tải lại bằng `node reference/fetch_horizons_moon.mjs`, `node reference/fetch_exoplanet_archive.mjs`, `node reference/fetch_horizons_planets_sun.mjs packages/sim-core/test/fixtures` và `node reference/fetch_horizons_sun_riseset.mjs packages/sim-core/test/fixtures`. Thông số hệ sao A6 lấy từ NASA Exoplanet Archive (`pscomppars`, truy vấn 2026-10-20) - xem `packages/sim-core/src/data/hzSystems.ts`.

## Các module đã có (25)

| Mã | Module | Mức | Điểm nổi bật |
|---|---|---|---|
| A1 | Chuyển động của Mặt Trời | A | Thiên cầu 3D tại vị trí và giờ thật; Mặt Trời lệch ≤ 34″ và giờ mọc/lặn ≤ 0,1 phút so với JPL Horizons; analemma, sao sáng thật |
| A3 | Các pha Mặt Trăng | A | Ba góc nhìn đồng bộ theo ngày thật, ngày trăng non/tròn kế tiếp, gợi ý thực |
| A4 | Săn ngoại hành tinh | A | Vận tốc xuyên tâm và quá cảnh có tối rìa, nhiễu đo, SNR |
| A5 | Sao biến quang | B | Chu đồ GLS có trọng số, FAP bootstrap, cảnh báo alias, ⟨V⟩ trung bình cường độ, Leavitt + A_V (δ Cep 265 ± 5 pc so với 273 ± 11 pc) |
| A6 | Vùng sinh sống được | A | Bốn biên Kopparapu 2014 (hệ số đối chiếu hzcalc.py), T_eq với suất phản chiếu Bond, hệ sao từ NASA Exoplanet Archive, không kẹp âm thầm |
| B1 | Quỹ đạo Kepler và bài toán hai vật | A | Elip/parabol/hyperbol với μ = G(M+m), chế độ quanh khối tâm, múi diện tích bằng thời gian lệch ≤ 4 × 10⁻¹¹, chu kỳ SBDB tái lập tới 2 × 10⁻¹⁰ |
| B2 | Chuyển quỹ đạo và đường tới Sao Hoả | A | Ba lớp: Hohmann lý tưởng · ngày pha theo ephemeris · Lambert (v∞, C₃, bản đồ porkchop); ngưỡng bi-elliptic 11,94/15,58 tính số |
| B3 | Bài toán ba vật hạn chế tròn và điểm Lagrange | B | CR3BP phẳng: điểm Lagrange (phần dư ≤ 10⁻¹⁵), trạng thái cổ chai L1–L3, khám phá mức Jacobi, ổn định tuyến tính từ trị riêng, kiểm tra hội tụ DOPRI5 và RK4 độc lập |
| B4 | Sandbox N vật | B | Leapfrog, Yoshida-4, RK4, độ trôi năng lượng |
| C1 | Đồng hồ ánh sáng và muon | A | Giãn thời gian nhìn từ hai hệ quy chiếu |
| C2 | Biểu đồ Minkowski | A | Kéo sự kiện, đổi hệ bằng rapidity, nghịch lý sinh đôi |
| C4 | Bay gần tốc độ ánh sáng | A | Quang sai và Doppler trên bầu trời sao thật |
| D1 | Thời gian hấp dẫn và GPS | A | Đồng hồ trên geoid (IAU L_G): +38,58 μs/ngày = 4,4647 × 10⁻¹⁰, khớp Ashby (2003); Pound–Rebka |
| D2 | Schwarzschild và Newton | B | Geodesic float64, thế hiệu dụng, ISCO, 43″/thế kỷ |
| D3 | Hố đen Schwarzschild | B | Ray tracing GPU thời gian thực (rìa bóng lệch ≤ 0,003% so với Synge), đĩa Doppler, hai đồng hồ khi rơi vào |
| D5 | Thấu kính hấp dẫn | A | Dò tia ngược, vòng Einstein, microlensing |
| D8 | Vũ trụ học FLRW | B | Planck 2018: tuổi 13,79 tỉ năm, a(t), các loại khoảng cách |
| E1 | Hệ Mặt Trời 3D | A | Phần tử Kepler JPL 1800–2050; sai số đo được so với DE441: 21″ (Trái Đất) tới 9,3′ (Sao Thổ); kết cấu bề mặt thật (Solar System Scope) |
| F1 | Sóng điện từ 3D | A | E ⟂ B ⟂ k theo vectơ Jones (thẳng, tròn, elip), toàn phổ 1 pm – 1 km, nguồn thật (21 cm, Hα, Cu Kα, 511 keV), I = ½cε₀E₀² |
| F2 | Âm thanh và ánh sáng | A | v = √(γRT/M) theo khí và nhiệt độ, nước/thép đo, ánh sáng c/n, chân không tắt sóng âm, đua sét – sấm thời gian thực |
| F3 | Tốc độ ánh sáng: một chuyến đi thật | A | Tia sáng tới Mặt Trăng, hành tinh (khoảng cách hôm nay theo ephemeris), Proxima, tâm Ngân Hà, Andromeda; trễ tín hiệu tới các hành tinh |
| F4 | Nhìn xa là nhìn về quá khứ | A | Thời gian nhìn lại và bốn loại khoảng cách từ Friedmann (Planck 2018); 100θ* khớp Planck trong 0,2%; quạt khảo sát với mạng lưới thật |
| F5 | Hấp dẫn và giãn nở vũ trụ | B | D(a), f(a) giải số (EdS, ΛCDM), xấp xỉ Zel’dovich trên phổ EH98 chuẩn σ₈, mật độ CIC |
| F6 | Sandbox mạng lưới vũ trụ 3D | B | 262 144 hạt 1LPT/2LPT trên GPU, Ω_m/σ₈/n_s, RSD (Kaiser ±3,5%), quầng đỉnh Lagrange, thiên hà HOD, P(k) đo trực tiếp, Web Worker |
| F8 | Suy luận tham số từ siêu tân tinh | A | 580 SN Ia thật (Union2.1), χ² lấy biên độ lệch, vùng 68/95/99,7%, MCMC Metropolis; Ω_m phẳng = 0,278 (thống kê) |

Các module trong lộ trình (B5, C3, C5, D4, D7, E2, E3) đã có mặt trên trang chủ với nhãn "Sắp ra mắt".

## Tính năng chung

Mỗi module dùng cùng một bộ khung theo brief (mục 3, 8 và 10):

- **Chuyển cấp độ** Khám phá, Học tập, Chuyên sâu ngay trên cùng một mô phỏng. Ở cấp Chuyên sâu có thêm sai số số trị và nút xuất CSV.
- **Model Card** (nút ⓘ) cho từng module, ghi phương trình, giả định, miền hợp lệ, sai số, kiểm chứng, giới hạn và tài liệu tham khảo.
- **Nhãn độ trung thực** A, B, C đặt trên từng phần của mô phỏng.
- **Bài học** gồm giới thiệu, trang nền tảng (có KaTeX), hoạt động "Hãy thử" tự đặt tham số, câu hỏi kiểm tra và phiếu in.
- **Chia sẻ bằng link**: mọi tham số nằm trong URL, ví dụ `#/m/d2?p=12&e=0.6`.
- **Các nút tiện ích** chụp ảnh PNG, toàn màn hình, đặt lại, cùng phím tắt `Space`, `R`, `L` và `I`.
- **Giao diện** tối theo mặc định, có chế độ sáng cho lớp học và in ấn. Bản điện thoại dùng bố cục một cột.
- **Ngôn ngữ** tiếng Việt và tiếng Anh.
- **Ngoại tuyến** qua PWA.

## Cấu trúc

```
packages/sim-core/   Vật lý thuần (float64, không phụ thuộc React/Three), có test
  src/units          Hằng số có nguồn (CODATA 2018, IAU 2012/2015, DE430)
  src/time           Julian Date, GMST
  src/celestial      Mặt Trời (Meeus), Mặt Trăng (Almanac), hành tinh (JPL), toạ độ
  src/orbits         Kepler, Hohmann, CR3BP, N vật
  src/relativity-sr  Lorentz, Doppler, quang sai
  src/relativity-gr  Schwarzschild, thấu kính, GPS, Kerr (bán kính đặc trưng)
  src/cosmology      Friedmann, khoảng cách, EH98/LPT/HOD (cấu trúc lớn), suy luận SN Ia, hình dạng thiên hà
  src/waves          Sóng điện từ, tốc độ âm
  src/stellar        Vật đen, vùng sinh sống
  src/exoplanets     RV, quá cảnh
  src/photometry     Lomb–Scargle, Leavitt
  test/              247 test đối chiếu giá trị tham chiếu
apps/web/            Vite + React + TypeScript + Three.js (React Three Fiber)
  src/modules/<id>/  Mỗi module là một thư mục, tải lười (lazy load)
reference/           Script Python sinh golden vectors (astropy, einsteinpy)
docs/                BRIEF.md, AGENTS.md
```

## Nguyên tắc khoa học

Đọc [docs/AGENTS.md](docs/AGENTS.md) trước khi sửa code. Tóm tắt các nguyên tắc chính:

- Mọi phép tính định lượng nằm trong `sim-core` và dùng float64. Shader GPU chỉ dùng để kết xuất hình.
- Mỗi hằng số và mỗi công thức phải kèm nguồn. Chỗ nào chưa chắc thì ghi `TODO: cần xác minh`.
- Không trình bày hình minh hoạ (Mức C) như thể đó là mô hình chính xác.

## Ghi công

Cấu trúc sư phạm lấy cảm hứng từ NAAP (Nebraska Astronomy Applet Project, University of Nebraska–Lincoln). Dự án không sao chép mã, hình ảnh hay văn bản nào của NAAP. Danh sách nguồn dữ liệu nằm trong [CREDITS.md](CREDITS.md).

## Việc cần chốt (brief mục 16)

Các quyết định sau đang chờ chủ dự án:

- Giấy phép mã và nội dung.
- Có cần tài khoản hoặc chế độ lớp học hay không.
- Chọn người có chuyên môn để rà soát khoa học (tiêu chí nghiệm thu, mục 13).
- Đối chiếu lại các giá trị đang gắn `TODO: cần xác minh`: hệ số Kopparapu và thông số ngoại hành tinh làm tròn.
