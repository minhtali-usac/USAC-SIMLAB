import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Phân biệt quỹ đạo tròn, elip, parabol và hyperbol dựa trên độ lệch tâm và năng lượng riêng.',
      'Mô tả hình học quỹ đạo bằng khoảng cách cận điểm, bán thông số tiêu và dị thường thật.',
      'Kiểm chứng định luật II Kepler bằng diện tích quét trong những khoảng thời gian bằng nhau.',
      'Vận dụng định luật III Kepler để xác định mối quan hệ giữa chu kỳ, bán trục lớn và khối lượng hệ.',
      'Giải thích sự biến thiên vận tốc dọc quỹ đạo thông qua bảo toàn năng lượng và mômen động lượng.',
      'Phân biệt mô hình hai vật lý tưởng với chuyển động thực của các thiên thể chịu nhiễu loạn.',
    ],
    en: [
      'Distinguish circular, elliptical, parabolic and hyperbolic orbits by eccentricity and specific energy.',
      'Describe orbit geometry with the periapsis distance, the semi-latus rectum and the true anomaly.',
      'Verify Kepler’s second law with the areas swept in equal time intervals.',
      'Apply Kepler’s third law to relate period, semi-major axis and system mass.',
      'Explain the speed variation along the orbit through conservation of energy and angular momentum.',
      'Distinguish the ideal two-body model from the real, perturbed motion of celestial bodies.',
    ],
  },
  durationMin: 40,
  prerequisites: { vi: 'Hình học elip, vận tốc, gia tốc và lực hấp dẫn Newton.', en: 'Ellipse geometry, velocity, acceleration and Newtonian gravity.' },
  background: [
    {
      title: { vi: 'Từ hình học quỹ đạo đến các định luật bảo toàn', en: 'From orbit geometry to conservation laws' },
      body: {
        vi: 'Vì sao hành tinh chuyển động nhanh hơn khi ở gần sao chủ? Điều gì quyết định một vật thể sẽ tiếp tục quay quanh sao, chỉ bay qua một lần hay thoát ra không gian liên sao?\n\nMô-đun B1 khảo sát chuyển động dưới tác dụng của lực hấp dẫn Newton thông qua quỹ đạo conic, ba định luật Kepler và các đại lượng bất biến của chuyển động. Người học có thể thay đổi khoảng cách cận điểm, độ lệch tâm và khối lượng sao chủ để quan sát sự thay đổi về hình dạng quỹ đạo, vận tốc, gia tốc và thời gian chuyển động.',
        en: 'Why does a planet move faster near its star? What decides whether a body keeps orbiting, passes by once, or escapes into interstellar space?\n\nModule B1 explores motion under Newtonian gravity through conic orbits, Kepler’s three laws and the invariants of motion. Learners change the periapsis distance, the eccentricity and the host-star mass and watch how the orbit shape, speed, acceleration and timing respond.',
      },
    },
    {
      title: { vi: '1. Ba định luật Kepler', en: '1. Kepler’s three laws' },
      body: {
        vi: 'Johannes Kepler xây dựng ba định luật chuyển động hành tinh từ việc phân tích các quan sát chính xác của Tycho Brahe, đặc biệt là dữ liệu về Sao Hỏa. Hai định luật đầu được công bố năm 1609; định luật thứ ba được công bố năm 1619.\n\n**Định luật I - Quỹ đạo elip.** Trong bài toán Kepler lý tưởng với quỹ đạo liên kết, vật thể chuyển động trên một elip và vật thể còn lại nằm tại một tiêu điểm. Đường tròn là trường hợp đặc biệt của elip khi độ lệch tâm bằng không.\n\n**Định luật II - Diện tích quét bằng nhau.** Đoạn thẳng nối hai vật quét những diện tích bằng nhau trong những khoảng thời gian bằng nhau. Vì vậy, vận tốc quỹ đạo thay đổi theo vị trí: vật thể chuyển động nhanh gần cận điểm và chậm gần viễn điểm.\n\n$$\\frac{dA}{dt} = \\frac{h}{2} = \\text{hằng số},\\qquad \\Delta A = \\frac{h}{2}\\,\\Delta t$$\n\n**Định luật III - Quan hệ chu kỳ và kích thước quỹ đạo.** Đối với một hệ hai vật cô lập:\n\n$$P^2 = \\frac{4\\pi^2 a^3}{G(M+m)}$$\n\ntrong đó $P$ là chu kỳ quỹ đạo, $a$ là bán trục lớn của quỹ đạo tương đối, $M, m$ là khối lượng hai vật và $G$ là hằng số hấp dẫn. Trong đơn vị thiên văn:\n\n$$\\left(\\frac{P}{\\text{năm}}\\right)^2 = \\frac{(a/\\text{au})^3}{(M+m)/M_\\odot}$$\n\nDạng quen thuộc $P^2 = a^3$ chỉ là dạng chuẩn hoá khi $P$ tính bằng năm, $a$ bằng au và tổng khối lượng xấp xỉ một khối lượng Mặt Trời. Khi thay đổi khối lượng sao, không được dùng $P^2 = a^3$ mà không hiệu chỉnh.\n\nCác định luật Kepler mô tả hình học và động học quỹ đạo; lực hấp dẫn Newton giải thích cơ chế vật lý đứng sau những quy luật đó trong bài toán hai vật lý tưởng.',
        en: 'Johannes Kepler derived three laws of planetary motion from Tycho Brahe’s precise observations, especially of Mars. The first two were published in 1609, the third in 1619.\n\n**First law - elliptical orbits.** In the ideal Kepler problem with a bound orbit, the body moves on an ellipse with the other body at one focus. A circle is the special case of zero eccentricity.\n\n**Second law - equal areas.** The line joining the two bodies sweeps equal areas in equal times. Hence the orbital speed depends on position: fast near periapsis, slow near apoapsis.\n\n$$\\frac{dA}{dt} = \\frac{h}{2} = \\text{const},\\qquad \\Delta A = \\frac{h}{2}\\,\\Delta t$$\n\n**Third law - period and orbit size.** For an isolated two-body system:\n\n$$P^2 = \\frac{4\\pi^2 a^3}{G(M+m)}$$\n\nwhere $P$ is the period, $a$ the semi-major axis of the relative orbit, $M, m$ the two masses and $G$ the gravitational constant. In astronomical units:\n\n$$\\left(\\frac{P}{\\text{yr}}\\right)^2 = \\frac{(a/\\text{au})^3}{(M+m)/M_\\odot}$$\n\nThe familiar $P^2 = a^3$ is only the normalised form with $P$ in years, $a$ in au and a total mass of about one solar mass. When the stellar mass changes, $P^2 = a^3$ must not be used without the correction.\n\nKepler’s laws describe the geometry and kinematics of orbits; Newtonian gravity explains the mechanism behind them in the ideal two-body problem.',
      },
    },
    {
      title: { vi: '2. Hình dạng quỹ đạo và độ lệch tâm', en: '2. Orbit shape and eccentricity' },
      body: {
        vi: 'Quỹ đạo chịu tác dụng của lực hấp dẫn nghịch đảo bình phương thuộc họ đường conic. Trong hệ toạ độ cực lấy vật thể trung tâm làm gốc tương đối:\n\n$$r(\\nu) = \\frac{p}{1+e\\cos\\nu},\\qquad p = q(1+e) = \\frac{h^2}{\\mu}$$\n\ntrong đó $r$ là khoảng cách tức thời giữa hai vật; $\\nu$ là dị thường thật, đo từ cận điểm; $e$ là độ lệch tâm; $q$ là khoảng cách cận điểm; $p$ là bán thông số tiêu.\n\n- $e = 0$: quỹ đạo tròn.\n- $0 < e < 1$: quỹ đạo elip, vật thể liên kết với hệ.\n- $e = 1$: quỹ đạo parabol, trường hợp giới hạn có năng lượng riêng bằng không.\n- $e > 1$: quỹ đạo hyperbol, năng lượng riêng dương, không có quỹ đạo khép kín trong mô hình hai vật.\n\nĐối với elip: $a = q/(1-e)$, $Q = a(1+e)$, và cách viết theo bán trục lớn là $r = a(1-e^2)/(1+e\\cos\\nu)$ - tương đương vì $p = a(1-e^2)$. Với parabol và hyperbol không tồn tại viễn điểm hữu hạn; bán trục lớn có dấu $a = q/(1-e)$ âm với hyperbol (độ lớn ký hiệu $|a|$).',
        en: 'Orbits under an inverse-square force are conics. In polar coordinates centred on the central body (relative frame):\n\n$$r(\\nu) = \\frac{p}{1+e\\cos\\nu},\\qquad p = q(1+e) = \\frac{h^2}{\\mu}$$\n\nwhere $r$ is the separation, $\\nu$ the true anomaly measured from periapsis, $e$ the eccentricity, $q$ the periapsis distance and $p$ the semi-latus rectum.\n\n- $e = 0$: circle.\n- $0 < e < 1$: ellipse, bound.\n- $e = 1$: parabola, the limiting case of zero specific energy.\n- $e > 1$: hyperbola, positive specific energy, no closed orbit in the two-body model.\n\nFor an ellipse $a = q/(1-e)$, $Q = a(1+e)$, and the semi-major-axis form is $r = a(1-e^2)/(1+e\\cos\\nu)$ - equivalent since $p = a(1-e^2)$. Parabolas and hyperbolas have no finite apoapsis; the signed semi-major axis $a = q/(1-e)$ is negative for a hyperbola (its magnitude is written $|a|$).',
      },
    },
    {
      title: { vi: '3. Phương trình Kepler: vị trí theo thời gian', en: '3. Kepler’s equation: position versus time' },
      body: {
        vi: 'Phương trình quỹ đạo cho biết vị trí theo góc nhưng chưa cho biết vật ở đâu tại một thời điểm. Mô hình dùng phương trình phù hợp với từng loại quỹ đạo:\n\n**Elip** ($e < 1$): $$M = E - e\\sin E,\\qquad M = n(t - T_p),\\quad n = \\sqrt{\\mu/a^3}$$\n\n**Hyperbol** ($e > 1$), với dị thường hyperbol $H$: $$M_h = e\\sinh H - H,\\qquad M_h = n_h(t - T_p),\\quad n_h = \\sqrt{\\mu/|a|^3}$$\n\n**Parabol** ($e = 1$), phương trình Barker: $$D + \\frac{D^3}{3} = \\sqrt{\\frac{\\mu}{2q^3}}\\,(t - T_p),\\qquad D = \\tan\\frac{\\nu}{2}$$\n\n$T_p$ là thời điểm qua cận điểm. Phương trình Kepler không có nghiệm sơ cấp tổng quát nên mô phỏng giải bằng lặp Halley; phương trình Barker có nghiệm dạng đóng (Cardano). Chất lượng nghiệm được đánh giá bằng phần dư của phương trình và bằng các kiểm thử độc lập về vị trí, vận tốc và bảo toàn năng lượng.',
        en: 'The orbit equation gives position versus angle, not where the body is at a given time. The model uses the equation appropriate to each orbit type:\n\n**Ellipse** ($e < 1$): $$M = E - e\\sin E,\\qquad M = n(t - T_p),\\quad n = \\sqrt{\\mu/a^3}$$\n\n**Hyperbola** ($e > 1$), with hyperbolic anomaly $H$: $$M_h = e\\sinh H - H,\\qquad M_h = n_h(t - T_p),\\quad n_h = \\sqrt{\\mu/|a|^3}$$\n\n**Parabola** ($e = 1$), Barker’s equation: $$D + \\frac{D^3}{3} = \\sqrt{\\frac{\\mu}{2q^3}}\\,(t - T_p),\\qquad D = \\tan\\frac{\\nu}{2}$$\n\n$T_p$ is the time of periapsis passage. Kepler’s equation has no general elementary inverse, so the simulator uses Halley iteration; Barker’s equation has a closed-form (Cardano) solution. Solution quality is assessed by the equation residual and by independent tests of position, velocity and energy conservation.',
      },
    },
    {
      title: { vi: '4. Bảo toàn năng lượng và mômen động lượng', en: '4. Conservation of energy and angular momentum' },
      body: {
        vi: 'Với chuyển động tương đối của hai vật, tham số hấp dẫn chuẩn là $\\mu = G(M+m)$.\n\n$$\\varepsilon = \\frac{v^2}{2} - \\frac{\\mu}{r} = \\frac{\\mu(e-1)}{2q},\\qquad v^2 = \\mu\\left(\\frac{2}{r} - \\frac{1}{a}\\right),\\qquad h = |\\mathbf r\\times\\mathbf v| = \\sqrt{\\mu q(1+e)}$$\n\nĐối với elip $\\varepsilon < 0$ (và $\\varepsilon = -\\mu/2a$); với parabol $\\varepsilon = 0$; với hyperbol $\\varepsilon > 0$.\n\nVì lực hấp dẫn là lực xuyên tâm, mômen động lượng riêng được bảo toàn. Kết hợp với bảo toàn năng lượng, điều này giải thích vì sao vận tốc thay đổi theo khoảng cách và vì sao vận tốc lớn nhất tại cận điểm.\n\n**Hai vật quanh khối tâm.** Từ chuyển động tương đối $\\mathbf r = \\mathbf r_m - \\mathbf r_M$ suy ra $\\mathbf r_M = -\\frac{m}{M+m}\\mathbf r$, $\\mathbf r_m = \\frac{M}{M+m}\\mathbf r$: hai vật vẽ hai conic đồng dạng quanh khối tâm.',
        en: 'For the relative motion of two bodies the standard gravitational parameter is $\\mu = G(M+m)$.\n\n$$\\varepsilon = \\frac{v^2}{2} - \\frac{\\mu}{r} = \\frac{\\mu(e-1)}{2q},\\qquad v^2 = \\mu\\left(\\frac{2}{r} - \\frac{1}{a}\\right),\\qquad h = |\\mathbf r\\times\\mathbf v| = \\sqrt{\\mu q(1+e)}$$\n\nFor an ellipse $\\varepsilon < 0$ (and $\\varepsilon = -\\mu/2a$); for a parabola $\\varepsilon = 0$; for a hyperbola $\\varepsilon > 0$.\n\nGravity is a central force, so the specific angular momentum is conserved. Together with energy conservation this explains why the speed changes with distance and peaks at periapsis.\n\n**Two bodies about the barycentre.** From the relative motion $\\mathbf r = \\mathbf r_m - \\mathbf r_M$: $\\mathbf r_M = -\\frac{m}{M+m}\\mathbf r$, $\\mathbf r_m = \\frac{M}{M+m}\\mathbf r$ - the two bodies trace similar conics about the barycentre.',
      },
    },
  ],
  activities: [
    {
      title: { vi: 'Thử nghiệm 1 - Quỹ đạo Trái Đất', en: 'Experiment 1 - Earth’s orbit' },
      text: {
        vi: 'Chọn cấu hình Trái Đất (e ≈ 0,0167). Quan sát sự khác biệt giữa cận điểm và viễn điểm. Tính hai khoảng cách từ bán trục lớn và độ lệch tâm; giải thích vì sao quỹ đạo thực gần tròn nhưng không phải đường tròn hoàn hảo. So sánh chu kỳ tính được với 365,256 ngày (NASA) và với cấu hình tròn lý tưởng a = 1 au.',
        en: 'Choose the Earth preset (e ≈ 0.0167). Compare perihelion and aphelion. Compute both distances from the semi-major axis and eccentricity; explain why the real orbit is nearly but not exactly circular. Compare the computed period with 365.256 d (NASA) and with the idealised a = 1 au circle.',
      },
      params: { preset: 'earth', areas: false },
    },
    {
      title: { vi: 'Thử nghiệm 2 - Diện tích quét', en: 'Experiment 2 - Swept areas' },
      text: {
        vi: 'Đặt e = 0,7 và bật diện tích quét. Mỗi múi được quét trong cùng một khoảng thời gian. So sánh các múi và quan sát sự khác biệt về góc quét, chiều dài cung và vận tốc. Các múi có góc quét khác nhau nhưng diện tích bằng nhau - đọc diện tích kỳ vọng h·Δt/2 và độ lệch ở bảng số liệu.',
        en: 'Set e = 0.7 and turn on swept areas. Each sector takes the same time. Compare sweep angle, arc length and speed between sectors. The angles differ but the areas are equal - read the expected area h·Δt/2 and the deviation in the readouts.',
      },
      params: { preset: 'custom', e: 0.7, q: 0.4, areas: true },
    },
    {
      title: { vi: 'Thử nghiệm 3 - Sao chổi Halley', en: 'Experiment 3 - Comet Halley' },
      text: {
        vi: 'Chọn 1P/Halley (e ≈ 0,968). Tính bán trục lớn từ khoảng cách cận điểm, rồi ước lượng chu kỳ bằng định luật III. So sánh với chu kỳ trung bình khoảng 76 năm và lưu ý rằng tương tác hấp dẫn với các hành tinh làm chu kỳ thực thay đổi giữa các lần trở lại.',
        en: 'Choose 1P/Halley (e ≈ 0.968). Compute the semi-major axis from the periapsis distance, then estimate the period with the third law. Compare with the ~76-year average and note that planetary perturbations change the actual period from one return to the next.',
      },
      params: { preset: 'halley' },
    },
    {
      title: { vi: 'Thử nghiệm 4 - Ngưỡng thoát', en: 'Experiment 4 - The escape threshold' },
      text: {
        vi: 'Giữ q cố định và thay đổi e qua giá trị 1. Theo dõi dấu của năng lượng riêng khi quỹ đạo chuyển từ elip sang parabol rồi hyperbol, và việc chu kỳ biến mất. Đối chiếu trường hợp hyperbol với 1I/ʻOumuamua (e ≈ 1,20).',
        en: 'Keep q fixed and move e through 1. Watch the sign of the specific energy as the orbit goes from ellipse to parabola to hyperbola, and the period disappear. Compare the hyperbolic case with 1I/ʻOumuamua (e ≈ 1.20).',
      },
      params: { preset: 'oumuamua' },
    },
    {
      title: { vi: 'Thử nghiệm 5 - Kiểm chứng định luật III', en: 'Experiment 5 - Testing the third law' },
      text: {
        vi: 'Khảo sát các hành tinh trong đồ thị P theo a (thang log). Kiểm tra quan hệ tuyến tính độ dốc 3/2, rồi tăng khối lượng sao M lên 2 M☉: đường lý thuyết dịch xuống bao nhiêu? Giải thích sự khác nhau giữa dạng chuẩn hoá P² = a³ và công thức tổng quát có (M + m).',
        en: 'Study the planets on the log P–a plot. Check the slope of 3/2, then raise the star mass M to 2 M☉: how far does the theory line move down? Explain the difference between the normalised P² = a³ and the general (M + m) form.',
      },
      params: { preset: 'earth', m: 2 },
    },
  ],
  quiz: [
    {
      q: { vi: 'Trên một quỹ đạo elip, vật thể đạt vận tốc lớn nhất ở đâu?', en: 'Where on an elliptical orbit is the speed greatest?' },
      options: [{ vi: 'Viễn điểm', en: 'Apoapsis' }, { vi: 'Cận điểm', en: 'Periapsis' }, { vi: 'Đầu mút trục nhỏ', en: 'End of the minor axis' }, { vi: 'Vận tốc không đổi', en: 'Speed is constant' }],
      answer: 1,
      explain: { vi: 'Tại cận điểm, nơi khoảng cách tới vật thể trung tâm nhỏ nhất ($h = r v_\\perp$ không đổi).', en: 'At periapsis, where the distance is smallest ($h = r v_\\perp$ is constant).' },
    },
    {
      q: { vi: 'Một vật thể có bán trục lớn a = 4 au quay quanh Mặt Trời. Chu kỳ xấp xỉ bao nhiêu?', en: 'A body with a = 4 au orbits the Sun. What is its period?' },
      options: [{ vi: '4 năm', en: '4 yr' }, { vi: '8 năm', en: '8 yr' }, { vi: '16 năm', en: '16 yr' }, { vi: '64 năm', en: '64 yr' }],
      answer: 1,
      explain: { vi: '$P = \\sqrt{a^3} = \\sqrt{64} = 8$ năm, theo dạng chuẩn hoá của định luật III (m ≪ M☉).', en: '$P = \\sqrt{a^3} = \\sqrt{64} = 8$ yr, from the normalised third law (m ≪ M☉).' },
    },
    {
      q: { vi: 'Quỹ đạo có năng lượng riêng bằng không tương ứng với trường hợp nào?', en: 'Which orbit has zero specific energy?' },
      options: [{ vi: 'Tròn', en: 'Circle' }, { vi: 'Elip', en: 'Ellipse' }, { vi: 'Parabol', en: 'Parabola' }, { vi: 'Hyperbol', en: 'Hyperbola' }],
      answer: 2,
      explain: { vi: 'Quỹ đạo parabol, e = 1, trong bài toán hai vật lý tưởng.', en: 'The parabola, e = 1, in the ideal two-body problem.' },
    },
    {
      q: { vi: 'Vì sao các múi quét trong những khoảng thời gian bằng nhau có diện tích bằng nhau nhưng góc quét không bằng nhau?', en: 'Why do sectors swept in equal times have equal areas but unequal angles?' },
      options: [
        { vi: 'Vì tốc độ góc thay đổi theo khoảng cách', en: 'Because the angular speed changes with distance' },
        { vi: 'Vì quỹ đạo là đường tròn', en: 'Because the orbit is a circle' },
        { vi: 'Vì năng lượng không bảo toàn', en: 'Because energy is not conserved' },
      ],
      answer: 0,
      explain: { vi: 'Gần cận điểm vật chuyển động nhanh và quét góc lớn hơn trong cùng thời gian; gần viễn điểm chậm hơn. $r^2\\dot\\nu = h$ không đổi.', en: 'Near periapsis the body moves fast and sweeps a larger angle in the same time; near apoapsis it is slower. $r^2\\dot\\nu = h$ is constant.' },
    },
  ],
  instructor: {
    vi: 'Dùng mục “Dự đoán rồi kiểm chứng”: hỏi trước “nếu tăng a lên hai lần, chu kỳ tăng bao nhiêu lần?”, sau đó kiểm chứng ($2^{3/2} ≈ 2,83$). Ở cấp Chuyên sâu, xuất CSV (có siêu dữ liệu mô hình) để học sinh tự kiểm tra bảo toàn năng lượng và mômen động lượng.\n\nTài liệu: NASA - Orbits and Kepler’s Laws; NASA/JPL - Approximate Positions of the Planets; MIT OpenCourseWare 16.346 - Barker’s Equation and Kepler’s Equation; NASA - 1P/Halley, Earth Fact Sheet; NASA - What We Know - and Don’t Know - About ʻOumuamua.',
    en: 'Use “Predict, then verify”: ask first “if a doubles, by what factor does the period grow?”, then check ($2^{3/2} ≈ 2.83$). At the Advanced level, export the CSV (with model metadata) and let students verify energy and angular-momentum conservation.\n\nReferences: NASA - Orbits and Kepler’s Laws; NASA/JPL - Approximate Positions of the Planets; MIT OpenCourseWare 16.346 - Barker’s Equation and Kepler’s Equation; NASA - 1P/Halley, Earth Fact Sheet; NASA - What We Know - and Don’t Know - About ʻOumuamua.',
  },
};

/** Model Card · B1. Measured figures: `npm run validate:kepler` → docs/validation/B1-kepler.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Mô hình động lực học định lượng', en: 'Level A - Quantitative dynamical model' },
      body: {
        vi: 'Mô hình mô tả chuyển động tương đối của hai vật chịu lực hấp dẫn Newton trong một hệ cô lập, bỏ qua nhiễu loạn bên ngoài. Quỹ đạo được xác định từ khoảng cách cận điểm q, độ lệch tâm e và tham số hấp dẫn chuẩn μ = G(M + m). Hệ thống hỗ trợ ba loại conic: elip, parabol và hyperbol; vị trí theo thời gian được xác định bằng phương trình Kepler hoặc Barker tương ứng, không tích phân số từng bước. Có thể xem chuyển động tương đối (sao chủ tại tiêu điểm) hoặc chuyển động của cả hai vật quanh khối tâm.',
        en: 'The model describes the relative motion of two bodies under Newtonian gravity in an isolated system, without external perturbations. The orbit is set by the periapsis distance q, the eccentricity e and the standard gravitational parameter μ = G(M + m). Three conic types are supported - ellipse, parabola, hyperbola - and the position versus time comes from the matching Kepler or Barker equation, not from step-by-step integration. The view shows either the relative motion (host at the focus) or both bodies about the barycentre.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Kích thước sao/vật thể trên hình (phóng đại)', en: 'Star/body sizes in the drawing (exaggerated)' },
      body: { vi: 'Hình ảnh sao, hành tinh, vectơ được giản lược để trực quan; khoảng cách quỹ đạo vẽ đúng tỉ lệ, kích thước thiên thể thì không.', en: 'Star, planet and vector glyphs are simplified; orbital distances are to scale, body sizes are not.' },
    },
  ],
  fidelityNote: {
    vi: 'Mức A, C là phân loại nội bộ của USAC SimLab, không phải chứng nhận độ chính xác theo tiêu chuẩn quốc tế. Mức tin cậy thực tế phụ thuộc vào tính nhất quán của tham số, thuật toán giải nghiệm và kết quả kiểm định được công bố dưới đây.',
    en: 'Levels A, C are USAC SimLab’s internal scale, not a certification against an international standard. Actual reliability depends on parameter consistency, the solver and the published validation below.',
  },
  equations: [],
  methods: [
    {
      title: { vi: '1. Quỹ đạo conic', en: '1. Conic orbit' },
      tex: ['r(\\nu)=\\frac{p}{1+e\\cos\\nu},\\qquad p=q(1+e)=\\frac{h^2}{\\mu}'],
      body: {
        vi: '$r$ là khoảng cách tương đối; $\\nu$ dị thường thật; $q$ khoảng cách cận điểm; $e$ độ lệch tâm; $p$ bán thông số tiêu. Một biểu thức theo $(q, e)$ dùng chung cho cả ba loại quỹ đạo; với elip, tương đương $r = a(1-e^2)/(1+e\\cos\\nu)$.',
        en: '$r$ is the separation; $\\nu$ the true anomaly; $q$ the periapsis distance; $e$ the eccentricity; $p$ the semi-latus rectum. One $(q, e)$ expression serves all three orbit types; for an ellipse it equals $r = a(1-e^2)/(1+e\\cos\\nu)$.',
      },
    },
    {
      title: { vi: '2. Tham số hấp dẫn chuẩn', en: '2. Standard gravitational parameter' },
      tex: ['\\mu=G(M+m)'],
      body: {
        vi: 'Mặc định dùng tỉ số $m/M$ thật của từng hành tinh (Trái Đất: Trái Đất + Mặt Trăng). Đặt $m/M ≈ 0$ là xấp xỉ vật thể thử $\\mu \\simeq GM$. Ví dụ đo được: với Sao Mộc, bỏ $m$ làm chu kỳ Kepler-III lệch $4{,}5\\times10^{-4}$ so với chuyển động trung bình JPL; dùng $\\mu = G(M+m)$ còn $-2{,}9\\times10^{-5}$.',
        en: 'By default each planet’s real $m/M$ is used (Earth: Earth + Moon). Setting $m/M ≈ 0$ is the test-particle approximation $\\mu \\simeq GM$. Measured example: for Jupiter, dropping $m$ shifts the Kepler-III period by $4.5\\times10^{-4}$ from the JPL mean motion; with $\\mu = G(M+m)$ the difference is $-2.9\\times10^{-5}$.',
      },
    },
    {
      title: { vi: '3. Năng lượng và mômen động lượng riêng', en: '3. Specific energy and angular momentum' },
      tex: ['\\varepsilon=\\frac{v^2}{2}-\\frac{\\mu}{r}=\\frac{\\mu(e-1)}{2q}\\;\\Big(=-\\frac{\\mu}{2a}\\ \\text{khi } a \\text{ hữu hạn}\\Big)', 'h=|\\mathbf r\\times\\mathbf v|=\\sqrt{\\mu q(1+e)},\\qquad v^2=\\mu\\left(\\frac{2}{r}-\\frac{1}{a}\\right)'],
      body: {
        vi: 'Bán trục lớn có dấu: $a = q/(1-e) > 0$ với elip, $a < 0$ với hyperbol (độ lớn hiển thị riêng là $|a|$); với parabol $a$ không hữu hạn và $\\varepsilon = 0$. Tốc độ thoát cục bộ tại khoảng cách $r$: $v_{\\rm esc} = \\sqrt{2\\mu/r}$.',
        en: 'Signed semi-major axis: $a = q/(1-e) > 0$ for an ellipse, $a < 0$ for a hyperbola (its magnitude shown separately as $|a|$); for a parabola $a$ is infinite and $\\varepsilon = 0$. Local escape speed at distance $r$: $v_{\\rm esc} = \\sqrt{2\\mu/r}$.',
      },
    },
    {
      title: { vi: '4. Phương trình thời gian', en: '4. Time equations' },
      tex: [
        '\\text{elip: } M=E-e\\sin E,\\quad M=\\sqrt{\\mu/a^3}\\,(t-T_p)',
        '\\text{hyperbol: } M_h=e\\sinh H-H,\\quad M_h=\\sqrt{\\mu/|a|^3}\\,(t-T_p)',
        '\\text{parabol: } D+\\tfrac{D^3}{3}=\\sqrt{\\mu/(2q^3)}\\,(t-T_p),\\quad D=\\tan\\tfrac{\\nu}{2}',
      ],
      body: {
        vi: '$T_p$ là thời điểm qua cận điểm; $E, H, D$ là các biến phụ. Elip và hyperbol: lặp Halley (giá trị khởi đầu Danby, asinh) tới $10^{-15}$; parabol: nghiệm dạng đóng Cardano. Phân loại có dung sai xác định: $|e-1| < 10^{-9}$ là parabol (dùng chung trong toàn lõi), $e < 10^{-9}$ hiển thị là đường tròn.',
        en: '$T_p$ is the time of periapsis passage; $E, H, D$ the auxiliary variables. Ellipse and hyperbola: Halley iteration (Danby and asinh starters) to $10^{-15}$; parabola: Cardano closed form. Classification has explicit tolerances: $|e-1| < 10^{-9}$ is a parabola (shared across the core), $e < 10^{-9}$ is displayed as a circle.',
      },
    },
    {
      title: { vi: '5. Định luật II và III', en: '5. Second and third laws' },
      tex: ['\\frac{dA}{dt}=\\frac{h}{2},\\qquad P=2\\pi\\sqrt{\\frac{a^3}{\\mu}}\\quad(0\\le e<1)'],
      body: {
        vi: 'Các múi diện tích được giới hạn bởi các mốc **thời gian** bằng nhau ($P/N$ với quỹ đạo đóng; $2t_v/N$ cho một lần bay qua giữa $r = r_{\\max}$ vào và ra với quỹ đạo mở), không phải góc chia đều. Diện tích mỗi múi được đo bằng công thức hình quạt tiêu điểm theo $\\nu$ của hai mốc và bằng tích phân độc lập $\\tfrac12\\int r^2 d\\nu$, so với $h\\Delta t/2$. Chu kỳ chỉ tồn tại khi $e < 1$; với $e \\ge 1$ giao diện không hiển thị chu kỳ, không lặp quỹ đạo và chạy thời gian một chiều.\n\n$P^2 = a^3$ (P theo năm, a theo au, M + m = 1 M☉) đúng tuyệt đối khi đo P bằng **năm Gauss** = 2π/k = 365,2568983 ngày; năm Julius 365,25 ngày lệch $1{,}9\\times10^{-5}$.',
        en: 'Sectors are bounded by equal **time** marks ($P/N$ for closed orbits; $2t_v/N$ for one pass between $r = r_{\\max}$ inbound and outbound for open orbits), not by equal angles. Each sector’s area is measured with the focal-sector formula from the $\\nu$ of its marks and with an independent quadrature $\\tfrac12\\int r^2 d\\nu$, against $h\\Delta t/2$. A period exists only for $e < 1$; for $e \\ge 1$ the interface shows no period, does not loop, and runs time one way.\n\n$P^2 = a^3$ (P in years, a in au, M + m = 1 M☉) is exact when P is measured in **Gaussian years** = 2π/k = 365.2568983 d; the 365.25-d Julian year differs by $1.9\\times10^{-5}$.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Hệ cô lập, chỉ tương tác hấp dẫn Newton giữa hai khối điểm.',
      'Không mô phỏng nhiễu loạn từ vật thứ ba, hiệu ứng tương đối tính (xem D2) hay biến đổi khối lượng.',
      'Quỹ đạo tương đối giải bằng nghiệm Kepler; vị trí quanh khối tâm suy ra bằng r_M = −m/(M+m)·r, r_m = M/(M+m)·r.',
      'Đơn vị thống nhất: au, ngày, $\\mu_\\odot = GM_\\odot$ (DE430) đổi sang au³/ngày².',
      'Quỹ đạo vẽ trong mặt phẳng quỹ đạo (2D), cận điểm trên trục +x, T_p = 0.',
    ],
    en: [
      'Isolated system: Newtonian gravity between two point masses only.',
      'No third-body perturbations, relativistic effects (see D2) or mass change.',
      'The relative orbit is the Kepler solution; barycentric positions follow from r_M = −m/(M+m)·r, r_m = M/(M+m)·r.',
      'Consistent units: au, days, $\\mu_\\odot = GM_\\odot$ (DE430) converted to au³/day².',
      'Orbit drawn in its own plane (2D), periapsis on +x, T_p = 0.',
    ],
  },
  validity: {
    vi: ['Tròn và elip: 0 ≤ e < 1; parabol: |e − 1| < 10⁻⁹; hyperbol: e > 1 (giao diện tới e = 3,5).', 'q > 0; M > 0; m/M ≥ 0.', 'Định luật III chỉ áp dụng cho quỹ đạo đóng.'],
    en: ['Circle and ellipse: 0 ≤ e < 1; parabola: |e − 1| < 10⁻⁹; hyperbola: e > 1 (UI up to e = 3.5).', 'q > 0; M > 0; m/M ≥ 0.', 'The third law applies to closed orbits only.'],
  },
  scope: {
    vi: 'Mô hình là bài toán hai vật lý tưởng; không dự báo quỹ đạo thiên thể thực trong dài hạn vì bỏ qua nhiễu loạn.',
    en: 'The model is the ideal two-body problem; it does not forecast real orbits in the long term because perturbations are neglected.',
  },
  validationText: {
    vi: 'Tái lập bằng `npm run validate:kepler` (→ `docs/validation/B1-kepler.json`), 15 giá trị e từ 0 tới 3,5, gồm 0,999999; 1; 1,000001:\n\n- **Phương trình thời gian:** phần dư ≤ 1,3 × 10⁻¹⁵ (Kepler, hyperbol) và ≤ 2,2 × 10⁻¹² (Barker); đảo ngược t(ν) khớp tới ≤ 4 × 10⁻¹² chu kỳ/cửa sổ.\n- **Năng lượng:** |ε(v, r) − μ(e − 1)/2q| ≤ 1,3 × 10⁻¹⁵ μ/q trên toàn miền.\n- **Mômen động lượng:** |r × v|/h − 1 ≤ 10⁻¹⁴ khi |e − 1| ≥ 0,1; tăng tới 1,4 × 10⁻¹⁰ (e = 0,999999) và 1,6 × 10⁻⁹ (e = 1,000001) do mất chữ số có nghĩa khi |a| rất lớn.\n- **Định luật II:** 12 múi bằng thời gian, diện tích hình học lệch h·Δt/2 tối đa 3,5 × 10⁻¹¹ (gần e = 1) và ≤ 10⁻¹³ ở nơi khác; tích phân độc lập ½∫r²dν cho cùng kết quả (khi |e − 1| ≥ 10⁻⁴).\n- **Định luật III:** năm Gauss 365,2568983 ngày; dạng chuẩn hoá đúng tới 10⁻⁹ với M = 0,3–4 M☉, m/M = 0–0,5. Chu kỳ SBDB của Ceres và Halley tái lập tới 2 × 10⁻¹⁰.\n- **Trái Đất:** từ phần tử trung bình J2000 của Standish và μ = G(M☉ + M⊕ + M☾), P = 365,2578 ngày, lệch +4,9 × 10⁻⁶ (≈ 2,5 phút) so với 365,256 ngày (NASA). Chênh lệch này do a của Standish là phần tử trung bình được làm khớp, đã hấp thụ nhiễu loạn - không phải lỗi đơn vị. Cấu hình “tròn lý tưởng a = 1 au” cho đúng năm Gauss.\n- **Khối tâm:** M·r_M + m·r_m = 0 tới 5 × 10⁻¹⁶.',
    en: 'Reproduce with `npm run validate:kepler` (→ `docs/validation/B1-kepler.json`), 15 values of e from 0 to 3.5 including 0.999999, 1, 1.000001:\n\n- **Time equations:** residual ≤ 1.3 × 10⁻¹⁵ (Kepler, hyperbolic) and ≤ 2.2 × 10⁻¹² (Barker); the t(ν) inverse agrees to ≤ 4 × 10⁻¹² of the period/window.\n- **Energy:** |ε(v, r) − μ(e − 1)/2q| ≤ 1.3 × 10⁻¹⁵ μ/q everywhere.\n- **Angular momentum:** |r × v|/h − 1 ≤ 10⁻¹⁴ for |e − 1| ≥ 0.1; rising to 1.4 × 10⁻¹⁰ (e = 0.999999) and 1.6 × 10⁻⁹ (e = 1.000001) through loss of significance at very large |a|.\n- **Second law:** 12 equal-time sectors, geometric area within 3.5 × 10⁻¹¹ of h·Δt/2 (near e = 1) and ≤ 10⁻¹³ elsewhere; the independent quadrature ½∫r²dν agrees (for |e − 1| ≥ 10⁻⁴).\n- **Third law:** Gaussian year 365.2568983 d; the normalised form holds to 10⁻⁹ for M = 0.3–4 M☉, m/M = 0–0.5. SBDB periods of Ceres and Halley reproduced to 2 × 10⁻¹⁰.\n- **Earth:** from Standish’s J2000 mean elements and μ = G(M☉ + M⊕ + M☾), P = 365.2578 d, +4.9 × 10⁻⁶ (≈ 2.5 min) from 365.256 d (NASA). The difference arises because Standish’s a is a fitted mean element that absorbs perturbations - not a unit error. The “idealised a = 1 au circle” gives exactly the Gaussian year.\n- **Barycentre:** M·r_M + m·r_m = 0 to 5 × 10⁻¹⁶.',
  },
  errors: { vi: [], en: [] },
  validation: { vi: [], en: [] },
  limitations: {
    vi: [
      'Không mô phỏng nhiễu loạn hấp dẫn từ các vật thể khác (tiến động cận điểm thực của Sao Thuỷ ≈ 575″/thế kỷ, phần lớn do hành tinh khác).',
      'Không mô tả tiến động tương đối tính và các hiệu chỉnh quỹ đạo bậc cao.',
      'Không dự báo quỹ đạo thiên thể thực trong dài hạn; phần tử tiểu thiên thể là phần tử dao động tại epoch ghi kèm.',
      'Sai số dấu phẩy động tăng khi e rất gần 1 (xem mục kiểm chứng).',
    ],
    en: [
      'No gravitational perturbations from other bodies (Mercury’s observed precession ≈ 575″/century, mostly from other planets).',
      'No relativistic precession or higher-order orbit corrections.',
      'No long-term forecasts of real orbits; small-body elements are osculating at the stated epoch.',
      'Floating-point error grows when e is very close to 1 (see validation).',
    ],
  },
  references: [
    'NASA Science - Orbits and Kepler’s Laws.',
    'NASA/JPL SSD - Approximate Positions of the Planets (Standish, Keplerian Elements, Table 1).',
    'MIT OpenCourseWare 16.346 Astrodynamics - Barker’s Equation and Kepler’s Equation.',
    'NASA - Earth Fact Sheet (sidereal orbit period 365.256 d); NASA - 1P/Halley.',
    'NASA - What We Know - and Don’t Know - About ʻOumuamua.',
    'JPL Small-Body Database API (1 Ceres, 1P/Halley, 1I/ʻOumuamua, 2I/Borisov), queried 2026-10-20.',
    'Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications, 4th ed., §2.2–2.3.',
    'Murray, C. D. & Dermott, S. F. (1999). Solar System Dynamics, ch. 2. Cambridge UP.',
    'Danby, J. M. A. (1988). Fundamentals of Celestial Mechanics, 2nd ed.',
  ],
};
