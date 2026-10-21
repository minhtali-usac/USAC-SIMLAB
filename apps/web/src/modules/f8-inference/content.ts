import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Mô tả chu trình suy luận tham số: chọn một điểm $\\boldsymbol\\theta$ trong không gian mô hình → tính dự đoán → so với dữ liệu cố định bằng $\\chi^2$ → lặp lại.',
      'Đọc giản đồ Hubble của 580 siêu tân tinh Ia (Union2.1) và giải thích vì sao dữ liệu đòi hỏi vũ trụ giãn nở tăng tốc ($q_0 < 0$).',
      'Dựng vùng tin cậy 68 / 95 / 99,7% từ $\\Delta\\chi^2$ cho hai tham số và nhận ra suy biến giữa $\\Omega_m$ và $\\Omega_\\Lambda$.',
      'Chạy thuật toán Metropolis, chỉnh độ dài bước đề xuất và so sánh kết quả chuỗi với quét lưới.',
    ],
    en: [
      'Describe the parameter-inference loop: pick a point $\\boldsymbol\\theta$ in model space → compute the prediction → compare with fixed data via $\\chi^2$ → repeat.',
      'Read the Hubble diagram of 580 Type Ia supernovae (Union2.1) and explain why the data require accelerating expansion ($q_0 < 0$).',
      'Build 68 / 95 / 99.7% confidence regions from $\\Delta\\chi^2$ for two parameters and recognise the $\\Omega_m$–$\\Omega_\\Lambda$ degeneracy.',
      'Run the Metropolis algorithm, tune the proposal step and compare the chain with the grid scan.',
    ],
  },
  durationMin: 50,
  prerequisites: { vi: 'D8 - Khoảng cách trong vũ trụ học ($E(z)$, $D_M$, $d_L$, môđun khoảng cách); khái niệm phân bố chuẩn và độ lệch chuẩn.', en: 'D8 - Cosmological distances ($E(z)$, $D_M$, $d_L$, distance modulus); the normal distribution and standard deviation.' },
  background: [
    {
      title: { vi: 'Từ dữ liệu đến tham số', en: 'From data to parameters' },
      body: {
        vi: 'Năm 1998–1999, hai nhóm High-z Supernova Search Team (Riess và cộng sự 1998) và Supernova Cosmology Project (Perlmutter và cộng sự 1999) phát hiện các siêu tân tinh Ia xa **mờ hơn** dự đoán của mọi vũ trụ đang giảm tốc - bằng chứng cho sự giãn nở tăng tốc, được trao giải Nobel Vật lý 2011. Mô-đun F8 lặp lại phép suy luận đó trên dữ liệu thật: tập hợp **Union2.1** gồm 580 siêu tân tinh Ia, $0{,}015 \\le z \\le 1{,}414$ (Suzuki và cộng sự 2012). Mỗi cú bấm trên mặt phẳng tham số là một “vũ trụ thử”; máy tính đường cong $\\mu(z)$ của nó, so với dữ liệu và cho biết mức khớp.',
        en: 'In 1998–1999 the High-z Supernova Search Team (Riess et al. 1998) and the Supernova Cosmology Project (Perlmutter et al. 1999) found distant Type Ia supernovae to be **fainter** than any decelerating universe predicts - evidence for accelerating expansion, recognised by the 2011 Nobel Prize in Physics. Module F8 repeats that inference on real data: the **Union2.1** compilation of 580 SNe Ia at $0.015 \\le z \\le 1.414$ (Suzuki et al. 2012). Every click on the parameter plane is a “trial universe”; the computer evaluates its $\\mu(z)$ curve, compares it with the data and reports the fit.',
      },
    },
    {
      title: { vi: '1. Ngọn nến chuẩn hoá được', en: '1. Standardisable candles' },
      body: {
        vi: 'Siêu tân tinh Ia không hoàn toàn giống nhau, nhưng sự khác biệt tương quan với độ rộng đường cong ánh sáng (Phillips 1993) và màu. Union2.1 dùng hiệu chỉnh hai tham số (Tripp 1998):\n\n$$\\mu_B = m_B^{\\max} + \\alpha\\,x_1 - \\beta\\,c - M_B,$$\n\ntrong đó $m_B^{\\max}$ là cấp sao biểu kiến cực đại ở dải B, $x_1$ là tham số kéo giãn đường cong ánh sáng, $c$ là màu, $M_B$ là cấp sao tuyệt đối. Môđun khoảng cách liên hệ với lý thuyết qua\n\n$$\\mu = 5\\log_{10}\\frac{d_L}{1\\ \\text{Mpc}} + 25,\\qquad d_L = (1+z)\\,D_M(z;\\boldsymbol\\theta).$$\n\nVì $M_B$ và $H_0$ chỉ làm **dịch toàn bộ** $\\mu$ một hằng số, hai đại lượng này bị loại khỏi phép suy luận; chỉ **hình dạng** của $\\mu(z)$ mang thông tin về lịch sử giãn nở.',
        en: 'SNe Ia are not identical, but their differences correlate with light-curve width (Phillips 1993) and colour. Union2.1 uses a two-parameter correction (Tripp 1998):\n\n$$\\mu_B = m_B^{\\max} + \\alpha\\,x_1 - \\beta\\,c - M_B,$$\n\nwhere $m_B^{\\max}$ is the peak apparent B magnitude, $x_1$ the light-curve stretch, $c$ the colour and $M_B$ the absolute magnitude. The distance modulus connects to theory through\n\n$$\\mu = 5\\log_{10}\\frac{d_L}{1\\ \\text{Mpc}} + 25,\\qquad d_L = (1+z)\\,D_M(z;\\boldsymbol\\theta).$$\n\nBecause $M_B$ and $H_0$ only **shift all** $\\mu$ by a constant, both drop out of the inference; only the **shape** of $\\mu(z)$ carries information on the expansion history.',
      },
    },
    {
      title: { vi: '2. Vì sao siêu tân tinh “thấy” gia tốc', en: '2. Why supernovae “see” acceleration' },
      body: {
        vi: 'Khai triển ở $z$ nhỏ,\n\n$$d_L \\approx \\frac{cz}{H_0}\\left[1 + \\tfrac12(1 - q_0)\\,z\\right],\\qquad q_0 = \\tfrac12\\Omega_m - \\Omega_\\Lambda,$$\n\nnên với cùng $z$, vũ trụ tăng tốc ($q_0 < 0$) cho khoảng cách lớn hơn - siêu tân tinh mờ hơn. Vũ trụ **rỗng** ($\\Omega_m = \\Omega_\\Lambda = 0$, $q_0 = 0$) là ranh giới giữa tăng tốc và giảm tốc; vì vậy biểu đồ phần dư vẽ $\\mu - \\mu_{\\text{rỗng}}$. Các điểm ở $z \\approx 0{,}5$ nằm **trên** đường không: chúng xa hơn mức mọi vũ trụ giảm tốc cho phép.',
        en: 'At small $z$,\n\n$$d_L \\approx \\frac{cz}{H_0}\\left[1 + \\tfrac12(1 - q_0)\\,z\\right],\\qquad q_0 = \\tfrac12\\Omega_m - \\Omega_\\Lambda,$$\n\nso at a given $z$ an accelerating universe ($q_0 < 0$) gives a larger distance - fainter supernovae. The **empty** universe ($\\Omega_m = \\Omega_\\Lambda = 0$, $q_0 = 0$) separates acceleration from deceleration, so the residual panel plots $\\mu - \\mu_{\\rm empty}$. Points near $z \\approx 0.5$ lie **above** zero: they are farther than any decelerating universe allows.',
      },
    },
    {
      title: { vi: '3. Hàm $\\chi^2$ và vùng tin cậy', en: '3. The $\\chi^2$ function and confidence regions' },
      body: {
        vi: 'Với sai số Gauss độc lập, mức khớp của tham số $\\boldsymbol\\theta$ là\n\n$$\\chi^2(\\boldsymbol\\theta) = \\sum_{i=1}^{580} \\frac{\\left[\\mu_i - \\mu(z_i;\\boldsymbol\\theta) - \\mathcal M\\right]^2}{\\sigma_i^2},$$\n\ntrong đó $\\mathcal M$ là độ dịch chung gộp $M_B$ và $H_0$. Hàm hợp lý là $\\mathcal L \\propto e^{-\\chi^2/2}$. Với hai tham số, đường biên $\\Delta\\chi^2 = \\chi^2 - \\chi^2_{\\min} = 2{,}30$; $6{,}18$; $11{,}83$ bao các vùng có xác suất 68,3%; 95,4%; 99,73% (phân bố $\\chi^2$ hai bậc tự do). Vùng tin cậy là elip **kéo dài**: siêu tân tinh đo tốt tổ hợp $0{,}8\\,\\Omega_m - 0{,}6\\,\\Omega_\\Lambda \\approx -0{,}2$ (Perlmutter và cộng sự 1999) nhưng ít thông tin theo hướng vuông góc - đó là **suy biến**. Phông nền vi sóng (CMB) và dao động âm baryon (BAO) có suy biến theo hướng khác, nên kết hợp lại sẽ thu hẹp đáng kể.',
        en: 'With independent Gaussian errors, the fit of parameters $\\boldsymbol\\theta$ is\n\n$$\\chi^2(\\boldsymbol\\theta) = \\sum_{i=1}^{580} \\frac{\\left[\\mu_i - \\mu(z_i;\\boldsymbol\\theta) - \\mathcal M\\right]^2}{\\sigma_i^2},$$\n\nwhere $\\mathcal M$ is the common offset combining $M_B$ and $H_0$. The likelihood is $\\mathcal L \\propto e^{-\\chi^2/2}$. For two parameters the contours $\\Delta\\chi^2 = \\chi^2 - \\chi^2_{\\min} = 2.30$, $6.18$, $11.83$ enclose 68.3%, 95.4%, 99.73% probability (a two-degree-of-freedom $\\chi^2$ distribution). The regions are **elongated** ellipses: supernovae measure the combination $0.8\\,\\Omega_m - 0.6\\,\\Omega_\\Lambda \\approx -0.2$ well (Perlmutter et al. 1999) but carry little information in the perpendicular direction - a **degeneracy**. The cosmic microwave background (CMB) and baryon acoustic oscillations (BAO) are degenerate along other directions, so combining them shrinks the region sharply.',
      },
    },
    {
      title: { vi: '4. Chuỗi Markov Monte Carlo', en: '4. Markov chain Monte Carlo' },
      body: {
        vi: 'Quét lưới chỉ khả thi với vài tham số: $n$ tham số, mỗi trục 100 điểm, cần $100^n$ lần tính. Thuật toán **Metropolis** (Metropolis và cộng sự 1953) thay bằng một bước ngẫu nhiên: từ $\\boldsymbol\\theta$ đề xuất $\\boldsymbol\\theta\' = \\boldsymbol\\theta + \\boldsymbol\\epsilon$ và chấp nhận với xác suất\n\n$$P_{\\text{nhận}} = \\min\\!\\left(1,\\ e^{-[\\chi^2(\\boldsymbol\\theta\') - \\chi^2(\\boldsymbol\\theta)]/2}\\right).$$\n\nSau giai đoạn khởi động (*burn-in*), mật độ các điểm chuỗi đã ghé tỉ lệ với phân bố hậu nghiệm. Bước quá nhỏ thì gần như luôn được nhận nhưng đi chậm; bước quá lớn thì hay bị từ chối. Đây là công cụ mà các nhóm như Planck dùng để ước lượng đồng thời hàng chục tham số.',
        en: 'Grid scans are feasible only for a few parameters: $n$ parameters with 100 points per axis need $100^n$ evaluations. The **Metropolis** algorithm (Metropolis et al. 1953) replaces this with a random walk: from $\\boldsymbol\\theta$ propose $\\boldsymbol\\theta\' = \\boldsymbol\\theta + \\boldsymbol\\epsilon$ and accept with probability\n\n$$P_{\\rm acc} = \\min\\!\\left(1,\\ e^{-[\\chi^2(\\boldsymbol\\theta\') - \\chi^2(\\boldsymbol\\theta)]/2}\\right).$$\n\nAfter burn-in, the density of visited points is proportional to the posterior. Steps that are too small are almost always accepted but move slowly; steps that are too large are often rejected. Teams such as Planck use this tool to estimate dozens of parameters at once.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Vũ trụ không có năng lượng tối', en: 'Experiment 1 - A universe without dark energy' }, text: { vi: 'Điểm thử bắt đầu ở Einstein–de Sitter ($\\Omega_m = 1$, $\\Omega_\\Lambda = 0$). Trên biểu đồ phần dư, đường cong nằm ở đâu so với dữ liệu tại $z \\approx 0{,}5$? Đọc $\\Delta\\chi^2$ và giải thích vì sao mô hình này bị loại.', en: 'The trial starts at Einstein–de Sitter ($\\Omega_m = 1$, $\\Omega_\\Lambda = 0$). In the residual panel, where does the curve sit relative to the data near $z \\approx 0.5$? Read $\\Delta\\chi^2$ and explain why the model is excluded.' }, params: { m: 'olcdm', data: 'real', p1: 1, p2: 0 } },
    { title: { vi: 'Thử nghiệm 2 - Đi dọc thung lũng suy biến', en: 'Experiment 2 - Walk along the degeneracy valley' }, text: { vi: 'Lần lượt bấm $(\\Omega_m, \\Omega_\\Lambda) = (0{,}1;\\ 0{,}55)$, $(0{,}3;\\ 0{,}7)$, $(0{,}5;\\ 0{,}95)$. Tính $0{,}8\\,\\Omega_m - 0{,}6\\,\\Omega_\\Lambda$ cho từng điểm. Vì sao cả ba đều chấp nhận được? Dữ liệu nào giúp phá suy biến?', en: 'Click $(\\Omega_m, \\Omega_\\Lambda) = (0.1, 0.55)$, $(0.3, 0.7)$, $(0.5, 0.95)$ in turn. Compute $0.8\\,\\Omega_m - 0.6\\,\\Omega_\\Lambda$ for each. Why are all three acceptable? Which data would break the degeneracy?' }, params: { m: 'olcdm', data: 'real', p1: 0.1, p2: 0.55 } },
    { title: { vi: 'Thử nghiệm 3 - Vùng 68% có đúng 68%?', en: 'Experiment 3 - Is the 68% region really 68%?' }, text: { vi: 'Chọn “Giả lập” và rút lại nhiễu nhiều lần. Đếm số lần ngôi sao (đáp án thật) nằm trong vùng 68%. Với 20 lần thử, kết quả trong khoảng $68\\% \\pm 10\\%$ là phù hợp thống kê nhị thức.', en: 'Choose “Mock” and redraw the noise many times. Count how often the star (the truth) lies inside the 68% region. With 20 trials, $68\\% \\pm 10\\%$ is consistent with binomial statistics.' }, params: { m: 'olcdm', data: 'mock' } },
    { title: { vi: 'Thử nghiệm 4 - Chỉnh bước của chuỗi', en: 'Experiment 4 - Tune the chain step' }, text: { vi: 'Chạy chuỗi với bước × 0,1 rồi × 4. So sánh tỉ lệ chấp nhận, tốc độ chuỗi tìm tới vùng tin cậy, và độ lệch chuẩn ước lượng so với quét lưới.', en: 'Run the chain with step × 0.1 and then × 4. Compare the acceptance rate, how fast the chain reaches the confidence region, and the estimated standard deviations against the grid scan.' }, params: { m: 'olcdm', data: 'real', step: 0.1 } },
    { title: { vi: 'Thử nghiệm 5 - Năng lượng tối có phải hằng số vũ trụ?', en: 'Experiment 5 - Is dark energy a cosmological constant?' }, text: { vi: 'Chuyển sang mô hình $w$CDM phẳng. Giá trị $w = -1$ có nằm trong vùng 68% không? Vì sao chỉ dùng siêu tân tinh thì $w$ còn sai số khoảng $\\pm 0{,}2$?', en: 'Switch to flat $w$CDM. Is $w = -1$ inside the 68% region? Why does $w$ remain uncertain by about $\\pm 0.2$ with supernovae alone?' }, params: { m: 'wcdm', data: 'real' } },
  ],
  quiz: [
    { q: { vi: 'Trên biểu đồ phần dư, siêu tân tinh ở $z \\approx 0{,}5$ nằm phía trên đường “vũ trụ rỗng”. Điều đó nghĩa là:', en: 'In the residual panel, SNe at $z \\approx 0.5$ lie above the “empty universe” line. This means:' }, options: [{ vi: 'Chúng xa hơn (mờ hơn) mức mọi vũ trụ giảm tốc cho phép ⇒ tăng tốc', en: 'They are farther (fainter) than any decelerating universe allows ⇒ acceleration' }, { vi: 'Chúng gần hơn dự đoán', en: 'They are closer than predicted' }, { vi: '$H_0$ bị đo sai', en: '$H_0$ is mismeasured' }], answer: 0, explain: { vi: 'Vũ trụ rỗng ($q_0 = 0$) là ranh giới giữa tăng và giảm tốc; $H_0$ chỉ dịch toàn bộ đường cong và đã bị loại qua $\\mathcal M$.', en: 'The empty universe ($q_0 = 0$) separates acceleration from deceleration; $H_0$ only shifts the whole curve and is absorbed in $\\mathcal M$.' } },
    { q: { vi: 'Với hai tham số, vùng tin cậy 95% là:', en: 'For two parameters the 95% region is:' }, options: [{ vi: '$\\Delta\\chi^2 < 6{,}18$', en: '$\\Delta\\chi^2 < 6.18$' }, { vi: '$\\Delta\\chi^2 < 4$', en: '$\\Delta\\chi^2 < 4$' }, { vi: '$\\Delta\\chi^2 < 1$', en: '$\\Delta\\chi^2 < 1$' }], answer: 0, explain: { vi: '$\\Delta\\chi^2$ tuân theo phân bố $\\chi^2$ hai bậc tự do; $\\Delta\\chi^2 < 1$ và $< 4$ là các mức 68% và 95% cho **một** tham số.', en: '$\\Delta\\chi^2$ follows a two-degree-of-freedom $\\chi^2$ distribution; $\\Delta\\chi^2 < 1$ and $< 4$ are the 68% and 95% levels for **one** parameter.' } },
    { q: { vi: 'Metropolis chấp nhận một bước làm $\\chi^2$ tăng thêm 4 với xác suất:', en: 'Metropolis accepts a step that raises $\\chi^2$ by 4 with probability:' }, options: [{ vi: '$e^{-2} \\approx 13{,}5\\%$', en: '$e^{-2} \\approx 13.5\\%$' }, { vi: '0', en: '0' }, { vi: '50%', en: '50%' }], answer: 0, explain: { vi: '$P = \\min(1, e^{-\\Delta\\chi^2/2}) = e^{-2}$.', en: '$P = \\min(1, e^{-\\Delta\\chi^2/2}) = e^{-2}$.' } },
  ],
  instructor: {
    vi: 'Nguồn gốc: phát triển từ “How we infer model parameters” của lss-lab (github.com/MinhMPA/lss-lab). Bản gốc là hoạt cảnh minh hoạ trên dữ liệu giả; bản này suy luận thật trên bảng Union2.1 công khai của Supernova Cosmology Project, chỉ dùng sai số thống kê (không dùng ma trận hiệp phương sai hệ thống), nên vùng tin cậy **hẹp hơn** kết quả công bố có tính sai số hệ thống. Gợi ý thảo luận: vì sao $\\chi^2_{\\min}/\\nu \\approx 0{,}97$ lại là dấu hiệu tốt, và nếu tỉ số này bằng 3 thì ta nên nghi ngờ điều gì?',
    en: 'Origin: developed from lss-lab’s “How we infer model parameters” (github.com/MinhMPA/lss-lab). The original is an illustrative animation on fake data; this version performs real inference on the Supernova Cosmology Project’s public Union2.1 table with statistical errors only (no systematic covariance matrix), so its regions are **tighter** than the published ones that include systematics. Discussion: why is $\\chi^2_{\\min}/\\nu \\approx 0.97$ a good sign, and what should we suspect if the ratio were 3?',
  },
};

/** Model Card · F8. Measured figures: `npm run validate:sn` → docs/validation/F8-sn-inference.json. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Môđun khoảng cách và $\\chi^2$', en: 'Level A - Distance modulus and $\\chi^2$' },
      body: { vi: 'Tích phân $1/E(z)$ bằng quy tắc Simpson luỹ kế (bước con $\\le 0{,}01$), $D_M$ theo độ cong (sinh / sin); độ dịch $\\mathcal M$ bị loại bằng giải tích (Goliath và cộng sự 2001). Kiểm chứng với hàm khoảng cách tích phân thích nghi của D8.', en: 'Cumulative Simpson integration of $1/E(z)$ (sub-steps $\\le 0.01$), curvature-aware $D_M$ (sinh / sin); the offset $\\mathcal M$ is removed analytically (Goliath et al. 2001). Checked against D8’s adaptive-quadrature distance.' },
    },
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Dữ liệu thật Union2.1', en: 'Level A - Real Union2.1 data' },
      body: { vi: '580 SN Ia, $0{,}015 \\le z \\le 1{,}414$; $\\mu_i$ và $\\sigma_i$ lấy nguyên từ bảng công khai SCPUnion2.1_mu_vs_z.txt (Suzuki và cộng sự 2012), chuẩn hoá với $h = 0{,}7$. Chỉ dùng sai số thống kê trên đường chéo.', en: '580 SNe Ia, $0.015 \\le z \\le 1.414$; $\\mu_i$ and $\\sigma_i$ taken verbatim from the public table SCPUnion2.1_mu_vs_z.txt (Suzuki et al. 2012), standardised with $h = 0.7$. Diagonal statistical errors only.' },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Vùng tin cậy và MCMC', en: 'Level B - Confidence regions and MCMC' },
      body: { vi: 'Quét lưới $97 \\times 129$ với tiên nghiệm phẳng trong khung hiển thị; đường đồng mức $\\Delta\\chi^2$. Metropolis với bước đề xuất Gauss, bỏ 20% mẫu đầu làm giai đoạn khởi động. Kết quả hậu nghiệm phụ thuộc vào khung tiên nghiệm khi vùng tin cậy chạm biên.', en: '$97 \\times 129$ grid scan with flat priors over the displayed box; $\\Delta\\chi^2$ contours. Gaussian-proposal Metropolis, first 20% of samples discarded as burn-in. Posterior summaries depend on the prior box when a region touches its edge.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, B là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Mô hình và khoảng cách', en: '1. Models and distances' },
      tex: [
        'E^2(z)=\\Omega_m(1+z)^3+\\Omega_k(1+z)^2+\\Omega_\\Lambda,\\qquad \\Omega_k=1-\\Omega_m-\\Omega_\\Lambda',
        'E^2(z)=\\Omega_m(1+z)^3+(1-\\Omega_m)(1+z)^{3(1+w)}',
        'D_M=\\frac{D_H}{\\sqrt{|\\Omega_k|}}\\,S_k\\!\\left(\\sqrt{|\\Omega_k|}\\int_0^z\\frac{dz\'}{E(z\')}\\right),\\qquad \\mu=5\\log_{10}\\frac{(1+z)\\,D_M}{1\\ \\mathrm{Mpc}}+25',
      ],
      body: {
        vi: 'Trong đó dòng thứ nhất là ΛCDM có độ cong (tham số $\\Omega_m$, $\\Omega_\\Lambda$), dòng thứ hai là $w$CDM phẳng (tham số $\\Omega_m$, $w$); $D_H = c/H_0$ với $H_0 = 70$ km s⁻¹ Mpc⁻¹ theo chuẩn hoá Union2.1; $S_k = \\sinh$ khi $\\Omega_k > 0$, $\\sin$ khi $\\Omega_k < 0$, và $D_M = D_H\\int_0^z dz\'/E$ khi $\\Omega_k = 0$ (Hogg 1999). Bỏ qua bức xạ (sai lệch dưới 0,01 mag khi $z < 1{,}5$). Điểm có $E^2 \\le 0$ trên $[0, z_{\\max}]$ (không có Vụ Nổ Lớn) bị loại.',
        en: 'The first line is curved ΛCDM (parameters $\\Omega_m$, $\\Omega_\\Lambda$), the second flat $w$CDM (parameters $\\Omega_m$, $w$); $D_H = c/H_0$ with $H_0 = 70$ km s⁻¹ Mpc⁻¹ as in the Union2.1 standardisation; $S_k = \\sinh$ for $\\Omega_k > 0$, $\\sin$ for $\\Omega_k < 0$, and $D_M = D_H\\int_0^z dz\'/E$ for $\\Omega_k = 0$ (Hogg 1999). Radiation is neglected (under 0.01 mag for $z < 1.5$). Points with $E^2 \\le 0$ on $[0, z_{\\max}]$ (no Big Bang) are excluded.',
      },
    },
    {
      title: { vi: '2. Loại độ dịch $\\mathcal M$ bằng giải tích', en: '2. Analytic removal of the offset $\\mathcal M$' },
      tex: ['\\chi^2_{\\rm marg}=A-\\frac{B^2}{C},\\qquad A=\\sum_i\\frac{\\Delta_i^2}{\\sigma_i^2},\\quad B=\\sum_i\\frac{\\Delta_i}{\\sigma_i^2},\\quad C=\\sum_i\\frac{1}{\\sigma_i^2}'],
      body: {
        vi: 'Trong đó $\\Delta_i = \\mu_i - \\mu(z_i;\\boldsymbol\\theta)$. Biểu thức là cực tiểu của $\\chi^2$ theo $\\mathcal M$, đạt tại $\\mathcal M = B/C$; với tiên nghiệm phẳng trên $\\mathcal M$, lấy tích phân biên cho cùng kết quả sai khác một hằng số $\\ln(C/2\\pi)$ không phụ thuộc $\\boldsymbol\\theta$ (Goliath và cộng sự 2001).',
        en: 'Here $\\Delta_i = \\mu_i - \\mu(z_i;\\boldsymbol\\theta)$. The expression is the minimum of $\\chi^2$ over $\\mathcal M$, reached at $\\mathcal M = B/C$; with a flat prior on $\\mathcal M$, marginalising gives the same result up to a $\\boldsymbol\\theta$-independent constant $\\ln(C/2\\pi)$ (Goliath et al. 2001).',
      },
    },
    {
      title: { vi: '3. Vùng tin cậy, hậu nghiệm và gia tốc', en: '3. Confidence regions, posterior and acceleration' },
      tex: ['\\Delta\\chi^2=2.30,\\ 6.18,\\ 11.83\\ \\leftrightarrow\\ 68.3\\%,\\ 95.4\\%,\\ 99.73\\%', 'q_0=\\tfrac12\\Omega_m-\\Omega_\\Lambda,\\qquad q_0^{\\,w\\rm CDM}=\\tfrac12\\left[1+3w(1-\\Omega_m)\\right]', 'P_{\\rm acc}=\\min\\!\\left(1,\\ e^{-\\Delta\\chi^2/2}\\right)'],
      body: {
        vi: 'Ngưỡng $\\Delta\\chi^2$ là phân vị của phân bố $\\chi^2$ hai bậc tự do (Press và cộng sự 2007, §15.6). Trung bình, độ lệch chuẩn biên và xác suất $P(q_0 < 0)$ được tính bằng trọng số $e^{-\\Delta\\chi^2/2}$ trên lưới (tiên nghiệm phẳng). Metropolis đề xuất bước Gauss độc lập cho từng tham số; mẫu nằm ngoài khung hoặc trong vùng không có Vụ Nổ Lớn bị từ chối.',
        en: 'The $\\Delta\\chi^2$ thresholds are quantiles of the two-degree-of-freedom $\\chi^2$ distribution (Press et al. 2007, §15.6). Means, marginal standard deviations and $P(q_0 < 0)$ use weights $e^{-\\Delta\\chi^2/2}$ on the grid (flat priors). Metropolis proposes independent Gaussian steps per parameter; samples outside the box or in the no-Big-Bang region are rejected.',
      },
    },
  ],
  assumptions: {
    vi: ['Sai số Gauss, độc lập (chỉ đường chéo); không dùng ma trận hiệp phương sai hệ thống của Union2.1.', 'Các tham số chuẩn hoá $\\alpha$, $\\beta$ được giữ như nhóm SCP đã khớp; không khớp lại đồng thời.', 'Tiên nghiệm phẳng trên khung tham số hiển thị.'],
    en: ['Gaussian, independent errors (diagonal only); the Union2.1 systematic covariance matrix is not used.', 'The standardisation parameters $\\alpha$, $\\beta$ are held at the SCP fit; they are not refitted jointly.', 'Flat priors over the displayed parameter box.'],
  },
  validity: {
    vi: ['ΛCDM có độ cong: $\\Omega_m \\in [0;\\ 1{,}2]$, $\\Omega_\\Lambda \\in [0;\\ 1{,}6]$.', '$w$CDM phẳng: $\\Omega_m \\in [0{,}05;\\ 0{,}65]$, $w \\in [-2{,}2;\\ -0{,}2]$ (hằng số theo thời gian).'],
    en: ['Curved ΛCDM: $\\Omega_m \\in [0, 1.2]$, $\\Omega_\\Lambda \\in [0, 1.6]$.', 'Flat $w$CDM: $\\Omega_m \\in [0.05, 0.65]$, $w \\in [-2.2, -0.2]$ (constant in time).'],
  },
  scope: { vi: 'Kiểm chứng gồm độ chính xác của $\\mu(z)$, phép loại độ dịch, các khớp trên dữ liệu thật và phép thử phủ trên dữ liệu giả lập.', en: 'Validation covers the accuracy of $\\mu(z)$, the offset removal, the fits to real data and a coverage test on mock data.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:sn\` → \`docs/validation/F8-sn-inference.json\`; ngưỡng khoá trong \`packages/sim-core/test/sn-f8.test.ts\`.

- **Độ chính xác $\\mu(z)$:** sai lệch lớn nhất so với tích phân thích nghi của D8 là $3{,}4\\times10^{-9}$ mag cho vũ trụ phẳng, mở, đóng và Einstein–de Sitter.
- **Loại độ dịch:** $A - B^2/C$ trùng với cực tiểu tìm bằng quét $\\mathcal M$ tới 6 chữ số thập phân.
- **ΛCDM phẳng** (Union2.1, chỉ sai số thống kê): $\\Omega_m = 0{,}278$, khoảng $\\Delta\\chi^2 = 1$ là $[0{,}258;\\ 0{,}298]$.
- **ΛCDM có độ cong:** điểm tốt nhất $(\\Omega_m, \\Omega_\\Lambda) = (0{,}28;\\ 0{,}73)$, $\\chi^2_{\\min} = 562{,}2$ với $\\nu = 577$ bậc tự do ($\\chi^2_{\\min}/\\nu = 0{,}97$); hậu nghiệm $\\Omega_m = 0{,}27 \\pm 0{,}07$, $\\Omega_\\Lambda = 0{,}71 \\pm 0{,}12$; $P(q_0 < 0) > 99{,}9999\\%$.
- **$w$CDM phẳng:** $w = -1{,}03 \\pm 0{,}20$, phù hợp hằng số vũ trụ $w = -1$.
- **Phủ trên dữ liệu giả lập:** 20 bộ dữ liệu với đáp án $(0{,}3;\\ 0{,}7)$ và cùng $z_i$, $\\sigma_i$ như Union2.1; vùng 68% chứa đáp án 13/20 lần (65%), phù hợp kỳ vọng nhị thức $68\\% \\pm 10\\%$.
- **Metropolis:** tái tạo phân bố Gauss 2D có tương quan (trung bình và $\\sigma$ sai lệch dưới 10%, tỉ lệ chấp nhận trên 20%).`,
    en: `Reproducible report: \`npm run validate:sn\` → \`docs/validation/F8-sn-inference.json\`; thresholds locked in \`packages/sim-core/test/sn-f8.test.ts\`.

- **Accuracy of $\\mu(z)$:** largest deviation from D8’s adaptive quadrature is $3.4\\times10^{-9}$ mag for flat, open, closed and Einstein–de Sitter universes.
- **Offset removal:** $A - B^2/C$ agrees with the minimum found by scanning $\\mathcal M$ to 6 decimal places.
- **Flat ΛCDM** (Union2.1, statistical errors only): $\\Omega_m = 0.278$, $\\Delta\\chi^2 = 1$ interval $[0.258, 0.298]$.
- **Curved ΛCDM:** best fit $(\\Omega_m, \\Omega_\\Lambda) = (0.28, 0.73)$, $\\chi^2_{\\min} = 562.2$ for $\\nu = 577$ degrees of freedom ($\\chi^2_{\\min}/\\nu = 0.97$); posterior $\\Omega_m = 0.27 \\pm 0.07$, $\\Omega_\\Lambda = 0.71 \\pm 0.12$; $P(q_0 < 0) > 99.9999\\%$.
- **Flat $w$CDM:** $w = -1.03 \\pm 0.20$, consistent with a cosmological constant $w = -1$.
- **Mock coverage:** 20 catalogues with truth $(0.3, 0.7)$ and the same $z_i$, $\\sigma_i$ as Union2.1; the 68% region contains the truth 13/20 times (65%), consistent with the binomial expectation $68\\% \\pm 10\\%$.
- **Metropolis:** reproduces a correlated 2D Gaussian (mean and $\\sigma$ within 10%, acceptance above 20%).`,
  },
  validation: { vi: [], en: [] },
  errors: {
    vi: ['Độ phân giải lưới: $\\approx 0{,}0125$ theo cả $\\Omega_m$ và $\\Omega_\\Lambda$; $\\approx 0{,}006$ theo $\\Omega_m$ và $\\approx 0{,}016$ theo $w$.'],
    en: ['Grid resolution: $\\approx 0.0125$ in both $\\Omega_m$ and $\\Omega_\\Lambda$; $\\approx 0.006$ in $\\Omega_m$ and $\\approx 0.016$ in $w$.'],
  },
  limitations: {
    vi: ['Không tính sai số hệ thống (hiệu chuẩn, tiến hoá, chọn mẫu) nên vùng tin cậy hẹp hơn kết quả công bố.', 'Chỉ dùng siêu tân tinh; không kết hợp CMB hay BAO.', '$w$ không đổi theo thời gian; không có mô hình $w_0w_a$.'],
    en: ['No systematic errors (calibration, evolution, selection), so regions are tighter than the published ones.', 'Supernovae only; no CMB or BAO combination.', 'Time-independent $w$; no $w_0w_a$ model.'],
  },
  references: [
    'Suzuki, N. et al. (2012). The Hubble Space Telescope Cluster Supernova Survey. V. Improving the dark-energy constraints above z > 1 and building an early-type-hosted supernova sample. ApJ 746, 85.',
    'Riess, A. G. et al. (1998). Observational evidence from supernovae for an accelerating universe and a cosmological constant. AJ 116, 1009.',
    'Perlmutter, S. et al. (1999). Measurements of Ω and Λ from 42 high-redshift supernovae. ApJ 517, 565.',
    'Phillips, M. M. (1993). The absolute magnitudes of Type IA supernovae. ApJ 413, L105.',
    'Tripp, R. (1998). A two-parameter luminosity correction for Type IA supernovae. A&A 331, 815.',
    'Goliath, M., Amanullah, R., Astier, P., Goobar, A. & Pain, R. (2001). Supernovae and the nature of the dark energy. A&A 380, 6.',
    'Hogg, D. W. (1999). Distance measures in cosmology. arXiv:astro-ph/9905116.',
    'Metropolis, N., Rosenbluth, A. W., Rosenbluth, M. N., Teller, A. H. & Teller, E. (1953). Equation of state calculations by fast computing machines. J. Chem. Phys. 21, 1087.',
    'Hastings, W. K. (1970). Monte Carlo sampling methods using Markov chains and their applications. Biometrika 57, 97.',
    'Press, W. H., Teukolsky, S. A., Vetterling, W. T. & Flannery, B. P. (2007). Numerical Recipes, 3rd ed., §15.6. Cambridge University Press.',
    'lss-lab - How we infer model parameters (github.com/MinhMPA/lss-lab).',
  ],
};
