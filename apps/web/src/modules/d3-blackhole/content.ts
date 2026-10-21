import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Xác định các bán kính đặc trưng của hố đen Schwarzschild: chân trời sự kiện $2M$, mặt cầu photon $3M$, ISCO $6M$ và tham số va chạm tới hạn $3\\sqrt3\\,M$.',
      'Giải thích vì sao bóng hố đen lớn hơn chân trời khoảng 2,6 lần và vì sao phần đĩa phía sau hiện lên trên và dưới bóng.',
      'Giải thích sự bất đối xứng độ sáng của đĩa bồi tụ bằng hiệu ứng Doppler, chùm tia tương đối tính và dịch đỏ hấp dẫn.',
      'So sánh thời gian riêng của người rơi tự do với thời gian toạ độ của người quan sát ở xa, và ước lượng lực thuỷ triều tại chân trời.',
    ],
    en: [
      'Identify the characteristic radii of a Schwarzschild black hole: the event horizon $2M$, the photon sphere $3M$, the ISCO $6M$ and the critical impact parameter $3\\sqrt3\\,M$.',
      'Explain why the shadow is about 2.6 times larger than the horizon and why the far side of the disk appears above and below it.',
      'Explain the disk’s brightness asymmetry through the Doppler effect, relativistic beaming and gravitational redshift.',
      'Compare the free-faller’s proper time with a distant observer’s coordinate time and estimate tidal forces at the horizon.',
    ],
  },
  durationMin: 45,
  prerequisites: { vi: 'D2 - Geodesic Schwarzschild, thế hiệu dụng; C4 - hiệu ứng Doppler tương đối tính.', en: 'D2 - Schwarzschild geodesics, effective potential; C4 - relativistic Doppler effect.' },
  background: [
    {
      title: { vi: 'Nhìn một hố đen', en: 'Looking at a black hole' },
      body: {
        vi: 'Hố đen không phát sáng, nhưng ánh sáng của vật chất xung quanh bị không–thời gian bẻ cong mạnh trước khi tới máy ảnh. Mô-đun D3 tạo ảnh bằng **dò tia ngược**: với mỗi điểm ảnh, một tia sáng được truy ngược từ máy ảnh để biết nó đến từ đâu. Năm 2019, Event Horizon Telescope công bố ảnh đầu tiên của bóng hố đen M87*; ảnh của Sgr A* ở tâm Ngân Hà công bố năm 2022.',
        en: 'A black hole does not shine, but light from surrounding matter is strongly bent by spacetime before reaching the camera. Module D3 builds images by **backward ray tracing**: for each pixel a light ray is traced back from the camera to find where it came from. In 2019 the Event Horizon Telescope published the first image of a black-hole shadow, M87*; the image of Sgr A* at the Galactic Centre followed in 2022.',
      },
    },
    {
      title: { vi: '1. Các bán kính đặc trưng', en: '1. Characteristic radii' },
      body: {
        vi: 'Với hố đen Schwarzschild khối lượng $M$ (đơn vị $G = c = 1$):\n\n- **Chân trời sự kiện** $r = 2M$, tức $r_s = 2GM/c^2$ (khoảng 2,95 km cho một khối lượng Mặt Trời).\n- **Mặt cầu photon** $r = 3M$: ánh sáng có thể chạy trên quỹ đạo tròn, nhưng quỹ đạo này **không bền**.\n- **ISCO** $r = 6M$: quỹ đạo tròn bền trong cùng của vật chất, mép trong của đĩa bồi tụ mỏng.\n- **Tham số va chạm tới hạn** $b_c = 3\\sqrt3\\,M \\approx 5{,}196\\,M$: tia sáng tới từ vô cực với $b < b_c$ bị bắt.\n\nVì vậy bóng nhìn từ rất xa có bán kính góc tương ứng $b_c$, lớn hơn chân trời $3\\sqrt3/2 \\approx 2{,}6$ lần.',
        en: 'For a Schwarzschild black hole of mass $M$ (units $G = c = 1$):\n\n- **Event horizon** $r = 2M$, i.e. $r_s = 2GM/c^2$ (about 2.95 km per solar mass).\n- **Photon sphere** $r = 3M$: light can travel on a circular orbit, but the orbit is **unstable**.\n- **ISCO** $r = 6M$: the innermost stable circular orbit of matter, the inner edge of a thin accretion disk.\n- **Critical impact parameter** $b_c = 3\\sqrt3\\,M \\approx 5.196\\,M$: rays arriving from infinity with $b < b_c$ are captured.\n\nThe shadow seen from very far therefore corresponds to $b_c$, about $3\\sqrt3/2 \\approx 2.6$ times the horizon radius.',
      },
    },
    {
      title: { vi: '2. Quỹ đạo ánh sáng và dò tia ngược', en: '2. Light orbits and backward ray tracing' },
      body: {
        vi: 'Một tia sáng luôn nằm trong một mặt phẳng đi qua tâm hố đen. Với $u = 1/r$, phương trình quỹ đạo chính xác của ánh sáng là\n\n$$\\frac{d^2u}{d\\varphi^2} + u = 3Mu^2.$$\n\nSố hạng $3Mu^2$ là toàn bộ khác biệt so với đường thẳng ($u\'\' + u = 0$). Máy ảnh là một người quan sát **đứng yên** tại bán kính $r_{\\rm obs}$; một tia rời máy ảnh với góc $\\alpha$ so với hướng tới tâm có\n\n$$u\'(0) = u_0\\sqrt{1 - 2Mu_0}\\,\\cot\\alpha.$$\n\nTia đi qua $r = 2M$: điểm ảnh đen. Tia cắt mặt phẳng đĩa giữa mép trong và mép ngoài: lấy màu đĩa. Tia ra xa: lấy màu bầu trời theo hướng cuối cùng. Các tia đi sát mặt cầu photon quấn nhiều vòng và tạo nên **nhẫn photon** mảnh ở mép bóng.',
        en: 'A light ray always lies in a plane through the centre of the hole. With $u = 1/r$ the exact light-orbit equation is\n\n$$\\frac{d^2u}{d\\varphi^2} + u = 3Mu^2.$$\n\nThe $3Mu^2$ term is the whole difference from a straight line ($u\'\' + u = 0$). The camera is an observer **at rest** at radius $r_{\\rm obs}$; a ray leaving it at angle $\\alpha$ from the inward radial direction has\n\n$$u\'(0) = u_0\\sqrt{1 - 2Mu_0}\\,\\cot\\alpha.$$\n\nA ray crossing $r = 2M$ gives a black pixel. A ray crossing the disk plane between the inner and outer edges takes the disk colour. An escaping ray takes the sky colour in its final direction. Rays skimming the photon sphere wind around several times and form the thin **photon ring** at the edge of the shadow.',
      },
    },
    {
      title: { vi: '3. Kích thước bóng nhìn từ khoảng cách hữu hạn', en: '3. Shadow size from a finite distance' },
      body: {
        vi: 'Với máy ảnh đứng yên tại $r_{\\rm obs}$, bán kính góc của bóng được Synge (1966) cho bởi\n\n$$\\sin\\alpha_{\\rm sh} = \\frac{3\\sqrt3\\,M}{r_{\\rm obs}}\\sqrt{1 - \\frac{2M}{r_{\\rm obs}}}.$$\n\nKhi $r_{\\rm obs} \\gg M$, $\\alpha_{\\rm sh} \\approx 3\\sqrt3\\,M/r_{\\rm obs}$. Với M87* ($M \\approx 6{,}5\\times10^9\\,M_\\odot$, khoảng cách 16,8 Mpc) biểu thức này cho đường kính bóng khoảng 40 micro giây cung, cùng bậc với vành sáng khoảng 42 µas mà EHT quan sát được.',
        en: 'For a camera at rest at $r_{\\rm obs}$ the angular radius of the shadow is given by Synge (1966):\n\n$$\\sin\\alpha_{\\rm sh} = \\frac{3\\sqrt3\\,M}{r_{\\rm obs}}\\sqrt{1 - \\frac{2M}{r_{\\rm obs}}}.$$\n\nFor $r_{\\rm obs} \\gg M$, $\\alpha_{\\rm sh} \\approx 3\\sqrt3\\,M/r_{\\rm obs}$. For M87* ($M \\approx 6.5\\times10^9\\,M_\\odot$, distance 16.8 Mpc) this gives a shadow diameter of about 40 microarcseconds, the same order as the ≈ 42 µas ring observed by the EHT.',
      },
    },
    {
      title: { vi: '4. Vì sao một bên đĩa sáng hơn', en: '4. Why one side of the disk is brighter' },
      body: {
        vi: 'Khí trong đĩa quay rất nhanh: tại ISCO, tốc độ đo bởi người quan sát tĩnh tại chỗ là $\\sqrt{M/(r - 2M)} = 0{,}5c$. Tần số nhận được thay đổi theo hệ số\n\n$$g = \\frac{\\nu_{\\rm obs}}{\\nu_{\\rm em}} = \\frac{\\sqrt{1 - 3M/r}}{(1 - \\Omega\\,L_z)\\sqrt{1 - 2M/r_{\\rm obs}}},\\qquad \\Omega = \\sqrt{M/r^3},$$\n\ntrong đó $L_z$ là thành phần mômen động lượng của photon theo trục quay của đĩa. Tử số chứa dịch đỏ hấp dẫn và giãn thời gian do chuyển động quỹ đạo; mẫu số chứa hiệu ứng Doppler. Vì $I_\\nu/\\nu^3$ bất biến, cường độ tổng (bolometric) biến đổi theo $g^4$: phía tiến lại gần sáng và xanh hơn, phía lùi ra xa tối và đỏ hơn.',
        en: 'Disk gas moves very fast: at the ISCO the speed measured by a local static observer is $\\sqrt{M/(r - 2M)} = 0.5c$. The received frequency changes by the factor\n\n$$g = \\frac{\\nu_{\\rm obs}}{\\nu_{\\rm em}} = \\frac{\\sqrt{1 - 3M/r}}{(1 - \\Omega\\,L_z)\\sqrt{1 - 2M/r_{\\rm obs}}},\\qquad \\Omega = \\sqrt{M/r^3},$$\n\nwhere $L_z$ is the photon’s angular momentum about the disk axis. The numerator contains gravitational redshift and orbital time dilation; the denominator the Doppler effect. Since $I_\\nu/\\nu^3$ is invariant, the bolometric intensity scales as $g^4$: the approaching side is brighter and bluer, the receding side dimmer and redder.',
      },
    },
    {
      title: { vi: '5. Rơi vào: hai đồng hồ và lực thuỷ triều', en: '5. Falling in: two clocks and tidal forces' },
      body: {
        vi: 'Một người rơi tự do từ rất xa ($E = 1$) đi từ $r_0$ tới $r$ trong thời gian riêng hữu hạn\n\n$$\\tau = \\frac23\\,\\frac{r_0^{3/2} - r^{3/2}}{\\sqrt{2M}},$$\n\nkể cả khi qua chân trời. Nhưng thời gian toạ độ $t$ của người quan sát ở xa **tiến tới vô cùng** khi $r \\to 2M$: người ở xa thấy người rơi chậm dần và mờ đi vì dịch đỏ. Hai mô tả không mâu thuẫn; chân trời không phải bề mặt vật chất.\n\nChênh lệch gia tốc theo phương bán kính giữa hai đầu một vật dài $\\ell$ là $\\Delta a \\approx 2GM\\ell/r^3$. Tại chân trời $r = 2GM/c^2$, $\\Delta a \\propto 1/M^2$: với hố đen khối lượng sao lực thuỷ triều có thể xé nát cơ thể người, còn với hố đen siêu khối lượng như Sgr A* thì nhỏ.',
        en: 'A free-faller starting from far away ($E = 1$) goes from $r_0$ to $r$ in the finite proper time\n\n$$\\tau = \\frac23\\,\\frac{r_0^{3/2} - r^{3/2}}{\\sqrt{2M}},$$\n\neven across the horizon. But the distant observer’s coordinate time $t$ **diverges** as $r \\to 2M$: from afar the faller slows down and fades through redshift. The two descriptions do not conflict; the horizon is not a material surface.\n\nThe radial difference in acceleration across a body of length $\\ell$ is $\\Delta a \\approx 2GM\\ell/r^3$. At the horizon $r = 2GM/c^2$, $\\Delta a \\propto 1/M^2$: for a stellar-mass hole the tides can tear a human body apart, while for a supermassive hole such as Sgr A* they are small.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Nhìn gần ngang mặt phẳng đĩa', en: 'Experiment 1 - An almost edge-on view' }, text: { vi: 'Đặt góc nghiêng 88°. Phần đĩa nằm phía sau hố đen hiện lên trên và dưới bóng. Giải thích bằng quỹ đạo của các tia sáng đi vòng qua hố đen.', en: 'Set the inclination to 88°. The part of the disk behind the hole appears above and below the shadow. Explain using the paths of rays bent around the hole.' }, params: { incl: 88, r: 30, disk: true, bg: 'stars' } },
    { title: { vi: 'Thử nghiệm 2 - Kích thước bóng', en: 'Experiment 2 - The size of the shadow' }, text: { vi: 'Tắt đĩa và bật lớp phủ. Đổi $r_{\\rm obs}$ từ 8M tới 120M và so kích thước bóng với công thức Synge. Vì sao ở xa, bóng tiến tới $3\\sqrt3\\,M/r_{\\rm obs}$?', en: 'Turn off the disk and turn on the overlay. Vary $r_{\\rm obs}$ from 8M to 120M and compare the shadow with Synge’s formula. Why does it approach $3\\sqrt3\\,M/r_{\\rm obs}$ far away?' }, params: { disk: false, ov: true, r: 30 } },
    { title: { vi: 'Thử nghiệm 3 - Lưới bầu trời bị bẻ cong', en: 'Experiment 3 - A warped sky grid' }, text: { vi: 'Chọn nền “lưới”. Tìm vòng Einstein và các ảnh lặp lại sát mép bóng (nhẫn photon). Vì sao các ảnh này càng gần mép càng mảnh?', en: 'Choose the “grid” background. Find the Einstein ring and the repeated images near the shadow edge (photon ring). Why are they thinner the closer they are to the edge?' }, params: { disk: false, bg: 'grid', r: 25, incl: 70 } },
    { title: { vi: 'Thử nghiệm 4 - Tắt Doppler', en: 'Experiment 4 - Turn off Doppler' }, text: { vi: 'Tắt “Doppler và dịch đỏ” rồi bật lại. Phần nào của sự bất đối xứng đến từ chuyển động quỹ đạo, phần nào đến từ dịch đỏ hấp dẫn?', en: 'Turn “Doppler and redshift” off and on again. Which part of the asymmetry comes from orbital motion and which from gravitational redshift?' }, params: { dop: false, disk: true, incl: 75 } },
    { title: { vi: 'Thử nghiệm 5 - Lực thuỷ triều', en: 'Experiment 5 - Tidal forces' }, text: { vi: 'Trong mục “Rơi vào”, so sánh lực thuỷ triều tại chân trời của hố đen 10 $M_\\odot$ với Sgr A*. Dùng $\\Delta a \\propto 1/M^2$ để giải thích vì sao hố đen lớn lại “hiền” hơn.', en: 'In “Infall”, compare the tidal acceleration at the horizon of a 10 $M_\\odot$ hole with Sgr A*. Use $\\Delta a \\propto 1/M^2$ to explain why the bigger hole is gentler.' }, params: { mass: 'stellar' } },
  ],
  quiz: [
    { q: { vi: 'Nhìn từ rất xa, bán kính bóng hố đen so với bán kính chân trời là:', en: 'Seen from very far, the shadow radius compared with the horizon radius is:' }, options: [{ vi: 'Khoảng 2,6 lần', en: 'About 2.6×' }, { vi: 'Bằng nhau', en: 'Equal' }, { vi: '1,5 lần', en: '1.5×' }], answer: 0, explain: { vi: '$3\\sqrt3\\,M / 2M \\approx 2{,}6$: ánh sáng bị bẻ cong làm bóng to hơn chân trời.', en: '$3\\sqrt3\\,M / 2M \\approx 2.6$: light bending makes the shadow larger than the horizon.' } },
    { q: { vi: 'Quỹ đạo tròn của ánh sáng tại $r = 3M$:', en: 'Circular light orbits at $r = 3M$ are:' }, options: [{ vi: 'Không bền', en: 'Unstable' }, { vi: 'Bền', en: 'Stable' }, { vi: 'Không tồn tại', en: 'Impossible' }], answer: 0, explain: { vi: 'Chúng nằm ở đỉnh của thế hiệu dụng cho ánh sáng; nhiễu nhỏ làm photon rơi vào hoặc thoát ra.', en: 'They sit at the top of the light’s effective potential; small perturbations send photons in or out.' } },
    { q: { vi: 'Theo đồng hồ của chính mình, người rơi vào hố đen đi qua chân trời sau:', en: 'By their own clock, an infaller crosses the horizon after:' }, options: [{ vi: 'Một thời gian hữu hạn', en: 'A finite time' }, { vi: 'Thời gian vô hạn', en: 'An infinite time' }], answer: 0, explain: { vi: 'Thời gian riêng hữu hạn; chỉ thời gian toạ độ của người ở xa phân kỳ.', en: 'Proper time is finite; only the distant observer’s coordinate time diverges.' } },
    { q: { vi: 'Cường độ bolometric của đĩa biến đổi theo hệ số dịch tần số $g$ như:', en: 'The disk’s bolometric intensity scales with the frequency-shift factor $g$ as:' }, options: [{ vi: '$g^4$', en: '$g^4$' }, { vi: '$g$', en: '$g$' }, { vi: '$g^2$', en: '$g^2$' }], answer: 0, explain: { vi: '$I_\\nu/\\nu^3$ bất biến nên $I_\\nu \\propto g^3$; tích phân theo tần số thêm một thừa số $g$.', en: '$I_\\nu/\\nu^3$ is invariant so $I_\\nu \\propto g^3$; integrating over frequency adds one more factor of $g$.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Luminet (1979) A&A 75, 228 - ảnh đầu tiên của hố đen với đĩa mỏng; James và cộng sự (2015) CQG 32, 065001 - kết xuất cho phim Interstellar; EHT Collaboration (2019) ApJL 875, L1. Nhấn mạnh hệ quy chiếu: ảnh là những gì một **máy ảnh đứng yên tại $r_{\\rm obs}$** ghi lại. Ở cấp Chuyên sâu có thể thảo luận vì sao ảnh EHT thật khác ảnh đĩa mỏng (plasma quang học mỏng, phát xạ synchrotron, độ phân giải hữu hạn).',
    en: 'Resources: Luminet (1979) A&A 75, 228 - the first image of a black hole with a thin disk; James et al. (2015) CQG 32, 065001 - rendering for the film Interstellar; EHT Collaboration (2019) ApJL 875, L1. Stress the frame: the image is what a **camera at rest at $r_{\\rm obs}$** records. At the Advanced level, discuss why real EHT images differ from thin-disk images (optically thin plasma, synchrotron emission, finite resolution).',
  },
};

/** Model Card · D3. Measured figures: `npm run validate:shadow` → docs/validation/D3-shadow.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Bán kính đặc trưng, thời gian rơi, lực thuỷ triều', en: 'Level A - Characteristic radii, infall times, tides' },
      body: { vi: 'Các bán kính đặc trưng, bán kính góc của bóng (Synge 1966), thời gian riêng và thời gian toạ độ khi rơi, gia tốc thuỷ triều được tính giải tích trên float64.', en: 'Characteristic radii, the shadow’s angular radius (Synge 1966), proper and coordinate infall times and tidal accelerations are analytic, in float64.' },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Dò tia trên GPU', en: 'Level B - GPU ray tracing' },
      body: { vi: 'Mỗi điểm ảnh tích phân phương trình quỹ đạo ánh sáng chính xác bằng RK4 bước cố định trên GPU (float32). Sai số được đo bằng một bản sao trên CPU của chính vòng lặp shader và so với nghiệm Synge.', en: 'Each pixel integrates the exact light-orbit equation with fixed-step RK4 on the GPU (float32). The error is measured with a CPU copy of the same shader loop against Synge’s solution.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Đĩa và bầu trời', en: 'Level C - Disk and sky' },
      body: { vi: 'Đĩa dùng profile thông lượng Newton (không phải Novikov–Thorne), màu vật đen với nhiệt độ đỉnh giả định 4 600 K và hoa văn quay trang trí; sao nền được tạo theo thủ tục.', en: 'The disk uses a Newtonian flux profile (not Novikov–Thorne), a blackbody palette with an assumed 4,600 K peak temperature and a decorative streak texture; background stars are procedural.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, B, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Quỹ đạo tia sáng và điều kiện đầu', en: '1. Ray orbits and initial conditions' },
      tex: ["\\frac{d^2u}{d\\varphi^2}+u=3Mu^2,\\qquad u'(0)=u_0\\sqrt{1-2Mu_0}\\,\\cot\\alpha", 'b_c=3\\sqrt3\\,M,\\qquad \\sin\\alpha_{\\rm sh}=\\frac{3\\sqrt3\\,M}{r_{\\rm obs}}\\sqrt{1-\\frac{2M}{r_{\\rm obs}}}'],
      body: {
        vi: 'Trong đó $u = 1/r$, $\\varphi$ là góc trong mặt phẳng của tia, $u_0 = 1/r_{\\rm obs}$, $\\alpha$ là góc giữa tia và hướng tới tâm trong hệ cục bộ của máy ảnh đứng yên. Bước $\\Delta\\varphi = 0{,}012$ rad (1 100 bước, chất lượng cao) hoặc 0,02 rad (650 bước, tiết kiệm). Tia quấn hơn khoảng hai vòng quanh mặt cầu photon bị cắt và tô đen.',
        en: '$u = 1/r$, $\\varphi$ the angle in the ray’s plane, $u_0 = 1/r_{\\rm obs}$, $\\alpha$ the angle between the ray and the inward direction in the static camera’s local frame. Step $\\Delta\\varphi = 0.012$ rad (1,100 steps, high quality) or 0.02 rad (650 steps, saver). Rays winding more than about two turns around the photon sphere are truncated and drawn black.',
      },
    },
    {
      title: { vi: '2. Dịch tần số và độ sáng của đĩa', en: '2. Frequency shift and disk brightness' },
      tex: ['g=\\frac{\\sqrt{1-3M/r}}{(1-\\Omega L_z)\\sqrt{1-2M/r_{\\rm obs}}},\\qquad \\Omega=\\sqrt{M/r^3},\\qquad I_{\\rm obs}\\propto g^4F(r)', 'F(r)\\propto r^{-3}\\left(1-\\sqrt{r_{\\rm in}/r}\\right)'],
      body: {
        vi: 'Trong đó $\\Omega$ là tốc độ góc Kepler của khí trên quỹ đạo tròn bán kính $r$, $L_z$ là mômen động lượng của photon quanh trục đĩa (chuẩn theo năng lượng), $F(r)$ là thông lượng phát xạ của đĩa mỏng theo dạng Newton của Shakura & Sunyaev (1973) với mép trong $r_{\\rm in}$.',
        en: '$\\Omega$ is the Keplerian angular velocity of gas on a circular orbit of radius $r$, $L_z$ the photon’s angular momentum about the disk axis (per unit energy), $F(r)$ the thin-disk emitted flux in the Newtonian form of Shakura & Sunyaev (1973) with inner edge $r_{\\rm in}$.',
      },
    },
    {
      title: { vi: '3. Rơi tự do và thuỷ triều', en: '3. Free fall and tides' },
      tex: ['\\tau=\\tfrac23\\,\\frac{r_0^{3/2}-r^{3/2}}{\\sqrt{2M}},\\qquad \\Delta a\\approx\\frac{2GM\\ell}{r^3}'],
      body: {
        vi: 'Thời gian riêng của người rơi tự do xuất phát từ vô cực ($E = 1$) giữa $r_0$ và $r$; thời gian toạ độ tương ứng được tích phân số và phân kỳ tại $r = 2M$. $\\Delta a$ là chênh lệch gia tốc bán kính trên chiều dài $\\ell$ (giới hạn Newton của độ lệch geodesic). Khối lượng mẫu: 10 $M_\\odot$; Sgr A* $4{,}3\\times10^6\\,M_\\odot$; M87* $6{,}5\\times10^9\\,M_\\odot$.',
        en: 'Proper time of a free-faller from infinity ($E = 1$) between $r_0$ and $r$; the corresponding coordinate time is integrated numerically and diverges at $r = 2M$. $\\Delta a$ is the radial acceleration difference over a length $\\ell$ (Newtonian limit of geodesic deviation). Sample masses: 10 $M_\\odot$; Sgr A* $4.3\\times10^6\\,M_\\odot$; M87* $6.5\\times10^9\\,M_\\odot$.',
      },
    },
  ],
  assumptions: {
    vi: ['Hố đen không quay, không điện tích (Schwarzschild).', 'Máy ảnh là người quan sát đứng yên tại $r_{\\rm obs}$; ảnh là ảnh chụp tức thời (bỏ qua chênh lệch thời gian truyền sáng giữa các phần đĩa).', 'Đĩa mỏng, đục, nằm trong mặt phẳng xích đạo, khí chuyển động trên quỹ đạo tròn Kepler; không tự hấp thụ hay tán xạ.'],
    en: ['Non-rotating, uncharged (Schwarzschild) hole.', 'The camera is an observer at rest at $r_{\\rm obs}$; the image is an instantaneous snapshot (light-travel-time differences across the disk ignored).', 'Thin, opaque, equatorial disk with gas on circular Keplerian orbits; no self-absorption or scattering.'],
  },
  validity: { vi: ['$8M \\le r_{\\rm obs} \\le 120M$ (máy ảnh đứng yên phải ở ngoài mặt cầu photon); spin $a = 0$.'], en: ['$8M \\le r_{\\rm obs} \\le 120M$ (a static camera must be outside the photon sphere); spin $a = 0$.'] },
  scope: { vi: 'Sai số dò tia được đo cho bóng (đường biên giải tích đã biết); phần đĩa là minh hoạ định tính.', en: 'The ray-tracing error is measured for the shadow (whose boundary is known analytically); the disk is a qualitative illustration.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:shadow\` → \`docs/validation/D3-shadow.json\`; ngưỡng khoá trong bộ test.

- **Rìa bóng trong ảnh so với góc Synge** (bản sao float32 của vòng lặp RK4 trong shader): $r_{\\rm obs}$ = 8, 15, 30, 60, 120M cho bán kính góc 34,23°, 18,81°, 9,63°, 4,88°, 2,46°; sai lệch tương đối lớn nhất **$2{,}8\\times10^{-5}$** (chất lượng cao) và **$3{,}4\\times10^{-5}$** (tiết kiệm).
- **Lõi float64:** góc lệch chính xác khớp khai triển $4M/b + 15\\pi M^2/(4b^2)$ tại $b = 1000M$; tia bị bắt khi $b < 3\\sqrt3\\,M$ và thoát khi $b > 3\\sqrt3\\,M$; thời gian riêng khi rơi hữu hạn còn thời gian toạ độ phân kỳ tại chân trời (test).`,
    en: `Reproducible report: \`npm run validate:shadow\` → \`docs/validation/D3-shadow.json\`; thresholds locked in the test suite.

- **Rendered shadow edge vs Synge’s angle** (float32 copy of the shader’s RK4 loop): $r_{\\rm obs}$ = 8, 15, 30, 60, 120M give angular radii 34.23°, 18.81°, 9.63°, 4.88°, 2.46°; maximum relative error **$2.8\\times10^{-5}$** (high quality) and **$3.4\\times10^{-5}$** (saver).
- **float64 core:** the exact deflection matches $4M/b + 15\\pi M^2/(4b^2)$ at $b = 1000M$; rays are captured for $b < 3\\sqrt3\\,M$ and escape for $b > 3\\sqrt3\\,M$; infall proper time is finite while coordinate time diverges at the horizon (tests).`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có spin (Kerr), plasma quang học mỏng hay phát xạ synchrotron như trong ảnh EHT thật; không mô phỏng độ phân giải hữu hạn của kính thiên văn.', 'Nhẫn photon bậc cao (tia quấn hơn hai vòng) bị cắt.', 'Profile thông lượng đĩa là dạng Newton.'],
    en: ['No spin (Kerr), optically thin plasma or synchrotron emission as in real EHT images; no finite telescope resolution.', 'Higher-order photon rings (rays winding more than two turns) are truncated.', 'The disk flux profile is Newtonian.'],
  },
  references: [
    'Synge, J. L. (1966). The escape of photons from gravitationally intense stars. MNRAS 131, 463.',
    'Luminet, J.-P. (1979). Image of a spherical black hole with thin accretion disk. A&A 75, 228.',
    'Misner, C. W., Thorne, K. S. & Wheeler, J. A. (1973). Gravitation. W. H. Freeman, ch. 25.',
    'Bardeen, J. M., Press, W. H. & Teukolsky, S. A. (1972). Rotating black holes. ApJ 178, 347.',
    'Shakura, N. I. & Sunyaev, R. A. (1973). Black holes in binary systems. Observational appearance. A&A 24, 337.',
    'James, O., von Tunzelmann, E., Franklin, P. & Thorne, K. S. (2015). Gravitational lensing by spinning black holes in astrophysics, and in the movie Interstellar. CQG 32, 065001.',
    'Event Horizon Telescope Collaboration (2019). First M87 Event Horizon Telescope results. I. ApJL 875, L1.',
    'Event Horizon Telescope Collaboration (2022). First Sagittarius A* Event Horizon Telescope results. I. ApJL 930, L12.',
  ],
};
