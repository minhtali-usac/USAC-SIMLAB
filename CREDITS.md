# Ghi công và nguồn dữ liệu

## Cảm hứng sư phạm

**NAAP**, viết tắt của Nebraska Astronomy Applet Project, thuộc University of Nebraska–Lincoln. USAC SimLab chỉ lấy ý tưởng sư phạm và cấu trúc bài học từ dự án này. Không có mã, hình ảnh, văn bản hay ảnh chụp màn hình nào của NAAP được sao chép.

## Dữ liệu và thuật toán

Các bảng dưới đây ghi nguồn cho mọi số liệu và thuật toán đang được dùng, cùng nơi chúng xuất hiện trong mã.

### Hằng số

| Nguồn | Dùng cho | Nằm ở |
|---|---|---|
| CODATA 2018 | Hằng số vật lý | `sim-core/src/units/constants.ts` |
| Nghị quyết IAU 2012 B2 và 2015 B2, B3 | au, parsec, hằng số danh định của Mặt Trời và Trái Đất | `sim-core/src/units/constants.ts` |
| JPL DE430 (Folkner et al. 2014) | GM của Mặt Trời, Mặt Trăng và Sao Mộc | `sim-core/src/units/constants.ts` |
| PDG 2022 | Thời gian sống của muon | `sim-core/src/units/constants.ts` |

### Vị trí thiên thể

| Nguồn | Dùng cho | Nằm ở |
|---|---|---|
| E. M. Standish, JPL SSD, *Keplerian Elements for Approximate Positions of the Major Planets* | Vị trí hành tinh | `sim-core/src/celestial/planets.ts` |
| J. Meeus, *Astronomical Algorithms*, tái bản lần 2 (1998) | Mặt Trời, GMST, khúc xạ, toạ độ | `sim-core/src/celestial/` |
| Astronomical Almanac, công thức Mặt Trăng độ chính xác thấp | Vị trí Mặt Trăng | `sim-core/src/celestial/moon.ts` |
| Yale Bright Star Catalogue, bản 5 (Hoffleit & Warren 1991) | Toạ độ J2000 của khoảng 60 sao sáng | `sim-core/src/data/brightStars.ts` |
| NASA Planetary Fact Sheet | Bán kính, khối lượng và chu kỳ quay của hành tinh | `sim-core/src/celestial/planets.ts` |
| P. Bretagnon & G. Francou 1988, A&A 202, 309 (VSOP87), bản rút gọn trong Celestia | Vị trí tám hành tinh trong E1 | `sim-core/src/ephemeris/vsop87*.ts` |
| Celestia: lý thuyết vệ tinh (Meeus ch. 44, 46, 47; Laskar & Jacobson 1987; Emelyanov & Samorodov 2015) | Mặt Trăng và 16 vệ tinh trong E1 | `sim-core/src/ephemeris/satellite*.ts` |
| Archinal et al. 2018, CeMDA 130, 22 (IAU WGCCRE), qua Celestia | Hướng cực quay và pha quay | `sim-core/src/ephemeris/iauRotationData.ts` |
| Park et al. 2021, AJ 161, 105 (JPL DE440/DE441) | Tỉ số khối lượng Trái Đất/Mặt Trăng; dữ liệu đối chiếu qua JPL Horizons | `sim-core/src/ephemeris/earthMoon.ts` |
| McEwen 1996, Lunar and Planetary Science 27, 841 | Hàm ánh sáng lunar-Lambert | `web/src/lib/celestiaShaders.ts` |

### Sao và ngoại hành tinh

| Nguồn | Dùng cho | Ghi chú |
|---|---|---|
| NASA Exoplanet Archive | Thông số ngoại hành tinh trong A4 và A6 | Đã làm tròn, cần xác minh trước khi phát hành |
| GCVS và AAVSO VSX | Chu kỳ và cấp sao của sao biến quang (A5) | |

### Mô hình vật lý

| Nguồn | Dùng cho |
|---|---|
| Planck Collaboration 2020, A&A 641, A6, Bảng 2 | Tham số vũ trụ học |
| Kopparapu et al. 2013 (ApJ 765, 131) và 2014 (ApJL 787, L29) | Vùng sinh sống được |
| Benedict et al. 2007, AJ 133, 1810 | Định luật chu kỳ–độ trưng của Cepheid |
| Ashby 2003, Living Reviews in Relativity 6, 1 | Hiệu chỉnh đồng hồ GPS |
| Bardeen, Press & Teukolsky 1972 | Bán kính đặc trưng của hố đen Kerr |
| Wyman, Sloan & Shirley 2013, JCGT 2(2) | Hàm ghép màu CIE |

## Celestia (GNU GPL)

Mô-đun E1 chứa mã phái sinh từ **Celestia** (Bản quyền (C) 2001-nay, Celestia Development Team; GNU GPL phiên bản 2 hoặc mới hơn; https://celestiaproject.space). Để tuân thủ giấy phép, USAC SimLab cũng phát hành theo **GPL-2.0-or-later** ([LICENSE](LICENSE)). Danh sách tệp phái sinh, thay đổi, ngày thay đổi và cách tái lập đầu vào nằm trong [NOTICE.md](NOTICE.md).

## Ảnh thiên văn trên thẻ module

Toàn bộ ảnh nằm trong `apps/web/public/img/`, lấy từ Wikimedia Commons. Tác giả và giấy phép được đọc trực tiếp từ siêu dữ liệu Commons (API `extmetadata`), không gõ tay. Với các ảnh CC BY và CC BY-SA, ghi công hiển thị ngay trên thẻ và trong trang Giới thiệu.

| Tệp | Tên gốc | Tác giả | Giấy phép | Nguồn |
|---|---|---|---|---|
| `img/a1.jpg` | The Sun by the Atmospheric Imaging Assembly of NASA's Solar Dynamics Observatory - 20100819.jpg | NASA/SDO (AIA) | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg) |
| `img/a3.jpg` | FullMoon2010.jpg | Gregory H. Revera | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg) |
| `img/a4.jpg` | Kepler186f-ArtistConcept-20140417.jpg | NASA Ames/SETI Institute/JPL-Caltech | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Kepler186f-ArtistConcept-20140417.jpg) |
| `img/a5.jpg` | RS Puppis.jpg | NASA/ESA/Hubble Heritage (STScI/AURA)-Hubble/Europe Collab. | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:RS_Puppis.jpg) |
| `img/a6.jpg` | Kepler186f-ComparisonGraphic-20140417.jpg | NASA Ames/SETI Institute/JPL-Caltech | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Kepler186f-ComparisonGraphic-20140417.jpg) |
| `img/b1.jpg` | Lspn comet halley.jpg | NASA/W. Liller | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Lspn_comet_halley.jpg) |
| `img/b2.jpg` | OSIRIS Mars true color.jpg | ESA & MPS for OSIRIS Team MPS/UPD/LAM/IAA/RSSD/INTA/UPM/DASP/IDA, CC BY-SA 3.0 IGO | CC BY-SA 3.0 igo | [Commons](https://commons.wikimedia.org/wiki/File:OSIRIS_Mars_true_color.jpg) |
| `img/b3.jpg` | Saturn during Equinox.jpg | NASA / JPL / Space Science Institute | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Saturn_during_Equinox.jpg) |
| `img/b4.jpg` | Antennae galaxies xl.jpg | NASA, ESA, and the Hubble Heritage Team (STScI/AURA)-ESA/Hubble Collaboration | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Antennae_galaxies_xl.jpg) |
| `img/c1.jpg` | Top of Atmosphere.jpg | NASA Earth Observatory | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Top_of_Atmosphere.jpg) |
| `img/c2.jpg` | Orion Nebula - Hubble 2006 mosaic 18000.jpg | NASA, ESA, M. Robberto (Space Telescope Science Institute/ESA) and the Hubble Space Telescope Orion Treasury Project Tea | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg) |
| `img/c4.jpg` | ESO-VLT-Laser-phot-33a-07.jpg | ESO/Y. Beletsky | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:ESO-VLT-Laser-phot-33a-07.jpg) |
| `img/d1.jpg` | GPS Satellite NASA art-iif.jpg | NASA | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:GPS_Satellite_NASA_art-iif.jpg) |
| `img/d2.jpg` | Mercury in color - Prockter07-edit1.jpg | National Aeronautics and Space Administration/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution o | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Mercury_in_color_-_Prockter07-edit1.jpg) |
| `img/d3.jpg` | Black hole - Messier 87 crop max res.jpg | Event Horizon Telescope, uploader cropped and converted TIF to JPG | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Black_hole_-_Messier_87_crop_max_res.jpg) |
| `img/d5.jpg` | A Horseshoe Einstein Ring from Hubble.JPG | Lensshoe_hubble.jpg: ESA/Hubble & NASA derivative work: Bulwersator (talk) | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:A_Horseshoe_Einstein_Ring_from_Hubble.JPG) |
| `img/d8.jpg` | NASA-HS201427a-HubbleUltraDeepField2014-20140603.jpg | NASA, ESA, H. Teplitz and M. Rafelski (IPAC/Caltech), A. Koekemoer (STScI), R. Windhorst (Arizona State University), and | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:NASA-HS201427a-HubbleUltraDeepField2014-20140603.jpg) |
| `img/e1.jpg` | The Earth seen from Apollo 17.jpg | NASA/Apollo 17 crew; taken by either Harrison Schmitt or Ron Evans | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg) |

### Nền bầu trời trong các mô phỏng

| Tệp | Tên gốc | Tác giả | Giấy phép | Nguồn |
|---|---|---|---|---|
| `img/milkyway.jpg` | ESO - Milky Way.jpg (thu nhỏ 2000×1000) | ESO/S. Brunier | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:ESO_-_Milky_Way.jpg) |

Ảnh Mặt Trăng (`a3.jpg`) và Trái Đất (`e1.jpg`) ở bảng trên cũng được dùng làm bề mặt thiên thể trong A3, B2 và D1. Phần tối của Mặt Trăng được tô theo đúng đường phân chia sáng–tối tính từ pha.

## Phần mềm

Toàn bộ thư viện dùng giấy phép MIT:

- React
- Three.js
- React Three Fiber và drei
- Zustand
- KaTeX
- Vite
- Vitest

## Phông chữ

Lấy từ Google Fonts, giấy phép SIL Open Font License:

- Be Vietnam Pro
- JetBrains Mono

## Đồ hoạ

Hình minh hoạ bên trong mô phỏng được vẽ mới bằng mã, gồm SVG, canvas và shader. Ảnh trên thẻ module là ảnh thật có ghi công ở mục trên.

Một số phần là hình trang trí và được gắn nhãn như vậy ngay trên giao diện:

- Các sao mờ ngẫu nhiên ở nền.
- Thiên hà nguồn trong module thấu kính hấp dẫn.
- Ảnh CCD tổng hợp trong module sao biến quang.

## Nhóm F - phát triển từ lss-lab

Bảy mô-đun F1–F6 và F8 được phát triển từ bộ công cụ **lss-lab** (github.com/MinhMPA/lss-lab, tác giả MinhMPA). Mô hình vật lý được chuyển vào `packages/sim-core` (float64, có test) và viết lại giao diện.

> **Giấy phép lss-lab hiện là “TBD”** (chưa công bố, theo README của kho mã). Cần xin phép tác giả trước khi phát hành công khai các mô-đun F.

| Mô-đun | Bản gốc lss-lab | Nguồn mô hình và dữ liệu chính |
|---|---|---|
| F1 | EM-field-and-wave | Griffiths §9.2; CODATA 2018 (μ₀); Bruton 1996 (màu bước sóng, chỉ hiển thị) |
| F2 | sound-and-light-waves | Kinsler et al. (v = √(γRT/M)); Del Grosso & Mader 1972 (nước); CRC Handbook of Chemistry and Physics, 65th ed. (thép không gỉ 347) |
| F3 | speed-of-light | Gaia DR3 (Proxima); van Leeuwen 2007 (Sirius); GRAVITY 2019 (R₀); Pietrzyński et al. 2019 (LMC); McConnachie et al. 2005 (M31) |
| F4 | light-from-distant-past | Planck 2018 VI (z*, r*, θ*); Fixsen 2009 (T₀); Hogg 1999; Schmidt 1963; Bañados et al. 2018; Bunker et al. 2023; Carniani et al. 2024, 2025 |
| F5 | gravitational-collapse-vs-cosmic-acceleration | Eisenstein & Hu 1998; Zel’dovich 1970; Carroll, Press & Turner 1992; Linder 2005 |
| F6 | cosmic-web-sandbox | Bouchet et al. 1995 (2LPT, f₂); Kaiser 1987; Bardeen et al. 1986; Zheng et al. 2007 (HOD); Hahn et al. 2007 (T-web) |
| F8 | model-parameter-inference | **Union2.1** (Suzuki et al. 2012, ApJ 746, 85; bảng `SCPUnion2.1_mu_vs_z.txt` của Supernova Cosmology Project) trong `sim-core/src/data/union21.ts`; Goliath et al. 2001; Metropolis et al. 1953 |

## Kết cấu bề mặt thiên thể 3D

Các bản đồ bề mặt trong `apps/web/public/tex/` (Mặt Trời, tám hành tinh, Mặt Trăng, mây và mặt đêm Trái Đất, vành Sao Thổ) lấy từ **Solar System Scope** (solarsystemscope.com/textures), giấy phép **CC BY 4.0**, dựa trên dữ liệu NASA. Dùng trong E1, A3, B1, B2, B3, D1, F3.

## Ảnh thẻ nhóm F

| Tệp | Tên gốc | Tác giả | Giấy phép | Nguồn |
|---|---|---|---|---|
| `img/f1.jpg` | Crab Nebula in Multiple Wavelengths.png | Radio: NRAO/AUI (M. Bietenholz; J.M. Uson, T.J. Cornwell); IR: NASA/JPL-Caltech/R. Gehrz; Visible: NASA, ESA, J. Hester & A. Loll; UV: NASA/Swift/E. Hoversten; X-ray: NASA/CXC/SAO/F. Seward et al.; Gamma: NASA/DOE/Fermi LAT/R. Buehler; ghép bởi Torres997 | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Crab_Nebula_in_Multiple_Wavelengths.png) |
| `img/f2.jpg` | Lightning over Oradea Romania 2.jpg | Mircea Madau | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Lightning_over_Oradea_Romania_2.jpg) |
| `img/f3.jpg` | Apollo 11 Lunar Laser Ranging Experiment.jpg | NASA | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Apollo_11_Lunar_Laser_Ranging_Experiment.jpg) |
| `img/f4.jpg` | WMAP 2012.png | NASA / WMAP Science Team | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:WMAP_2012.png) |
| `img/f5.jpg` | Cosmic web.jpg | Volker Springel / Max Planck Institute for Astrophysics | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Cosmic_web.jpg) |
| `img/f6.jpg` | The FLAMINGO project – cosmological hydrodynamical simulations… .jpg | Schaye, Kugel, Schaller, Helly et al. (MNRAS 526, 4978) | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:The_FLAMINGO_project_%E2%80%93_cosmological_hydrodynamical_simulations_for_large-scale_structure_and_galaxy_cluster_surveys.jpg) |
| `img/f8.jpg` | Supernova 1994D in Galaxy NGC 4526 (1999-19-813).jpg | NASA, ESA, The Hubble Key Project Team and The High-Z Supernova Search Team | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Supernova_1994D_in_Galaxy_NGC_4526_(1999-19-813).jpg) |

## Hiển thị công thức

Công thức dựng bằng **KaTeX** (MIT). Bảng màu “inferno” lấy mẫu từ matplotlib (CC0).
