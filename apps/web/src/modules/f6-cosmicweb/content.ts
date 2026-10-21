import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Nhận ra các thành phần của mạng lưới vũ trụ - khoảng trống, tấm, sợi, nút - trong một hộp 3 chiều 250 Mpc/$h$.',
      'Giải thích ảnh hưởng của $\\Omega_m$, $\\sigma_8$ và $n_s$ lên hình dạng mạng lưới khi giữ nguyên pha ngẫu nhiên.',
      'So sánh lý thuyết nhiễu loạn Lagrange bậc một (Zel’dovich) và bậc hai; đọc phổ công suất $P(k)$ đo từ hộp so với lý thuyết tuyến tính.',
      'Hiểu méo không gian dịch chuyển đỏ (hiệu ứng Kaiser) và vì sao thiên hà là “vết” có độ lệch của vật chất (bias, mô hình HOD).',
    ],
    en: [
      'Recognise the parts of the cosmic web - voids, sheets, filaments, nodes - in a 250 Mpc/$h$ 3D box.',
      'Explain how $\\Omega_m$, $\\sigma_8$ and $n_s$ reshape the web while the random phases stay fixed.',
      'Compare first-order (Zel’dovich) and second-order Lagrangian perturbation theory; read the box’s measured power spectrum $P(k)$ against linear theory.',
      'Understand redshift-space distortions (the Kaiser effect) and why galaxies are biased tracers of matter (bias, the HOD model).',
    ],
  },
  durationMin: 50,
  prerequisites: { vi: 'F5 - Hệ số tăng trưởng, xấp xỉ Zel’dovich; khái niệm biến đổi Fourier và phổ công suất (ở mức định tính).', en: 'F5 - Growth factor, Zel’dovich approximation; Fourier transforms and power spectra (qualitatively).' },
  background: [
    {
      title: { vi: 'Một vũ trụ trong hộp', en: 'A universe in a box' },
      body: {
        vi: 'Các khảo sát thiên hà như SDSS, DESI cho thấy thiên hà xếp thành một mạng lưới khổng lồ. Mô-đun F6 tạo một **hộp tuần hoàn** cạnh 250 Mpc/$h$ chứa tới $128^3$ phần tử vật chất, đặt chúng theo lý thuyết nhiễu loạn Lagrange từ một trường ban đầu ngẫu nhiên, rồi cho phép thay đổi các tham số vũ trụ học, xem quầng vật chất tối, thiên hà và đo phổ công suất ngay trong trình duyệt. Pha ngẫu nhiên được giữ cố định, nên mọi thay đổi bạn thấy là do **vật lý**, không phải do một lần lấy mẫu khác.',
        en: 'Galaxy surveys such as SDSS and DESI show galaxies arranged in an enormous web. Module F6 builds a **periodic box** 250 Mpc/$h$ on a side containing up to $128^3$ matter elements, places them with Lagrangian perturbation theory from a random initial field, and lets you change the cosmological parameters, view dark-matter halos and galaxies and measure the power spectrum in the browser. The random phases are kept fixed, so every change you see comes from **physics**, not from a different random draw.',
      },
    },
    {
      title: { vi: '1. Trường ban đầu và phổ công suất', en: '1. The initial field and power spectrum' },
      body: {
        vi: 'Trường mật độ ban đầu là trường Gauss, hoàn toàn được xác định bởi phổ công suất. Theo lý thuyết tuyến tính, phổ không thứ nguyên hôm nay là\n\n$$\\Delta^2(k) = \\frac{4}{25}\\,A_s\\left(\\frac{k}{k_p}\\right)^{n_s-1}\\left(\\frac{ck}{H_0}\\right)^4 T^2(k)\\left[\\frac{D(1)}{\\Omega_m}\\right]^2,$$\n\ntrong đó $A_s$ là **biên độ nguyên thủy** tại $k_p = 0{,}05$ Mpc⁻¹ (Planck 2018: $A_s = 2{,}099\\times10^{-9}$), $n_s$ là độ nghiêng phổ, $T(k)$ là hàm truyền Eisenstein & Hu (1998) có **dao động âm baryon**, và $D$ là hệ số tăng trưởng chuẩn hoá $D \\to a$ trong kỷ nguyên vật chất. Độ “vón cục” thường được tóm tắt bằng $\\sigma_8$, độ lệch chuẩn của mật độ trong các cầu bán kính 8 Mpc/$h$.\n\nMô-đun có hai cách giữ biên độ:\n\n- **Giữ $A_s$** (mặc định, như phông nền vi sóng đo được): tăng $\\Omega_m$ thì hấp dẫn khuếch đại nhiễu loạn mạnh hơn, nên $\\sigma_8$ tăng mạnh, từ 0,22 ở $\\Omega_m = 0{,}1$ tới 1,20 ở $\\Omega_m = 0{,}6$. Mạng lưới vón cục rõ rệt hơn và có nhiều quầng nặng hơn.\n- **Giữ $\\sigma_8$**: $\\Omega_m$ chỉ đổi **hình dạng** phổ. $\\Omega_m$ lớn hơn làm vật chất và bức xạ cân bằng sớm hơn, đỉnh phổ dịch về $k$ lớn, nên có nhiều cấu trúc nhỏ hơn và ít cấu trúc lớn hơn. Thay đổi này tinh tế hơn. Khảo sát thấu kính yếu chủ yếu đo được tổ hợp $S_8 = \\sigma_8(\\Omega_m/0{,}3)^{0{,}5}$.\n\n$n_s$ nhỏ hơn 1 ưu tiên cấu trúc lớn, lớn hơn 1 ưu tiên cấu trúc nhỏ. Mọi thay đổi đều giữ nguyên pha ngẫu nhiên, nên cấu trúc xuất hiện ở cùng những vị trí.',
        en: 'The initial density field is Gaussian, fully specified by its power spectrum. In linear theory the dimensionless spectrum today is\n\n$$\\Delta^2(k) = \\frac{4}{25}\\,A_s\\left(\\frac{k}{k_p}\\right)^{n_s-1}\\left(\\frac{ck}{H_0}\\right)^4 T^2(k)\\left[\\frac{D(1)}{\\Omega_m}\\right]^2,$$\n\nwhere $A_s$ is the **primordial amplitude** at $k_p = 0.05$ Mpc⁻¹ (Planck 2018: $A_s = 2.099\\times10^{-9}$), $n_s$ the spectral tilt, $T(k)$ the Eisenstein & Hu (1998) transfer function with **baryon acoustic oscillations**, and $D$ the growth factor normalised to $D \\to a$ in the matter era. Clumpiness is usually summarised by $\\sigma_8$, the rms density in spheres of radius 8 Mpc/$h$.\n\nThe module offers two ways to hold the amplitude:\n\n- **Fix $A_s$** (default, as measured by the cosmic microwave background): a larger $\\Omega_m$ lets gravity amplify the perturbations more, so $\\sigma_8$ rises steeply, from 0.22 at $\\Omega_m = 0.1$ to 1.20 at $\\Omega_m = 0.6$. The web becomes visibly clumpier, with more massive halos.\n- **Fix $\\sigma_8$**: $\\Omega_m$ then changes only the **shape** of the spectrum. A larger $\\Omega_m$ makes matter-radiation equality earlier and moves the spectral peak to larger $k$, giving more small and fewer large structures. The change is subtler. Weak-lensing surveys mainly measure the combination $S_8 = \\sigma_8(\\Omega_m/0.3)^{0.5}$.\n\nAn $n_s$ below 1 favours large structures, above 1 small ones. Every change keeps the random phases, so structures appear in the same places.',
      },
    },
    {
      title: { vi: '2. Lý thuyết nhiễu loạn Lagrange', en: '2. Lagrangian perturbation theory' },
      body: {
        vi: 'Mỗi phần tử vật chất xuất phát từ vị trí Lagrange $\\mathbf q$ được dịch chuyển tới\n\n$$\\mathbf x = \\mathbf q + D\\,\\boldsymbol\\Psi^{(1)}(\\mathbf q) + \\tfrac37\\,D^2\\,\\boldsymbol\\Psi^{(2)}(\\mathbf q).$$\n\nSố hạng bậc một (1LPT) là xấp xỉ Zel’dovich (F5): với $\\lambda_1, \\lambda_2, \\lambda_3$ là trị riêng của tenxơ biến dạng $\\partial\\Psi^{(1)}_i/\\partial q_j$, mật độ là $1 + \\delta = \\prod_i (1 + D\\lambda_i)^{-1}$, và vật chất co sụp trước hết dọc trục có $\\lambda_i$ âm nhất - một trục cho **tấm**, hai trục cho **sợi**, ba trục cho **nút**. Màu “kiểu cấu trúc” đếm số trục có $D\\lambda_i < -0{,}4$ (ngưỡng minh hoạ). Số hạng bậc hai (2LPT, Bouchet et al. 1995) có nguồn là các tổ hợp bậc hai của tenxơ biến dạng; nó làm sợi và nút sắc nét hơn và làm phân bố mật độ lệch (độ xiên dương), gần với mô phỏng N vật hơn. Cả hai đều tính bằng biến đổi Fourier nhanh trên lưới.',
        en: 'Each matter element starting at Lagrangian position $\\mathbf q$ is displaced to\n\n$$\\mathbf x = \\mathbf q + D\\,\\boldsymbol\\Psi^{(1)}(\\mathbf q) + \\tfrac37\\,D^2\\,\\boldsymbol\\Psi^{(2)}(\\mathbf q).$$\n\nThe first-order term (1LPT) is the Zel’dovich approximation (F5): with $\\lambda_1, \\lambda_2, \\lambda_3$ the eigenvalues of the deformation tensor $\\partial\\Psi^{(1)}_i/\\partial q_j$, the density is $1 + \\delta = \\prod_i (1 + D\\lambda_i)^{-1}$, and matter collapses first along the axis with the most negative $\\lambda_i$ - one axis gives a **sheet**, two a **filament**, three a **node**. The “web type” colouring counts axes with $D\\lambda_i < -0.4$ (an illustrative threshold). The second-order term (2LPT, Bouchet et al. 1995) is sourced by quadratic combinations of the deformation tensor; it sharpens filaments and nodes and skews the density distribution (positive skewness), closer to N-body simulations. Both are computed with fast Fourier transforms on the grid.',
      },
    },
    {
      title: { vi: '3. Không gian dịch chuyển đỏ', en: '3. Redshift space' },
      body: {
        vi: 'Khảo sát thiên hà đo khoảng cách bằng dịch chuyển đỏ, nên vận tốc riêng làm lệch vị trí dọc theo trục nhìn $\\hat{\\mathbf e}$:\n\n$$\\mathbf s = \\mathbf x + \\frac{\\mathbf v\\cdot\\hat{\\mathbf e}}{aH}\\,\\hat{\\mathbf e},\\qquad \\frac{\\mathbf v}{aH} = f D\\,\\boldsymbol\\Psi^{(1)} + f_2\\,\\tfrac37 D^2\\,\\boldsymbol\\Psi^{(2)}.$$\n\nVật chất rơi về phía các cấu trúc nên chúng bị **nén** dọc trục nhìn. Ở thang lớn, Kaiser (1987) chỉ ra $\\delta_s = (1 + f\\mu^2)\\,\\delta$ với $\\mu$ là cosin góc giữa vectơ sóng và trục nhìn, nên đơn cực của phổ tăng thêm\n\n$$\\frac{P_s^{(0)}}{P} = 1 + \\tfrac23 f + \\tfrac15 f^2.$$\n\nĐo hệ số này cho phép đo tốc độ tăng trưởng $f$ - một phép thử của thuyết hấp dẫn ở thang vũ trụ.',
        en: 'Galaxy surveys measure distance by redshift, so peculiar velocities shift positions along the line of sight $\\hat{\\mathbf e}$:\n\n$$\\mathbf s = \\mathbf x + \\frac{\\mathbf v\\cdot\\hat{\\mathbf e}}{aH}\\,\\hat{\\mathbf e},\\qquad \\frac{\\mathbf v}{aH} = f D\\,\\boldsymbol\\Psi^{(1)} + f_2\\,\\tfrac37 D^2\\,\\boldsymbol\\Psi^{(2)}.$$\n\nMatter falls towards structures, so they are **squashed** along the line of sight. On large scales Kaiser (1987) showed $\\delta_s = (1 + f\\mu^2)\\,\\delta$, with $\\mu$ the cosine of the angle between the wavevector and the line of sight, so the spectrum monopole is boosted by\n\n$$\\frac{P_s^{(0)}}{P} = 1 + \\tfrac23 f + \\tfrac15 f^2.$$\n\nMeasuring this factor measures the growth rate $f$ - a test of gravity on cosmological scales.',
      },
    },
    {
      title: { vi: '4. Quầng, thiên hà và độ lệch', en: '4. Halos, galaxies and bias' },
      body: {
        vi: 'Quầng vật chất tối hình thành ở các **đỉnh** của trường tuyến tính đã làm mượt khi $D\\,\\delta_R \\ge \\delta_c \\approx 1{,}686$ (ngưỡng sụp đổ cầu). Thiên hà được đặt vào quầng theo mô hình **HOD** (Zheng et al. 2007):\n\n$$\\langle N_{\\rm cen}\\rangle = \\tfrac12\\left[1 + \\operatorname{erf}\\!\\left(\\frac{\\log M - \\log M_{\\min}}{\\sigma_{\\log M}}\\right)\\right],\\qquad \\langle N_{\\rm sat}\\rangle = \\langle N_{\\rm cen}\\rangle\\left(\\frac{M - M_0}{M_1}\\right)^{\\alpha}.$$\n\nVì chỉ những đỉnh cao mới trở thành quầng, quầng **tập trung hơn** vật chất: ở thang lớn $P_{hh} \\approx b^2 P_m$ với độ lệch $b > 1$. Phổ của một tập hợp rời rạc còn có thêm **nhiễu Poisson** $1/\\bar n$.',
        en: 'Dark-matter halos form at **peaks** of the smoothed linear field once $D\\,\\delta_R \\ge \\delta_c \\approx 1.686$ (the spherical-collapse threshold). Galaxies are placed in halos with the **HOD** model (Zheng et al. 2007):\n\n$$\\langle N_{\\rm cen}\\rangle = \\tfrac12\\left[1 + \\operatorname{erf}\\!\\left(\\frac{\\log M - \\log M_{\\min}}{\\sigma_{\\log M}}\\right)\\right],\\qquad \\langle N_{\\rm sat}\\rangle = \\langle N_{\\rm cen}\\rangle\\left(\\frac{M - M_0}{M_1}\\right)^{\\alpha}.$$\n\nBecause only high peaks become halos, halos **cluster more strongly** than matter: on large scales $P_{hh} \\approx b^2 P_m$ with bias $b > 1$. The spectrum of a discrete set also carries **shot noise** $1/\\bar n$.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Biển phẳng lặng và nút dày đặc', en: 'Experiment 1 - Smooth sea and dense knots' }, text: { vi: 'Ở chế độ “Giữ σ₈”, chọn “Phẳng lặng” ($\\sigma_8 = 0{,}45$) rồi “Planck 2018” ($\\sigma_8 = 0{,}811$). Các sợi có nằm ở cùng chỗ không? Giải thích bằng việc pha ngẫu nhiên được giữ cố định.', en: 'In “Fix σ₈” mode choose “Smooth” ($\\sigma_8 = 0.45$) and then “Planck 2018” ($\\sigma_8 = 0.811$). Are the filaments in the same places? Explain using the fixed random phases.' }, params: { norm: 's8', s8: 0.45 } },
    { title: { vi: 'Thử nghiệm 2 - Thêm vật chất thì sao?', en: 'Experiment 2 - What does more matter do?' }, text: { vi: 'Ở chế độ “Giữ A_s”, chọn lần lượt “Ít vật chất” ($\\Omega_m = 0{,}15$), “Planck 2018” và “Nhiều vật chất” ($\\Omega_m = 0{,}55$); đọc $\\sigma_8$ hôm nay và bật quầng để đếm. Sau đó chuyển sang “Giữ σ₈” và làm lại. Vì sao ở chế độ thứ hai thay đổi tinh tế hơn nhiều? Đọc thêm $S_8$: vì sao các khảo sát thiên hà khó tách riêng $\\sigma_8$ và $\\Omega_m$?', en: 'In “Fix A_s” mode choose “Matter-light” ($\\Omega_m = 0.15$), “Planck 2018” and “Matter-heavy” ($\\Omega_m = 0.55$) in turn; read today’s $\\sigma_8$ and turn on halos to count them. Then switch to “Fix σ₈” and repeat. Why is the change so much subtler in the second mode? Read $S_8$ too: why do galaxy surveys struggle to separate $\\sigma_8$ from $\\Omega_m$?' }, params: { norm: 'As', om: 0.55, halos: true } },
    { title: { vi: 'Thử nghiệm 3 - Thứ tự co sụp', en: 'Experiment 3 - The order of collapse' }, text: { vi: 'Bật “Kiểu cấu trúc”, kéo $a$ về 0,05 rồi bấm chạy. Tấm, sợi và nút xuất hiện theo thứ tự nào? Liên hệ với số trục có $D\\lambda_i < -0{,}4$.', en: 'Turn on “Web type”, drag $a$ to 0.05 and press play. In what order do sheets, filaments and nodes appear? Relate this to the number of axes with $D\\lambda_i < -0.4$.' }, params: { col: 'web', a: 0.05 } },
    { title: { vi: 'Thử nghiệm 4 - Đo hiệu ứng Kaiser', en: 'Experiment 4 - Measuring the Kaiser effect' }, text: { vi: 'Mở tab $P(k)$ và chuyển giữa “Không gian thực” và “LOS z”. Ở $k$ nhỏ, phổ đo được tăng khoảng bao nhiêu lần? So với hệ số Kaiser trong bảng số liệu. Xem lát cắt 2D: cấu trúc bị nén theo trục nào?', en: 'Open the $P(k)$ tab and switch between “Real space” and “LOS z”. By roughly what factor does the measured spectrum rise at small $k$? Compare with the Kaiser factor in the readouts. Look at the 2D slice: along which axis is structure squashed?' }, params: { rsd: 'z' } },
    { title: { vi: 'Thử nghiệm 5 - Quầng lệch bao nhiêu?', en: 'Experiment 5 - How biased are halos?' }, text: { vi: 'Bật quầng và thiên hà, mở tab $P(k)$ và đọc độ lệch $b_h$. Tăng $\\log M_{\\min}$: số thiên hà giảm nhưng chúng nằm trong quầng nặng hơn - tương quan mạnh hơn hay yếu hơn? Nhiễu Poisson thay đổi thế nào?', en: 'Turn on halos and galaxies, open the $P(k)$ tab and read the bias $b_h$. Raise $\\log M_{\\min}$: fewer galaxies, in heavier halos - do they cluster more or less? How does the shot noise change?' }, params: { halos: true, gals: true } },
    { title: { vi: 'Thử nghiệm 6 - 1LPT và 2LPT', en: 'Experiment 6 - 1LPT and 2LPT' }, text: { vi: 'Ở $a = 1$, chuyển giữa 1LPT và 2LPT. Sợi và nút thay đổi thế nào? Ở $k$ lớn, phổ đo được khác lý thuyết tuyến tính ra sao?', en: 'At $a = 1$, switch between 1LPT and 2LPT. How do filaments and nodes change? At large $k$, how does the measured spectrum depart from linear theory?' }, params: { lpt: '1' } },
  ],
  quiz: [
    { q: { vi: 'Tăng $\\sigma_8$ khi giữ nguyên $\\Omega_m$ và $n_s$ sẽ:', en: 'Raising $\\sigma_8$ at fixed $\\Omega_m$ and $n_s$ will:' }, options: [{ vi: 'Làm cấu trúc ở đúng các vị trí cũ đậm đặc hơn', en: 'Make structure denser in the same places' }, { vi: 'Dời các sợi sang chỗ khác', en: 'Move the filaments elsewhere' }, { vi: 'Thay đổi hình dạng phổ $P(k)$', en: 'Change the shape of $P(k)$' }], answer: 0, explain: { vi: '$\\sigma_8$ chỉ nhân biên độ; pha ngẫu nhiên và hình dạng phổ không đổi.', en: '$\\sigma_8$ only scales the amplitude; the phases and spectral shape are unchanged.' } },
    { q: { vi: 'Ở thang lớn, hiệu ứng Kaiser làm đơn cực của phổ:', en: 'On large scales the Kaiser effect makes the spectrum monopole:' }, options: [{ vi: 'Tăng thêm $1 + \\tfrac23 f + \\tfrac15 f^2$ lần', en: 'Larger by $1 + \\tfrac23 f + \\tfrac15 f^2$' }, { vi: 'Giảm đi', en: 'Smaller' }, { vi: 'Không đổi', en: 'Unchanged' }], answer: 0, explain: { vi: 'Dòng vật chất rơi vào cấu trúc làm chúng trông đậm hơn dọc trục nhìn.', en: 'Infall makes structures look denser along the line of sight.' } },
    { q: { vi: 'Vì sao quầng có độ lệch $b > 1$?', en: 'Why do halos have bias $b > 1$?' }, options: [{ vi: 'Chúng chỉ hình thành ở các đỉnh cao của trường mật độ', en: 'They form only at high peaks of the density field' }, { vi: 'Vì chúng nặng hơn vật chất', en: 'Because they are heavier than matter' }, { vi: 'Vì nhiễu Poisson', en: 'Because of shot noise' }], answer: 0, explain: { vi: 'Đỉnh cao tập trung ở vùng có mode sóng dài dương, nên tương quan của chúng được khuếch đại (Kaiser 1984).', en: 'High peaks sit where long-wavelength modes are positive, so their clustering is amplified (Kaiser 1984).' } },
  ],
  instructor: {
    vi: 'Nguồn gốc: phát triển từ “The Cosmic Web Sandbox” của lss-lab (github.com/MinhMPA/lss-lab). Bản này tính toàn bộ trong Web Worker và có kiểm chứng tự động (phục hồi $P(k)$, tỉ số Kaiser, HOD). Tài nguyên: Bouchet et al. (1995) A&A 296, 575; Kaiser (1987) MNRAS 227, 1; Zheng et al. (2007) ApJ 667, 760. Gợi ý thảo luận: vì sao các mô phỏng nghiên cứu cần động lực học N vật cho các thang dưới khoảng 5 Mpc/$h$?',
    en: 'Origin: developed from lss-lab’s “The Cosmic Web Sandbox” (github.com/MinhMPA/lss-lab). This version computes everything in a Web Worker and is checked by automated tests ($P(k)$ recovery, Kaiser ratio, HOD). Resources: Bouchet et al. (1995) A&A 296, 575; Kaiser (1987) MNRAS 227, 1; Zheng et al. (2007) ApJ 667, 760. Discussion: why do research simulations need N-body dynamics below about 5 Mpc/$h$?',
  },
};

/** Model Card · F6. Measured figures: `npm run validate:cosmicweb` → docs/validation/F6-cosmic-web.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Phổ tuyến tính và tăng trưởng', en: 'Level A - Linear spectrum and growth' },
      body: { vi: 'Hàm truyền Eisenstein & Hu (1998) có dao động baryon ($\\Omega_b = 0{,}049$, $h = 0{,}674$, $T_{\\rm CMB} = 2{,}7255$ K), biên độ đặt theo $A_s$ (neo vào Planck 2018) hoặc trực tiếp theo $\\sigma_8$ với cửa sổ cầu 8 Mpc/$h$; $D(a)$, $f(a)$ giải số như F5.', en: 'Eisenstein & Hu (1998) transfer function with baryon wiggles ($\\Omega_b = 0.049$, $h = 0.674$, $T_{\\rm CMB} = 2.7255$ K); amplitude set by $A_s$ (anchored to Planck 2018) or directly by $\\sigma_8$ with an 8 Mpc/$h$ top-hat; $D(a)$, $f(a)$ solved numerically as in F5.' },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Hạt 1LPT/2LPT, không gian dịch chuyển đỏ, phổ đo được', en: 'Level B - 1LPT/2LPT particles, redshift space, measured spectrum' },
      body: { vi: 'Trường Gauss $N^3$ ($N$ = 32, 64 hoặc 128) trong hộp tuần hoàn 250 Mpc/$h$, pha cố định theo hạt giống. Hạt đi theo LPT không cắt bớt, như bản lss-lab: sau khi giao vỏ, hạt tiếp tục đi xuyên qua cấu trúc. Vị trí được tính trên GPU bằng cùng công thức với lõi CPU; màu lấy từ mật độ CIC trên lưới $N^3$ (tối đa $64^3$, ô 3,9 Mpc/$h$).', en: 'Gaussian $N^3$ field ($N$ = 32, 64 or 128) in a 250 Mpc/$h$ periodic box, phases fixed by the seed. Particles follow untruncated LPT, as in lss-lab: after shell crossing they keep streaming through structures. Positions are computed on the GPU with the same formula as the CPU core; colours use the CIC density on an $N^3$ grid (at most $64^3$, 3.9 Mpc/$h$ cells).' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Quầng và thiên hà', en: 'Level C - Halos and galaxies' },
      body: { vi: 'Quầng là đỉnh của trường tuyến tính làm mượt (“peak-patch” rút gọn), không phải danh mục quầng từ mô phỏng N vật; hàm khối lượng chỉ đúng bậc độ lớn. Tham số HOD mặc định là minh hoạ cho hộp này, không khớp với một khảo sát cụ thể; vệ tinh phân bố Gauss quanh tâm quầng, không theo profile NFW.', en: 'Halos are peaks of the smoothed linear field (a reduced “peak-patch”), not an N-body halo catalogue; the mass function is right only to order of magnitude. Default HOD parameters are illustrative for this box, not fitted to a survey; satellites are Gaussian-distributed about the halo centre, not NFW.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, B, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Dịch chuyển Lagrange và không gian dịch chuyển đỏ', en: '1. Lagrangian displacement and redshift space' },
      tex: ['\\mathbf x=\\mathbf q+D\\,\\boldsymbol\\Psi^{(1)}+\\tfrac37 D^2\\,\\boldsymbol\\Psi^{(2)},\\qquad \\boldsymbol\\Psi^{(1)}(\\mathbf k)=\\frac{i\\mathbf k}{k^2}\\delta_L(\\mathbf k)', '\\mathbf s=\\mathbf x+\\left[fD\\,\\Psi^{(1)}_\\parallel+f_2\\tfrac37D^2\\Psi^{(2)}_\\parallel\\right]\\hat{\\mathbf e},\\qquad f_2\\approx2\\,\\Omega_m(a)^{6/11}'],
      body: {
        vi: 'Trong đó $\\boldsymbol\\Psi^{(2)}$ có nguồn $\\sum_{i<j}(\\phi_{,ii}\\phi_{,jj} - \\phi_{,ij}^2)$ với $\\phi_{,ij}(\\mathbf k) = k_ik_j\\delta_L/k^2$ (Bouchet et al. 1995); $\\Psi_\\parallel$ là thành phần dọc trục nhìn $\\hat{\\mathbf e}$ (trục $x$, $y$ hoặc $z$, xấp xỉ quan sát viên ở rất xa); $f = d\\ln D/d\\ln a$. Trường được dựng ở $\\sigma_8 = 0{,}811$ cho đúng hình dạng phổ của $(\\Omega_m, n_s)$ đang chọn, rồi nhân biên độ với $(\\sigma_8/0{,}811)\\,D(a)/D(1)$.',
        en: '$\\boldsymbol\\Psi^{(2)}$ is sourced by $\\sum_{i<j}(\\phi_{,ii}\\phi_{,jj} - \\phi_{,ij}^2)$ with $\\phi_{,ij}(\\mathbf k) = k_ik_j\\delta_L/k^2$ (Bouchet et al. 1995); $\\Psi_\\parallel$ is the component along the line of sight $\\hat{\\mathbf e}$ (the $x$, $y$ or $z$ axis, distant-observer approximation); $f = d\\ln D/d\\ln a$. The field is built at $\\sigma_8 = 0.811$ with the spectral shape of the chosen $(\\Omega_m, n_s)$ and then scaled by $(\\sigma_8/0.811)\\,D(a)/D(1)$.',
      },
    },
    {
      title: { vi: '2. Biên độ: giữ $A_s$ hay giữ $\\sigma_8$', en: '2. Amplitude: fixed $A_s$ or fixed $\\sigma_8$' },
      tex: ['\\sigma_8^2=\\int\\Delta^2(k)\\,W^2(8k)\\,d\\ln k,\\qquad \\Delta^2(k)=\\frac{4}{25}A_s\\left(\\frac{k}{k_p}\\right)^{n_s-1}\\left(\\frac{ck}{H_0}\\right)^4T^2(k)\\left[\\frac{D(1)}{\\Omega_m}\\right]^2', '\\sigma_8(\\Omega_m,n_s,A_s)=0.811\\,\\frac{\\tilde\\sigma_8(\\Omega_m,n_s,A_s)}{\\tilde\\sigma_8(0.315,\\,0.965,\\,A_{s,\\rm P})}'],
      body: {
        vi: 'Trong đó $W$ là cửa sổ cầu đặc, $k$ tính bằng $h$/Mpc, $c/H_0 = 2997{,}92$ Mpc/$h$, $k_p = 0{,}05$ Mpc⁻¹ và $A_{s,\\rm P} = e^{3{,}044}\\times10^{-10} = 2{,}099\\times10^{-9}$ (Planck 2018); $D$ chuẩn hoá $D \\to a$ khi $a \\to 0$ (Dodelson & Schmidt 2020, ch. 8). $\\tilde\\sigma_8$ là giá trị tính thẳng từ tích phân trên. Phép neo làm cho vũ trụ Planck cho đúng $\\sigma_8 = 0{,}811$, còn sự phụ thuộc vào $\\Omega_m$, $n_s$, $A_s$ lấy từ công thức. Khi giữ $\\sigma_8$, $A_s$ tương đương được suy ngược từ cùng hệ thức.',
        en: '$W$ is the top-hat window, $k$ in $h$/Mpc, $c/H_0 = 2997.92$ Mpc/$h$, $k_p = 0.05$ Mpc⁻¹ and $A_{s,\\rm P} = e^{3.044}\\times10^{-10} = 2.099\\times10^{-9}$ (Planck 2018); $D$ is normalised to $D \\to a$ as $a \\to 0$ (Dodelson & Schmidt 2020, ch. 8). $\\tilde\\sigma_8$ is the value computed directly from the integral above. The anchor makes the Planck universe give exactly $\\sigma_8 = 0.811$, while the dependence on $\\Omega_m$, $n_s$, $A_s$ comes from the formula. With $\\sigma_8$ fixed, the equivalent $A_s$ is inferred from the same relation.',
      },
    },
    {
      title: { vi: '3. Phổ công suất đo được', en: '3. Measured power spectrum' },
      tex: ['\\hat P(k)=\\frac{V}{N_{\\rm cell}^2}\\left\\langle|\\delta_{\\mathbf k}|^2\\right\\rangle_{|\\mathbf k|\\in{\\rm bin}},\\qquad \\frac{P_s^{(0)}}{P}=1+\\tfrac23f+\\tfrac15f^2'],
      body: {
        vi: 'Mật độ được gán lên lưới tối đa $64^3$ theo phương pháp CIC rồi biến đổi Fourier; $V$ là thể tích hộp, $N_{\\rm cell}$ số ô. Không hiệu chỉnh cửa sổ CIC và chồng phổ, nên phổ đo bị giảm gần tần số Nyquist. Nhiễu Poisson của quầng là $V/N_h$; độ lệch $b_h$ lấy từ $k < 0{,}08\\ h$/Mpc sau khi trừ nhiễu Poisson.',
        en: 'The density is deposited on at most a $64^3$ grid by CIC and Fourier transformed; $V$ is the box volume, $N_{\\rm cell}$ the number of cells. No CIC-window or aliasing correction is applied, so the measured spectrum is suppressed near the Nyquist frequency. Halo shot noise is $V/N_h$; the bias $b_h$ uses $k < 0.08\\ h$/Mpc after subtracting shot noise.',
      },
    },
    {
      title: { vi: '4. Quầng và HOD', en: '4. Halos and HOD' },
      tex: ['D\\,\\delta_R(\\mathbf q)\\ge\\delta_c=1.686,\\qquad M=(2\\pi)^{3/2}\\,\\bar\\rho_m\\,R^3,\\qquad \\bar\\rho_m=2.775\\times10^{11}\\,\\Omega_m\\ h^2M_\\odot\\,\\mathrm{Mpc}^{-3}'],
      body: {
        vi: 'Quầng là cực đại địa phương (so với 6 ô lân cận) của $\\delta_L$ làm mượt Gauss với $R$ = 3; 4,5; 6,75; 10 Mpc/$h$, xét từ $R$ lớn tới nhỏ và loại trùng trong bán kính cầu đặc cùng khối lượng $R_{\\rm TH} = (\\tfrac32\\sqrt{2\\pi})^{1/3}R \\approx 1{,}55R$. HOD: $\\sigma_{\\log M} = 0{,}26$, $\\log M_0 = 13$; mặc định $\\log M_{\\min} = 13{,}5$, $\\log M_1 = 14{,}5$, $\\alpha = 1$. Vệ tinh phân bố Gauss đẳng hướng với $\\sigma = r_{200}/2$, trong đó $M = \\tfrac{4\\pi}{3}\\,200\\,\\bar\\rho_m\\,r_{200}^3$.',
        en: 'Halos are local maxima (against 6 neighbours) of $\\delta_L$ Gaussian-smoothed with $R$ = 3, 4.5, 6.75, 10 Mpc/$h$, scanned from large to small $R$ with exclusion inside the equal-mass top-hat radius $R_{\\rm TH} = (\\tfrac32\\sqrt{2\\pi})^{1/3}R \\approx 1.55R$. HOD: $\\sigma_{\\log M} = 0.26$, $\\log M_0 = 13$; defaults $\\log M_{\\min} = 13.5$, $\\log M_1 = 14.5$, $\\alpha = 1$. Satellites are isotropic Gaussian with $\\sigma = r_{200}/2$, where $M = \\tfrac{4\\pi}{3}\\,200\\,\\bar\\rho_m\\,r_{200}^3$.',
      },
    },
  ],
  assumptions: {
    vi: ['Vũ trụ phẳng ΛCDM, không có neutrino khối lượng; $\\Omega_b$ và $h$ giữ theo Planck 2018 khi đổi $\\Omega_m$.', 'Biên độ ($\\sigma_8$ hoặc $A_s$) được áp dụng như hệ số nhân lên trường đã dựng; đổi $\\Omega_m$ hoặc $n_s$ thì trường được dựng lại với hình dạng phổ mới.', 'Xấp xỉ quan sát viên ở rất xa (trục nhìn song song) cho méo dịch chuyển đỏ.'],
    en: ['Flat ΛCDM without massive neutrinos; $\\Omega_b$ and $h$ kept at Planck 2018 when $\\Omega_m$ changes.', 'The amplitude ($\\sigma_8$ or $A_s$) multiplies the built field; changing $\\Omega_m$ or $n_s$ rebuilds the field with the new spectral shape.', 'Distant-observer (plane-parallel) approximation for redshift-space distortions.'],
  },
  validity: { vi: ['Thang lớn hơn khoảng 8 Mpc/$h$; sau giao vỏ chỉ định tính.', '$0{,}05 \\le a \\le 1$; $0{,}1 \\le \\Omega_m \\le 0{,}6$; $0{,}3 \\le \\sigma_8 \\le 1{,}5$ hoặc $0{,}3 \\le 10^9 A_s \\le 6$; $0{,}7 \\le n_s \\le 1{,}3$.', 'Độ tương phản mật độ chỉ đáng tin khi $\\sigma_8(a) \\lesssim 1$; xa hơn, LPT bão hoà (xem Giới hạn).'], en: ['Scales above about 8 Mpc/$h$; qualitative after shell crossing.', '$0.05 \\le a \\le 1$; $0.1 \\le \\Omega_m \\le 0.6$; $0.3 \\le \\sigma_8 \\le 1.5$ or $0.3 \\le 10^9 A_s \\le 6$; $0.7 \\le n_s \\le 1.3$.', 'The density contrast is reliable only for $\\sigma_8(a) \\lesssim 1$; beyond that LPT saturates (see Limitations).'] },
  scope: { vi: 'Các kiểm chứng dưới đây dùng $64^3$ phần tử ở biên độ nhỏ (chế độ tuyến tính), nơi có dự đoán giải tích.', en: 'The checks below use $64^3$ elements at small amplitude (the linear regime), where analytic predictions exist.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:cosmicweb\` → \`docs/validation/F6-cosmic-web.json\`; ngưỡng khoá trong \`packages/sim-core/test/cosmicweb.test.ts\`.

- **Hiệu ứng Kaiser** ($64^3$, biên độ nhỏ, $f = 0{,}53$): tỉ số đơn cực không gian dịch chuyển đỏ / không gian thực ở $k < 0{,}1\\ h$/Mpc chia cho $1 + \\tfrac23 f + \\tfrac15 f^2$ là **1,035** và **0,966** với hai hạt giống.
- **Phổ đo từ hạt** so với $D^2P_{\\rm lin}$ ở $k < 0{,}1\\ h$/Mpc: tỉ số theo từng khoảng nằm trong 0,68–1,77 với 6–158 mode mỗi khoảng, phù hợp phương sai vũ trụ $\\sqrt{2/N_{\\rm mode}}$ của hộp 250 Mpc/$h$.
- **Quầng** tại $a = 1$ (hạt giống 2026): 1 268 quầng, khối lượng $3{,}7\\times10^{13}$ – $4{,}2\\times10^{14}\\ M_\\odot/h$, mật độ số $8{,}1\\times10^{-5}\\ (h/\\text{Mpc})^3$.
- **Biên độ theo $A_s$:** tính tuyệt đối từ $A_s$ của Planck 2018 cho $\\sigma_8 = 0{,}834$, lệch 2,8% so với giá trị công bố 0,811 (do bỏ qua khối lượng neutrino và dùng hàm truyền EH98). Sau khi neo, $\\sigma_8$ = 0,220; 0,392; 0,541; 0,811; 1,032; 1,150; 1,199 với $\\Omega_m$ = 0,1; 0,15; 0,2; 0,315; 0,45; 0,55; 0,6.
- **Hạt không bị cắt bớt:** độ dịch chuyển 1LPT tỉ lệ tuyến tính với biên độ, sai lệch lớn nhất $1{,}5\\times10^{-5}$ Mpc/$h$ (làm tròn float32). Bản trước dừng hạt ở lần giao vỏ đầu tiên, làm 49% hạt đứng yên ở $\\sigma_8 = 0{,}811$ và 68% ở $\\sigma_8 = 1{,}22$, khiến mạng lưới gần như không phản ứng với $\\sigma_8$ và $\\Omega_m$; lỗi này đã được sửa.
- **Độ tương phản** (2LPT, CIC $64^3$): rms $\\delta$ = 0,84; 1,26; 1,32; 1,30 và tỉ lệ ô gần trống ($\\rho/\\bar\\rho < 0{,}2$) = 2,7%; 14,9%; 21,4%; 23,6% với $\\sigma_8$ = 0,45; 0,811; 1,1; 1,3.
- **Lõi:** khối lượng CIC bảo toàn; dịch chuyển đỏ chỉ thay đổi toạ độ dọc trục nhìn; số thiên hà khớp kỳ vọng HOD trong biên Poisson; $f_2 \\to 2$ khi $\\Omega_m = 1$.`,
    en: `Reproducible report: \`npm run validate:cosmicweb\` → \`docs/validation/F6-cosmic-web.json\`; thresholds locked in \`packages/sim-core/test/cosmicweb.test.ts\`.

- **Kaiser effect** ($64^3$, small amplitude, $f = 0.53$): the redshift-/real-space monopole ratio at $k < 0.1\\ h$/Mpc divided by $1 + \\tfrac23 f + \\tfrac15 f^2$ is **1.035** and **0.966** for two seeds.
- **Particle spectrum** vs $D^2P_{\\rm lin}$ at $k < 0.1\\ h$/Mpc: bin ratios within 0.68–1.77 with 6–158 modes per bin, consistent with the cosmic variance $\\sqrt{2/N_{\\rm mode}}$ of a 250 Mpc/$h$ box.
- **Halos** at $a = 1$ (seed 2026): 1,268 halos, masses $3.7\\times10^{13}$ – $4.2\\times10^{14}\\ M_\\odot/h$, number density $8.1\\times10^{-5}\\ (h/\\text{Mpc})^3$.
- **Amplitude from $A_s$:** computed absolutely from the Planck 2018 $A_s$, $\\sigma_8 = 0.834$, 2.8% above the published 0.811 (massless neutrinos, EH98 transfer function). After anchoring, $\\sigma_8$ = 0.220, 0.392, 0.541, 0.811, 1.032, 1.150, 1.199 for $\\Omega_m$ = 0.1, 0.15, 0.2, 0.315, 0.45, 0.55, 0.6.
- **Particles are not truncated:** the 1LPT displacement is linear in the amplitude, largest deviation $1.5\\times10^{-5}$ Mpc/$h$ (float32 rounding). An earlier version stopped particles at their first shell crossing, leaving 49% of them at rest at $\\sigma_8 = 0.811$ and 68% at $\\sigma_8 = 1.22$, so the web barely responded to $\\sigma_8$ and $\\Omega_m$; this has been fixed.
- **Contrast** (2LPT, CIC $64^3$): rms $\\delta$ = 0.84, 1.26, 1.32, 1.30 and near-empty cell fraction ($\\rho/\\bar\\rho < 0.2$) = 2.7%, 14.9%, 21.4%, 23.6% for $\\sigma_8$ = 0.45, 0.811, 1.1, 1.3.
- **Core:** CIC conserves mass; redshift-space mapping changes only the line-of-sight coordinate; galaxy counts match the HOD expectation within Poisson scatter; $f_2 \\to 2$ for $\\Omega_m = 1$.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có động lực học N vật, quầng virial hoá thật hay vật lý baryon.', 'Mô hình vận tốc tuyến tính nên không có hiệu ứng “ngón tay của Chúa” (Fingers of God) do chuyển động hỗn loạn trong quầng.', 'Phương sai vũ trụ lớn ở $k$ nhỏ vì hộp chỉ chứa ít mode dài.', 'Sau khi giao vỏ, LPT để hạt đi xuyên qua cấu trúc thay vì bị giữ lại như trong mô phỏng N vật, nên khi $\\sigma_8 \\gtrsim 1$ độ tương phản ở thang 4 Mpc/$h$ gần như không tăng thêm (rms $\\delta$ 1,26 → 1,30 từ $\\sigma_8$ = 0,811 tới 1,3). Cắt phổ ban đầu bằng cửa sổ Gauss với $k_G \\approx 1{,}25\\,k_{nl}$ (Melott, Pellman & Shandarin 1994) cải thiện vị trí cấu trúc nhưng chưa được áp dụng.'],
    en: ['No N-body dynamics, truly virialised halos or baryonic physics.', 'The linear velocity model has no Fingers-of-God from random motions inside halos.', 'Large cosmic variance at small $k$ because the box holds few long modes.', 'After shell crossing, LPT lets particles stream through structures instead of staying bound as in N-body simulations, so for $\\sigma_8 \\gtrsim 1$ the contrast on 4 Mpc/$h$ scales barely grows (rms $\\delta$ 1.26 → 1.30 from $\\sigma_8$ = 0.811 to 1.3). Truncating the initial spectrum with a Gaussian window at $k_G \\approx 1.25\\,k_{nl}$ (Melott, Pellman & Shandarin 1994) improves the positions of structures but is not applied.'],
  },
  references: [
    'Eisenstein, D. J. & Hu, W. (1998). Baryonic features in the matter transfer function. ApJ 496, 605.',
    'Bouchet, F. R., Colombi, S., Hivon, E. & Juszkiewicz, R. (1995). Perturbative Lagrangian approach to gravitational instability. A&A 296, 575.',
    'Kaiser, N. (1987). Clustering in real space and in redshift space. MNRAS 227, 1.',
    'Kaiser, N. (1984). On the spatial correlations of Abell clusters. ApJ 284, L9.',
    'Bardeen, J. M., Bond, J. R., Kaiser, N. & Szalay, A. S. (1986). The statistics of peaks of Gaussian random fields. ApJ 304, 15.',
    'Zheng, Z., Coil, A. L. & Zehavi, I. (2007). Galaxy evolution from halo occupation distribution modeling of DEEP2 and SDSS galaxy clustering. ApJ 667, 760.',
    'Hahn, O., Porciani, C., Carollo, C. M. & Dekel, A. (2007). Properties of dark matter haloes in clusters, filaments, sheets and voids. MNRAS 375, 489.',
    'Planck Collaboration (2020). Planck 2018 results. VI. Cosmological parameters. A&A 641, A6.',
    'Dodelson, S. & Schmidt, F. (2020). Modern Cosmology, 2nd ed. Academic Press, ch. 8.',
    'Melott, A. L., Pellman, T. F. & Shandarin, S. F. (1994). Optimizing the Zeldovich approximation. MNRAS 269, 626.',
    'lss-lab - The Cosmic Web Sandbox (github.com/MinhMPA/lss-lab).',
  ],
};
