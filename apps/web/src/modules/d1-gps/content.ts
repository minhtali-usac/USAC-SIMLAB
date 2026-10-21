import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Phát biểu nguyên lý tương đương và suy ra rằng đồng hồ ở thế hấp dẫn cao hơn chạy nhanh hơn.',
      'Tính hai hiệu chỉnh tần số cho đồng hồ trên vệ tinh quỹ đạo tròn: hiệu ứng hấp dẫn (dương) và hiệu ứng vận tốc (âm).',
      'Giải thích vai trò của geoid và hằng số $L_G$ khi so sánh đồng hồ vệ tinh với đồng hồ mặt đất.',
      'Giải thích vì sao hệ thống GPS phải hiệu chỉnh thuyết tương đối và ước lượng hậu quả nếu bỏ qua.',
    ],
    en: [
      'State the equivalence principle and infer that clocks higher in a gravitational potential run faster.',
      'Compute the two frequency corrections for a clock on a circular orbit: the gravitational (positive) and the velocity (negative) effect.',
      'Explain the role of the geoid and the constant $L_G$ when comparing satellite and ground clocks.',
      'Explain why GPS must correct for relativity and estimate the consequence of ignoring it.',
    ],
  },
  durationMin: 35,
  prerequisites: { vi: 'C1 - Giãn thời gian; thế hấp dẫn $\\Phi = -GM/r$; quỹ đạo tròn $v = \\sqrt{GM/r}$ (B1).', en: 'C1 - Time dilation; gravitational potential $\\Phi = -GM/r$; circular orbits $v = \\sqrt{GM/r}$ (B1).' },
  background: [
    {
      title: { vi: 'Đồng hồ trong không–thời gian cong', en: 'Clocks in curved spacetime' },
      body: {
        vi: 'Thuyết tương đối rộng mô tả hấp dẫn là độ cong của không–thời gian. Hệ quả dễ đo nhất là tốc độ chạy của đồng hồ phụ thuộc vào vị trí trong trường hấp dẫn và vào vận tốc của nó. Hệ thống định vị toàn cầu (GPS) là ứng dụng hằng ngày cần đến cả thuyết tương đối hẹp lẫn rộng: không có các hiệu chỉnh này, thời gian từ vệ tinh sẽ lệch dần khỏi thời gian mặt đất.',
        en: 'General relativity describes gravity as the curvature of spacetime. Its most easily measured consequence is that a clock’s rate depends on where it sits in the gravitational field and on its velocity. The Global Positioning System (GPS) is an everyday application that needs both special and general relativity: without these corrections satellite time would drift away from ground time.',
      },
    },
    {
      title: { vi: '1. Nguyên lý tương đương và dịch đỏ hấp dẫn', en: '1. The equivalence principle and gravitational redshift' },
      body: {
        vi: 'Trong một phòng kín đủ nhỏ, không thí nghiệm cục bộ nào phân biệt được trường hấp dẫn đều với gia tốc đều (Einstein 1907, 1911). Áp dụng cho một tín hiệu ánh sáng đi lên quãng $h$ trong trường $g$, ta được dịch đỏ hấp dẫn bậc nhất\n\n$$\\frac{\\Delta f}{f} \\approx -\\frac{\\Delta\\Phi}{c^2} = -\\frac{g\\,h}{c^2}.$$\n\nTương đương, đồng hồ ở cao hơn **chạy nhanh hơn** đồng hồ ở thấp. Pound & Rebka (1960) đo được hiệu ứng này trên tháp cao 22,5 m ở Harvard: $gh/c^2 \\approx 2{,}46\\times10^{-15}$. Ngày nay đồng hồ quang học phát hiện được chênh lệch độ cao chỉ 33 cm (Chou và cộng sự 2010).',
        en: 'In a small enough closed room no local experiment can distinguish a uniform gravitational field from uniform acceleration (Einstein 1907, 1911). Applied to a light signal rising a height $h$ in a field $g$, this gives the first-order gravitational redshift\n\n$$\\frac{\\Delta f}{f} \\approx -\\frac{\\Delta\\Phi}{c^2} = -\\frac{g\\,h}{c^2}.$$\n\nEquivalently, a higher clock **runs faster** than a lower one. Pound & Rebka (1960) measured this on a 22.5 m tower at Harvard: $gh/c^2 \\approx 2.46\\times10^{-15}$. Today optical clocks resolve a height difference of only 33 cm (Chou et al. 2010).',
      },
    },
    {
      title: { vi: '2. Tốc độ đồng hồ trong trường yếu', en: '2. Clock rates in a weak field' },
      body: {
        vi: 'Với trường yếu ($|\\Phi|/c^2 \\ll 1$) và vận tốc nhỏ ($v \\ll c$), tốc độ của thời gian riêng so với thời gian toạ độ là\n\n$$\\frac{d\\tau}{dt} \\approx 1 + \\frac{\\Phi}{c^2} - \\frac{v^2}{2c^2}.$$\n\nSo đồng hồ vệ tinh (thế $\\Phi_s$, vận tốc $v_s$) với đồng hồ mặt đất ($\\Phi_g$, $v_g$):\n\n$$\\frac{\\Delta\\tau}{\\tau} \\approx \\underbrace{\\frac{\\Phi_s - \\Phi_g}{c^2}}_{\\text{GR}} + \\underbrace{\\frac{v_g^2 - v_s^2}{2c^2}}_{\\text{SR}}.$$\n\nVệ tinh ở cao hơn nên số hạng hấp dẫn dương (chạy nhanh hơn); vệ tinh chuyển động nhanh nên số hạng vận tốc âm (chạy chậm hơn). Với quỹ đạo tròn bán kính $r$: $\\Phi_s = -GM/r$ và $v_s^2 = GM/r$.',
        en: 'In a weak field ($|\\Phi|/c^2 \\ll 1$) and at low speed ($v \\ll c$) the rate of proper time relative to coordinate time is\n\n$$\\frac{d\\tau}{dt} \\approx 1 + \\frac{\\Phi}{c^2} - \\frac{v^2}{2c^2}.$$\n\nComparing a satellite clock (potential $\\Phi_s$, speed $v_s$) with a ground clock ($\\Phi_g$, $v_g$):\n\n$$\\frac{\\Delta\\tau}{\\tau} \\approx \\underbrace{\\frac{\\Phi_s - \\Phi_g}{c^2}}_{\\text{GR}} + \\underbrace{\\frac{v_g^2 - v_s^2}{2c^2}}_{\\text{SR}}.$$\n\nThe satellite is higher, so the gravitational term is positive (faster); it moves fast, so the velocity term is negative (slower). For a circular orbit of radius $r$: $\\Phi_s = -GM/r$ and $v_s^2 = GM/r$.',
      },
    },
    {
      title: { vi: '3. Geoid và hằng số L_G', en: '3. The geoid and the constant L_G' },
      body: {
        vi: 'Đồng hồ trên mặt đất chịu cả thế hấp dẫn lẫn thế ly tâm do Trái Đất tự quay, và Trái Đất không phải khối cầu. **Geoid** là mặt đẳng thế của tổng hai thế này, gần trùng mực nước biển trung bình; mọi đồng hồ đứng yên trên geoid chạy cùng một tốc độ, định nghĩa Giờ Trái Đất (TT). Nghị quyết IAU 2000 B1.9 cho\n\n$$L_G = \\frac{W_0}{c^2} = 6{,}969290134\\times10^{-10},$$\n\nvới $W_0$ là thế trên geoid. Khi so với geoid,\n\n$$\\frac{\\Delta\\tau}{\\tau} = L_G - \\frac{GM}{r c^2} - \\frac{v^2}{2c^2}.$$\n\nVới GPS ($a = 26\\,561{,}75$ km): số hạng hấp dẫn $+45{,}79\\ \\mu$s/ngày, số hạng vận tốc $-7{,}21\\ \\mu$s/ngày, tổng **$+38{,}58\\ \\mu$s/ngày**, tức độ lệch tần số $4{,}4647\\times10^{-10}$ mà Ashby (2003) nêu. Tần số đồng hồ vệ tinh được đặt thấp đi đúng lượng này trước khi phóng.',
        en: 'A ground clock feels both the gravitational potential and the centrifugal potential of Earth’s rotation, and Earth is not a sphere. The **geoid** is the equipotential surface of their sum, close to mean sea level; every clock at rest on the geoid runs at the same rate, which defines Terrestrial Time (TT). IAU 2000 Resolution B1.9 gives\n\n$$L_G = \\frac{W_0}{c^2} = 6.969290134\\times10^{-10},$$\n\nwhere $W_0$ is the geoid potential. Relative to the geoid,\n\n$$\\frac{\\Delta\\tau}{\\tau} = L_G - \\frac{GM}{r c^2} - \\frac{v^2}{2c^2}.$$\n\nFor GPS ($a = 26,561.75$ km): gravitational term $+45.79\\ \\mu$s/day, velocity term $-7.21\\ \\mu$s/day, total **$+38.58\\ \\mu$s/day**, the $4.4647\\times10^{-10}$ frequency offset quoted by Ashby (2003). Satellite clock frequencies are set low by exactly this amount before launch.',
      },
    },
    {
      title: { vi: '4. Hậu quả và điểm hoà', en: '4. Consequences and the break-even point' },
      body: {
        vi: 'Máy thu GPS tính khoảng cách từ thời gian truyền tín hiệu, nên một sai lệch thời gian $\\Delta t$ tương ứng sai lệch khoảng cách $c\\,\\Delta t$. Nếu không hiệu chỉnh, $38{,}58\\ \\mu$s mỗi ngày tương ứng khoảng **11,6 km** mỗi ngày sai số khoảng cách tích luỹ.\n\nHai hiệu ứng triệt tiêu khi $L_G = \\tfrac32\\,GM/(r c^2)$, tức $r \\approx 1{,}497\\,R_E$ (độ cao khoảng 3 167 km). Vệ tinh thấp hơn (như ISS) chạy **chậm** hơn mặt đất vì hiệu ứng vận tốc thắng; vệ tinh cao hơn (GPS, Galileo, địa tĩnh) chạy **nhanh** hơn.',
        en: 'A GPS receiver computes ranges from signal travel times, so a timing error $\\Delta t$ maps to a range error $c\\,\\Delta t$. Uncorrected, $38.58\\ \\mu$s per day corresponds to about **11.6 km** per day of accumulated range error.\n\nThe two effects cancel when $L_G = \\tfrac32\\,GM/(r c^2)$, i.e. $r \\approx 1.497\\,R_E$ (about 3,167 km altitude). Lower satellites (like the ISS) run **slow** relative to the ground because the velocity effect wins; higher ones (GPS, Galileo, geostationary) run **fast**.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Đồng hồ GPS', en: 'Experiment 1 - The GPS clock' }, text: { vi: 'Chọn GPS và so với geoid. Đọc hai số hạng và tổng; kiểm tra rằng tổng nhân $c$ cho khoảng 11,6 km mỗi ngày.', en: 'Choose GPS relative to the geoid. Read the two terms and the total; check that the total times $c$ gives about 11.6 km per day.' }, params: { orbit: 'gps', h: 20183.6, ground: 'geoid' } },
    { title: { vi: 'Thử nghiệm 2 - Phi hành gia trên ISS', en: 'Experiment 2 - Astronauts on the ISS' }, text: { vi: 'Chọn ISS. Hiệu ứng nào thắng? Sau sáu tháng trên quỹ đạo, đồng hồ của phi hành gia lệch so với mặt đất khoảng bao nhiêu micro giây?', en: 'Choose the ISS. Which effect wins? After six months in orbit, by how many microseconds does an astronaut’s clock differ from the ground?' }, params: { orbit: 'iss', h: 420 } },
    { title: { vi: 'Thử nghiệm 3 - Điểm hoà', en: 'Experiment 3 - The break-even point' }, text: { vi: 'Kéo độ cao tới khi tổng hiệu chỉnh bằng 0. So với $r = 1{,}497\\,R_E$ (geoid) và $1{,}5\\,R_E$ (Trái Đất điểm khối). Vì sao hai kết quả khác nhau?', en: 'Drag the altitude until the net correction vanishes. Compare with $r = 1.497\\,R_E$ (geoid) and $1.5\\,R_E$ (point-mass Earth). Why do the two differ?' }, params: { h: 3200 } },
    { title: { vi: 'Thử nghiệm 4 - Tháp Pound–Rebka', en: 'Experiment 4 - The Pound–Rebka tower' }, text: { vi: 'Đặt chiều cao tháp 22,5 m và đọc $gh/c^2$. Cần tháp cao bao nhiêu để dịch đỏ đạt $10^{-13}$?', en: 'Set the tower height to 22.5 m and read $gh/c^2$. How tall must a tower be for a redshift of $10^{-13}$?' }, params: { tower: 22.5 } },
  ],
  quiz: [
    { q: { vi: 'So với đồng hồ trên geoid, đồng hồ trên vệ tinh GPS:', en: 'Relative to a clock on the geoid, a GPS satellite clock:' }, options: [{ vi: 'Chạy nhanh hơn khoảng 38,6 µs mỗi ngày', en: 'Runs fast by about 38.6 µs per day' }, { vi: 'Chạy chậm hơn khoảng 7,2 µs mỗi ngày', en: 'Runs slow by about 7.2 µs per day' }, { vi: 'Chạy cùng tốc độ', en: 'Runs at the same rate' }], answer: 0, explain: { vi: 'Hiệu ứng hấp dẫn (+45,8 µs/ngày) lớn hơn hiệu ứng vận tốc (−7,2 µs/ngày).', en: 'The gravitational effect (+45.8 µs/day) exceeds the velocity effect (−7.2 µs/day).' } },
    { q: { vi: 'Nếu không hiệu chỉnh tương đối tính, sai số khoảng cách GPS tích luỹ mỗi ngày khoảng:', en: 'Without relativistic corrections, the GPS range error would accumulate per day by about:' }, options: [{ vi: '11,6 km', en: '11.6 km' }, { vi: '11,6 m', en: '11.6 m' }, { vi: '11,6 cm', en: '11.6 cm' }], answer: 0, explain: { vi: '$38{,}58\\ \\mu\\text s \\times c \\approx 11{,}6$ km.', en: '$38.58\\ \\mu\\text s \\times c \\approx 11.6$ km.' } },
    { q: { vi: 'Vì sao dùng geoid làm mốc thay vì một đồng hồ ở cực?', en: 'Why use the geoid as reference rather than a clock at the pole?' }, options: [{ vi: 'Mọi đồng hồ đứng yên trên geoid chạy cùng tốc độ (Giờ Trái Đất), đã gồm cả thế ly tâm và độ dẹt', en: 'All clocks at rest on the geoid run at the same rate (Terrestrial Time), including the centrifugal potential and oblateness' }, { vi: 'Vì ở cực không có trọng lực', en: 'Because there is no gravity at the pole' }], answer: 0, explain: { vi: 'Geoid là mặt đẳng thế của thế hấp dẫn cộng thế ly tâm.', en: 'The geoid is the equipotential of gravity plus centrifugal potential.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Ashby (2003) “Relativity in the Global Positioning System”, Living Rev. Relativ. 6, 1; Nghị quyết IAU 2000 B1.9; Pound & Rebka (1960) Phys. Rev. Lett. 4, 337; Chou và cộng sự (2010) Science 329, 1630. Gợi ý thảo luận: hiệu chỉnh tuần hoàn do độ lệch tâm quỹ đạo ($\\Delta t = 2\\sqrt{GMa}\\,e\\sin E/c^2$) được máy thu tính riêng; hiệu ứng Sagnac xuất hiện vì mặt đất quay trong lúc tín hiệu truyền.',
    en: 'Resources: Ashby (2003) “Relativity in the Global Positioning System”, Living Rev. Relativ. 6, 1; IAU 2000 Resolution B1.9; Pound & Rebka (1960) Phys. Rev. Lett. 4, 337; Chou et al. (2010) Science 329, 1630. Discussion: the periodic eccentricity correction ($\\Delta t = 2\\sqrt{GMa}\\,e\\sin E/c^2$) is applied separately by receivers; the Sagnac effect arises because the ground rotates while the signal travels.',
  },
};

/** Model Card · D1. Figures reproduced by packages/sim-core/test/relativity.test.ts. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Hiệu chỉnh tốc độ đồng hồ bậc nhất trong trường yếu', en: 'Level A - First-order weak-field clock-rate corrections' },
      body: {
        vi: 'Hiệu chỉnh hấp dẫn và vận tốc cho đồng hồ trên quỹ đạo tròn, so với đồng hồ trên geoid (mặc định, theo IAU 2000 B1.9) hoặc với Trái Đất điểm khối; dịch đỏ Pound–Rebka. Kết quả GPS khớp giá trị tham chiếu của Ashby (2003).',
        en: 'Gravitational and velocity corrections for a clock on a circular orbit, relative to a clock on the geoid (default, IAU 2000 B1.9) or to a point-mass Earth; the Pound–Rebka redshift. The GPS result matches Ashby’s (2003) reference value.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Hoạt ảnh vệ tinh', en: 'Level C - Satellite animation' },
      body: { vi: 'Kích thước Trái Đất và quỹ đạo theo tỉ lệ; tốc độ chuyển động trên màn hình được tăng tốc và không theo thời gian thực.', en: 'Earth and orbit sizes are to scale; on-screen motion is sped up and not in real time.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. So với geoid (mặc định)', en: '1. Relative to the geoid (default)' },
      tex: ['\\frac{\\Delta\\tau}{\\tau}=\\underbrace{L_G-\\frac{GM}{rc^2}}_{\\rm GR}\\ \\underbrace{-\\,\\frac{v^2}{2c^2}}_{\\rm SR},\\qquad v^2=\\frac{GM}{r},\\qquad L_G=6.969290134\\times10^{-10}', 'r_\\times=\\frac{3\\,GM}{2\\,c^2 L_G}\\approx1.497\\,R_E'],
      body: {
        vi: 'Trong đó $GM = 3{,}986004418\\times10^{14}$ m³/s² (IERS 2010), $r$ là bán kính quỹ đạo tròn, $v$ là tốc độ quỹ đạo, $L_G = W_0/c^2$ là hằng số định nghĩa của IAU (đã gồm thế ly tâm và độ dẹt của Trái Đất tại mặt đất). Thế tại vệ tinh dùng mô hình điểm khối. $r_\\times$ là bán kính tại đó hai hiệu ứng triệt tiêu. Đại lượng hiển thị theo µs/ngày bằng tỉ số nhân 86 400 × 10⁶.',
        en: '$GM = 3.986004418\\times10^{14}$ m³/s² (IERS 2010), $r$ the circular orbit radius, $v$ the orbital speed, $L_G = W_0/c^2$ the IAU defining constant (including the centrifugal potential and Earth’s oblateness at the ground). The satellite potential is point-mass. $r_\\times$ is the radius at which the two effects cancel. Values in µs/day are the ratio times 86,400 × 10⁶.',
      },
    },
    {
      title: { vi: '2. Trái Đất điểm khối (tuỳ chọn) và Pound–Rebka', en: '2. Point-mass Earth (option) and Pound–Rebka' },
      tex: ['\\frac{\\Delta\\tau}{\\tau}=\\frac{GM}{c^2}\\left(\\frac1{R_E}-\\frac1r\\right)-\\frac{v^2-v_g^2}{2c^2},\\qquad v_g=\\omega_E R_E\\ \\text{or}\\ 0', '\\frac{\\Delta f}{f}=\\frac{g\\,h}{c^2}'],
      body: {
        vi: 'Trong đó $R_E = 6\\,378{,}1$ km là bán kính xích đạo danh định (IAU 2015), $v_g$ là tốc độ của đồng hồ mặt đất do Trái Đất tự quay ($\\omega_E = 7{,}292115\\times10^{-5}$ rad/s) khi đặt ở xích đạo, hoặc 0 khi đặt ở cực; $g = 9{,}80665$ m/s² là gia tốc trọng trường chuẩn, $h$ là chiều cao tháp.',
        en: '$R_E = 6,378.1$ km is the nominal equatorial radius (IAU 2015), $v_g$ the ground clock’s speed due to rotation ($\\omega_E = 7.292115\\times10^{-5}$ rad/s) at the equator, or 0 at the pole; $g = 9.80665$ m/s² is standard gravity, $h$ the tower height.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Trường yếu và vận tốc nhỏ: chỉ giữ số hạng bậc nhất theo $\\Phi/c^2$ và $v^2/c^2$ (số hạng bậc hai cỡ $10^{-19}$).',
      'Quỹ đạo tròn; thế tại vệ tinh là điểm khối (ảnh hưởng của $J_2$ ở độ cao GPS cỡ $10^{-13}$, bỏ qua).',
      'Mặc định đồng hồ mặt đất nằm trên geoid; tuỳ chọn Trái Đất điểm khối với đồng hồ ở cực hoặc xích đạo.',
    ],
    en: [
      'Weak field and low speed: only first-order terms in $\\Phi/c^2$ and $v^2/c^2$ (second-order terms are about $10^{-19}$).',
      'Circular orbits; point-mass potential at the satellite (the $J_2$ effect at GPS altitude, about $10^{-13}$, is neglected).',
      'By default the ground clock is on the geoid; optionally a point-mass Earth with the clock at the pole or the equator.',
    ],
  },
  validity: { vi: ['Độ cao 100 – 400 000 km; $GM/(rc^2) \\ll 1$, $v \\ll c$.'], en: ['Altitudes 100 – 400,000 km; $GM/(rc^2) \\ll 1$, $v \\ll c$.'] },
  scope: { vi: 'Các giá trị dưới đây được tái lập bằng bộ test của sim-core.', en: 'The values below are reproduced by the sim-core test suite.' },
  validationText: {
    vi: `Ngưỡng khoá trong \`packages/sim-core/test/relativity.test.ts\`.

- **GPS so với geoid** ($h = 20\\,183{,}6$ km): hấp dẫn $+45{,}788$, vận tốc $-7{,}213$, tổng **$+38{,}575\\ \\mu$s/ngày** $= 4{,}4647\\times10^{-10}$, khớp Ashby (2003) tới 5 chữ số; $c \\times 38{,}575\\ \\mu$s $= 11{,}56$ km.
- **Trái Đất điểm khối, đồng hồ ở cực:** $+45{,}65 / -7{,}21 / +38{,}44\\ \\mu$s/ngày.
- **Các quỹ đạo khác (so với geoid):** ISS (420 km) $-24{,}34\\ \\mu$s/ngày; Galileo (23 222 km) $+40{,}80$; địa tĩnh (35 786 km) $+46{,}58$.
- **Điểm hoà:** độ cao 3 167 km ($1{,}4966\\,R_E$) với geoid; 3 189 km ($1{,}5\\,R_E$) với điểm khối.
- **Pound–Rebka** ($h = 22{,}5$ m): $gh/c^2 = 2{,}455\\times10^{-15}$.`,
    en: `Thresholds locked in \`packages/sim-core/test/relativity.test.ts\`.

- **GPS vs the geoid** ($h = 20,183.6$ km): gravitational $+45.788$, velocity $-7.213$, total **$+38.575\\ \\mu$s/day** $= 4.4647\\times10^{-10}$, matching Ashby (2003) to 5 digits; $c \\times 38.575\\ \\mu$s $= 11.56$ km.
- **Point-mass Earth, pole clock:** $+45.65 / -7.21 / +38.44\\ \\mu$s/day.
- **Other orbits (vs the geoid):** ISS (420 km) $-24.34\\ \\mu$s/day; Galileo (23,222 km) $+40.80$; geostationary (35,786 km) $+46.58$.
- **Break-even:** 3,167 km altitude ($1.4966\\,R_E$) with the geoid; 3,189 km ($1.5\\,R_E$) with the point mass.
- **Pound–Rebka** ($h = 22.5$ m): $gh/c^2 = 2.455\\times10^{-15}$.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: [
      'Không mô phỏng hiệu chỉnh tuần hoàn do độ lệch tâm quỹ đạo (tới vài chục ns với $e \\approx 0{,}01$), hiệu ứng Sagnac, trễ tầng điện li và tầng đối lưu.',
      'Con số 11,6 km/ngày là sai số khoảng cách tích luỹ của một vệ tinh; sai số định vị thực tế của máy thu còn phụ thuộc cách giải nghiệm đồng thời nhiều vệ tinh.',
    ],
    en: [
      'The periodic eccentricity correction (tens of ns for $e \\approx 0.01$), the Sagnac effect and ionospheric/tropospheric delays are not modelled.',
      'The 11.6 km/day figure is one satellite’s accumulated range error; the actual position error of a receiver also depends on how the multi-satellite solution is formed.',
    ],
  },
  references: [
    'Ashby, N. (2003). Relativity in the Global Positioning System. Living Rev. Relativ. 6, 1. doi:10.12942/lrr-2003-1',
    'IAU (2000). Resolution B1.9: Re-definition of Terrestrial Time TT (L_G = 6.969290134 × 10⁻¹⁰).',
    'Pound, R. V. & Rebka, G. A. (1960). Apparent weight of photons. Phys. Rev. Lett. 4, 337.',
    'Chou, C. W., Hume, D. B., Rosenband, T. & Wineland, D. J. (2010). Optical clocks and relativity. Science 329, 1630.',
    'Petit, G. & Luzum, B. (eds.) (2010). IERS Conventions (2010). IERS Technical Note 36 - $GM_\\oplus$.',
    'Einstein, A. (1911). Über den Einfluß der Schwerkraft auf die Ausbreitung des Lichtes. Ann. Phys. 35, 898.',
  ],
};
