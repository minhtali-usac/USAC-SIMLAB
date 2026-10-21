import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Mô tả sóng điện từ phẳng: điện trường $\\mathbf E$ và từ trường $\\mathbf B$ dao động cùng pha, vuông góc với nhau và với hướng truyền.',
      'Suy ra tốc độ ánh sáng $c = 1/\\sqrt{\\mu_0\\varepsilon_0}$ từ các phương trình Maxwell và dùng $c = \\lambda f$, $E_\\gamma = hf$ trên toàn phổ điện từ.',
      'Phân biệt phân cực thẳng, tròn và elip bằng vectơ Jones.',
      'Liên hệ biên độ trường với cường độ $I = \\tfrac12 c\\varepsilon_0 E_0^2$ và ước lượng trường điện từ của ánh sáng Mặt Trời.',
    ],
    en: [
      'Describe a plane electromagnetic wave: $\\mathbf E$ and $\\mathbf B$ oscillate in phase, perpendicular to each other and to the direction of travel.',
      'Derive $c = 1/\\sqrt{\\mu_0\\varepsilon_0}$ from Maxwell’s equations and use $c = \\lambda f$, $E_\\gamma = hf$ across the spectrum.',
      'Distinguish linear, circular and elliptical polarisation with Jones vectors.',
      'Relate field amplitude to intensity $I = \\tfrac12 c\\varepsilon_0 E_0^2$ and estimate the fields of sunlight.',
    ],
  },
  durationMin: 35,
  prerequisites: { vi: 'Khái niệm sóng (bước sóng, tần số, pha); vectơ; điện trường và từ trường cơ bản.', en: 'Basic waves (wavelength, frequency, phase); vectors; electric and magnetic fields.' },
  background: [
    {
      title: { vi: 'Ánh sáng là sóng điện từ', en: 'Light is an electromagnetic wave' },
      body: {
        vi: 'Maxwell (1865) thống nhất điện học và từ học và nhận ra rằng các phương trình của ông cho phép một nhiễu loạn điện từ **tự lan truyền** trong chân không với tốc độ đúng bằng tốc độ ánh sáng đã đo. Hertz (1888) tạo ra và thu được sóng vô tuyến, xác nhận dự đoán này. Mô-đun F1 dựng một sóng phẳng đơn sắc trong không gian 3 chiều và cho phép đi dọc toàn bộ phổ điện từ, từ sóng vô tuyến tới tia gamma.',
        en: 'Maxwell (1865) unified electricity and magnetism and realised that his equations allow an electromagnetic disturbance to **propagate by itself** through vacuum at exactly the measured speed of light. Hertz (1888) generated and detected radio waves, confirming the prediction. Module F1 builds a monochromatic plane wave in 3D and lets you travel along the whole spectrum, from radio waves to gamma rays.',
      },
    },
    {
      title: { vi: '1. Sóng phẳng trong chân không', en: '1. Plane waves in vacuum' },
      body: {
        vi: 'Trong chân không không có điện tích và dòng điện, phương trình Maxwell dẫn tới phương trình sóng cho mỗi thành phần của $\\mathbf E$ và $\\mathbf B$ với tốc độ\n\n$$c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}} = 299\\,792\\,458\\ \\text{m/s}.$$\n\nNghiệm sóng phẳng truyền theo trục $z$ là\n\n$$\\mathbf E = E_0\\cos(kz - \\omega t)\\,\\hat{\\mathbf x},\\qquad \\mathbf B = \\frac1c\\,\\hat{\\mathbf z}\\times\\mathbf E,\\qquad k = \\frac{2\\pi}{\\lambda},\\ \\ \\omega = 2\\pi f.$$\n\n$\\mathbf E$ và $\\mathbf B$ **cùng pha**, vuông góc nhau và vuông góc với hướng truyền (sóng ngang), và $|\\mathbf B| = |\\mathbf E|/c$ rất nhỏ - vì thế hình vẽ phóng đại $\\mathbf B$ lên $c$ lần.',
        en: 'In vacuum, with no charges or currents, Maxwell’s equations give a wave equation for each component of $\\mathbf E$ and $\\mathbf B$ with speed\n\n$$c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}} = 299\\,792\\,458\\ \\text{m/s}.$$\n\nThe plane-wave solution travelling along $z$ is\n\n$$\\mathbf E = E_0\\cos(kz - \\omega t)\\,\\hat{\\mathbf x},\\qquad \\mathbf B = \\frac1c\\,\\hat{\\mathbf z}\\times\\mathbf E,\\qquad k = \\frac{2\\pi}{\\lambda},\\ \\ \\omega = 2\\pi f.$$\n\n$\\mathbf E$ and $\\mathbf B$ are **in phase**, perpendicular to each other and to the direction of travel (a transverse wave), and $|\\mathbf B| = |\\mathbf E|/c$ is tiny - so the picture scales $\\mathbf B$ up by $c$.',
      },
    },
    {
      title: { vi: '2. Phổ điện từ', en: '2. The electromagnetic spectrum' },
      body: {
        vi: 'Mọi sóng điện từ trong chân không đi với cùng tốc độ $c$; chúng chỉ khác nhau ở bước sóng:\n\n$$c = \\lambda f,\\qquad E_\\gamma = hf = \\frac{hc}{\\lambda},\\qquad hc \\approx 1239{,}84\\ \\text{eV·nm}.$$\n\n- Sóng FM 100 MHz dài khoảng 3 m; mỗi photon chỉ mang khoảng $4\\times10^{-7}$ eV.\n- Vạch 21 cm của hiđrô trung hoà (1 420,405751768 MHz) là công cụ chính để vẽ bản đồ Ngân Hà.\n- Ánh sáng xanh lục 532 nm có photon 2,33 eV; vùng nhìn thấy trải khoảng 380–750 nm.\n- Photon gamma 511 keV sinh ra khi electron và positron huỷ nhau, có bước sóng bằng bước sóng Compton $h/(m_e c) = 2{,}43$ pm.\n\nRanh giới giữa các vùng phổ chỉ là **quy ước** và khác nhau giữa các nguồn tài liệu.',
        en: 'All electromagnetic waves in vacuum travel at the same speed $c$; they differ only in wavelength:\n\n$$c = \\lambda f,\\qquad E_\\gamma = hf = \\frac{hc}{\\lambda},\\qquad hc \\approx 1239.84\\ \\text{eV·nm}.$$\n\n- A 100 MHz FM wave is about 3 m long; each photon carries only about $4\\times10^{-7}$ eV.\n- The 21 cm line of neutral hydrogen (1,420.405751768 MHz) is the main tool for mapping the Milky Way.\n- Green 532 nm light has 2.33 eV photons; the visible band spans roughly 380–750 nm.\n- A 511 keV gamma photon, produced when an electron and a positron annihilate, has a wavelength equal to the Compton wavelength $h/(m_e c) = 2.43$ pm.\n\nThe boundaries between bands are **conventions** and differ between sources.',
      },
    },
    {
      title: { vi: '3. Phân cực', en: '3. Polarisation' },
      body: {
        vi: 'Tổng quát, điện trường có hai thành phần vuông góc với hướng truyền:\n\n$$E_x = E_{0x}\\cos\\phi,\\qquad E_y = E_{0y}\\cos(\\phi + \\delta),\\qquad \\phi = kz - \\omega t.$$\n\nCặp $(E_{0x}, E_{0y}, \\delta)$ là **vectơ Jones**. Khi $\\delta = 0$, đầu mút của $\\mathbf E$ vạch một đoạn thẳng (**phân cực thẳng**, góc $\\psi = \\arctan(E_{0y}/E_{0x})$). Khi $E_{0x} = E_{0y}$ và $\\delta = \\pm 90°$, nó vạch một đường tròn (**phân cực tròn**) với $|\\mathbf E|$ không đổi. Các trường hợp còn lại là **phân cực elip**. Kính râm phân cực, màn hình LCD và kính xem phim 3D đều dựa trên tính chất này.',
        en: 'In general the electric field has two components perpendicular to the direction of travel:\n\n$$E_x = E_{0x}\\cos\\phi,\\qquad E_y = E_{0y}\\cos(\\phi + \\delta),\\qquad \\phi = kz - \\omega t.$$\n\nThe triple $(E_{0x}, E_{0y}, \\delta)$ is the **Jones vector**. For $\\delta = 0$ the tip of $\\mathbf E$ traces a line (**linear polarisation**, angle $\\psi = \\arctan(E_{0y}/E_{0x})$). For $E_{0x} = E_{0y}$ and $\\delta = \\pm 90°$ it traces a circle (**circular polarisation**) with constant $|\\mathbf E|$. All other cases are **elliptical**. Polarising sunglasses, LCD screens and 3D cinema glasses all rely on this.',
      },
    },
    {
      title: { vi: '4. Năng lượng và cường độ', en: '4. Energy and intensity' },
      body: {
        vi: 'Dòng năng lượng của sóng được mô tả bằng vectơ Poynting $\\mathbf S = \\mathbf E\\times\\mathbf B/\\mu_0$. Lấy trung bình theo thời gian, cường độ là\n\n$$I = \\langle|\\mathbf S|\\rangle = \\tfrac12\\,c\\,\\varepsilon_0\\left(E_{0x}^2 + E_{0y}^2\\right).$$\n\nÁnh sáng Mặt Trời ở khoảng cách 1 au có cường độ khoảng 1 361 W/m², tương đương biên độ $E_0 \\approx 1\\,013$ V/m và $B_0 \\approx 3{,}4\\ \\mu$T của một sóng đơn sắc cùng cường độ - nhỏ hơn từ trường Trái Đất (khoảng 25–65 µT).',
        en: 'The energy flow is described by the Poynting vector $\\mathbf S = \\mathbf E\\times\\mathbf B/\\mu_0$. Time-averaged, the intensity is\n\n$$I = \\langle|\\mathbf S|\\rangle = \\tfrac12\\,c\\,\\varepsilon_0\\left(E_{0x}^2 + E_{0y}^2\\right).$$\n\nSunlight at 1 au has an intensity of about 1,361 W/m², equivalent to the amplitudes $E_0 \\approx 1,013$ V/m and $B_0 \\approx 3.4\\ \\mu$T of a monochromatic wave of the same intensity - smaller than Earth’s magnetic field (about 25–65 µT).',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Đi dọc phổ điện từ', en: 'Experiment 1 - Walking the spectrum' }, text: { vi: 'Kéo bước sóng từ 1 km xuống 1 pm. Năng lượng photon tăng bao nhiêu bậc độ lớn? So sánh tần số Wi-Fi 2,45 GHz với tần số của ánh sáng xanh lục.', en: 'Drag the wavelength from 1 km down to 1 pm. By how many orders of magnitude does the photon energy grow? Compare the 2.45 GHz Wi-Fi frequency with that of green light.' }, params: { ll: 3 } },
    { title: { vi: 'Thử nghiệm 2 - Phân cực tròn', en: 'Experiment 2 - Circular polarisation' }, text: { vi: 'Chọn “Tròn trái” và xoay hình để nhìn dọc trục truyền. Đầu mút của $\\mathbf E$ vạch hình gì? Độ lớn $|\\mathbf E|$ có thay đổi theo thời gian không?', en: 'Choose “Left circular” and rotate the view to look along the axis. What does the tip of $\\mathbf E$ trace? Does $|\\mathbf E|$ change with time?' }, params: { pol: 'circularL' } },
    { title: { vi: 'Thử nghiệm 3 - Từ trường của nắng', en: 'Experiment 3 - The magnetic field of sunlight' }, text: { vi: 'Bấm “Nắng trưa”. Đọc $E_0$, $B_0$ và cường độ. So $B_0$ với từ trường Trái Đất. Vì sao ta không cảm nhận được từ trường của ánh sáng?', en: 'Press “Sunlight”. Read $E_0$, $B_0$ and the intensity. Compare $B_0$ with Earth’s field. Why can’t we feel the magnetic field of light?' }, params: { le: 3.0054 } },
    { title: { vi: 'Thử nghiệm 4 - Góc phân cực', en: 'Experiment 4 - Polarisation angle' }, text: { vi: 'Với phân cực thẳng, đổi góc $\\psi$ từ 0° tới 90°. Mặt phẳng dao động của $\\mathbf B$ thay đổi thế nào so với $\\mathbf E$?', en: 'With linear polarisation, vary $\\psi$ from 0° to 90°. How does the plane of $\\mathbf B$ change relative to $\\mathbf E$?' }, params: { pol: 'linear', psi: 0 } },
  ],
  quiz: [
    { q: { vi: 'Trong chân không, sóng vô tuyến và tia X khác nhau ở:', en: 'In vacuum, radio waves and X-rays differ in:' }, options: [{ vi: 'Bước sóng (và tần số)', en: 'Wavelength (and frequency)' }, { vi: 'Tốc độ truyền', en: 'Speed' }, { vi: 'Bản chất (một loại không phải sóng điện từ)', en: 'Nature (one is not electromagnetic)' }], answer: 0, explain: { vi: 'Mọi sóng điện từ trong chân không đi với tốc độ $c$.', en: 'All electromagnetic waves travel at $c$ in vacuum.' } },
    { q: { vi: 'Photon 532 nm mang năng lượng khoảng:', en: 'A 532 nm photon carries about:' }, options: [{ vi: '2,33 eV', en: '2.33 eV' }, { vi: '532 eV', en: '532 eV' }, { vi: '0,02 eV', en: '0.02 eV' }], answer: 0, explain: { vi: '$E = hc/\\lambda \\approx 1239{,}84\\ \\text{eV·nm}/532\\ \\text{nm}$.', en: '$E = hc/\\lambda \\approx 1239.84\\ \\text{eV·nm}/532\\ \\text{nm}$.' } },
    { q: { vi: 'Trong sóng điện từ phẳng, $\\mathbf E$ và $\\mathbf B$:', en: 'In a plane electromagnetic wave, $\\mathbf E$ and $\\mathbf B$ are:' }, options: [{ vi: 'Cùng pha và vuông góc nhau', en: 'In phase and perpendicular' }, { vi: 'Lệch pha 90° và song song', en: '90° out of phase and parallel' }], answer: 0, explain: { vi: '$\\mathbf B = \\hat{\\mathbf z}\\times\\mathbf E/c$.', en: '$\\mathbf B = \\hat{\\mathbf z}\\times\\mathbf E/c$.' } },
    { q: { vi: 'Nhân đôi biên độ điện trường thì cường độ:', en: 'Doubling the electric amplitude makes the intensity:' }, options: [{ vi: 'Tăng 4 lần', en: '4× larger' }, { vi: 'Tăng 2 lần', en: '2× larger' }], answer: 0, explain: { vi: '$I \\propto E_0^2$.', en: '$I \\propto E_0^2$.' } },
  ],
  instructor: {
    vi: 'Nguồn gốc: phát triển từ mô phỏng “EM field and wave” của lss-lab (github.com/MinhMPA/lss-lab); bản này dựng 3D, có vectơ Jones, toàn phổ và các nguồn thật. Tài nguyên: Griffiths, Introduction to Electrodynamics, ch. 9; Hecht, Optics, ch. 8 (phân cực). Lưu ý quy ước: “tròn trái/phải” theo quy ước quang học, nhìn từ phía người nhận về phía nguồn; quy ước IEEE ngược lại.',
    en: 'Origin: developed from lss-lab’s “EM field and wave” (github.com/MinhMPA/lss-lab); this version is 3D, with Jones vectors, the full spectrum and real sources. Resources: Griffiths, Introduction to Electrodynamics, ch. 9; Hecht, Optics, ch. 8 (polarisation). Convention: “left/right circular” follows the optics convention, viewed by the receiver looking towards the source; the IEEE convention is the opposite.',
  },
};

/** Model Card · F1. Figures reproduced by packages/sim-core/test/em-f1.test.ts. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Sóng phẳng đơn sắc trong chân không', en: 'Level A - Monochromatic plane wave in vacuum' },
      body: { vi: 'Trường $\\mathbf E$, $\\mathbf B$ theo vectơ Jones, tần số, chu kỳ, năng lượng photon, cường độ và biên độ từ trường là nghiệm giải tích chính xác của phương trình Maxwell trong chân không.', en: 'The fields $\\mathbf E$, $\\mathbf B$ from the Jones vector, frequency, period, photon energy, intensity and magnetic amplitude are the exact analytic plane-wave solution of Maxwell’s equations in vacuum.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Cách hiển thị', en: 'Level C - Display' },
      body: { vi: 'Luôn vẽ ba bước sóng và quay chậm (hệ số làm chậm được hiển thị); $\\mathbf B$ được nhân $c$ để cùng thang với $\\mathbf E$; màu ánh sáng nhìn thấy theo xấp xỉ của Bruton; ranh giới vùng phổ là quy ước gần đúng.', en: 'Three wavelengths are always drawn, in slow motion (the slow-down factor is shown); $\\mathbf B$ is multiplied by $c$ to share the scale of $\\mathbf E$; visible colours follow Bruton’s approximation; band edges are approximate conventions.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Trường của sóng phẳng', en: '1. Plane-wave fields' },
      tex: ['\\mathbf E=\\left(E_{0x}\\cos\\phi,\\ E_{0y}\\cos(\\phi+\\delta),\\ 0\\right),\\qquad \\phi=kz-\\omega t', '\\mathbf B=\\frac1c\\,\\hat{\\mathbf z}\\times\\mathbf E=\\frac1c\\left(-E_y,\\ E_x,\\ 0\\right)'],
      body: {
        vi: 'Trong đó $(E_{0x}, E_{0y}, \\delta)$ là vectơ Jones: thẳng $(E_0\\cos\\psi, E_0\\sin\\psi, 0)$; tròn $(E_0/\\sqrt2, E_0/\\sqrt2, \\pm\\pi/2)$; elip $(E_0/\\sqrt{1+r^2}, rE_0/\\sqrt{1+r^2}, \\pi/2)$ với $r$ là tỉ số trục. $k = 2\\pi/\\lambda$ là số sóng, $\\omega = 2\\pi f$ là tần số góc.',
        en: '$(E_{0x}, E_{0y}, \\delta)$ is the Jones vector: linear $(E_0\\cos\\psi, E_0\\sin\\psi, 0)$; circular $(E_0/\\sqrt2, E_0/\\sqrt2, \\pm\\pi/2)$; elliptical $(E_0/\\sqrt{1+r^2}, rE_0/\\sqrt{1+r^2}, \\pi/2)$ with axis ratio $r$. $k = 2\\pi/\\lambda$ is the wavenumber, $\\omega = 2\\pi f$ the angular frequency.',
      },
    },
    {
      title: { vi: '2. Hằng số, photon và cường độ', en: '2. Constants, photons and intensity' },
      tex: ['c=\\lambda f=\\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}},\\qquad \\varepsilon_0=\\frac{1}{\\mu_0c^2}', 'E_\\gamma=hf,\\qquad I=\\tfrac12\\,c\\,\\varepsilon_0\\left(E_{0x}^2+E_{0y}^2\\right),\\qquad B_0=\\frac{E_0}{c}'],
      body: {
        vi: '$c$, $h$ và điện tích nguyên tố $e$ là các hằng số chính xác của SI (2019); $\\mu_0 = 1{,}25663706212\\times10^{-6}$ N/A² theo CODATA 2018. Năng lượng photon hiển thị bằng eV ($E_\\gamma/e$).',
        en: '$c$, $h$ and the elementary charge $e$ are exact SI (2019) constants; $\\mu_0 = 1.25663706212\\times10^{-6}$ N/A² from CODATA 2018. Photon energies are shown in eV ($E_\\gamma/e$).',
      },
    },
  ],
  assumptions: {
    vi: ['Sóng phẳng, đơn sắc, trong chân không, không có nguồn; biên độ không đổi.', 'Ánh sáng Mặt Trời được biểu diễn bằng một sóng đơn sắc có cùng cường độ (ánh sáng thật có phổ rộng và không kết hợp).'],
    en: ['Plane, monochromatic wave in source-free vacuum; constant amplitude.', 'Sunlight is represented by a monochromatic wave of equal intensity (real sunlight is broadband and incoherent).'],
  },
  validity: { vi: ['$1\\ \\text{pm} \\le \\lambda \\le 1\\ \\text{km}$; $10^{-3} \\le E_0 \\le 10^7$ V/m.'], en: ['$1\\ \\text{pm} \\le \\lambda \\le 1\\ \\text{km}$; $10^{-3} \\le E_0 \\le 10^7$ V/m.'] },
  scope: { vi: 'Nghiệm giải tích; sai số chỉ do làm tròn float64.', en: 'Analytic solution; errors are float64 round-off only.' },
  validationText: {
    vi: `Ngưỡng khoá trong \`packages/sim-core/test/em-f1.test.ts\`.

- $1/\\sqrt{\\mu_0\\varepsilon_0} = c$ và $\\varepsilon_0 = 8{,}8541878128\\times10^{-12}$ F/m (CODATA 2018).
- Ở mọi pha và mọi kiểu phân cực: $\\mathbf E\\cdot\\mathbf B = 0$ tới $10^{-15}$ và $c|\\mathbf B| = |\\mathbf E|$ tới $10^{-10}$; với phân cực tròn $|\\mathbf E|$ không đổi tới $10^{-12}$; cường độ tổng không phụ thuộc kiểu phân cực.
- 1 361 W/m² ↔ $E_0 = 1\\,012{,}6$ V/m; photon 532 nm = 2,3305 eV; vạch hiđrô 1 420,405751768 MHz ↔ 21,106 cm; bước sóng Compton ↔ 511,0 keV.`,
    en: `Thresholds locked in \`packages/sim-core/test/em-f1.test.ts\`.

- $1/\\sqrt{\\mu_0\\varepsilon_0} = c$ and $\\varepsilon_0 = 8.8541878128\\times10^{-12}$ F/m (CODATA 2018).
- At every phase and polarisation: $\\mathbf E\\cdot\\mathbf B = 0$ to $10^{-15}$ and $c|\\mathbf B| = |\\mathbf E|$ to $10^{-10}$; for circular polarisation $|\\mathbf E|$ is constant to $10^{-12}$; the total intensity is independent of polarisation.
- 1,361 W/m² ↔ $E_0 = 1,012.6$ V/m; 532 nm photon = 2.3305 eV; hydrogen line 1,420.405751768 MHz ↔ 21.106 cm; Compton wavelength ↔ 511.0 keV.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có môi trường vật chất (chiết suất, hấp thụ, tán sắc) - xem F2.', 'Không có sóng cầu, nhiễu xạ, giao thoa hay bản chất lượng tử của ánh sáng ngoài hệ thức $E_\\gamma = hf$.'],
    en: ['No material media (refractive index, absorption, dispersion) - see F2.', 'No spherical waves, diffraction, interference or quantum nature of light beyond $E_\\gamma = hf$.'],
  },
  references: [
    'Maxwell, J. C. (1865). A dynamical theory of the electromagnetic field. Phil. Trans. R. Soc. 155, 459.',
    'Hertz, H. (1889). Über Strahlen elektrischer Kraft. Annalen der Physik und Chemie (Wiedemann) 36, 769–783 [= Ann. Phys. 272]; first reported to the Berlin Academy, 13 Dec 1888.',
    'Griffiths, D. J. (2017). Introduction to Electrodynamics, 4th ed. Cambridge University Press, ch. 9.',
    'Hecht, E. (2017). Optics, 5th ed. Pearson, ch. 8.',
    'Tiesinga, E. et al. (2021). CODATA recommended values of the fundamental physical constants: 2018. Rev. Mod. Phys. 93, 025010.',
    'Kopp, G. & Lean, J. L. (2011). A new, lower value of total solar irradiance. Geophys. Res. Lett. 38, L01706.',
    'lss-lab - EM field and wave (github.com/MinhMPA/lss-lab).',
  ],
};
