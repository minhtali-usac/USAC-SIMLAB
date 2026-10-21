import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Giải thích vì sao nhìn càng xa là nhìn càng sâu về quá khứ, tới tận nền vi sóng vũ trụ.',
      'Liên hệ dịch chuyển đỏ $z$ với hệ số tỉ lệ $a = 1/(1+z)$, thời gian nhìn lại và nhiệt độ của nền vi sóng.',
      'Phân biệt bốn “khoảng cách” trong vũ trụ giãn nở: quãng đường ánh sáng đã đi, khoảng cách hiện nay, khoảng cách lúc phát và khoảng cách độ sáng.',
      'Đặt các thiên thể quan sát thật (đám thiên hà, chuẩn tinh, thiên hà sớm nhất, nền vi sóng) lên trục lịch sử vũ trụ.',
    ],
    en: [
      'Explain why looking farther means looking further back in time, all the way to the cosmic microwave background.',
      'Relate redshift $z$ to the scale factor $a = 1/(1+z)$, the look-back time and the temperature of the microwave background.',
      'Distinguish four “distances” in an expanding Universe: light-travel distance, distance today, distance at emission and luminosity distance.',
      'Place real observed objects (galaxy clusters, quasars, the earliest galaxies, the microwave background) on the cosmic timeline.',
    ],
  },
  durationMin: 30,
  prerequisites: { vi: 'F3 - Tốc độ ánh sáng; D8 - Phương trình Friedmann (nên học trước nếu muốn đi sâu).', en: 'F3 - The speed of light; D8 - The Friedmann equation (recommended for depth).' },
  background: [
    {
      title: { vi: 'Ánh sáng là cỗ máy thời gian', en: 'Light is a time machine' },
      body: {
        vi: 'Ánh sáng cần thời gian để tới ta, nên ta luôn thấy một vật như lúc ánh sáng rời nó. Ở thang vũ trụ, thời gian này lên tới hàng tỉ năm, và trong lúc ánh sáng đang bay, vũ trụ tiếp tục giãn nở. Mô-đun F4 đặt các thiên hà trong một **quạt khảo sát** giống các bản đồ dịch chuyển đỏ thật, kéo dài tới nền vi sóng vũ trụ, và tính mọi thời gian và khoảng cách từ phương trình Friedmann với tham số Planck 2018 (như D8).',
        en: 'Light needs time to reach us, so we always see an object as it was when the light left. On cosmic scales this time reaches billions of years, and while the light is in flight the Universe keeps expanding. Module F4 places galaxies in a **survey fan** like real redshift maps, extending to the cosmic microwave background, and computes every time and distance from the Friedmann equation with Planck 2018 parameters (as in D8).',
      },
    },
    {
      title: { vi: '1. Dịch chuyển đỏ và thời gian nhìn lại', en: '1. Redshift and look-back time' },
      body: {
        vi: 'Bước sóng của ánh sáng bị kéo dài cùng với không gian:\n\n$$1 + z = \\frac{\\lambda_{\\text{thu}}}{\\lambda_{\\text{phát}}} = \\frac{1}{a_{\\text{phát}}}.$$\n\nThời gian ánh sáng đã bay - **thời gian nhìn lại** - là\n\n$$t_{\\rm lb}(z) = \\int_0^z \\frac{dz\'}{(1+z\')\\,H(z\')},$$\n\nvà vũ trụ khi ánh sáng xuất phát có tuổi $t_0 - t_{\\rm lb}$. Với Planck 2018, $t_0 = 13{,}79$ tỉ năm. Ví dụ: chuẩn tinh 3C 273 ($z = 0{,}158$) cho thời gian nhìn lại khoảng 2,04 tỉ năm; thiên hà GN-z11 ($z = 10{,}6$) khoảng 13,35 tỉ năm, khi vũ trụ mới khoảng 435 triệu năm tuổi.',
        en: 'The wavelength of light is stretched along with space:\n\n$$1 + z = \\frac{\\lambda_{\\text{obs}}}{\\lambda_{\\text{emit}}} = \\frac{1}{a_{\\text{emit}}}.$$\n\nThe time the light has been flying - the **look-back time** - is\n\n$$t_{\\rm lb}(z) = \\int_0^z \\frac{dz\'}{(1+z\')\\,H(z\')},$$\n\nand the Universe was $t_0 - t_{\\rm lb}$ old when the light left. With Planck 2018, $t_0 = 13.79$ Gyr. For example: the quasar 3C 273 ($z = 0.158$) gives a look-back time of about 2.04 Gyr; the galaxy GN-z11 ($z = 10.6$) about 13.35 Gyr, when the Universe was only about 435 million years old.',
      },
    },
    {
      title: { vi: '2. Bốn “khoảng cách”, một thiên hà', en: '2. Four “distances”, one galaxy' },
      body: {
        vi: '- **Quãng đường ánh sáng** $c\\,t_{\\rm lb}$: con số thường gặp trên báo chí, nhưng không phải khoảng cách tới thiên hà lúc này.\n- **Khoảng cách hiện nay** (đồng chuyển động) $D_C = c\\int_0^z dz\'/H(z\')$: độ dài một sợi thước nối hai thiên hà nếu ta “dừng” giãn nở ngay hôm nay.\n- **Khoảng cách lúc phát** $D_M/(1+z)$: khi ánh sáng rời nguồn, thiên hà ở gần ta hơn nhiều.\n- **Khoảng cách độ sáng** $D_L = (1+z)D_M$: khoảng cách suy ra từ độ sáng của ngọn nến chuẩn (F8).\n\nVới nền vi sóng, ánh sáng đã bay khoảng 13,8 tỉ năm, nhưng vùng phát ra nó hiện cách ta khoảng 45,3 tỉ năm ánh sáng; chân trời hạt (giới hạn của vũ trụ quan sát được) ở khoảng 46,2 tỉ năm ánh sáng.',
        en: '- **Light-travel distance** $c\\,t_{\\rm lb}$: the number often quoted in the press, but not the galaxy’s distance now.\n- **Distance today** (comoving) $D_C = c\\int_0^z dz\'/H(z\')$: the length of a ruler joining the two galaxies if expansion were “paused” today.\n- **Distance at emission** $D_M/(1+z)$: when the light left, the galaxy was much closer.\n- **Luminosity distance** $D_L = (1+z)D_M$: the distance inferred from the brightness of a standard candle (F8).\n\nFor the microwave background the light has flown about 13.8 Gyr, but the region that emitted it is now about 45.3 billion light-years away; the particle horizon (the limit of the observable Universe) is about 46.2 billion light-years.',
      },
    },
    {
      title: { vi: '3. Bức tường ánh sáng đầu tiên', en: '3. The wall of first light' },
      body: {
        vi: 'Trước khi vũ trụ khoảng 370 nghìn năm tuổi ($z_* \\approx 1090$), vật chất là plasma nóng và photon liên tục tán xạ trên electron tự do. Khi electron và proton kết hợp thành nguyên tử hiđrô, photon bay tự do: đó là **nền vi sóng vũ trụ**, nay đã nguội còn $T_0 = 2{,}7255$ K vì\n\n$$T(z) = T_0\\,(1+z).$$\n\nGiữa nền vi sóng và những thiên hà đầu tiên là “thời kỳ tối”. Bức xạ từ các thiên hà đầu tiên dần ion hoá lại khí liên thiên hà; theo Planck, điểm giữa của quá trình tái ion hoá ở $z \\approx 7{,}7$.',
        en: 'Before the Universe was about 370,000 years old ($z_* \\approx 1090$) matter was a hot plasma and photons scattered continually off free electrons. When electrons and protons combined into hydrogen atoms, the photons flew free: that is the **cosmic microwave background**, now cooled to $T_0 = 2.7255$ K because\n\n$$T(z) = T_0\\,(1+z).$$\n\nBetween the microwave background and the first galaxies lie the “dark ages”. Radiation from the first galaxies gradually reionised the intergalactic gas; according to Planck the midpoint of reionisation is at $z \\approx 7.7$.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Chuẩn tinh đầu tiên', en: 'Experiment 1 - The first quasar' }, text: { vi: 'Chọn 3C 273. Ánh sáng đã bay bao lâu? Khi đó Trái Đất (khoảng 4,54 tỉ năm tuổi) đã hình thành chưa?', en: 'Choose 3C 273. How long has the light travelled? Had Earth (about 4.54 billion years old) formed then?' }, params: { lz: -0.80134 } },
    { title: { vi: 'Thử nghiệm 2 - So sánh các khoảng cách', en: 'Experiment 2 - Comparing the distances' }, text: { vi: 'Chọn GN-z11. Lập bảng bốn khoảng cách. Vì sao khoảng cách hiện nay lớn hơn quãng đường ánh sáng đã đi, còn khoảng cách lúc phát lại nhỏ hơn nhiều?', en: 'Choose GN-z11. Tabulate the four distances. Why is the distance today larger than the light-travel distance, while the distance at emission is much smaller?' }, params: { lz: 1.02543 } },
    { title: { vi: 'Thử nghiệm 3 - Đúng tỉ lệ', en: 'Experiment 3 - To scale' }, text: { vi: 'Chuyển sang thang tuyến tính. Toàn bộ vũ trụ gần ($z < 0{,}1$) chiếm phần nhỏ thế nào của hình quạt? Nền vi sóng nằm ở đâu?', en: 'Switch to the linear scale. How small a part of the fan is the whole nearby Universe ($z < 0.1$)? Where is the microwave background?' }, params: { sc: 'lin' } },
    { title: { vi: 'Thử nghiệm 4 - Thiên hà nhỏ nhất trên bầu trời', en: 'Experiment 4 - The smallest-looking galaxy' }, text: { vi: 'Kéo $z$ từ 0,5 tới 5 và theo dõi kích thước góc của một thiên hà 30 kpc. Ở $z$ nào nó trông nhỏ nhất? Giải thích bằng $D_A = D_M/(1+z)$.', en: 'Drag $z$ from 0.5 to 5 and follow the angular size of a 30 kpc galaxy. At what $z$ does it look smallest? Explain with $D_A = D_M/(1+z)$.' }, params: { lz: -0.301 } },
  ],
  quiz: [
    { q: { vi: 'Ánh sáng nền vi sóng đã bay khoảng 13,8 tỉ năm. Vùng phát ra nó hiện cách ta khoảng:', en: 'Microwave-background light has flown about 13.8 Gyr. The emitting region is now about:' }, options: [{ vi: '45 tỉ năm ánh sáng', en: '45 billion light-years away' }, { vi: '13,8 tỉ năm ánh sáng', en: '13.8 billion light-years away' }, { vi: '380 nghìn năm ánh sáng', en: '380 thousand light-years away' }], answer: 0, explain: { vi: 'Không gian đã giãn nở trong lúc ánh sáng bay.', en: 'Space expanded while the light was in flight.' } },
    { q: { vi: 'Ở $z = 3$, hệ số tỉ lệ của vũ trụ so với hôm nay là:', en: 'At $z = 3$ the scale factor relative to today was:' }, options: [{ vi: '1/4', en: '1/4' }, { vi: '1/3', en: '1/3' }, { vi: '3', en: '3' }], answer: 0, explain: { vi: '$a = 1/(1+z) = 1/4$.', en: '$a = 1/(1+z) = 1/4$.' } },
    { q: { vi: 'Nhiệt độ nền vi sóng tại $z = 1089$ xấp xỉ:', en: 'The microwave-background temperature at $z = 1089$ was about:' }, options: [{ vi: '3 000 K', en: '3,000 K' }, { vi: '2,7 K', en: '2.7 K' }, { vi: '300 K', en: '300 K' }], answer: 0, explain: { vi: '$T = 2{,}7255 \\times 1090 \\approx 2\\,970$ K, đủ thấp để hiđrô trung hoà.', en: '$T = 2.7255 \\times 1090 \\approx 2,970$ K, cool enough for hydrogen to be neutral.' } },
  ],
  instructor: {
    vi: 'Nguồn gốc: phát triển từ mô phỏng “Light from the Distant Past” của lss-lab (github.com/MinhMPA/lss-lab). Bản này tính mọi khoảng cách và thời gian từ phương trình Friedmann (vật chất, bức xạ, Λ; tham số Planck 2018) thay vì hoạt cảnh dựng sẵn. Tài nguyên: Hogg (1999) arXiv:astro-ph/9905116; Ryden (2017) Introduction to Cosmology, ch. 5.',
    en: 'Origin: developed from lss-lab’s “Light from the Distant Past” (github.com/MinhMPA/lss-lab). This version computes all distances and times from the Friedmann equation (matter, radiation, Λ; Planck 2018 parameters) instead of a scripted animation. Resources: Hogg (1999) arXiv:astro-ph/9905116; Ryden (2017) Introduction to Cosmology, ch. 5.',
  },
};

/** Model Card · F4. Figures reproduced by packages/sim-core/test/lookback-f4.test.ts. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Thời gian nhìn lại và các khoảng cách', en: 'Level A - Look-back times and distances' },
      body: { vi: 'Phương trình Friedmann với tham số Planck 2018 ($H_0 = 67{,}66$ km/s/Mpc, $\\Omega_m = 0{,}3111$, bức xạ gồm 3,046 loài neutrino không khối lượng), tích phân Simpson thích nghi như D8.', en: 'Friedmann equation with Planck 2018 parameters ($H_0 = 67.66$ km/s/Mpc, $\\Omega_m = 0.3111$, radiation with 3.046 massless neutrino species), adaptive Simpson integration as in D8.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Quạt khảo sát', en: 'Level C - Survey fan' },
      body: { vi: 'Thiên hà gần (dưới khoảng 3,2 Gpc) lấy từ lát mạng lưới Zel’dovich thật của F5 (64³, 200 Mpc/h, phổ Eisenstein & Hu), lặp tuần hoàn và thưa dần theo $1/r^2$; xa hơn là điểm ngẫu nhiên tới $z \\approx 15$. Vòng nền vi sóng là hoa văn ngẫu nhiên, không phải bản đồ Planck. Vị trí các mốc theo khoảng cách tính được, góc chỉ để dễ đọc.', en: 'Nearby galaxies (below about 3.2 Gpc) come from F5’s real Zel’dovich web slab (64³, 200 Mpc/h, Eisenstein & Hu spectrum), tiled periodically and thinned as $1/r^2$; beyond are random points to $z \\approx 15$. The microwave-background ring is a random pattern, not the Planck map. Landmarks sit at their computed distances; angles are for legibility only.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Thời gian và khoảng cách', en: '1. Times and distances' },
      tex: ["t_{\\rm lb}(z)=\\int_0^z\\frac{dz'}{(1+z')H(z')},\\qquad D_C=c\\int_0^z\\frac{dz'}{H(z')}", 'D_L=(1+z)D_M,\\qquad D_A=\\frac{D_M}{1+z},\\qquad T(z)=T_0(1+z)'],
      body: {
        vi: 'Trong đó $H(z) = H_0\\sqrt{\\Omega_r(1+z)^4 + \\Omega_m(1+z)^3 + \\Omega_\\Lambda}$ (vũ trụ phẳng); $D_M = D_C$; $T_0 = 2{,}7255$ K (Fixsen 2009). Quãng đường ánh sáng là $c\\,t_{\\rm lb}$; khoảng cách lúc phát là $D_M/(1+z)$. Kích thước góc của một thiên hà đường kính $\\ell$ là $\\ell/D_A$.',
        en: '$H(z) = H_0\\sqrt{\\Omega_r(1+z)^4 + \\Omega_m(1+z)^3 + \\Omega_\\Lambda}$ (flat universe); $D_M = D_C$; $T_0 = 2.7255$ K (Fixsen 2009). The light-travel distance is $c\\,t_{\\rm lb}$; the distance at emission is $D_M/(1+z)$. The angular size of a galaxy of diameter $\\ell$ is $\\ell/D_A$.',
      },
    },
    {
      title: { vi: '2. Các mốc dịch chuyển đỏ', en: '2. Redshift landmarks' },
      tex: ['z_*=1089.92,\\qquad 100\\,\\theta_*=\\frac{100\\,r_*}{D_M(z_*)}=1.04110\\ (\\text{Planck 2018})'],
      body: {
        vi: 'Đám Coma $z = 0{,}0231$; chuẩn tinh 3C 273 $z = 0{,}158$ (Schmidt 1963); chuẩn tinh ULAS J1342+0928 $z = 7{,}5413$ (Bañados et al. 2018); điểm giữa tái ion hoá $z = 7{,}67$ (Planck 2018); GN-z11 $z = 10{,}603$ (Bunker et al. 2023); JADES-GS-z14-0 $z = 14{,}1796$ (vạch [O III] 88 μm đo bằng ALMA, Carniani et al. 2025; phát hiện: Carniani et al. 2024); mặt tán xạ cuối $z_* = 1089{,}92$ với chân trời âm $r_* = 144{,}43$ Mpc (Planck 2018).',
        en: 'Coma Cluster $z = 0.0231$; quasar 3C 273 $z = 0.158$ (Schmidt 1963); quasar ULAS J1342+0928 $z = 7.5413$ (Bañados et al. 2018); reionisation midpoint $z = 7.67$ (Planck 2018); GN-z11 $z = 10.603$ (Bunker et al. 2023); JADES-GS-z14-0 $z = 14.1796$ (ALMA [O III] 88 μm line, Carniani et al. 2025; discovery: Carniani et al. 2024); last-scattering surface $z_* = 1089.92$ with sound horizon $r_* = 144.43$ Mpc (Planck 2018).',
      },
    },
  ],
  assumptions: {
    vi: ['Vũ trụ phẳng ΛCDM với tham số Planck 2018; neutrino coi như không khối lượng.', 'Bỏ qua chuyển động riêng (ví dụ Andromeda đang tiến lại gần ta, có dịch chuyển xanh).'],
    en: ['Flat ΛCDM with Planck 2018 parameters; neutrinos treated as massless.', 'Peculiar velocities ignored (e.g. Andromeda approaches us and is blueshifted).'],
  },
  validity: { vi: ['$0{,}001 \\le z \\le 1100$.'], en: ['$0.001 \\le z \\le 1100$.'] },
  scope: { vi: 'Các tích phân có sai số tương đối dưới $10^{-9}$; giới hạn chính là mô hình vũ trụ ΛCDM đã chọn.', en: 'Integrals have relative errors below $10^{-9}$; the main limitation is the chosen ΛCDM model.' },
  validationText: {
    vi: `Ngưỡng khoá trong \`packages/sim-core/test/lookback-f4.test.ts\`.

- Tuổi vũ trụ **13,786 tỉ năm** (Planck công bố 13,787).
- Góc âm học $100\\theta_* = 100\\,r_*/D_M(z_*)$ khớp giá trị Planck 1,04110 trong 0,2%; tuổi tại mặt tán xạ cuối khoảng 372 nghìn năm.
- $D_A$ đạt cực đại tại $z \\approx 1{,}6$; thời gian nhìn lại tăng đơn điệu theo $z$.
- Các mốc (Planck 2018): Coma - nhìn lại 0,328 tỉ năm, khoảng cách hiện nay 0,332 tỉ năm ánh sáng; 3C 273 - 2,042 / 2,197; GN-z11 - 13,351 / 31,84; JADES-GS-z14-0 - 13,500 / 33,81; nền vi sóng - 13,786 / 45,27. Chân trời hạt 46,19 tỉ năm ánh sáng.`,
    en: `Thresholds locked in \`packages/sim-core/test/lookback-f4.test.ts\`.

- Age **13.786 Gyr** (Planck quotes 13.787).
- Acoustic angle $100\\theta_* = 100\\,r_*/D_M(z_*)$ matches Planck’s 1.04110 within 0.2%; age at last scattering about 372 thousand years.
- $D_A$ peaks at $z \\approx 1.6$; the look-back time increases monotonically with $z$.
- Landmarks (Planck 2018): Coma - look-back 0.328 Gyr, distance today 0.332 billion ly; 3C 273 - 2.042 / 2.197; GN-z11 - 13.351 / 31.84; JADES-GS-z14-0 - 13.500 / 33.81; microwave background - 13.786 / 45.27. Particle horizon 46.19 billion ly.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Phân bố thiên hà trong quạt chỉ minh hoạ; mật độ thiên hà quan sát được phụ thuộc giới hạn độ sáng của khảo sát thật.', 'Không mô phỏng tiến hoá thiên hà hay sự kiện tái ion hoá.'],
    en: ['The galaxy distribution in the fan is illustrative; the observed density depends on a real survey’s flux limit.', 'Galaxy evolution and reionisation are not simulated.'],
  },
  references: [
    'Planck Collaboration (2020). Planck 2018 results. VI. Cosmological parameters. A&A 641, A6.',
    'Hogg, D. W. (1999). Distance measures in cosmology. arXiv:astro-ph/9905116.',
    'Fixsen, D. J. (2009). The temperature of the cosmic microwave background. ApJ 707, 916.',
    'Schmidt, M. (1963). 3C 273: a star-like object with large red-shift. Nature 197, 1040.',
    'Bañados, E. et al. (2018). An 800-million-solar-mass black hole in a significantly neutral Universe at a redshift of 7.5. Nature 553, 473.',
    'Bunker, A. J. et al. (2023). JADES NIRSpec spectroscopy of GN-z11. A&A 677, A88.',
    'Carniani, S. et al. (2024). Spectroscopic confirmation of two luminous galaxies at a redshift of 14. Nature 633, 318.',
    'Carniani, S. et al. (2025). The eventful life of a luminous galaxy at z = 14: metal enrichment, feedback, and low gas fraction? A&A 696, A87.',
    'lss-lab - Light from the Distant Past (github.com/MinhMPA/lss-lab).',
  ],
};
