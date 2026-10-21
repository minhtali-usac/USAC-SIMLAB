import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Mô tả sự hình thành cấu trúc lớn như cuộc giằng co giữa hấp dẫn (khuếch đại nhiễu loạn mật độ) và giãn nở vũ trụ (kìm hãm chúng).',
      'Giải phương trình hệ số tăng trưởng tuyến tính $D(a)$ và đọc tốc độ tăng trưởng $f = d\\ln D/d\\ln a$.',
      'Giải thích vì sao năng lượng tối làm cấu trúc gần như ngừng lớn lên khi $\\Omega_m(a)$ giảm.',
      'Hiểu xấp xỉ Zel’dovich $\\mathbf x = \\mathbf q + D\\,\\boldsymbol\\Psi(\\mathbf q)$, hiện tượng giao vỏ và sự hình thành tấm, sợi, nút.',
    ],
    en: [
      'Describe structure formation as a tug of war between gravity (amplifying density perturbations) and cosmic expansion (damping them).',
      'Solve the linear growth equation for $D(a)$ and read the growth rate $f = d\\ln D/d\\ln a$.',
      'Explain why dark energy nearly halts structure growth as $\\Omega_m(a)$ falls.',
      'Understand the Zel’dovich approximation $\\mathbf x = \\mathbf q + D\\,\\boldsymbol\\Psi(\\mathbf q)$, shell crossing and the formation of sheets, filaments and nodes.',
    ],
  },
  durationMin: 40,
  prerequisites: { vi: 'D8 - Phương trình Friedmann; hệ số tỉ lệ $a$ và dịch chuyển đỏ $z = 1/a - 1$; phương trình vi phân bậc hai.', en: 'D8 - The Friedmann equation; the scale factor $a$ and redshift $z = 1/a - 1$; second-order differential equations.' },
  background: [
    {
      title: { vi: 'Từ gợn nhỏ tới mạng lưới vũ trụ', en: 'From tiny ripples to the cosmic web' },
      body: {
        vi: 'Nền vi sóng vũ trụ cho thấy vũ trụ sơ khai gần như đồng nhất: chênh lệch nhiệt độ chỉ cỡ $10^{-5}$. Ngày nay vật chất tập trung thành thiên hà, đám thiên hà và một **mạng lưới vũ trụ** gồm tấm, sợi và khoảng trống. Hấp dẫn đã khuếch đại những gợn nhỏ ban đầu, trong khi sự giãn nở kìm hãm quá trình đó. Mô-đun F5 cho ba vũ trụ có **cùng** điều kiện ban đầu và chỉ khác lịch sử giãn nở, để thấy riêng vai trò của sự giãn nở.',
        en: 'The microwave background shows that the early Universe was nearly uniform: temperature differences of only about $10^{-5}$. Today matter is gathered into galaxies, clusters and a **cosmic web** of sheets, filaments and voids. Gravity amplified the tiny initial ripples while the expansion held the process back. Module F5 gives three universes with **the same** initial conditions that differ only in their expansion history, isolating the role of expansion.',
      },
    },
    {
      title: { vi: '1. Phương trình tăng trưởng tuyến tính', en: '1. The linear growth equation' },
      body: {
        vi: 'Gọi $\\delta = \\rho/\\bar\\rho - 1$ là độ tương phản mật độ. Khi $|\\delta| \\ll 1$, mọi thang độ dài lớn hơn nhiều thang Jeans tăng trưởng theo cùng một hàm $D(a)$: $\\delta(\\mathbf x, a) = D(a)\\,\\delta_0(\\mathbf x)$, với\n\n$$D\'\' + \\left(2 + \\frac{d\\ln H}{d\\ln a}\\right) D\' = \\frac32\\,\\Omega_m(a)\\,D,\\qquad {}\' \\equiv \\frac{d}{d\\ln a}.$$\n\nVế phải là **nguồn hấp dẫn**; số hạng chứa $D\'$ là **lực cản Hubble** do giãn nở. Với vũ trụ phẳng gồm vật chất và hằng số vũ trụ,\n\n$$\\Omega_m(a) = \\frac{\\Omega_m a^{-3}}{\\Omega_m a^{-3} + \\Omega_\\Lambda},\\qquad \\frac{d\\ln H}{d\\ln a} = -\\tfrac32\\,\\Omega_m(a).$$',
        en: 'Let $\\delta = \\rho/\\bar\\rho - 1$ be the density contrast. While $|\\delta| \\ll 1$, every scale much larger than the Jeans scale grows by the same function $D(a)$: $\\delta(\\mathbf x, a) = D(a)\\,\\delta_0(\\mathbf x)$, with\n\n$$D\'\' + \\left(2 + \\frac{d\\ln H}{d\\ln a}\\right) D\' = \\frac32\\,\\Omega_m(a)\\,D,\\qquad {}\' \\equiv \\frac{d}{d\\ln a}.$$\n\nThe right-hand side is the **gravity source**; the $D\'$ term is the **Hubble drag** from the expansion. For a flat universe of matter and a cosmological constant,\n\n$$\\Omega_m(a) = \\frac{\\Omega_m a^{-3}}{\\Omega_m a^{-3} + \\Omega_\\Lambda},\\qquad \\frac{d\\ln H}{d\\ln a} = -\\tfrac32\\,\\Omega_m(a).$$',
      },
    },
    {
      title: { vi: '2. Ba vũ trụ, một điều kiện ban đầu', en: '2. Three universes, one initial condition' },
      body: {
        vi: '- **Einstein–de Sitter** ($\\Omega_m = 1$): $\\Omega_m(a) = 1$ mãi mãi, nghiệm tăng là $D = a$ chính xác và cấu trúc lớn không ngừng.\n- **ΛCDM, $\\Omega_m = 0{,}315$** (Planck): giống EdS lúc đầu; khi hằng số vũ trụ chiếm ưu thế, $\\Omega_m(a)$ giảm, tốc độ tăng trưởng $f$ giảm và $D$ gần như đóng băng. Từ $z \\approx 0{,}41$, số hạng lực cản vượt nguồn hấp dẫn.\n- **ΛCDM, $\\Omega_m = 0{,}1$**: hằng số vũ trụ chiếm ưu thế sớm hơn nên cấu trúc ngừng lớn sớm hơn.\n\nTốc độ tăng trưởng được xấp xỉ tốt bởi $f \\approx \\Omega_m(a)^{0{,}55}$ (Linder 2005) trong quá khứ và hiện tại. Đây là đại lượng mà các khảo sát thiên hà đo được qua méo dịch chuyển đỏ (F6).',
        en: '- **Einstein–de Sitter** ($\\Omega_m = 1$): $\\Omega_m(a) = 1$ forever, the growing solution is exactly $D = a$ and structure grows without end.\n- **ΛCDM, $\\Omega_m = 0.315$** (Planck): like EdS at first; once the cosmological constant dominates, $\\Omega_m(a)$ falls, the growth rate $f$ drops and $D$ nearly freezes. From $z \\approx 0.41$ the drag term exceeds the gravity source.\n- **ΛCDM, $\\Omega_m = 0.1$**: the cosmological constant takes over earlier, so growth stops earlier.\n\nThe growth rate is well approximated by $f \\approx \\Omega_m(a)^{0.55}$ (Linder 2005) in the past and present. It is the quantity galaxy surveys measure through redshift-space distortions (F6).',
      },
    },
    {
      title: { vi: '3. Xấp xỉ Zel’dovich', en: '3. The Zel’dovich approximation' },
      body: {
        vi: 'Thay vì theo dõi mật độ, ta di chuyển từng phần tử vật chất từ vị trí Lagrange ban đầu $\\mathbf q$ theo đường thẳng (Zel’dovich 1970):\n\n$$\\mathbf x(\\mathbf q, a) = \\mathbf q + D(a)\\,\\boldsymbol\\Psi(\\mathbf q),\\qquad \\nabla_{\\mathbf q}\\cdot\\boldsymbol\\Psi = -\\delta_L(\\mathbf q).$$\n\nMật độ là nghịch đảo định thức Jacobi của ánh xạ $\\mathbf q \\to \\mathbf x$:\n\n$$\\frac{\\rho}{\\bar\\rho} = \\prod_{i=1}^{3} \\frac{1}{1 + D\\lambda_i},$$\n\nvới $\\lambda_1 \\le \\lambda_2 \\le \\lambda_3$ là trị riêng của tenxơ biến dạng $\\partial\\Psi_i/\\partial q_j$. Khi $D\\lambda_1 = -1$, các phần tử vật chất gặp nhau (**giao vỏ**): co sụp theo một trục tạo **tấm**, theo hai trục tạo **sợi**, theo ba trục tạo **nút**.',
        en: 'Instead of following the density, move each element of matter from its initial Lagrangian position $\\mathbf q$ along a straight line (Zel’dovich 1970):\n\n$$\\mathbf x(\\mathbf q, a) = \\mathbf q + D(a)\\,\\boldsymbol\\Psi(\\mathbf q),\\qquad \\nabla_{\\mathbf q}\\cdot\\boldsymbol\\Psi = -\\delta_L(\\mathbf q).$$\n\nThe density is the inverse Jacobian determinant of the map $\\mathbf q \\to \\mathbf x$:\n\n$$\\frac{\\rho}{\\bar\\rho} = \\prod_{i=1}^{3} \\frac{1}{1 + D\\lambda_i},$$\n\nwith $\\lambda_1 \\le \\lambda_2 \\le \\lambda_3$ the eigenvalues of the deformation tensor $\\partial\\Psi_i/\\partial q_j$. When $D\\lambda_1 = -1$ matter elements meet (**shell crossing**): collapse along one axis makes a **sheet**, along two a **filament**, along three a **node**.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Ai đang thắng?', en: 'Experiment 1 - Who is winning?' }, text: { vi: 'Với ΛCDM, kéo $a$ từ 0,02 tới 4 và theo dõi hai số liệu “nguồn hấp dẫn” và “lực cản Hubble”. Lực cản vượt nguồn ở $z$ nào? So với thời điểm hằng số vũ trụ bắt đầu chiếm ưu thế.', en: 'With ΛCDM, drag $a$ from 0.02 to 4 and follow the “gravity source” and “Hubble drag” readouts. At what $z$ does the drag overtake the source? Compare with when the cosmological constant starts to dominate.' }, params: { m: 'lcdm', lna: -3.9 } },
    { title: { vi: 'Thử nghiệm 2 - Ba vũ trụ cùng khởi đầu', en: 'Experiment 2 - Three universes, one start' }, text: { vi: 'Ở $a = 1$, chuyển giữa EdS, $\\Omega_m = 0{,}315$ và $0{,}1$. Vũ trụ nào có mạng lưới rõ nhất? Đọc $D/D_0$ của từng vũ trụ và giải thích.', en: 'At $a = 1$, switch between EdS, $\\Omega_m = 0.315$ and $0.1$. Which universe has the sharpest web? Read $D/D_0$ for each and explain.' }, params: { m: 'eds', lna: 0 } },
    { title: { vi: 'Thử nghiệm 3 - Tấm, sợi, nút', en: 'Experiment 3 - Sheets, filaments, nodes' }, text: { vi: 'Bật “Kiểu cấu trúc” và cho thời gian chạy từ $a \\approx 0{,}2$. Thứ tự xuất hiện của tấm (xanh lá), sợi (xanh dương), nút (cam) có khớp với số trục co sụp không?', en: 'Turn on “Web type” and run time from $a \\approx 0.2$. Does the order of sheets (green), filaments (blue) and nodes (orange) match the number of collapsing axes?' }, params: { m: 'lcdm', col: 'web', lna: -1.5 } },
    { title: { vi: 'Thử nghiệm 4 - Kiểm tra $f \\approx \\Omega_m^{0{,}55}$', en: 'Experiment 4 - Checking $f \\approx \\Omega_m^{0.55}$' }, text: { vi: 'Với ΛCDM, so sánh $f$ với $\\Omega_m(a)^{0{,}55}$ tại $a$ = 0,5; 1; 2. Xấp xỉ Linder tốt nhất ở đâu, kém nhất ở đâu?', en: 'With ΛCDM, compare $f$ with $\\Omega_m(a)^{0.55}$ at $a$ = 0.5, 1, 2. Where is Linder’s approximation best and where is it worst?' }, params: { m: 'lcdm', lna: 0.6931 } },
  ],
  quiz: [
    { q: { vi: 'Trong vũ trụ Einstein–de Sitter, hệ số tăng trưởng là:', en: 'In an Einstein–de Sitter universe the growth factor is:' }, options: [{ vi: '$D = a$', en: '$D = a$' }, { vi: '$D = a^2$', en: '$D = a^2$' }, { vi: '$D$ không đổi', en: '$D$ constant' }], answer: 0, explain: { vi: 'Với $\\Omega_m(a) = 1$, nghiệm tăng của phương trình là $D \\propto a$.', en: 'With $\\Omega_m(a) = 1$ the growing solution is $D \\propto a$.' } },
    { q: { vi: 'Vì sao cấu trúc gần như ngừng lớn trong tương lai của vũ trụ ΛCDM?', en: 'Why does structure nearly stop growing in the ΛCDM future?' }, options: [{ vi: '$\\Omega_m(a) \\to 0$ nên nguồn hấp dẫn nhỏ hơn lực cản Hubble', en: '$\\Omega_m(a) \\to 0$ so the gravity source falls below the Hubble drag' }, { vi: 'Vật chất bị phân rã', en: 'Matter decays' }, { vi: 'Hằng số hấp dẫn giảm', en: 'The gravitational constant decreases' }], answer: 0, explain: { vi: 'Mật độ hằng số vũ trụ không đổi còn vật chất loãng theo $a^{-3}$.', en: 'The cosmological constant has constant density while matter dilutes as $a^{-3}$.' } },
    { q: { vi: 'Một sợi (filament) ứng với số trục đã co sụp là:', en: 'A filament corresponds to how many collapsed axes?' }, options: [{ vi: 'Hai', en: 'Two' }, { vi: 'Một', en: 'One' }, { vi: 'Ba', en: 'Three' }], answer: 0, explain: { vi: 'Một trục → tấm, hai trục → sợi, ba trục → nút.', en: 'One axis → sheet, two → filament, three → node.' } },
  ],
  instructor: {
    vi: 'Nguồn gốc: phát triển từ mô phỏng “Gravity vs Expansion” của lss-lab (github.com/MinhMPA/lss-lab). Tài nguyên: Peebles (1980) The Large-Scale Structure of the Universe; Zel’dovich (1970) A&A 5, 84; Linder (2005) Phys. Rev. D 72, 043529; Eisenstein & Hu (1998) ApJ 496, 605.',
    en: 'Origin: developed from lss-lab’s “Gravity vs Expansion” (github.com/MinhMPA/lss-lab). Resources: Peebles (1980) The Large-Scale Structure of the Universe; Zel’dovich (1970) A&A 5, 84; Linder (2005) Phys. Rev. D 72, 043529; Eisenstein & Hu (1998) ApJ 496, 605.',
  },
};

/** Model Card · F5. Figures reproduced by packages/sim-core/test/lss.test.ts. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Hệ số tăng trưởng tuyến tính $D(a)$ và $f(a)$', en: 'Level A - Linear growth factor $D(a)$ and $f(a)$' },
      body: { vi: 'Nghiệm số của phương trình tăng trưởng (RK4 theo $N = \\ln a$, 4 000 bước từ $a = 10^{-3}$ với $D = a$, $D\' = D$) cho vũ trụ phẳng gồm vật chất và hằng số vũ trụ.', en: 'Numerical solution of the growth equation (RK4 in $N = \\ln a$, 4,000 steps from $a = 10^{-3}$ with $D = a$, $D\' = D$) for a flat matter + cosmological-constant universe.' },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Trường ban đầu và mạng lưới Zel’dovich', en: 'Level B - Initial field and Zel’dovich web' },
      body: { vi: 'Trường Gauss $64^3$ trong hộp tuần hoàn 200 Mpc/$h$, phổ tuyến tính Eisenstein & Hu (1998) có dao động baryon, chuẩn hoá $\\sigma_8 = 0{,}811$ cho ΛCDM Planck hôm nay. Hiển thị một lát dày 4 ô (12,5 Mpc/$h$). Sau giao vỏ, mỗi phần tử dừng ở lần giao vỏ đầu tiên ($D_{\\rm eff} = \\min(D, -1/\\lambda_1)$, kiểu “dính”); đây không phải mô phỏng N vật.', en: 'Gaussian $64^3$ field in a 200 Mpc/$h$ periodic box, Eisenstein & Hu (1998) linear spectrum with baryon wiggles, normalised to $\\sigma_8 = 0.811$ for Planck ΛCDM today. A 4-cell (12.5 Mpc/$h$) slab is shown. After shell crossing each element stops at its first crossing ($D_{\\rm eff} = \\min(D, -1/\\lambda_1)$, adhesion-like); this is not an N-body simulation.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, B là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Phương trình tăng trưởng', en: '1. Growth equation' },
      tex: ["D''+\\left(2+\\frac{d\\ln H}{d\\ln a}\\right)D'=\\tfrac32\\,\\Omega_m(a)\\,D,\\qquad \\frac{d\\ln H}{d\\ln a}=-\\tfrac32\\Omega_m(a)", "f\\equiv\\frac{d\\ln D}{d\\ln a},\\qquad \\Omega_m(a)=\\frac{\\Omega_m a^{-3}}{\\Omega_m a^{-3}+1-\\Omega_m}"],
      body: {
        vi: 'Trong đó dấu phẩy là đạo hàm theo $\\ln a$; $\\Omega_m$ là tham số mật độ vật chất hôm nay. Bức xạ bị bỏ qua. Số liệu “nguồn hấp dẫn” là $\\tfrac32\\Omega_m(a)$ và “lực cản Hubble” là $(2 - \\tfrac32\\Omega_m(a))\\,f$ - hai số hạng của phương trình chia cho $D$. $D/D_0$ chuẩn theo $D(a = 1)$ của ΛCDM Planck.',
        en: 'Primes denote derivatives with respect to $\\ln a$; $\\Omega_m$ is today’s matter density parameter. Radiation is neglected. The “gravity source” readout is $\\tfrac32\\Omega_m(a)$ and the “Hubble drag” is $(2 - \\tfrac32\\Omega_m(a))\\,f$ - the two terms of the equation divided by $D$. $D/D_0$ is normalised to $D(a = 1)$ of Planck ΛCDM.',
      },
    },
    {
      title: { vi: '2. Phổ ban đầu và dịch chuyển Zel’dovich', en: '2. Initial spectrum and Zel’dovich displacement' },
      tex: ['P(k)=A\\,k^{n_s}\\,T^2(k),\\qquad \\sigma_8^2=\\int\\frac{dk}{k}\\,\\frac{k^3P(k)}{2\\pi^2}\\,W^2(8k)', '\\boldsymbol\\Psi(\\mathbf k)=\\frac{i\\mathbf k}{k^2}\\,\\delta_L(\\mathbf k),\\qquad \\frac{\\rho}{\\bar\\rho}=\\prod_i\\left(1+D\\lambda_i\\right)^{-1}'],
      body: {
        vi: 'Trong đó $T(k)$ là hàm truyền Eisenstein & Hu (1998) có dao động baryon ($\\Omega_b = 0{,}049$, $h = 0{,}674$, $n_s = 0{,}965$), $W$ là cửa sổ cầu đặc bán kính 8 Mpc/$h$, $\\lambda_i$ là trị riêng của tenxơ biến dạng. Màu “mật độ” là mật độ khối lượng gán lên lưới $128^2$ theo CIC rồi làm mượt Gauss 1 ô; màu “kiểu cấu trúc” đếm số trục có $D\\lambda_i < -0{,}4$ (kiểu T-web).',
        en: '$T(k)$ is the Eisenstein & Hu (1998) transfer function with baryon wiggles ($\\Omega_b = 0.049$, $h = 0.674$, $n_s = 0.965$), $W$ the top-hat window of radius 8 Mpc/$h$, $\\lambda_i$ the deformation-tensor eigenvalues. The “density” colouring is the mass density deposited on a $128^2$ grid by CIC and Gaussian-smoothed by one cell; the “web type” colouring counts axes with $D\\lambda_i < -0.4$ (T-web style).',
      },
    },
  ],
  assumptions: {
    vi: ['Vũ trụ phẳng gồm vật chất và hằng số vũ trụ; không có bức xạ và neutrino có khối lượng.', 'Ba vũ trụ dùng chung một trường ban đầu để tách riêng ảnh hưởng của lịch sử giãn nở.', 'Mạng lưới theo xấp xỉ Zel’dovich bậc một.'],
    en: ['Flat universe of matter and a cosmological constant; no radiation or massive neutrinos.', 'All three universes share one initial field to isolate the effect of the expansion history.', 'First-order Zel’dovich web.'],
  },
  validity: { vi: ['Tăng trưởng tuyến tính chính xác khi $|\\delta| \\ll 1$; mạng lưới chỉ định tính sau giao vỏ.', '$0{,}02 \\le a \\le 4$; không phân giải cấu trúc nhỏ hơn khoảng 6 Mpc/$h$.'], en: ['Linear growth is exact for $|\\delta| \\ll 1$; the web is qualitative after shell crossing.', '$0.02 \\le a \\le 4$; nothing below about 6 Mpc/$h$ is resolved.'] },
  scope: { vi: 'Phần tăng trưởng được kiểm chứng với nghiệm giải tích và công thức khớp đã công bố; phần mạng lưới được kiểm chứng về phổ và tính nhất quán của tenxơ biến dạng.', en: 'The growth part is validated against analytic and published fitting results; the web part against its spectrum and deformation-tensor consistency.' },
  validationText: {
    vi: `Ngưỡng khoá trong \`packages/sim-core/test/lss.test.ts\`.

- **Einstein–de Sitter:** $D/a = 1$ và $f = 1$ tới $10^{-5}$.
- **ΛCDM** $\\Omega_m = 0{,}3$: $D(1) = 0{,}7790$, lệch 0,13% so với công thức Carroll, Press & Turner (1992); $f$ lệch so với $\\Omega_m(a)^{0{,}55}$ là 0,03% ($a = 0{,}3$), 0,07% ($a = 0{,}5$), 0,57% ($a = 1$) nhưng 5,6% ở $a = 2$ - xấp xỉ Linder kém dần trong tương lai xa.
- **Phổ và chuẩn hoá:** $\\sigma_8$ tính lại bằng 0,811 tới $10^{-6}$; chân trời âm EH98 $s = 151{,}0$ Mpc, trong 3% so với $r_{\\rm drag} = 147{,}1$ Mpc của Planck; $P(k)$ đo lại từ trường sinh ra khớp phổ đầu vào trong biên phương sai vũ trụ.
- **Tenxơ biến dạng:** vết bằng $-\\delta$ tới $10^{-4}$ (tương đối).
- Với ΛCDM Planck: lực cản Hubble vượt nguồn hấp dẫn từ $z \\approx 0{,}41$; $D(a=4)/D(1) = 1{,}37$.`,
    en: `Thresholds locked in \`packages/sim-core/test/lss.test.ts\`.

- **Einstein–de Sitter:** $D/a = 1$ and $f = 1$ to $10^{-5}$.
- **ΛCDM** $\\Omega_m = 0.3$: $D(1) = 0.7790$, 0.13% from the Carroll, Press & Turner (1992) fit; $f$ differs from $\\Omega_m(a)^{0.55}$ by 0.03% ($a = 0.3$), 0.07% ($a = 0.5$), 0.57% ($a = 1$) but 5.6% at $a = 2$ - Linder’s approximation degrades in the far future.
- **Spectrum and normalisation:** the recomputed $\\sigma_8$ equals 0.811 to $10^{-6}$; the EH98 sound horizon $s = 151.0$ Mpc lies within 3% of Planck’s $r_{\\rm drag} = 147.1$ Mpc; the $P(k)$ re-measured from the generated field matches the input within cosmic variance.
- **Deformation tensor:** its trace equals $-\\delta$ to $10^{-4}$ (relative).
- For Planck ΛCDM: the Hubble drag exceeds the gravity source from $z \\approx 0.41$; $D(a=4)/D(1) = 1.37$.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có động lực học N vật, quầng virial hoá hay vật lý baryon.', 'Hộp 200 Mpc/$h$ với $64^3$ phần tử: không phân giải cấu trúc nhỏ hơn khoảng 6 Mpc/$h$; phương sai vũ trụ lớn ở thang lớn nhất.'],
    en: ['No N-body dynamics, virialised halos or baryonic physics.', '200 Mpc/$h$ box with $64^3$ elements: nothing below about 6 Mpc/$h$ is resolved; large cosmic variance on the largest scales.'],
  },
  references: [
    'Peebles, P. J. E. (1980). The Large-Scale Structure of the Universe. Princeton University Press.',
    'Zel’dovich, Ya. B. (1970). Gravitational instability: an approximate theory for large density perturbations. A&A 5, 84.',
    'Eisenstein, D. J. & Hu, W. (1998). Baryonic features in the matter transfer function. ApJ 496, 605.',
    'Carroll, S. M., Press, W. H. & Turner, E. L. (1992). The cosmological constant. ARA&A 30, 499.',
    'Linder, E. V. (2005). Cosmic growth history and expansion history. Phys. Rev. D 72, 043529.',
    'Planck Collaboration (2020). Planck 2018 results. VI. Cosmological parameters. A&A 641, A6.',
    'lss-lab - Gravity vs Expansion (github.com/MinhMPA/lss-lab).',
  ],
};
