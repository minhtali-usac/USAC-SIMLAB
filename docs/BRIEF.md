# USAC SimLab: brief hệ thống mô phỏng thiên văn và vật lý

*USAC Astronomy Simulation Laboratory · Tài liệu định hướng để giao cho AI Code*

## 1. Tầm nhìn và định vị

**USAC SimLab** (USAC Astronomy Simulation Laboratory) là nền tảng web mở, miễn phí, nơi ai cũng có thể học thiên văn học và vật lý thiên thể qua mô phỏng tương tác, từ nhập môn đến chuyên sâu. Hệ thống lấy cảm hứng sư phạm từ NAAP nhưng đi xa hơn: 3D thật, dữ liệu thật, và phủ cả quỹ đạo, thuyết tương đối hẹp lẫn thuyết tương đối rộng.

Bốn trụ cột nội dung:

- **Thiên văn học nền tảng:** chuyển động của Mặt Trời và Mặt Trăng, ngoại hành tinh, sao biến quang, vùng sinh sống được, sao và thiên hà.
- **Quỹ đạo và cơ học thiên thể:** từ ba định luật Kepler đến bài toán nhiều vật, điểm Lagrange, chuyển quỹ đạo và nhiễu loạn.
- **Thuyết tương đối hẹp:** thời gian, không gian, ánh sáng và năng lượng ở vận tốc gần vận tốc ánh sáng.
- **Thuyết tương đối rộng:** hấp dẫn là hình học của không–thời gian: lỗ đen, thấu kính hấp dẫn, sóng hấp dẫn, vũ trụ học.

**Nguyên tắc tối cao:** đẹp là điều kiện cần, **đúng khoa học là điều kiện bắt buộc**. Mọi mô phỏng phải dựa trên mô hình vật lý đã công bố, có phương trình, giả định, miền hợp lệ và sai số được ghi rõ (mục 5 và 6). Chỗ nào chỉ là minh hoạ khái niệm thì phải gắn nhãn là minh hoạ.

**Một câu mô tả:** “Phòng thí nghiệm thiên văn ảo: chơi như một trò chơi, nhưng chính xác như một giáo trình.”

## 2. Phân tích NAAP: giữ gì, bỏ gì

Sáu lab NAAP dùng để tham khảo: Motions of the Sun, Planetary Orbits, Lunar Phases, Extrasolar Planets, Variable Star Photometry, Habitable Zones.

### Điểm mạnh cần giữ

- **Cấu trúc bài học nhất quán:** Description, Usage, Student Guide, Background pages, Simulators, Instructor resources.
- **Mô phỏng đi cùng giải thích:** trang nền tảng dẫn dắt khái niệm trước khi người học chạm vào mô phỏng.
- **Nhiều góc nhìn cùng lúc:** ví dụ Lunar Phases vừa có góc nhìn từ trên xuống, vừa có góc nhìn của người quan sát (horizon diagram). Đây là sức mạnh sư phạm lớn nhất.
- **Điều khiển trực tiếp:** kéo thanh trượt, kéo vật thể, thấy kết quả ngay (Kepler’s laws có biểu đồ P² = a³ cập nhật theo thời gian thực).
- **Phục vụ giảng viên:** worksheet, demonstration guide, student guide dạng PDF.

### Điểm yếu cần bỏ và khoảng trống cần lấp

- **Flash/SWF đã chết:** phải viết lại hoàn toàn bằng công nghệ web hiện đại.
- **Giao diện lỗi thời, dày đặc:** nhiều control nhỏ, chữ nhỏ, không dùng được trên điện thoại.
- **Chủ yếu 2D:** USAC SimLab cần 3D thật, ánh sáng, hiệu ứng đẹp mắt nhưng không làm mất độ chính xác.
- **Không có thuyết tương đối, ít quỹ đạo nhiều vật:** đây là khoảng trống lớn nhất USAC SimLab sẽ lấp.
- **Chỉ tiếng Anh, dữ liệu tĩnh:** cần đa ngôn ngữ (ưu tiên tiếng Việt) và dữ liệu thật (NASA, JPL, Gaia, LIGO).

> **Lưu ý bản quyền:** NAAP là tài sản của University of Nebraska–Lincoln. Chỉ lấy **ý tưởng sư phạm và cấu trúc bài học**. **Không copy mã, hình ảnh, văn bản hay screenshot.** Toàn bộ code, đồ hoạ, nội dung phải tự viết mới, và có mục ghi công “lấy cảm hứng từ NAAP” trong trang About.

## 3. Đối tượng và nguyên tắc thiết kế

### Ba cấp độ người học

1. **Khám phá (Explorer):** học sinh, người yêu thiên văn. Ít số liệu, nhiều hình ảnh, ghi chú đơn giản, có chế độ “hướng dẫn từng bước”.
2. **Học tập (Student):** THPT và đại học năm đầu. Có công thức, số liệu, biểu đồ, bài tập và câu hỏi kiểm tra.
3. **Chuyên sâu (Advanced):** sinh viên chuyên ngành, giảng viên. Mở toàn bộ tham số (spin lỗ đen, bộ tích phân, dung sai), phương trình đầy đủ, xuất dữ liệu CSV, hiển thị sai số số trị.

Một công tắc **Level** ở góc màn hình đổi mức chi tiết của cùng một mô phỏng, không làm ba bản riêng.

### Nguyên tắc cốt lõi

- **Đúng vật lý trước, đẹp sau, nhưng phải cả hai.** Mọi phép tính có test đối chiếu giá trị tham chiếu.
- **Phân tầng độ trung thực:** mỗi mô phỏng thuộc Mức A, B hoặc C và hiển thị nhãn tương ứng (mục 5).
- **Nói rõ hệ quy chiếu:** mọi đại lượng tương đối tính phải ghi đo trong hệ nào (người quan sát ở xa, người rơi, thời gian riêng của vật).
- **Nói rõ tỉ lệ:** khi dùng tỉ lệ phóng đại (kích thước hành tinh) phải có nhãn “không theo tỉ lệ” và nút chuyển sang tỉ lệ thật.
- **Trực quan:** kéo thả, thấy ngay kết quả. Hạn chế đọc chữ để hiểu.
- **Không cần đăng nhập để học.** Tài khoản chỉ là tuỳ chọn để lưu tiến độ.
- **Dùng được trên điện thoại, máy tính bảng, máy tính và bằng bàn phím.**
- **Mọi mô phỏng chia sẻ được bằng đường link** (tham số nằm trong URL).

## 4. Phạm vi nội dung (module)

Mỗi module là một thư mục độc lập, dùng chung lõi vật lý `sim-core`. Mã module: chữ cái là nhóm, số là thứ tự.

### Nhóm A · Thiên văn học nền tảng (lấy cảm hứng sáu lab NAAP)

| Mã | Module | Mô phỏng chính | Khái niệm trọng tâm |
| --- | --- | --- | --- |
| A1 | Chuyển động của Mặt Trời | Thiên cầu 3D, đường đi của Mặt Trời theo vĩ độ và ngày | Hoàng đạo, xích vĩ, độ cao kinh tuyến, phương vị, phương trình thời gian, mùa |
| A2 | Quỹ đạo hành tinh (cơ bản) | Quỹ đạo elip, ba định luật Kepler, đồ thị P² = a³ | Độ lệch tâm, vận tốc quỹ đạo, lực hấp dẫn Newton |
| A3 | Các pha Mặt Trăng | Góc nhìn từ trên xuống và góc nhìn người quan sát | Pha, giờ mọc/lặn, nhật/nguyệt thực, thuỷ triều |
| A4 | Ngoại hành tinh | Vận tốc xuyên tâm (Doppler) và quá cảnh (transit) | Khối tâm, dịch chuyển Doppler, nhiễu và phát hiện, đường cong ánh sáng |
| A5 | Trắc quang sao biến quang | Bộ phân tích ảnh sao, đường cong ánh sáng, xác định chu kỳ | CCD, trừ nền, Cepheid, RR Lyrae, đôi che khuất |
| A6 | Vùng sinh sống được | Vùng habitable quanh sao và trên thiên hà | Vùng Goldilocks, tiến hoá sao, vùng sinh sống thiên hà |

### Nhóm B · Quỹ đạo và cơ học thiên thể

| Mã | Module | Mô phỏng chính | Khái niệm trọng tâm |
| --- | --- | --- | --- |
| B1 | Quỹ đạo hai vật | Elip, parabol, hyperbol; phương trình Kepler | Năng lượng, mômen động lượng, vận tốc thoát, các yếu tố quỹ đạo |
| B2 | Chuyển quỹ đạo | Hohmann, bi-elliptic, đổi mặt phẳng, gia tốc nhờ hấp dẫn (gravity assist) | Δv, cửa sổ phóng, đường bay tới Sao Hoả |
| B3 | Bài toán ba vật hạn chế (CR3BP) | Điểm Lagrange L1–L5, đường đẳng thế Hill, quỹ đạo halo | Ổn định, hỗn loạn, các điểm Lagrange Mặt Trời–Trái Đất |
| B4 | N vật và cộng hưởng | Sandbox N-body, cộng hưởng quỹ đạo | Khe Kirkwood, ổn định hệ hành tinh, bảo toàn năng lượng |
| B5 | Nhiễu loạn và thuỷ triều | Dẹt cực (J2), tiến động nút, giới hạn Roche | Quỹ đạo thực của vệ tinh, ma sát thuỷ triều |
| B6 | Newton đối chiếu tương đối tính | Chồng hai quỹ đạo: Newton và Schwarzschild | Tiến động cận điểm, giới hạn của lực hấp dẫn Newton |

### Nhóm C · Thuyết tương đối hẹp

| Mã | Module | Mô phỏng chính | Khái niệm trọng tâm |
| --- | --- | --- | --- |
| C1 | Đồng hồ ánh sáng và giãn thời gian | Đồng hồ ánh sáng chuyển động, hạt muon từ tia vũ trụ | Giãn thời gian, hệ số Lorentz γ, thời gian riêng |
| C2 | Biểu đồ Minkowski | Đường thế giới, nón ánh sáng, đổi hệ quy chiếu bằng thanh trượt (rapidity) | Tính tương đối của đồng thời, khoảng không–thời gian bất biến |
| C3 | Co ngắn Lorentz và các nghịch lý | Thanh–nhà kho, nghịch lý sinh đôi, tàu Bell | Co độ dài, gia tốc và bất đối xứng của hai người sinh đôi |
| C4 | Nhìn thấy vật chuyển động gần c | Kết xuất quang học thật: quang sai, Doppler, “starbow” | Hiệu ứng Terrell–Penrose (vật trông xoay chứ không co), quang sai ánh sáng |
| C5 | Động lực học tương đối tính | Động lượng và năng lượng, va chạm, phân rã hạt | E² = (pc)² + (mc²)², cộng vận tốc, bảo toàn 4-vector |
| C6 | Jet và tia vũ trụ | Beaming tương đối tính, chuyển động siêu quang biểu kiến | Doppler boosting, jet từ lỗ đen siêu khối lượng |

### Nhóm D · Thuyết tương đối rộng

| Mã | Module | Mô phỏng chính | Khái niệm trọng tâm |
| --- | --- | --- | --- |
| D1 | Nguyên lý tương đương và thời gian hấp dẫn | Thang máy rơi tự do, dịch chuyển đỏ hấp dẫn, đồng hồ GPS | Nguyên lý tương đương, thí nghiệm Pound–Rebka, hiệu chỉnh SR + GR của GPS |
| D2 | Hình học Schwarzschild | Geodesic của hạt và ánh sáng quanh khối cầu | Thế hiệu dụng, quỹ đạo tròn bền (ISCO), tiến động cận điểm Sao Thuỷ |
| D3 | Lỗ đen Schwarzschild | Rơi vào lỗ đen nhìn từ hai góc: người rơi và người ở xa | Chân trời sự kiện, cầu photon, bóng lỗ đen, lực thuỷ triều (spaghetti hoá) |
| D4 | Lỗ đen quay (Kerr) | Quỹ đạo và ánh sáng quanh lỗ đen có spin a | Ergosphere, kéo hệ quy chiếu, ISCO phụ thuộc spin, quá trình Penrose (Advanced) |
| D5 | Thấu kính hấp dẫn | Vòng Einstein, ảnh kép, microlensing, ray tracing trường mạnh | Góc lệch 4GM/(c²b), bán kính Einstein, đường cong ánh sáng microlensing |
| D6 | Đĩa bồi tụ và hình ảnh lỗ đen | Ảnh ray-traced kiểu Event Horizon Telescope, đĩa mỏng, nhẫn photon | Doppler beaming, hình ảnh bất đối xứng, so sánh với ảnh M87\* |
| D7 | Sóng hấp dẫn | Sao đôi xoắn ốc, chirp, nghe âm thanh, dữ liệu LIGO | Dạng sóng PN, khối lượng chirp, Hulse–Taylor, GW150914 |
| D8 | Vũ trụ học FLRW | Phương trình Friedmann, dịch chuyển đỏ vũ trụ, tuổi vũ trụ | Hằng số Hubble, tham số mật độ, khoảng cách vũ trụ |
| D9 | Hình học không–thời gian (minh hoạ) | Embedding diagram kiểu Flamm | **Mức C:** ẩn dụ minh hoạ, bắt buộc có nhãn cảnh báo (mục 5) |

### Nhóm E · Mở rộng thiên văn

- **Hệ Mặt Trời 3D tỉ lệ thật:** vị trí tính theo ephemeris, chế độ cuộn từ Mặt Trời ra Neptune.
- **Thang khoảng cách vũ trụ:** Trái Đất, Hệ Mặt Trời, sao lân cận, thiên hà, vũ trụ quan sát được (zoom logarithmic).
- **Sao:** biểu đồ HR, tiến hoá sao, sao đôi, kết thúc đời sao.
- **Thiên hà:** cấu trúc Ngân Hà, đường cong quay, vật chất tối.
- **Bầu trời đêm (planetarium)** và **kính thiên văn, quang học**.

**Gợi ý thứ tự:** làm kỹ nhóm B1–B2, A2 và lõi `sim-core` trước. Sau đó C (tương đối hẹp, ít phụ thuộc hạ tầng) rồi D2–D5 (tương đối rộng cốt lõi). D6–D7 là phần khó nhất, để sau.

## 5. Độ tin cậy khoa học

Đây là phần quan trọng nhất của USAC SimLab, đặc biệt với tương đối rộng, nơi dễ làm ra hình ảnh đẹp nhưng sai. Hệ thống áp dụng ba cơ chế: phân tầng độ trung thực, thẻ mô hình (Model Card) và danh sách hiểu lầm cần tránh.

### Phân tầng độ trung thực

| Mức | Ý nghĩa | Ví dụ | Nhãn hiển thị |
| --- | --- | --- | --- |
| A · Chính xác | Nghiệm đóng hoặc công thức chuẩn, kiểm chứng được bằng tay | Phương trình Kepler, biến đổi Lorentz, dịch chuyển đỏ hấp dẫn Schwarzschild | “Chính xác theo lý thuyết” |
| B · Số trị có kiểm soát | Tích phân số, sai số định lượng và hiển thị được | N-body, CR3BP, geodesic Kerr, ray tracing lỗ đen, dạng sóng hấp dẫn PN | “Mô phỏng số, sai số ≤ x” (Advanced hiện giá trị thật) |
| C · Minh hoạ khái niệm | Ẩn dụ giúp hiểu, không phải hình dạng thật | Embedding diagram, “tấm cao su”, hoạt hoạ rút gọn | “Minh hoạ, không phải mô hình chính xác” |

Quy tắc: không được trình bày Mức C như thể là Mức A hoặc B. Mỗi module ghi rõ phần nào thuộc mức nào.

### Model Card cho mỗi mô phỏng

Mỗi module có một trang “Model Card” (mở được từ nút ⓘ), gồm:

- **Phương trình** được dùng, kèm trích dẫn tài liệu tham khảo.
- **Giả định và xấp xỉ** (trường yếu, khối điểm, bỏ qua nhiễu loạn…).
- **Miền hợp lệ:** ví dụ v < 0,99c, r > r\_ISCO, e < 1.
- **Sai số và cách đo:** năng lượng trôi bao nhiêu sau N chu kỳ, dung sai tích phân.
- **Kiểm chứng:** danh sách test và giá trị tham chiếu đã đối chiếu.
- **Giới hạn đã biết:** điều mô phỏng không biểu diễn được.

### Hiểu lầm phổ biến cần xử lý đúng

- **Không dùng “tấm cao su” làm hình ảnh chính** của hấp dẫn. Nếu dùng phải ở Mức C và giải thích giới hạn (không gian chỉ là lát cắt, hấp dẫn không “kéo xuống” theo nghĩa thường).
- **Co ngắn Lorentz không phải là cái ta “nhìn thấy”.** Vật chuyển động gần c trông bị xoay (Terrell–Penrose), không bị co. Mô phỏng quang học C4 phải kết xuất đúng, hệ quy chiếu phải được gắn nhãn.
- **Chân trời sự kiện không phải bề mặt vật chất.** Người rơi qua nó không thấy gì đặc biệt tại chỗ; người ở xa thấy vật “đóng băng” và mờ dần (dịch chuyển đỏ). Cần hiển thị cả hai góc nhìn.
- **Vũ trụ giãn nở không phải thiên hà bay trong một không gian có sẵn.** Mô hình D8 dùng toạ độ comoving, tách khỏi chuyển động riêng.
- **Nghịch lý sinh đôi** phải có người gia tốc, không phải hai hệ quán tính đối xứng. Biểu đồ Minkowski phải thể hiện đúng đường thế giới gấp khúc.
- **Ánh sáng không đứng yên ở cầu photon:** quỹ đạo tròn tại 1,5 r\_s là **không bền**.

## 6. Mô hình vật lý và yêu cầu số trị

### Nguyên tắc chung

- **Lõi số dùng float64.** GPU shader (float32) chỉ dùng cho kết xuất; mọi kết quả định lượng hiển thị cho người học lấy từ lõi float64.
- **Đơn vị:** lõi GR dùng đơn vị hình học (G = c = 1, độ dài tính theo M); lớp hiển thị đổi sang km, AU, M☉, giây. Không trộn đơn vị trong code.
- **Thời gian:** Julian Date, UTC, TT/TDB, thời gian thiên văn địa phương, phương trình thời gian.
- **Tích phân quỹ đạo:** nghiệm giải tích cho Kepler (Newton–Raphson hoặc Halley, biến phổ quát cho e ≥ 1); N-body dùng tích phân symplectic (leapfrog bậc cao, Wisdom–Holman) hoặc Runge–Kutta thích nghi bậc cao (Dormand–Prince); chọn IAS15 khi cần độ chính xác cao.
- **Bảo toàn:** mô phỏng phải hiển thị độ trôi năng lượng và mômen động lượng. Mục tiêu: độ trôi tương đối < 1e-9 sau 1000 chu kỳ cho hai vật.

### Thuyết tương đối hẹp

- Dùng **rapidity** làm biến trạng thái trong biểu đồ Minkowski để cộng vận tốc chính xác và tránh sai số khi v → c.
- Cài 4-vector và biến đổi Lorentz tổng quát (boost bất kỳ hướng), không chỉ dọc trục x.
- Kết xuất quang học (C4) dùng ray tracing trong hệ người quan sát: áp dụng quang sai và Doppler cho từng tia; có chế độ so sánh “hình thức co ngắn ngây thơ” để dạy sự khác nhau.

```latex
\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}, \qquad E^2 = (pc)^2 + (mc^2)^2
```

### Thuyết tương đối rộng

- **Metric:** Schwarzschild và Kerr (Boyer–Lindquist), thêm dạng không kỳ dị tại chân trời (Eddington–Finkelstein hoặc Kerr–Schild) để người rơi đi qua được chân trời.
- **Geodesic:** tích phân phương trình geodesic hoặc dạng Hamilton. Với Schwarzschild dùng thế hiệu dụng. Với Kerr dùng hằng số Carter. Luôn theo dõi các đại lượng bảo toàn (năng lượng E, mômen động lượng L, Q, chuẩn của 4-vận tốc) để phát hiện sai số.
- **Ray tracing ánh sáng:** geodesic zero (null) trong ba chế độ: xấp xỉ trường yếu cho thấu kính (nhanh), bảng tra góc lệch tiền tính cho Schwarzschild (thời gian thực trên di động), tích phân đầy đủ cho Kerr (độ chính xác cao, có refinement dần).
- **Sóng hấp dẫn:** dạng sóng post-Newtonian cho giai đoạn xoắn ốc; không tự bịa giai đoạn hợp nhất. Với giai đoạn hợp nhất, dùng dữ liệu LIGO hoặc dạng sóng đã công bố, ghi rõ nguồn.
- **Vũ trụ học:** phương trình Friedmann cho ΛCDM, tham số lấy từ kết quả Planck, ghi rõ bản công bố.

```latex
\left(\frac{dr}{d\tau}\right)^2 = E^2 - \left(1 - \frac{2GM}{rc^2}\right)\left(c^2 + \frac{L^2}{r^2}\right)
```

### Giá trị tham chiếu để viết test

Các giá trị dưới đây là gần đúng. AI Code phải **đối chiếu lại với tài liệu chính thống** (sách giáo khoa, bài báo, NASA/JPL) trước khi đưa vào test và ghi nguồn cạnh mỗi giá trị.

| Hạng mục | Giá trị tham chiếu | Dùng cho |
| --- | --- | --- |
| Chu kỳ quỹ đạo Trái Đất | ≈ 365,256 ngày | A2, B1 |
| Tiến động cận điểm Sao Thuỷ do GR | ≈ 43″ mỗi thế kỷ | D2, B6 |
| Góc lệch ánh sáng sát rìa Mặt Trời | ≈ 1,75″ | D5 |
| Hiệu chỉnh đồng hồ GPS | GR ≈ +45 μs/ngày, SR ≈ −7 μs/ngày, ròng ≈ +38 μs/ngày | C1, D1 |
| Bán kính Schwarzschild | r\_s = 2GM/c² (Mặt Trời ≈ 2,95 km) | D3 |
| Cầu photon (Schwarzschild) | r = 1,5 r\_s = 3GM/c² | D3, D6 |
| ISCO Schwarzschild | r = 3 r\_s = 6GM/c² | D2, D3 |
| ISCO Kerr, a = 1 | 1 GM/c² (thuận chiều), 9 GM/c² (ngược chiều) | D4 |
| Bán kính bóng lỗ đen Schwarzschild | b = 3√3 GM/c² ≈ 5,196 GM/c² | D3, D6 |
| Hệ số Lorentz γ | v = 0,5c → 1,155; v = 0,9c → 2,294; v = 0,99c → 7,089 | C1–C5 |
| Thời gian sống muon (nghỉ) | ≈ 2,197 μs | C1 |
| Dịch chuyển hấp dẫn Pound–Rebka | Δf/f ≈ 2,5 × 10⁻¹⁵ trên 22,5 m | D1 |
| Điểm L1 Mặt Trời–Trái Đất | ≈ 1,5 triệu km từ Trái Đất | B3 |
| Bán kính Einstein | θ\_E = √\[ 4GM/c² · D\_ls / (D\_l D\_s) \] | D5 |

## 7. Kiến trúc kỹ thuật đề xuất

### Công nghệ

| Lớp | Lựa chọn đề xuất | Lý do |
| --- | --- | --- |
| Ngôn ngữ | TypeScript (strict) | An toàn kiểu, dễ cho AI sinh code đúng |
| Framework | Next.js hoặc Vite + React | Routing, SEO cho trang bài học, triển khai tĩnh |
| 3D và kết xuất | Three.js với React Three Fiber (+ drei) | Chuẩn thực tế, hệ sinh thái lớn |
| Ray tracing GR | WebGPU compute, dự phòng WebGL2 fragment shader | Tính hàng triệu tia, có dự phòng cho thiết bị cũ |
| Lõi số nặng | Rust biên dịch ra WebAssembly (tuỳ chọn, cho N-body, geodesic Kerr) | Nhanh và ổn định số hơn JS khi cần |
| Tính toán nền | Web Worker | Không treo giao diện |
| Biểu đồ 2D | D3 hoặc visx, canvas cho dữ liệu lớn | Biểu đồ Kepler, đường cong ánh sáng, HR, dạng sóng |
| State | Zustand (state mô phỏng) + URL state | Chia sẻ trạng thái qua link |
| Công thức | KaTeX | Hiển thị toán nhanh |
| Nội dung | MDX | Bài học và widget trong cùng file |
| i18n | next-intl hoặc i18next | Việt, Anh trước; dễ thêm ngôn ngữ |
| Test | Vitest, Playwright, và bộ vector vàng (golden vectors) | Test vật lý và test giao diện |
| Triển khai | Vercel hoặc Cloudflare Pages, PWA | Miễn phí, nhanh, dùng offline |

### Kiến trúc tách lớp

```
usac-simlab/
├─ packages/
│  ├─ sim-core/              # Vật lý thuần, KHÔNG phụ thuộc React/Three
│  │   ├─ units/             # Hằng số, đơn vị, chuyển đổi (có nguồn)
│  │   ├─ time/              # Julian Date, UTC/TT/TDB, thời gian thiên văn
│  │   ├─ celestial/         # Toạ độ thiên cầu, ephemeris
│  │   ├─ orbits/            # Kepler, N-body, CR3BP, chuyển quỹ đạo, nhiễu loạn
│  │   ├─ relativity-sr/     # 4-vector, Lorentz, Minkowski, kết xuất quang học
│  │   ├─ relativity-gr/     # Metric, geodesic, ray tracing, thấu kính, sóng hấp dẫn
│  │   ├─ cosmology/         # FLRW, khoảng cách, dịch chuyển đỏ
│  │   ├─ stellar/           # Tiến hoá sao, HR, vùng habitable
│  │   └─ photometry/        # Xử lý ảnh sao, đường cong ánh sáng, periodogram
│  ├─ sim-ui/                # Slider, panel, timeline, biểu đồ, spacetime diagram
│  ├─ sim-render/            # Shader, ray tracer, vật liệu, camera
│  └─ data/                  # Dữ liệu tĩnh đã xử lý (JSON/Parquet nhỏ)
├─ apps/
│  └─ web/
│      └─ modules/           # A1…E: mỗi module = sim, content (MDX), assets, tests
├─ reference/                # Script Python tạo golden vectors (astropy, REBOUND, einsteinpy)
└─ docs/                     # BRIEF.md, AGENTS.md, model cards, CREDITS.md
```

**Quy tắc:** `sim-core` là hàm thuần (pure), có test đơn vị, chạy được cả trên Node. Lớp hiển thị chỉ *đọc* state và *vẽ*. Điều này giúp AI Code sửa giao diện mà không làm hỏng vật lý, và ngược lại.

**Kiểm chứng chéo:** thư mục `reference/` chứa script Python dùng thư viện khoa học đã có (ví dụ astropy cho thời gian và toạ độ, REBOUND cho N-body, einsteinpy cho GR) để sinh **golden vectors**. Code TypeScript/Rust phải khớp các vector này trong dung sai ghi sẵn. Đây là cách kiểm chứng thực tế nhất khi AI viết code vật lý.

### Vòng lặp mô phỏng

- Một **clock trung tâm** (thời gian mô phỏng, tốc độ, tạm dừng, đảo chiều, bước theo ngày/giờ).
- Tách **thời gian mô phỏng** khỏi **thời gian thật** của khung hình. Dùng `requestAnimationFrame`, mọi cập nhật dựa trên delta time.
- Trạng thái là hàm của thời gian khi có thể: `state = f(t, params)` (Kepler giải tích). Với tích phân số, lưu trạng thái ở bước cố định và nội suy để hiển thị mượt.
- Phân biệt rõ **thời gian toạ độ** và **thời gian riêng** trong mô phỏng tương đối. Giao diện luôn hiển thị cả hai.

## 8. Cấu trúc một bài học chuẩn

Mọi module theo cùng một khuôn để dễ mở rộng:

1. **Giới thiệu ngắn** (mục tiêu học tập, thời lượng ước tính, mức độ, kiến thức cần có).
2. **Các trang nền tảng** (background): ngắn, có hình minh hoạ nhỏ và mini-widget tương tác.
3. **Mô phỏng chính** (full-screen, có thể thu gọn panel).
4. **Hoạt động có hướng dẫn:** các bước “Hãy thử…” gắn với mô phỏng, tự động đặt tham số khi bấm.
5. **Kiểm tra nhanh:** trắc nghiệm, kéo thả, hoặc dự đoán rồi chạy mô phỏng để kiểm chứng.
6. **Model Card** (mục 5): phương trình, giả định, sai số, giới hạn.
7. **Tài nguyên:** bản PDF in được, worksheet, gợi ý cho giảng viên.
8. **Nguồn tham khảo và credit dữ liệu.**

Nội dung bài học viết bằng **MDX** (Markdown + component React), lưu theo thư mục ngôn ngữ.

## 9. Dữ liệu và nguồn tham khảo

| Nhu cầu | Nguồn đề xuất |
| --- | --- |
| Thông số hành tinh, vệ tinh, vị trí | NASA/JPL (Horizons, Planetary Fact Sheet) |
| Ngoại hành tinh | NASA Exoplanet Archive |
| Danh mục sao, chòm sao | HYG database, Hipparcos/Gaia (rút gọn) |
| Đường cong ánh sáng thật | Kepler/TESS (qua MAST), AAVSO |
| Sóng hấp dẫn | GWOSC (Gravitational Wave Open Science Center, dữ liệu LIGO/Virgo công khai) |
| Ảnh lỗ đen tham chiếu | Event Horizon Telescope (kiểm tra giấy phép từng ảnh trước khi dùng) |
| Tham số vũ trụ học | Kết quả Planck (ghi rõ bản công bố) |
| Tiến hoá sao | MIST/PARSEC (bảng rút gọn) hoặc công thức xấp xỉ |
| Kết cấu hành tinh, Mặt Trăng | NASA Visible Earth (kiểm tra giấy phép) |

**Quy tắc:** chỉ dùng tài sản có giấy phép rõ ràng (public domain, CC). Ghi nguồn và giấy phép trong `CREDITS.md` và trang About. Dữ liệu lớn phải được tiền xử lý thành tệp nhỏ, tải theo nhu cầu (lazy load). Mọi số liệu nhúng trong code kèm trích dẫn.

## 10. Thiết kế giao diện và trải nghiệm

### Phong cách

- **Dark theme theo mặc định** (nền không gian), có chế độ sáng cho in ấn và lớp học.
- Bảng màu có chủ đích: mỗi khái niệm một màu nhất quán xuyên suốt (ví dụ Mặt Trời vàng, hoàng đạo xanh lá, xích đạo xanh dương), giải thích trong legend.
- Typography rõ ràng, số liệu dùng font monospace/tabular để không nhảy khi thay đổi.
- Hoạt ảnh mượt, có ý nghĩa; tôn trọng `prefers-reduced-motion`.

### Bố cục mô phỏng chuẩn

- **Khung nhìn chính** chiếm phần lớn màn hình (3D hoặc 2D).
- **Panel điều khiển** có thể thu gọn: nhóm theo Thời gian · Tham số · Hiển thị.
- **Thanh thời gian** (timeline): phát/tạm dừng, tốc độ, nhảy tới sự kiện (xuân phân, cận điểm, trăng tròn...).
- **Panel thông tin** hiển thị giá trị tính được theo thời gian thực kèm đơn vị.
- **Nhiều khung nhìn đồng bộ** (ví dụ góc nhìn vũ trụ + góc nhìn người quan sát), chia đôi màn hình hoặc chuyển tab trên điện thoại.
- **Tooltip và nhãn tương tác:** rê chuột hoặc chạm vào vật thể để xem thông tin và định nghĩa thuật ngữ.
- Nút **Reset**, **Chia sẻ (link)**, **Chụp ảnh**, **Toàn màn hình**, **Model Card (ⓘ)**.

### Khung nhìn riêng cho thuyết tương đối

- **Bộ chuyển hệ quy chiếu:** chọn xem sự kiện từ hệ nào (người ở xa, người rơi, tàu vũ trụ). Hai khung nhìn song song, đồng bộ theo thời gian riêng.
- **Biểu đồ không–thời gian tương tác:** kéo sự kiện, nón ánh sáng, đường thế giới, đổi hệ bằng thanh trượt rapidity.
- **Hiển thị hai đồng hồ:** thời gian toạ độ và thời gian riêng, luôn có nhãn.
- **Ray tracing có tinh chỉnh dần:** hiển thị nhanh độ phân giải thấp khi kéo, tinh chỉnh dần khi dừng. Có nút “chất lượng khoa học” để dựng ảnh tham chiếu độ phân giải cao.
- **Lớp chú thích vật lý:** bật/tắt cầu photon, ISCO, ergosphere, chân trời sự kiện để người học thấy các ranh giới nằm ở đâu.
- **Cảnh báo Mức C:** mọi hình minh hoạ khái niệm có dải nhãn rõ ràng.

### Tính năng tạo “độ xịn”

- Bầu trời, ánh sáng, bóng đổ, texture chất lượng cao, hiệu ứng bloom tiết chế. Nền sao đúng vị trí thật.
- Chuyển cảnh camera mượt giữa các vật thể (fly-to).
- Mức chi tiết (LOD) và chất lượng đồ hoạ tự động theo thiết bị, có tuỳ chọn “chế độ tiết kiệm”.
- Chế độ **dự đoán rồi kiểm chứng:** người học nhập dự đoán trước, mô phỏng cho thấy kết quả.
- Chế độ **thử thách:** đặt mục tiêu (ví dụ “chỉnh quỹ đạo để chu kỳ là 2 năm”, “tìm quỹ đạo tròn bền gần lỗ đen nhất”).

## 11. Yêu cầu phi chức năng

- **Hiệu năng:** 60 FPS trên laptop phổ thông, tối thiểu 30 FPS trên điện thoại tầm trung với mô phỏng thường. Ray tracing GR có chế độ nhẹ cho di động (bảng tra tiền tính, độ phân giải thấp, tinh chỉnh dần). Tải lần đầu mỗi module dưới 3 giây trên 4G (lazy load).
- **Độ chính xác số:** đạt dung sai trong mục 6; test vật lý chạy trong CI cho mỗi pull request.
- **Khả năng truy cập (a11y):** chuẩn WCAG 2.1 AA, điều khiển bằng bàn phím, mô tả văn bản cho các hình quan trọng, độ tương phản tốt, giá trị thông tin đọc được bằng trình đọc màn hình.
- **Responsive:** thiết kế mobile-first cho các điều khiển (slider lớn, panel dạng ngăn kéo).
- **Offline:** PWA, lưu cache các module đã mở.
- **Đa ngôn ngữ:** mọi chuỗi chữ tách ra file ngôn ngữ, không hard-code. Số, ngày, đơn vị theo locale. Có bảng thuật ngữ (glossary) vi/en dùng chung, đặc biệt cho thuật ngữ tương đối.
- **Riêng tư:** không theo dõi cá nhân; analytics ẩn danh và tối thiểu.
- **Bảo trì:** lint, format, CI chạy test và build cho mỗi pull request.

## 12. Lộ trình đề xuất

**Giai đoạn 0 · Nền móng (1–2 tuần)** Thiết lập monorepo, design system, `sim-core` cơ bản (đơn vị, thời gian, Kepler), clock mô phỏng, khung bố cục simulator, i18n, CI, khung Model Card, và bộ `reference/` sinh golden vectors đầu tiên.

**Giai đoạn 1 · Module vàng (2–3 tuần)** Làm hoàn chỉnh *một* module từ đầu đến cuối làm chuẩn: **B1/A2 Quỹ đạo hai vật**. Gồm bài học MDX, mô phỏng, đồ thị, câu hỏi, Model Card, test đối chiếu.

**Giai đoạn 2 · Quỹ đạo nâng cao (3–4 tuần)** B2 (Hohmann), B3 (CR3BP, điểm Lagrange), B4 (N vật). Tích phân symplectic và kiểm tra bảo toàn năng lượng.

**Giai đoạn 3 · Thuyết tương đối hẹp (3–4 tuần)** C1, C2, C3 trước (đồng hồ ánh sáng, biểu đồ Minkowski, nghịch lý), rồi C4 (kết xuất quang học) và C5.

**Giai đoạn 4 · Thuyết tương đối rộng cốt lõi (4–6 tuần)** D1, D2, B6 (tiến động cận điểm, so với Newton), D3 (lỗ đen Schwarzschild), D5 (thấu kính hấp dẫn). Ray tracing Schwarzschild với bảng tra góc lệch.

**Giai đoạn 5 · Thiên văn nền tảng và Mặt Trời–Mặt Trăng (3–4 tuần)** A1, A3, A4, A5, A6 và hệ Mặt Trời 3D tỉ lệ thật.

**Giai đoạn 6 · GR nâng cao (6+ tuần)** D4 (Kerr), D6 (đĩa bồi tụ), D7 (sóng hấp dẫn, dữ liệu LIGO), D8 (vũ trụ học FLRW). Đây là phần khó nhất, cần người có chuyên môn rà soát.

**Giai đoạn 7 · Mở rộng (liên tục)** Nhóm E, chế độ lớp học (giáo viên tạo link bài tập), thêm ngôn ngữ.

Mỗi giai đoạn kết thúc bằng một bản chạy được và triển khai công khai.

## 13. Tiêu chí nghiệm thu cho mỗi module

- [ ] Mô phỏng chạy ổn định, không lỗi console, đạt mục tiêu FPS.
- [ ] Mọi phép tính vật lý có test đơn vị đối chiếu golden vectors hoặc giá trị tham chiếu có nguồn.
- [ ] Có Model Card đầy đủ: phương trình, giả định, miền hợp lệ, sai số, giới hạn.
- [ ] Mức độ trung thực (A/B/C) được gắn nhãn trên giao diện; không có hình Mức C nào bị trình bày như Mức A/B.
- [ ] Các đại lượng bảo toàn (năng lượng, mômen động lượng, chuẩn 4-vận tốc) được theo dõi và không vượt dung sai.
- [ ] Mọi đại lượng tương đối tính ghi rõ hệ quy chiếu và loại thời gian (toạ độ hay riêng).
- [ ] Có đủ 3 mức Level (Explorer/Student/Advanced) hoặc ghi rõ lý do không áp dụng.
- [ ] Bài học đầy đủ cấu trúc chuẩn (mục 8), có câu hỏi kiểm tra.
- [ ] Dùng được trên điện thoại và bằng bàn phím.
- [ ] Có tiếng Việt và tiếng Anh, không còn chuỗi hard-code.
- [ ] Trạng thái chia sẻ được qua URL.
- [ ] Ghi nguồn dữ liệu và tài sản trong `CREDITS.md`.
- [ ] Một người có chuyên môn vật lý/thiên văn đã rà soát nội dung khoa học.
- [ ] Qua kiểm tra a11y tự động (axe) và Lighthouse trên 90.

## 14. Quy ước làm việc với AI Code

Để AI Code cho kết quả tốt và nhất quán, hãy đưa cho nó:

1. **Brief này** làm bối cảnh cố định (đặt trong `docs/BRIEF.md`).
2. Một file **`AGENTS.md` / `CLAUDE.md`** ghi quy ước: cấu trúc thư mục, quy tắc “vật lý nằm trong `sim-core`”, phong cách code, cách chạy test.
3. **Mỗi lần giao một nhiệm vụ nhỏ, có tiêu chí hoàn thành rõ ràng**, ví dụ: “Triển khai `solveKepler(M, e)` trong `sim-core/orbits` kèm test cho e = 0, 0.2, 0.9; sau đó xây `OrbitView` hiển thị quỹ đạo elip 2D với slider a và e.”
4. **Yêu cầu viết test trước hoặc cùng lúc** với logic vật lý, đối chiếu golden vectors.
5. **Không bịa công thức hay hằng số.** Mọi phương trình phải kèm trích dẫn (sách hoặc bài báo); mọi hằng số lấy từ `units/constants.ts` kèm nguồn. Chỗ nào không chắc, AI phải ghi `TODO: cần xác minh` thay vì đoán.
6. **Phản biện chéo:** sau mỗi module vật lý, yêu cầu một lượt “review” độc lập (AI khác hoặc người) kiểm tra công thức, đơn vị, dấu và dung sai.
7. **Duyệt từng bước** thay vì nhờ làm cả hệ thống một lần. Làm module vàng thật tốt rồi mới nhân rộng.

### Mẫu prompt khởi đầu

> Bạn là kỹ sư full-stack có kiến thức vật lý thiên văn. Hãy đọc `docs/BRIEF.md` của dự án USAC SimLab. Nhiệm vụ đầu tiên: khởi tạo monorepo theo mục 7, thiết lập TypeScript strict, Vitest, ESLint, i18n (vi/en), khung Model Card và một trang simulator rỗng với bố cục chuẩn ở mục 10. Chưa làm module nào. Khi xong, giải thích cấu trúc và cách chạy.

## 15. Rủi ro và cách giảm thiểu

| Rủi ro | Giảm thiểu |
| --- | --- |
| Phạm vi quá lớn, dự án không bao giờ xong | Làm theo giai đoạn, mỗi giai đoạn ra sản phẩm dùng được; GR nâng cao để sau |
| Sai vật lý do AI sinh code (đặc biệt GR) | Tách `sim-core`, bắt buộc golden vectors từ thư viện tham chiếu, Model Card, người có chuyên môn rà soát |
| Sai số số trị gần chân trời hoặc điểm kỳ dị | Dùng toạ độ không kỳ dị, theo dõi đại lượng bảo toàn, dung sai thích nghi, float64 cho lõi |
| Độ chính xác float32 trên GPU làm hỏng ray tracing GR | Lõi định lượng chạy float64; GPU chỉ để kết xuất; dùng bảng tra tiền tính và kiểm tra so với ảnh tham chiếu từ CPU |
| Hình ảnh đẹp nhưng gây hiểu lầm (tấm cao su, “thấy” co Lorentz) | Phân tầng Mức A/B/C, nhãn bắt buộc, danh sách hiểu lầm ở mục 5 |
| Hiệu năng kém trên điện thoại | Ngân sách hiệu năng từ đầu, LOD, tinh chỉnh dần, chế độ tiết kiệm |
| Vi phạm bản quyền (NAAP, texture, ảnh EHT, dữ liệu) | Chỉ lấy ý tưởng; tài sản có giấy phép rõ; `CREDITS.md` |
| Giao diện đẹp nhưng khó học | Thử nghiệm với người học thật, dựa trên mục tiêu học tập |
| Dịch thuật ngữ vật lý không nhất quán | Xây bảng thuật ngữ (glossary) dùng chung vi/en, giảng viên rà soát |

## 16. Câu hỏi cần chốt trước khi bắt đầu

1. Đối tượng chính là ai trước: học sinh THPT, sinh viên, hay cộng đồng yêu thiên văn?
2. Ngôn ngữ ưu tiên: Việt trước rồi Anh, hay song song?
3. Mục tiêu là sản phẩm phi lợi nhuận mã nguồn mở hay có kế hoạch thương mại? (Ảnh hưởng chọn giấy phép: MIT/Apache cho code, CC BY-SA cho nội dung.)
4. Có cần tài khoản, lưu tiến độ và chế độ lớp học cho giáo viên ngay từ đầu không?
5. Có người chuyên môn vật lý/thiên văn để rà soát nội dung, đặc biệt phần tương đối, không?
6. Mức độ toán học của Advanced đến đâu (đại số, giải tích, hay tenxơ và hình học vi phân)?
7. Thiết bị mục tiêu thấp nhất cần hỗ trợ là gì (điện thoại đời nào, có WebGPU không)?

---

*Gợi ý: sau khi chốt mục 16, hãy bắt đầu bằng Giai đoạn 0 và Giai đoạn 1 (Quỹ đạo hai vật) để có một “module vàng” làm chuẩn cho mọi module sau, rồi mới mở sang nhóm C và D.*
