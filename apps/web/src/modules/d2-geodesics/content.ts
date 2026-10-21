import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'So sánh quỹ đạo Newton (elip đóng) với geodesic kiểu thời gian trong hình học Schwarzschild (quỹ đạo hoa hồng tiến động).',
      'Dùng thế hiệu dụng $V^2(r)$ để dự đoán quỹ đạo liên kết, rơi vào hay thoát ra.',
      'Giải thích vì sao không có quỹ đạo tròn bền bên trong $r = 6M$ (ISCO).',
      'Tính độ tiến cận điểm trong giới hạn trường yếu và áp dụng cho Sao Thuỷ (khoảng 43″ mỗi thế kỷ).',
      'Phân biệt thời gian riêng của hạt với thời gian toạ độ của người quan sát ở xa.',
    ],
    en: [
      'Compare Newtonian orbits (closed ellipses) with timelike geodesics of the Schwarzschild geometry (precessing rosettes).',
      'Use the effective potential $V^2(r)$ to predict bound, plunging or escaping motion.',
      'Explain why no stable circular orbits exist inside $r = 6M$ (the ISCO).',
      'Compute the weak-field periapsis advance and apply it to Mercury (about 43″ per century).',
      'Distinguish the particle’s proper time from the coordinate time of a distant observer.',
    ],
  },
  durationMin: 45,
  prerequisites: { vi: 'B1 - Quỹ đạo Kepler, $p = a(1-e^2)$; bảo toàn năng lượng và mômen động lượng; C1 - thời gian riêng.', en: 'B1 - Kepler orbits, $p = a(1-e^2)$; conservation of energy and angular momentum; C1 - proper time.' },
  background: [
    {
      title: { vi: 'Từ Newton đến Einstein', en: 'From Newton to Einstein' },
      body: {
        vi: 'Trong thuyết tương đối rộng, một vật rơi tự do chuyển động theo **geodesic** của không–thời gian. Quanh một khối cầu không quay, không–thời gian được mô tả bằng nghiệm Schwarzschild (1916). Mô-đun D2 dùng đơn vị hình học $G = c = 1$, đo khoảng cách theo $M$ (một nửa bán kính Schwarzschild $r_s = 2M$). Trong đơn vị thông thường, $M$ tương ứng độ dài $GM/c^2$: khoảng 1,48 km với Mặt Trời.',
        en: 'In general relativity a freely falling body follows a **geodesic** of spacetime. Around a non-rotating spherical mass, spacetime is described by the Schwarzschild solution (1916). Module D2 uses geometric units $G = c = 1$ and measures distances in $M$ (half the Schwarzschild radius $r_s = 2M$). In ordinary units $M$ corresponds to the length $GM/c^2$: about 1.48 km for the Sun.',
      },
    },
    {
      title: { vi: '1. Thế hiệu dụng', en: '1. The effective potential' },
      body: {
        vi: 'Với một hạt thử có năng lượng riêng $E$ và mômen động lượng riêng $L$ (tính trên một đơn vị khối lượng nghỉ), phương trình chuyển động bán kính là\n\n$$\\left(\\frac{dr}{d\\tau}\\right)^2 = E^2 - V^2(r),\\qquad V^2(r) = \\left(1 - \\frac{2M}{r}\\right)\\left(1 + \\frac{L^2}{r^2}\\right).$$\n\nKhai triển $V^2$ cho thấy ngoài thế Newton $-M/r$ và hàng rào ly tâm $L^2/(2r^2)$ còn có số hạng $-ML^2/r^3$: **lực hút mạnh hơn ở gần tâm**. Vì vậy hàng rào ly tâm chỉ có đỉnh hữu hạn; nếu $E^2$ vượt đỉnh đó, hạt **rơi vào** dù có mômen động lượng lớn - điều không thể xảy ra trong cơ học Newton.',
        en: 'For a test particle with specific energy $E$ and specific angular momentum $L$ (per unit rest mass), the radial equation of motion is\n\n$$\\left(\\frac{dr}{d\\tau}\\right)^2 = E^2 - V^2(r),\\qquad V^2(r) = \\left(1 - \\frac{2M}{r}\\right)\\left(1 + \\frac{L^2}{r^2}\\right).$$\n\nExpanding $V^2$ shows, besides the Newtonian $-M/r$ and the centrifugal barrier $L^2/(2r^2)$, an extra $-ML^2/r^3$ term: **stronger attraction close in**. The centrifugal barrier therefore has a finite top; if $E^2$ exceeds it the particle **plunges** even with large angular momentum - impossible in Newtonian mechanics.',
      },
    },
    {
      title: { vi: '2. Quỹ đạo tròn và ISCO', en: '2. Circular orbits and the ISCO' },
      body: {
        vi: 'Quỹ đạo tròn ứng với cực trị của $V^2$. Chúng chỉ tồn tại khi $L \\ge \\sqrt{12}\\,M$; quỹ đạo tròn **bền** nhỏ nhất nằm ở\n\n$$r_{\\rm ISCO} = 6M,\\qquad E_{\\rm ISCO} = \\sqrt{8/9}.$$\n\nVật chất trong đĩa bồi tụ trôi dần vào trong và rơi tự do khi qua ISCO; năng lượng liên kết tại đó, $1 - \\sqrt{8/9} \\approx 5{,}7\\%$ năng lượng nghỉ, là hiệu suất bức xạ cực đại của đĩa bồi tụ quanh hố đen không quay. Quỹ đạo tròn không bền tồn tại tới $3M$ (mặt cầu photon).',
        en: 'Circular orbits correspond to extrema of $V^2$. They exist only for $L \\ge \\sqrt{12}\\,M$; the smallest **stable** circular orbit is at\n\n$$r_{\\rm ISCO} = 6M,\\qquad E_{\\rm ISCO} = \\sqrt{8/9}.$$\n\nMatter in an accretion disk drifts inwards and falls freely once it passes the ISCO; the binding energy there, $1 - \\sqrt{8/9} \\approx 5.7\\%$ of the rest energy, is the maximum radiative efficiency of a disk around a non-rotating black hole. Unstable circular orbits exist down to $3M$ (the photon sphere).',
      },
    },
    {
      title: { vi: '3. Tiến động cận điểm', en: '3. Periapsis precession' },
      body: {
        vi: 'Với $u = 1/r$, phương trình quỹ đạo (dạng Binet) là\n\n$$\\frac{d^2u}{d\\varphi^2} + u = \\frac{M}{L^2} + 3Mu^2.$$\n\nSố hạng $3Mu^2$ không có trong cơ học Newton làm quỹ đạo không đóng: sau mỗi vòng, cận điểm tiến thêm một góc. Kết quả chính xác được biểu diễn bằng tích phân eliptic đầy đủ $K(k)$ (Cutler, Kennefick & Poisson 1994):\n\n$$\\Delta\\varphi = \\frac{4K(k)}{\\sqrt{1 - (6 - 2e)/p}} - 2\\pi,\\qquad k^2 = \\frac{4e}{p - 6 + 2e}.$$\n\nKhi $p \\gg M$ nó tiến về giới hạn trường yếu\n\n$$\\Delta\\varphi \\approx \\frac{6\\pi GM}{c^2\\,a(1-e^2)}.$$\n\nVới Sao Thuỷ ($a = 0{,}387$ au, $e = 0{,}206$, khoảng 415 vòng mỗi thế kỷ) ta được **42,98″ mỗi thế kỷ** - phần dư mà Le Verrier (1859) không giải thích được bằng nhiễu loạn Newton, và Einstein (1915) đã tính ra.',
        en: 'With $u = 1/r$ the orbit (Binet) equation is\n\n$$\\frac{d^2u}{d\\varphi^2} + u = \\frac{M}{L^2} + 3Mu^2.$$\n\nThe $3Mu^2$ term, absent in Newtonian mechanics, keeps the orbit from closing: after each turn the periapsis advances. The exact result is expressed with the complete elliptic integral $K(k)$ (Cutler, Kennefick & Poisson 1994):\n\n$$\\Delta\\varphi = \\frac{4K(k)}{\\sqrt{1 - (6 - 2e)/p}} - 2\\pi,\\qquad k^2 = \\frac{4e}{p - 6 + 2e}.$$\n\nFor $p \\gg M$ it tends to the weak-field limit\n\n$$\\Delta\\varphi \\approx \\frac{6\\pi GM}{c^2\\,a(1-e^2)}.$$\n\nFor Mercury ($a = 0.387$ au, $e = 0.206$, about 415 orbits per century) this gives **42.98″ per century** - the residual that Le Verrier (1859) could not explain with Newtonian perturbations and that Einstein (1915) derived.',
      },
    },
    {
      title: { vi: '4. Hai đồng hồ', en: '4. Two clocks' },
      body: {
        vi: 'Hạt mang theo đồng hồ đo **thời gian riêng** $\\tau$; người quan sát đứng yên ở rất xa đo **thời gian toạ độ** $t$. Hai thời gian liên hệ qua\n\n$$\\frac{dt}{d\\tau} = \\frac{E}{1 - 2M/r}.$$\n\nVới quỹ đạo tròn, $dt/d\\tau = 1/\\sqrt{1 - 3M/r}$: tổ hợp của giãn thời gian hấp dẫn và giãn thời gian do vận tốc. Khi hạt tiến tới chân trời $r = 2M$, $t$ tăng không giới hạn trong khi $\\tau$ vẫn hữu hạn. Mô phỏng hiển thị cả hai và cho phép chọn đồng hồ dùng để chạy hoạt ảnh.',
        en: 'The particle carries a clock measuring **proper time** $\\tau$; an observer at rest far away measures **coordinate time** $t$. They are related by\n\n$$\\frac{dt}{d\\tau} = \\frac{E}{1 - 2M/r}.$$\n\nFor a circular orbit $dt/d\\tau = 1/\\sqrt{1 - 3M/r}$: gravitational and velocity time dilation combined. As the particle approaches the horizon $r = 2M$, $t$ grows without bound while $\\tau$ stays finite. The simulator shows both and lets you choose which clock drives the animation.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Quỹ đạo hoa hồng', en: 'Experiment 1 - A rosette orbit' }, text: { vi: 'Đặt $p = 12M$, $e = 0{,}6$. Cận điểm tiến bao nhiêu độ mỗi vòng? So với giá trị chính xác 153,0° và với công thức trường yếu $6\\pi/p = 90°$. Vì sao công thức trường yếu sai nhiều ở đây?', en: 'Set $p = 12M$, $e = 0.6$. By how many degrees does the periapsis advance per orbit? Compare with the exact 153.0° and with the weak-field $6\\pi/p = 90°$. Why is the weak-field formula so far off here?' }, params: { mode: 'pe', p: 12, e: 0.6 } },
    { title: { vi: 'Thử nghiệm 2 - Giới hạn trường yếu', en: 'Experiment 2 - The weak-field limit' }, text: { vi: 'Tăng $p$ lên $200M$ với $e = 0{,}3$. So sánh độ tiến đo được với $6\\pi/p$. Sai khác tương đối giảm thế nào khi $p$ tăng?', en: 'Raise $p$ to $200M$ with $e = 0.3$. Compare the measured advance with $6\\pi/p$. How does the relative difference shrink as $p$ grows?' }, params: { mode: 'pe', p: 200, e: 0.3 } },
    { title: { vi: 'Thử nghiệm 3 - Vượt qua ISCO', en: 'Experiment 3 - Past the ISCO' }, text: { vi: 'Ở chế độ “phóng”, đặt $r_0 = 7M$ và tốc độ tiếp tuyến gần tốc độ quỹ đạo tròn $\\sqrt{M/(r_0 - 2M)} \\approx 0{,}447$. Giảm nhẹ tốc độ: hạt còn quỹ đạo không? Lặp lại ở $r_0 = 20M$ (tốc độ tròn $\\approx 0{,}236$).', en: 'In “launch” mode, set $r_0 = 7M$ and a tangential speed near the circular value $\\sqrt{M/(r_0 - 2M)} \\approx 0.447$. Lower it slightly: does the particle stay in orbit? Repeat at $r_0 = 20M$ (circular speed $\\approx 0.236$).' }, params: { mode: 'launch', r0: 7, v: 0.44 } },
    { title: { vi: 'Thử nghiệm 4 - Zoom–whirl', en: 'Experiment 4 - Zoom–whirl' }, text: { vi: 'Đặt $p = 7{,}9M$, $e = 0{,}9$ (sát ranh giới bền $p = 6 + 2e$). Hạt quay nhiều vòng sát hố đen rồi văng ra xa trước khi quay lại - một hành vi chỉ có trong thuyết tương đối rộng.', en: 'Set $p = 7.9M$, $e = 0.9$ (just outside the stability boundary $p = 6 + 2e$). The particle whirls several times close in, then zooms far out before returning - behaviour found only in general relativity.' }, params: { mode: 'pe', p: 7.9, e: 0.9, n: 6 } },
  ],
  quiz: [
    { q: { vi: 'Bán kính ISCO của hố đen Schwarzschild là:', en: 'The ISCO radius of a Schwarzschild black hole is:' }, options: [{ vi: '$6M = 3r_s$', en: '$6M = 3r_s$' }, { vi: '$3M$', en: '$3M$' }, { vi: '$2M$', en: '$2M$' }], answer: 0, explain: { vi: '$3M$ là mặt cầu photon (quỹ đạo tròn không bền của ánh sáng); $2M$ là chân trời sự kiện.', en: '$3M$ is the photon sphere (unstable circular light orbits); $2M$ is the event horizon.' } },
    { q: { vi: 'Phần lớn độ tiến cận điểm quan sát được của Sao Thuỷ (khoảng 574″ mỗi thế kỷ so với hệ quy chiếu quán tính) là do:', en: 'Most of Mercury’s observed perihelion advance (about 574″ per century relative to an inertial frame) is due to:' }, options: [{ vi: 'Nhiễu loạn của các hành tinh khác', en: 'Perturbations by the other planets' }, { vi: 'Thuyết tương đối rộng', en: 'General relativity' }, { vi: 'Áp suất bức xạ Mặt Trời', en: 'Solar radiation pressure' }], answer: 0, explain: { vi: 'Khoảng 531″ đến từ các hành tinh khác; thuyết tương đối rộng giải thích phần còn lại ≈ 43″ (Clemence 1947).', en: 'About 531″ comes from the other planets; general relativity explains the remaining ≈ 43″ (Clemence 1947).' } },
    { q: { vi: 'Gần hố đen, đồng hồ của hạt so với đồng hồ của người quan sát ở xa:', en: 'Near the hole, the particle’s clock compared with a distant observer’s clock:' }, options: [{ vi: 'Chạy chậm hơn', en: 'Runs slower' }, { vi: 'Chạy nhanh hơn', en: 'Runs faster' }, { vi: 'Chạy như nhau', en: 'Runs at the same rate' }], answer: 0, explain: { vi: '$dt/d\\tau = E/(1 - 2M/r) > 1$ với quỹ đạo liên kết.', en: '$dt/d\\tau = E/(1 - 2M/r) > 1$ for bound orbits.' } },
    { q: { vi: 'Vì sao trong thuyết tương đối rộng một hạt có mômen động lượng lớn vẫn có thể rơi vào tâm?', en: 'Why can a particle with large angular momentum still plunge in general relativity?' }, options: [{ vi: 'Số hạng $-ML^2/r^3$ làm hàng rào ly tâm chỉ có đỉnh hữu hạn', en: 'The $-ML^2/r^3$ term gives the centrifugal barrier a finite top' }, { vi: 'Vì mômen động lượng không bảo toàn', en: 'Because angular momentum is not conserved' }], answer: 0, explain: { vi: 'Nếu $E^2$ lớn hơn đỉnh của $V^2$, không có điểm quay ở phía trong.', en: 'If $E^2$ exceeds the top of $V^2$ there is no inner turning point.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Hartle (2003) Gravity: An Introduction to Einstein’s General Relativity, ch. 9; Misner, Thorne & Wheeler (1973) Gravitation, §25; Cutler, Kennefick & Poisson (1994) Phys. Rev. D 50, 3816; Clemence (1947) Rev. Mod. Phys. 19, 361. Gợi ý thảo luận: các sao S quay quanh Sgr A* (ví dụ S2, GRAVITY Collaboration 2020) cho phép đo tiến động Schwarzschild ở trường mạnh hơn Sao Thuỷ nhiều bậc.',
    en: 'Resources: Hartle (2003) Gravity: An Introduction to Einstein’s General Relativity, ch. 9; Misner, Thorne & Wheeler (1973) Gravitation, §25; Cutler, Kennefick & Poisson (1994) Phys. Rev. D 50, 3816; Clemence (1947) Rev. Mod. Phys. 19, 361. Discussion: the S-stars orbiting Sgr A* (e.g. S2, GRAVITY Collaboration 2020) measure the Schwarzschild precession in a field many orders of magnitude stronger than at Mercury.',
  },
};

/** Model Card · D2. Measured figures: `npm run validate:gr` → docs/validation/D2-geodesics.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Thế hiệu dụng, quỹ đạo tròn, ISCO, tiến động chính xác', en: 'Level A - Effective potential, circular orbits, ISCO, exact precession' },
      body: {
        vi: 'Thế hiệu dụng, các hằng số quỹ đạo $(E, L)$ từ $(p, e)$, bán kính quỹ đạo tròn, ISCO và độ tiến cận điểm chính xác (tích phân eliptic) được tính bằng công thức giải tích.',
        en: 'The effective potential, the orbital constants $(E, L)$ from $(p, e)$, circular-orbit radii, the ISCO and the exact periapsis advance (elliptic integral) are analytic.',
      },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Tích phân số geodesic', en: 'Level B - Numerical geodesic integration' },
      body: {
        vi: 'Quỹ đạo, thời gian riêng và thời gian toạ độ được tích phân bằng DOPRI5 (float64, $r_{\\rm tol} = 10^{-11}$). Sai số được đo bằng cách so độ tiến cận điểm với nghiệm chính xác.',
        en: 'Orbits, proper time and coordinate time are integrated with DOPRI5 (float64, $r_{\\rm tol} = 10^{-11}$). The error is measured by comparing the periapsis advance with the exact result.',
      },
    },
  ],
  fidelityNote: { vi: 'Mức A, B là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Phương trình geodesic theo góc', en: '1. Geodesic equations in φ' },
      tex: ["u''+u=\\frac{M}{L^2}+3Mu^2,\\qquad \\frac{d\\tau}{d\\varphi}=\\frac{1}{Lu^2},\\qquad \\frac{dt}{d\\varphi}=\\frac{E}{Lu^2(1-2Mu)}", 'V^2(r)=\\left(1-\\frac{2M}{r}\\right)\\left(1+\\frac{L^2}{r^2}\\right)'],
      body: {
        vi: 'Trong đó $u = 1/r$, dấu phẩy là đạo hàm theo góc $\\varphi$ trong mặt phẳng xích đạo, $E$ và $L$ là năng lượng và mômen động lượng riêng (bảo toàn), $\\tau$ là thời gian riêng, $t$ là thời gian toạ độ Schwarzschild. Đơn vị $G = c = M = 1$. Tích phân dừng khi $r < 2{,}002M$ (thời gian toạ độ phân kỳ tại chân trời) hoặc khi $r > 10^4 M$ (thoát).',
        en: '$u = 1/r$, primes denote derivatives with respect to the angle $\\varphi$ in the equatorial plane, $E$ and $L$ are the conserved specific energy and angular momentum, $\\tau$ the proper time, $t$ the Schwarzschild coordinate time. Units $G = c = M = 1$. Integration stops when $r < 2.002M$ (coordinate time diverges at the horizon) or $r > 10^4 M$ (escape).',
      },
    },
    {
      title: { vi: '2. Hằng số quỹ đạo', en: '2. Orbital constants' },
      tex: ['L^2=\\frac{p^2M^2}{p-3-e^2},\\qquad E^2=\\frac{(p-2-2e)(p-2+2e)}{p\\,(p-3-e^2)}', 'E=\\gamma\\sqrt{1-2M/r_0},\\qquad L=\\gamma\\,v\\,r_0\\cos\\alpha'],
      body: {
        vi: 'Chế độ $(p, e)$: $p$ là bán latus rectum (theo $M$), $e$ là độ lệch tâm; quỹ đạo bắt đầu ở viễn điểm $r = p/(1-e)$. Nghiệm tồn tại khi $p > 3 + e^2$ và là quỹ đạo liên kết bền khi $p > 6 + 2e$. Chế độ phóng: $v$ là tốc độ đo bởi người quan sát tĩnh tại $r_0$, $\\gamma = 1/\\sqrt{1 - v^2}$, $\\alpha$ là góc so với phương tiếp tuyến. Quỹ đạo Newton (màu cam) dùng cùng $p, e$ hoặc cùng $r_0, v$.',
        en: '$(p, e)$ mode: $p$ is the semi-latus rectum (in $M$), $e$ the eccentricity; the orbit starts at apoapsis $r = p/(1-e)$. A solution exists for $p > 3 + e^2$ and is a stable bound orbit for $p > 6 + 2e$. Launch mode: $v$ is the speed measured by a static observer at $r_0$, $\\gamma = 1/\\sqrt{1 - v^2}$, $\\alpha$ the angle from the tangential direction. The Newtonian orbit (orange) uses the same $p, e$ or the same $r_0, v$.',
      },
    },
    {
      title: { vi: '3. Độ tiến cận điểm', en: '3. Periapsis advance' },
      tex: ['\\Delta\\varphi=\\frac{4K(k)}{\\sqrt{1-(6-2e)/p}}-2\\pi,\\qquad k^2=\\frac{4e}{p-6+2e}', '\\Delta\\varphi_{\\rm weak}=\\frac{6\\pi GM}{c^2a(1-e^2)}=\\frac{6\\pi}{p}'],
      body: {
        vi: 'Trong đó $K(k)$ là tích phân eliptic đầy đủ loại một (tính bằng trung bình cộng–nhân). Giao diện đo độ tiến bằng số từ các cực tiểu liên tiếp của $r$ (tinh chỉnh bằng nội suy parabol) và hiển thị cạnh giá trị trường yếu.',
        en: '$K(k)$ is the complete elliptic integral of the first kind (computed with the arithmetic–geometric mean). The interface measures the advance numerically from successive minima of $r$ (parabolic refinement) and shows it next to the weak-field value.',
      },
    },
  ],
  assumptions: {
    vi: ['Hạt thử có khối lượng không đáng kể; không bức xạ sóng hấp dẫn.', 'Khối lượng trung tâm không quay, đối xứng cầu (hình học Schwarzschild); chuyển động trong mặt phẳng xích đạo.'],
    en: ['Test particle of negligible mass; no gravitational-wave emission.', 'Non-rotating, spherically symmetric central mass (Schwarzschild geometry); equatorial motion.'],
  },
  validity: { vi: ['$3{,}5 \\le p \\le 400$, $0 \\le e \\le 0{,}95$ (chế độ $p, e$); $3 \\le r_0 \\le 200$, $0 \\le v \\le 0{,}99$ (chế độ phóng).'], en: ['$3.5 \\le p \\le 400$, $0 \\le e \\le 0.95$ ($p, e$ mode); $3 \\le r_0 \\le 200$, $0 \\le v \\le 0.99$ (launch mode).'] },
  scope: { vi: 'Phần giải tích là chính xác; phần tích phân số được kiểm chứng trên các cấu hình dưới đây.', en: 'The analytic part is exact; the numerical part is validated on the configurations below.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:gr\` → \`docs/validation/D2-geodesics.json\`; ngưỡng khoá trong \`packages/sim-core/test/gr-d2.test.ts\` và \`relativity.test.ts\`.

- **Độ tiến cận điểm, số so với chính xác** (6 vòng mỗi cấu hình): $p = 12, e = 0{,}6$: **153,021°** (chính xác 153,021°, trường yếu 90°); $p = 14, e = 0{,}5$: 117,64°; $p = 20, e = 0{,}5$: 70,70°; $p = 50, e = 0{,}2$: 23,77°; $p = 100, e = 0{,}1$: 11,31°; $p = 500, e = 0{,}2$: 2,180° (trường yếu 2,160°). Sai lệch tương đối lớn nhất $5{,}4\\times10^{-11}$.
- **Sao Thuỷ** (phần tử trung bình J2000, chu kỳ 87,9691 ngày): **42,98″/thế kỷ**.
- **Quỹ đạo tròn** $r = 10M$: $dt/d\\tau = 1{,}19523$, khớp $1/\\sqrt{1 - 3M/r}$ tới sai số làm tròn.
- **ISCO:** $E = \\sqrt{8/9} = 0{,}94281$; năng lượng liên kết 5,72%.`,
    en: `Reproducible report: \`npm run validate:gr\` → \`docs/validation/D2-geodesics.json\`; thresholds locked in \`packages/sim-core/test/gr-d2.test.ts\` and \`relativity.test.ts\`.

- **Periapsis advance, numerical vs exact** (6 orbits per case): $p = 12, e = 0.6$: **153.021°** (exact 153.021°, weak field 90°); $p = 14, e = 0.5$: 117.64°; $p = 20, e = 0.5$: 70.70°; $p = 50, e = 0.2$: 23.77°; $p = 100, e = 0.1$: 11.31°; $p = 500, e = 0.2$: 2.180° (weak field 2.160°). Maximum relative difference $5.4\\times10^{-11}$.
- **Mercury** (J2000 mean elements, period 87.9691 d): **42.98″/century**.
- **Circular orbit** $r = 10M$: $dt/d\\tau = 1.19523$, equal to $1/\\sqrt{1 - 3M/r}$ to round-off.
- **ISCO:** $E = \\sqrt{8/9} = 0.94281$; binding energy 5.72%.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có spin (hình học Kerr), không có phản lực bức xạ (quỹ đạo xoắn ốc do phát sóng hấp dẫn).', 'Chỉ chuyển động phẳng; kích thước hạt trên hình không theo tỉ lệ.'],
    en: ['No spin (Kerr geometry), no radiation reaction (gravitational-wave inspiral).', 'Planar motion only; particle size on screen is not to scale.'],
  },
  references: [
    'Schwarzschild, K. (1916). Über das Gravitationsfeld eines Massenpunktes nach der Einsteinschen Theorie. Sitzungsber. Preuss. Akad. Wiss., 189–196.',
    'Hartle, J. B. (2003). Gravity: An Introduction to Einstein’s General Relativity. Addison-Wesley, ch. 9.',
    'Misner, C. W., Thorne, K. S. & Wheeler, J. A. (1973). Gravitation. W. H. Freeman, §25.',
    'Cutler, C., Kennefick, D. & Poisson, E. (1994). Gravitational radiation reaction for bound motion around a Schwarzschild black hole. Phys. Rev. D 50, 3816.',
    'Einstein, A. (1915). Erklärung der Perihelbewegung des Merkur aus der allgemeinen Relativitätstheorie. Sitzungsber. Preuss. Akad. Wiss., 831–839.',
    'Clemence, G. M. (1947). The relativity effect in planetary motions. Rev. Mod. Phys. 19, 361.',
  ],
};
