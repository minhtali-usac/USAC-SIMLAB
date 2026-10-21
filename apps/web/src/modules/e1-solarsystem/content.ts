import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Xác định vị trí thật của tám hành tinh tại một ngày bất kỳ trong khoảng 1800–2050 từ phần tử quỹ đạo Kepler.',
      'Mô tả các bước tính lịch thiên văn: phần tử theo thời gian, phương trình Kepler, phép quay sang hệ hoàng đạo.',
      'Cảm nhận quy mô thật của Hệ Mặt Trời và giải thích vì sao hầu hết hình vẽ không theo tỉ lệ.',
      'Tính khoảng cách, tốc độ quỹ đạo, thời gian ánh sáng và góc ly giác của hành tinh nhìn từ Trái Đất.',
    ],
    en: [
      'Determine the true positions of the eight planets on any date between 1800 and 2050 from Keplerian orbital elements.',
      'Describe the steps of an ephemeris computation: time-dependent elements, Kepler’s equation, rotation to the ecliptic frame.',
      'Grasp the true scale of the Solar System and explain why most drawings are not to scale.',
      'Compute distances, orbital speeds, light times and elongations of the planets as seen from Earth.',
    ],
  },
  durationMin: 30,
  prerequisites: { vi: 'B1 - Quỹ đạo Kepler, phương trình Kepler; khái niệm đơn vị thiên văn (au) và hệ toạ độ hoàng đạo.', en: 'B1 - Kepler orbits, Kepler’s equation; the astronomical unit (au) and ecliptic coordinates.' },
  background: [
    {
      title: { vi: 'Lịch thiên văn trong trình duyệt', en: 'An ephemeris in the browser' },
      body: {
        vi: 'Lịch thiên văn hiện đại như JPL DE441 được tính bằng tích phân số toàn bộ Hệ Mặt Trời và khớp với các phép đo radar, quỹ đạo tàu vũ trụ. Để chạy nhanh trong trình duyệt, mô-đun E1 dùng **phần tử Kepler gần đúng** do E. M. Standish (JPL) khớp với lịch thiên văn chính xác: sáu phần tử của mỗi hành tinh cộng tốc độ biến thiên tuyến tính theo thế kỷ. Cách này đủ chính xác cho giáo dục và quan sát bằng mắt trong khoảng 1800–2050.',
        en: 'Modern ephemerides such as JPL DE441 are numerical integrations of the whole Solar System fitted to radar ranging and spacecraft tracking. To run fast in a browser, module E1 uses the **approximate Keplerian elements** fitted by E. M. Standish (JPL) to the precise ephemeris: six elements per planet plus linear rates per century. This is accurate enough for education and naked-eye observing between 1800 and 2050.',
      },
    },
    {
      title: { vi: '1. Từ phần tử quỹ đạo tới vị trí', en: '1. From orbital elements to position' },
      body: {
        vi: 'Mỗi hành tinh có bán trục lớn $a$, độ lệch tâm $e$, độ nghiêng $I$, kinh độ trung bình $L$, kinh độ cận điểm $\\varpi$ và kinh độ nút lên $\\Omega$, mỗi phần tử có dạng $x(T) = x_0 + \\dot x\\,T$ với $T$ là số thế kỷ Julius kể từ J2000. Từ đó\n\n$$M = L - \\varpi,\\qquad \\omega = \\varpi - \\Omega,\\qquad M = E - e\\sin E.$$\n\nPhương trình Kepler được giải bằng phương pháp Newton để có dị thường lệch tâm $E$. Vị trí trong mặt phẳng quỹ đạo là $(a(\\cos E - e),\\ a\\sqrt{1-e^2}\\sin E,\\ 0)$, sau đó được quay ba lần\n\n$$\\mathbf r = R_z(\\Omega)\\,R_x(I)\\,R_z(\\omega)\\,\\mathbf r_{\\text{quỹ đạo}}$$\n\nsang hệ toạ độ hoàng đạo và điểm xuân phân J2000.',
        en: 'Each planet has a semi-major axis $a$, eccentricity $e$, inclination $I$, mean longitude $L$, longitude of perihelion $\\varpi$ and longitude of the ascending node $\\Omega$, each of the form $x(T) = x_0 + \\dot x\\,T$ with $T$ in Julian centuries since J2000. Then\n\n$$M = L - \\varpi,\\qquad \\omega = \\varpi - \\Omega,\\qquad M = E - e\\sin E.$$\n\nKepler’s equation is solved by Newton’s method for the eccentric anomaly $E$. The position in the orbital plane is $(a(\\cos E - e),\\ a\\sqrt{1-e^2}\\sin E,\\ 0)$, which is rotated three times\n\n$$\\mathbf r = R_z(\\Omega)\\,R_x(I)\\,R_z(\\omega)\\,\\mathbf r_{\\rm orb}$$\n\ninto the J2000 ecliptic and equinox frame.',
      },
    },
    {
      title: { vi: '2. Các đại lượng quan sát', en: '2. Observable quantities' },
      body: {
        vi: 'Từ vị trí nhật tâm $\\mathbf r_p$ của hành tinh và $\\mathbf r_\\oplus$ của Trái Đất:\n\n- khoảng cách tới Trái Đất $d = |\\mathbf r_p - \\mathbf r_\\oplus|$ và thời gian ánh sáng $d/c$;\n- tốc độ quỹ đạo theo phương trình vis-viva $v = \\sqrt{GM_\\odot(2/r - 1/a)}$;\n- **góc ly giác** - góc giữa hành tinh và Mặt Trời nhìn từ Trái Đất. Hành tinh ngoài ở gần 180° là đang **xung đối**: gần Trái Đất nhất, sáng nhất và mọc lúc Mặt Trời lặn, thời điểm tốt nhất để quan sát.',
        en: 'From the heliocentric positions $\\mathbf r_p$ of the planet and $\\mathbf r_\\oplus$ of Earth:\n\n- the distance from Earth $d = |\\mathbf r_p - \\mathbf r_\\oplus|$ and the light time $d/c$;\n- the orbital speed from the vis-viva equation $v = \\sqrt{GM_\\odot(2/r - 1/a)}$;\n- the **elongation** - the angle between the planet and the Sun as seen from Earth. An outer planet near 180° is at **opposition**: closest to Earth, brightest and rising at sunset, the best time to observe it.',
      },
    },
    {
      title: { vi: '3. Quy mô của Hệ Mặt Trời', en: '3. The scale of the Solar System' },
      body: {
        vi: 'Nếu Mặt Trời là quả bóng đường kính 20 cm, Trái Đất là một hạt nhỏ khoảng 1,8 mm cách 21,5 m, còn Sao Hải Vương là hạt đậu khoảng 7 mm cách khoảng 650 m. Ánh sáng mất khoảng 8 phút 19 giây từ Mặt Trời tới Trái Đất và khoảng 4 giờ 10 phút tới Sao Hải Vương. Vì vậy mô-đun mặc định phóng to kích thước và nén khoảng cách theo thang logarit; chọn “kích thước thật” và “khoảng cách tuyến tính” để thấy tỉ lệ thật.',
        en: 'If the Sun were a ball 20 cm across, Earth would be a speck about 1.8 mm across 21.5 m away, and Neptune a pea about 7 mm across some 650 m away. Light takes about 8 min 19 s from the Sun to Earth and about 4 h 10 min to Neptune. The module therefore enlarges sizes and compresses distances logarithmically by default; choose “true size” and “linear distance” to see the real proportions.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Bầu trời hôm nay', en: 'Experiment 1 - Today’s sky' }, text: { vi: 'Bấm “Bây giờ”. Đọc góc ly giác của từng hành tinh. Hành tinh nào đang gần xung đối? Hành tinh nào ở quá gần Mặt Trời để quan sát?', en: 'Press “Now”. Read each planet’s elongation. Which planet is near opposition? Which is too close to the Sun to observe?' } },
    { title: { vi: 'Thử nghiệm 2 - Tỉ lệ thật', en: 'Experiment 2 - True scale' }, text: { vi: 'Chọn kích thước “thật” và khoảng cách “tuyến tính”. Bạn còn thấy được hành tinh nào? Ước lượng tỉ số giữa khoảng cách Sao Hải Vương và đường kính Mặt Trời.', en: 'Choose “true” sizes and “linear” distances. Which planets can you still see? Estimate the ratio of Neptune’s distance to the Sun’s diameter.' }, params: { size: 'true', dist: 'linear' } },
    { title: { vi: 'Thử nghiệm 3 - Định luật Kepler II trên Sao Thuỷ', en: 'Experiment 3 - Kepler’s second law on Mercury' }, text: { vi: 'Chọn Sao Thuỷ ($e \\approx 0{,}206$) và chạy thời gian. Đọc tốc độ quỹ đạo ở cận điểm và viễn điểm. Tỉ số có bằng $(1+e)/(1-e)$ không?', en: 'Select Mercury ($e \\approx 0.206$) and run time. Read the orbital speed at perihelion and aphelion. Is the ratio $(1+e)/(1-e)$?' }, params: { sel: 'mercury', speed: 2 } },
    { title: { vi: 'Thử nghiệm 4 - Tín hiệu tới Sao Hoả', en: 'Experiment 4 - Signals to Mars' }, text: { vi: 'Chọn Sao Hoả và thay đổi ngày trong hai năm. Thời gian ánh sáng từ Trái Đất thay đổi trong khoảng nào? Liên hệ với chu kỳ giao hội khoảng 780 ngày.', en: 'Select Mars and change the date over two years. Over what range does the light time from Earth vary? Relate this to the ≈ 780-day synodic period.' }, params: { sel: 'mars' } },
  ],
  quiz: [
    { q: { vi: 'Ánh sáng từ Mặt Trời tới Trái Đất mất khoảng:', en: 'Sunlight reaches Earth in about:' }, options: [{ vi: '8 phút 19 giây', en: '8 min 19 s' }, { vi: '8 giây', en: '8 s' }, { vi: '8 giờ', en: '8 h' }], answer: 0, explain: { vi: '$1\\ \\text{au}/c \\approx 499$ s.', en: '$1\\ \\text{au}/c \\approx 499$ s.' } },
    { q: { vi: 'Một hành tinh ngoài ở xung đối khi góc ly giác bằng khoảng:', en: 'An outer planet is at opposition when its elongation is about:' }, options: [{ vi: '180°', en: '180°' }, { vi: '90°', en: '90°' }, { vi: '0°', en: '0°' }], answer: 0, explain: { vi: 'Hành tinh ở phía đối diện Mặt Trời trên bầu trời.', en: 'The planet is opposite the Sun in the sky.' } },
    { q: { vi: 'Vì sao phần tử Kepler gần đúng có sai số lớn nhất với Sao Mộc và Sao Thổ?', en: 'Why are approximate Keplerian elements least accurate for Jupiter and Saturn?' }, options: [{ vi: 'Nhiễu loạn lẫn nhau giữa hai hành tinh lớn không được mô tả bằng biến thiên tuyến tính', en: 'Their strong mutual perturbations are not captured by linear rates' }, { vi: 'Vì chúng ở quá xa', en: 'Because they are too far away' }], answer: 0, explain: { vi: 'Sao Mộc và Sao Thổ gần cộng hưởng 5 : 2 gây dao động dài hạn trong kinh độ của chúng.', en: 'Jupiter and Saturn are near a 5 : 2 resonance that causes long-period oscillations in their longitudes.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Standish, “Keplerian Elements for Approximate Positions of the Major Planets” (JPL SSD); hệ thống JPL Horizons; NASA Planetary Fact Sheet; Meeus (1998) Astronomical Algorithms. Gợi ý thảo luận: so sánh vị trí do mô-đun tính với Horizons cho một ngày cụ thể, và giải thích nguồn gốc sai lệch.',
    en: 'Resources: Standish, “Keplerian Elements for Approximate Positions of the Major Planets” (JPL SSD); the JPL Horizons system; NASA Planetary Fact Sheet; Meeus (1998) Astronomical Algorithms. Discussion: compare the module’s position with Horizons for a given date and explain the source of the difference.',
  },
};

/** Model Card · E1. Measured figures: `npm run validate:ephem` → docs/validation/E1-planets.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Vị trí hành tinh từ phần tử Kepler gần đúng của JPL', en: 'Level A - Planet positions from JPL approximate Keplerian elements' },
      body: { vi: 'Vị trí nhật tâm, khoảng cách, tốc độ quỹ đạo, thời gian ánh sáng và góc ly giác được tính từ phần tử Standish (Bảng 1), sai số đo được so với JPL Horizons DE441 nêu dưới đây.', en: 'Heliocentric positions, distances, orbital speeds, light times and elongations come from Standish’s elements (Table 1), with errors measured against JPL Horizons DE441 below.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Hình ảnh 3D', en: 'Level C - 3D rendering' },
      body: { vi: 'Kích thước được phóng đại và khoảng cách nén logarit (trừ khi chọn tỉ lệ thật). Bề mặt hành tinh dùng bản đồ Solar System Scope (CC BY 4.0, dựa trên dữ liệu NASA); độ nghiêng trục và chu kỳ tự quay theo NASA Planetary Fact Sheet; bầu trời nền là ảnh toàn cảnh Ngân Hà của ESO đặt theo toạ độ thiên hà.', en: 'Sizes are enlarged and distances log-compressed (unless true scale is chosen). Planet surfaces use Solar System Scope maps (CC BY 4.0, based on NASA data); axial tilts and rotation periods follow the NASA Planetary Fact Sheet; the background is ESO’s Milky Way panorama placed in galactic coordinates.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Phần tử quỹ đạo và phương trình Kepler', en: '1. Orbital elements and Kepler’s equation' },
      tex: ['x(T)=x_0+\\dot x\\,T,\\qquad T=\\frac{\\mathrm{JD}_{\\rm TDB}-2451545.0}{36525}', 'M=L-\\varpi,\\qquad \\omega=\\varpi-\\Omega,\\qquad M=E-e\\sin E'],
      body: {
        vi: 'Trong đó $x$ là một trong sáu phần tử $a, e, I, L, \\varpi, \\Omega$; $T$ là số thế kỷ Julius kể từ J2000; $M$ là dị thường trung bình, $\\omega$ là đối số cận điểm, $E$ là dị thường lệch tâm (giải bằng phương pháp Newton tới $10^{-15}$).',
        en: '$x$ is one of the six elements $a, e, I, L, \\varpi, \\Omega$; $T$ is Julian centuries since J2000; $M$ the mean anomaly, $\\omega$ the argument of perihelion, $E$ the eccentric anomaly (solved by Newton’s method to $10^{-15}$).',
      },
    },
    {
      title: { vi: '2. Vị trí, tốc độ và thời gian ánh sáng', en: '2. Position, speed and light time' },
      tex: ['\\mathbf r=R_z(\\Omega)\\,R_x(I)\\,R_z(\\omega)\\begin{pmatrix}a(\\cos E-e)\\\\ a\\sqrt{1-e^2}\\sin E\\\\ 0\\end{pmatrix}', 'v=\\sqrt{GM_\\odot\\left(\\frac2r-\\frac1a\\right)},\\qquad t_{\\rm light}=\\frac{|\\mathbf r_p-\\mathbf r_\\oplus|}{c}'],
      body: {
        vi: 'Trong đó $R_z$, $R_x$ là ma trận quay quanh trục $z$ và $x$; $\\mathbf r$ là vị trí nhật tâm trong hệ hoàng đạo J2000 (au); $GM_\\odot = 1{,}32712440018\\times10^{20}$ m³/s²; $\\mathbf r_\\oplus$ là vị trí khối tâm Trái Đất–Mặt Trăng.',
        en: '$R_z$, $R_x$ are rotation matrices about $z$ and $x$; $\\mathbf r$ is the heliocentric position in the J2000 ecliptic frame (au); $GM_\\odot = 1.32712440018\\times10^{20}$ m³/s²; $\\mathbf r_\\oplus$ is the Earth–Moon barycentre.',
      },
    },
  ],
  assumptions: {
    vi: ['Phần tử Kepler với biến thiên tuyến tính theo thế kỷ (Standish, Bảng 1, hợp lệ 1800–2050), hệ hoàng đạo J2000.', '“Trái Đất” là khối tâm Trái Đất–Mặt Trăng.', 'TDB ≈ UTC (chênh khoảng 69 s, không đáng kể ở đây).', 'Vị trí hiển thị là nhật tâm; với Sao Thiên Vương và Sao Hải Vương, phần tử Standish bám theo quỹ đạo quanh khối tâm Hệ Mặt Trời (khác biệt là chuyển động phản xạ của Mặt Trời, khoảng 0,01 au).'],
    en: ['Keplerian elements with linear rates per century (Standish, Table 1, valid 1800–2050), J2000 ecliptic frame.', '“Earth” is the Earth–Moon barycentre.', 'TDB ≈ UTC (≈ 69 s difference, negligible here).', 'Displayed positions are heliocentric; for Uranus and Neptune Standish’s elements track the barycentric orbit (the difference is the Sun’s reflex motion, about 0.01 au).'],
  },
  validity: { vi: ['Ngày từ 1800 đến 2050.'], en: ['Dates from 1800 to 2050.'] },
  scope: { vi: 'Sai số được đo trên khoảng 1980–2050; ngoài khoảng đó trong miền 1800–2050, sai số theo Standish cùng bậc.', en: 'Errors are measured over 1980–2050; elsewhere in 1800–2050 Standish quotes errors of the same order.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:ephem\` → \`docs/validation/E1-planets.json\`; ngưỡng từng hành tinh khoá trong bộ test.

- **Sai số góc nhật tâm lớn nhất so với JPL Horizons DE441** (1980–2050, 214 thời điểm mỗi hành tinh, hệ hoàng đạo J2000): Sao Thuỷ 28″, Sao Kim 26″, Trái Đất (khối tâm Trái Đất–Mặt Trăng) 21″, Sao Hoả 92″, Sao Mộc 516″, Sao Thổ 559″, Sao Thiên Vương 113″, Sao Hải Vương 58″ (10,8″ khi so với quỹ đạo quanh khối tâm).
- Sai số chủ yếu do nhiễu loạn lẫn nhau giữa các hành tinh; chúng dao động chứ không tăng dần, và không thể biểu diễn bằng phần tử Kepler với biến thiên tuyến tính.
- Trái Đất tại J2000 ≈ (−0,177; 0,967; 0) au; khoảng cách Sao Hoả – Mặt Trời luôn trong 1,38–1,67 au (test).`,
    en: `Reproducible report: \`npm run validate:ephem\` → \`docs/validation/E1-planets.json\`; per-planet thresholds locked in the test suite.

- **Maximum heliocentric angular error vs JPL Horizons DE441** (1980–2050, 214 epochs per planet, J2000 ecliptic): Mercury 28″, Venus 26″, Earth (Earth–Moon barycentre) 21″, Mars 92″, Jupiter 516″, Saturn 559″, Uranus 113″, Neptune 58″ (10.8″ against the barycentric orbit).
- The errors are mostly mutual planetary perturbations; they oscillate rather than grow and cannot be represented by Keplerian elements with linear rates.
- Earth at J2000 ≈ (−0.177, 0.967, 0) au; the Mars–Sun distance always lies within 1.38–1.67 au (tests).`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Chưa có vệ tinh tự nhiên, tiểu hành tinh và sao chổi.', 'JPL Horizons chỉ dùng để kiểm chứng, không được truy vấn khi mô phỏng chạy.', 'Sao nền và ảnh Ngân Hà bỏ qua tiến động.'],
    en: ['No moons, asteroids or comets yet.', 'JPL Horizons is used for validation only, not queried while the simulation runs.', 'Background stars and the Milky Way image ignore precession.'],
  },
  references: [
    'Standish, E. M. Keplerian Elements for Approximate Positions of the Major Planets. JPL Solar System Dynamics (ssd.jpl.nasa.gov).',
    'Park, R. S., Folkner, W. M., Williams, J. G. & Boggs, D. H. (2021). The JPL Planetary and Lunar Ephemerides DE440 and DE441. AJ 161, 105.',
    'Williams, D. R. NASA Planetary Fact Sheet. NASA Goddard Space Flight Center.',
    'Meeus, J. (1998). Astronomical Algorithms, 2nd ed. Willmann-Bell, ch. 30–33.',
  ],
};
