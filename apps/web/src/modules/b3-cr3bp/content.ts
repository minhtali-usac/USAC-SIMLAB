import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Giải thích các giả định và hệ đơn vị chuẩn hoá của CR3BP.',
      'Xác định vị trí năm điểm Lagrange và phân biệt ba điểm thẳng hàng với hai điểm tam giác.',
      'Giải thích hằng số Jacobi và điều kiện xác định miền khả dĩ, miền cấm.',
      'Dự đoán các thay đổi về cấu trúc miền Hill khi hằng số Jacobi đi qua những giá trị tới hạn.',
      'Phân biệt tính ổn định tuyến tính của L4, L5 với hành vi thực tế của các quỹ đạo lân cận.',
      'Đánh giá độ tin cậy của tích phân số bằng bảo toàn Jacobi, kiểm tra hội tụ và đối chiếu nghiệm.',
    ],
    en: [
      'Explain the assumptions and normalised units of the CR3BP.',
      'Locate the five Lagrange points and distinguish the three collinear points from the two triangular ones.',
      'Explain the Jacobi constant and the condition defining allowed and forbidden regions.',
      'Predict how the Hill-region structure changes as the Jacobi constant crosses its critical values.',
      'Distinguish the linear stability of L4, L5 from the actual behaviour of nearby orbits.',
      'Assess numerical reliability with Jacobi conservation, convergence tests and cross-checks.',
    ],
  },
  durationMin: 45,
  prerequisites: { vi: 'B1 - Quỹ đạo Kepler; hệ toạ độ quay; lực hấp dẫn Newton; đạo hàm và tích phân cơ bản; nhập môn phương trình vi phân.', en: 'B1 - Kepler orbits; rotating frames; Newtonian gravity; basic calculus; introductory differential equations.' },
  background: [
    {
      title: { vi: 'Động lực học trong hệ quy chiếu quay', en: 'Dynamics in a rotating frame' },
      body: {
        vi: 'Trong bài toán hai vật, chuyển động được mô tả bằng các quỹ đạo Kepler và những đại lượng bảo toàn quen thuộc. Khi một vật thử đồng thời chịu ảnh hưởng hấp dẫn của hai vật chính đang chuyển động quanh nhau, cấu trúc động lực học trở nên phong phú hơn: xuất hiện năm điểm Lagrange, các quỹ đạo tuần hoàn và những miền không gian mà vật thử không thể tiếp cận với một mức Jacobi nhất định.\n\nMô-đun B3 dùng **bài toán ba vật hạn chế tròn (CR3BP)**: hai vật chính chuyển động tròn quanh khối tâm, vật thử có khối lượng không đáng kể. Đây **không phải** bài toán ba vật tổng quát; phiên bản hiện tại là phẳng - vật thử ở trong mặt phẳng quỹ đạo của hai vật chính.',
        en: 'In the two-body problem motion is described by Kepler orbits and familiar conserved quantities. When a test body feels two primaries orbiting each other, the dynamics become richer: five Lagrange points, periodic orbits, and regions the test body cannot reach at a given Jacobi level.\n\nModule B3 uses the **circular restricted three-body problem (CR3BP)**: two primaries on circular orbits about their barycentre and a test body of negligible mass. This is **not** the general three-body problem; the current version is planar - the test body stays in the primaries’ orbital plane.',
      },
    },
    {
      title: { vi: '1. Bài toán ba vật hạn chế tròn', en: '1. The circular restricted three-body problem' },
      body: {
        vi: '$$\\mu = \\frac{m_2}{m_1 + m_2},\\qquad 0 < \\mu \\le \\tfrac12$$\n\nTrong hệ đơn vị chuẩn, khoảng cách hai vật chính và tổng khối lượng bằng 1, hệ quay đồng bộ có tốc độ góc bằng 1 (chu kỳ của hai vật chính là $2\\pi$), và\n\n$$P_1 = (-\\mu, 0),\\qquad P_2 = (1-\\mu, 0).$$\n\nPhương trình chuyển động phẳng:\n\n$$\\ddot x - 2\\dot y = \\frac{\\partial\\Omega}{\\partial x},\\qquad \\ddot y + 2\\dot x = \\frac{\\partial\\Omega}{\\partial y}$$\n\nvới **thế hiệu dụng** (pseudo-potential, gồm cả thành phần ly tâm)\n\n$$\\Omega = \\frac{x^2+y^2}{2} + \\frac{1-\\mu}{r_1} + \\frac{\\mu}{r_2},\\quad r_1 = \\sqrt{(x+\\mu)^2+y^2},\\quad r_2 = \\sqrt{(x-1+\\mu)^2+y^2}.$$\n\nCác số hạng $-2\\dot y$, $+2\\dot x$ là hiệu ứng **Coriolis** của hệ quay - thành phần thiết yếu của mô hình, không phải lực hấp dẫn bổ sung.',
        en: '$$\\mu = \\frac{m_2}{m_1 + m_2},\\qquad 0 < \\mu \\le \\tfrac12$$\n\nIn normalised units the primary separation and total mass are 1, the synodic frame rotates at unit angular speed (the primaries’ period is $2\\pi$), and\n\n$$P_1 = (-\\mu, 0),\\qquad P_2 = (1-\\mu, 0).$$\n\nPlanar equations of motion:\n\n$$\\ddot x - 2\\dot y = \\frac{\\partial\\Omega}{\\partial x},\\qquad \\ddot y + 2\\dot x = \\frac{\\partial\\Omega}{\\partial y}$$\n\nwith the **effective potential** (pseudo-potential, including the centrifugal term)\n\n$$\\Omega = \\frac{x^2+y^2}{2} + \\frac{1-\\mu}{r_1} + \\frac{\\mu}{r_2},\\quad r_1 = \\sqrt{(x+\\mu)^2+y^2},\\quad r_2 = \\sqrt{(x-1+\\mu)^2+y^2}.$$\n\nThe $-2\\dot y$, $+2\\dot x$ terms are the **Coriolis** effect of the rotating frame - an essential part of the model, not an extra gravitational force.',
      },
    },
    {
      title: { vi: '2. Năm điểm Lagrange', en: '2. The five Lagrange points' },
      body: {
        vi: 'Các điểm Lagrange là vị trí cân bằng trong hệ quay, thoả $\\nabla\\Omega = 0$. Ba điểm $L_1, L_2, L_3$ nằm trên trục nối hai vật chính và được tìm bằng **nghiệm số** của $\\Omega_x(x, 0) = 0$ trong từng khoảng; hai điểm tam giác có nghiệm tường minh:\n\n$$L_{4,5} = \\left(\\tfrac12 - \\mu,\\ \\pm\\tfrac{\\sqrt3}{2}\\right).$$\n\nTại đó vật thử đứng yên trong hệ quay; trong hệ quán tính nó vẫn quay cùng tốc độ góc với hai vật chính. Các điểm Lagrange là **điểm** cân bằng toán học, không phải vùng không gian rộng.',
        en: 'Lagrange points are equilibria of the rotating frame, $\\nabla\\Omega = 0$. The three points $L_1, L_2, L_3$ lie on the line through the primaries and are found as **numerical roots** of $\\Omega_x(x, 0) = 0$ in separate intervals; the triangular points are explicit:\n\n$$L_{4,5} = \\left(\\tfrac12 - \\mu,\\ \\pm\\tfrac{\\sqrt3}{2}\\right).$$\n\nThere the test body is at rest in the rotating frame; in the inertial frame it still revolves with the primaries. Lagrange points are mathematical equilibrium **points**, not extended regions.',
      },
    },
    {
      title: { vi: '3. Hằng số Jacobi và miền Hill', en: '3. The Jacobi constant and Hill regions' },
      body: {
        vi: '$$C = 2\\Omega - (\\dot x^2 + \\dot y^2)$$\n\nvới $\\dot x, \\dot y$ là vận tốc **trong hệ quay** (không phải vận tốc quán tính). $C$ không đổi trên một nghiệm chính xác. Vì $\\dot x^2 + \\dot y^2 = 2\\Omega - C \\ge 0$, vật thử chỉ có thể ở nơi\n\n$$2\\Omega \\ge C\\quad\\text{(miền khả dĩ)}.$$\n\nVùng $2\\Omega < C$ là **miền cấm**; biên $2\\Omega = C$ là **đường vận tốc bằng không** - ranh giới của miền khả dĩ, không phải quỹ đạo. Hằng số Jacobi là tích phân chuyển động riêng của CR3BP, không đồng nhất với cơ năng quán tính.',
        en: '$$C = 2\\Omega - (\\dot x^2 + \\dot y^2)$$\n\nwith $\\dot x, \\dot y$ the **rotating-frame** velocity (not the inertial velocity). $C$ is constant along an exact solution. Since $\\dot x^2 + \\dot y^2 = 2\\Omega - C \\ge 0$, the test body can only be where\n\n$$2\\Omega \\ge C\\quad\\text{(allowed region)}.$$\n\nThe region $2\\Omega < C$ is **forbidden**; the boundary $2\\Omega = C$ is the **zero-velocity curve** - the edge of the allowed region, not an orbit. The Jacobi constant is the CR3BP’s own integral of motion, not the inertial mechanical energy.',
      },
    },
    {
      title: { vi: '4. Các cổ chai Hill', en: '4. Hill-region necks' },
      body: {
        vi: 'Giá trị Jacobi tại điểm Lagrange là $C_i = 2\\Omega(L_i)$; với hai điểm tam giác $C_{L4} = C_{L5} = 3 - \\mu + \\mu^2$. Hệ Trái Đất–Mặt Trăng ($\\mu ≈ 0{,}01215$): $C_{L1} ≈ 3{,}18834$, $C_{L2} ≈ 3{,}17216$, $C_{L3} ≈ 3{,}01215$, $C_{L4} ≈ 2{,}98800$ - chỉ đúng cho $\\mu$ này.\n\n- Khi $C$ giảm qua $C_{L1}$, cổ chai ở $L_1$ mở: miền quanh hai vật chính thông nhau.\n- Qua $C_{L2}$: mở thêm lối ra miền ngoài qua $L_2$.\n- Qua $C_{L3}$: mở thêm lối qua $L_3$.\n\nKhi $C = C_i$ đúng bằng, đường biên chỉ **vừa chạm** tại $L_i$. Cổ chai mở là **điều kiện cho phép** theo Jacobi; quỹ đạo có thực sự đi qua hay không còn tuỳ trạng thái ban đầu.',
        en: 'The Jacobi value at a Lagrange point is $C_i = 2\\Omega(L_i)$; for the triangular points $C_{L4} = C_{L5} = 3 - \\mu + \\mu^2$. Earth–Moon ($\\mu ≈ 0.01215$): $C_{L1} ≈ 3.18834$, $C_{L2} ≈ 3.17216$, $C_{L3} ≈ 3.01215$, $C_{L4} ≈ 2.98800$ - valid only for this $\\mu$.\n\n- As $C$ drops below $C_{L1}$, the neck at $L_1$ opens: the regions around the primaries connect.\n- Below $C_{L2}$: an exit to the outer region opens at $L_2$.\n- Below $C_{L3}$: a further passage opens at $L_3$.\n\nAt exactly $C = C_i$ the boundary only **touches** at $L_i$. An open neck is a **permission** from the Jacobi condition; whether an orbit actually passes depends on its initial state.',
      },
    },
    {
      title: { vi: '5. Ổn định và 6. tích phân số', en: '5. Stability and 6. numerical integration' },
      body: {
        vi: '$L_1, L_2, L_3$ không ổn định tuyến tính. $L_4, L_5$ ổn định tuyến tính khi\n\n$$\\mu < \\mu_R = \\tfrac12\\left(1 - \\sqrt{23/27}\\right) ≈ 0{,}0385209,$$\n\nthoả mãn với Trái Đất–Mặt Trăng. Ổn định tuyến tính nghĩa là nhiễu đủ nhỏ trong hệ tuyến tính hoá không phân kỳ theo hàm mũ trong mô hình lý tưởng - **không** có nghĩa mọi quỹ đạo gần điểm Lagrange đều tuần hoàn hay ổn định trước mọi nhiễu loạn.\n\nQuỹ đạo vật thử được tính bằng **DOPRI5** (Runge–Kutta thích nghi, không bảo toàn cấu trúc chính xác). Độ trôi của $C$ là **một** phép kiểm tra; cần thêm kiểm tra hội tụ khi giảm dung sai và đối chiếu với một phương pháp độc lập.',
        en: '$L_1, L_2, L_3$ are linearly unstable. $L_4, L_5$ are linearly stable when\n\n$$\\mu < \\mu_R = \\tfrac12\\left(1 - \\sqrt{23/27}\\right) ≈ 0.0385209,$$\n\nwhich holds for Earth–Moon. Linear stability means small perturbations of the linearised system do not grow exponentially in the ideal model - it does **not** mean every orbit near a Lagrange point is periodic or stable against every perturbation.\n\nTest-body orbits are integrated with **DOPRI5** (adaptive Runge–Kutta, not exactly structure-preserving). The drift of $C$ is **one** check; convergence under tighter tolerances and comparison with an independent method are also needed.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Năm điểm Lagrange', en: 'Experiment 1 - The five Lagrange points' }, text: { vi: 'Chọn Trái Đất–Mặt Trăng. Quan sát năm điểm trong hệ quay. Kiểm tra toạ độ L4, L5 bằng quan hệ tam giác đều và so sánh với L1, L2, L3 từ nghiệm số (bảng số liệu, cấp Học tập).', en: 'Choose Earth–Moon. Look at the five points in the rotating frame. Check L4, L5 with the equilateral-triangle relation and compare with the numerical roots L1, L2, L3 (readouts, Student level).' }, params: { sys: 'earthMoon', ic: 'l4exact', hill: false } },
    { title: { vi: 'Thử nghiệm 2 - Mở cổ chai tại L1', en: 'Experiment 2 - Opening the L1 neck' }, text: { vi: 'Chuyển sang “Khám phá mức C”. Bắt đầu với C lớn hơn C_L1, quan sát đường vận tốc bằng không và miền cấm, rồi giảm C qua C_L1, C_L2, C_L3. Giải thích sự thay đổi hình học của các cổ chai.', en: 'Switch to “Explore C”. Start with C above C_L1, look at the zero-velocity curve and forbidden region, then lower C through C_L1, C_L2, C_L3. Explain how the necks change.' }, params: { sys: 'earthMoon', hmode: 'explore', cx: 3.19, hill: true } },
    { title: { vi: 'Thử nghiệm 3 - Điểm cân bằng và quỹ đạo lân cận', en: 'Experiment 3 - Equilibrium versus nearby orbits' }, text: { vi: 'Đặt vật đúng tại L4 với v = 0: nó đứng yên. Sau đó chọn “Lệch khỏi L4” và quan sát quỹ đạo. Làm tương tự với L1 - vì sao vật đúng tại L1 cuối cùng vẫn trôi đi?', en: 'Place the body exactly at L4 with v = 0: it stays. Then choose “Offset from L4” and watch. Do the same at L1 - why does a body placed exactly at L1 eventually drift away?' }, params: { sys: 'earthMoon', ic: 'l4exact' } },
    { title: { vi: 'Thử nghiệm 4 - Kiểm tra độ trôi Jacobi', en: 'Experiment 4 - Checking the Jacobi drift' }, text: { vi: 'Chọn quỹ đạo hỗn loạn, chạy với rtol = 10⁻⁸, 10⁻¹⁰, 10⁻¹². So sánh δ_C, số bước và hình dạng quỹ đạo. Khi nào giảm dung sai không còn làm thay đổi đáng kể kết quả?', en: 'Choose the chaotic orbit and run with rtol = 10⁻⁸, 10⁻¹⁰, 10⁻¹². Compare δ_C, the step counts and the orbit shape. When does tightening the tolerance stop changing the result appreciably?' }, params: { sys: 'earthMoon', ic: 'chaos', tol: 8 } },
    { title: { vi: 'Thử nghiệm 5 - Trojan và Routh', en: 'Experiment 5 - Trojans and Routh' }, text: { vi: 'Mặt Trời–Sao Mộc, “Lệch khỏi L4”: vật dao động hình nòng nọc. Đổi sang Pluto–Charon (μ ≈ 0,109 > μ_R): với cùng kiểu lệch, quỹ đạo thay đổi thế nào?', en: 'Sun–Jupiter, “Offset from L4”: the body librates on a tadpole. Switch to Pluto–Charon (μ ≈ 0.109 > μ_R): with the same kind of offset, how does the orbit change?' }, params: { sys: 'sunJupiter', ic: 'l4' } },
  ],
  quiz: [
    { q: { vi: 'Vì sao hai vật chính đứng yên trong hệ quay nhưng không đứng yên trong hệ quán tính?', en: 'Why are the primaries at rest in the rotating frame but not in the inertial frame?' }, options: [{ vi: 'Vì hệ toạ độ quay cùng tốc độ góc với hai vật chính', en: 'Because the frame rotates with the primaries’ angular speed' }, { vi: 'Vì chúng không có khối lượng', en: 'Because they are massless' }], answer: 0, explain: { vi: 'Trong hệ quán tính cả hai vẫn chuyển động quanh khối tâm.', en: 'In the inertial frame both still orbit the barycentre.' } },
    { q: { vi: 'Điều kiện để một vị trí thuộc miền khả dĩ ở mức Jacobi C là:', en: 'A position is allowed at Jacobi level C when:' }, options: [{ vi: '2Ω ≥ C', en: '2Ω ≥ C' }, { vi: '2Ω < C', en: '2Ω < C' }, { vi: 'Ω = 0', en: 'Ω = 0' }], answer: 0, explain: { vi: 'Bình phương vận tốc trong hệ quay 2Ω − C phải không âm.', en: 'The squared rotating-frame speed 2Ω − C must be non-negative.' } },
    { q: { vi: 'Khi C thấp hơn C_L1, điều gì thay đổi?', en: 'When C is below C_L1, what changes?' }, options: [{ vi: 'Cổ chai L1 mở về mặt miền khả dĩ - chưa đảm bảo quỹ đạo đi qua', en: 'The L1 neck opens as far as the allowed region goes - passage is not guaranteed' }, { vi: 'Vật chắc chắn đi qua L1', en: 'The body certainly passes L1' }], answer: 0, explain: { vi: 'Cổ chai mở chỉ là điều kiện cho phép; quỹ đạo cụ thể còn tuỳ trạng thái đầu.', en: 'An open neck is only a permission; a given orbit depends on its initial state.' } },
    { q: { vi: 'Vì sao không thể kết luận mọi quỹ đạo quanh L4, L5 đều ổn định chỉ từ điều kiện Routh?', en: 'Why can’t Routh’s criterion alone prove every orbit around L4, L5 is stable?' }, options: [{ vi: 'Routh chỉ cho ổn định tuyến tính của điểm cân bằng trong mô hình lý tưởng', en: 'Routh only gives linear stability of the equilibrium in the ideal model' }, { vi: 'Vì Routh sai', en: 'Because Routh is wrong' }], answer: 0, explain: { vi: 'Hành vi quỹ đạo cụ thể còn phụ thuộc điều kiện đầu, động lực học phi tuyến và nhiễu loạn bị bỏ qua.', en: 'A given orbit also depends on initial conditions, nonlinear dynamics and neglected perturbations.' } },
    { q: { vi: 'Vì sao phải kiểm tra độ trôi Jacobi khi dùng tích phân số?', en: 'Why check the Jacobi drift in numerical integration?' }, options: [{ vi: 'C bảo toàn trong nghiệm chính xác nên độ trôi lớn báo hiệu sai số - nhưng vẫn cần kiểm tra hội tụ', en: 'C is conserved exactly, so a large drift signals error - but convergence tests are still needed' }, { vi: 'Vì C là năng lượng quán tính', en: 'Because C is the inertial energy' }], answer: 0, explain: { vi: 'Độ trôi nhỏ là điều kiện cần, chưa đủ.', en: 'A small drift is necessary, not sufficient.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Szebehely (1967) Theory of Orbits; Murray & Dermott (1999) Solar System Dynamics, ch. 3; MIT OpenCourseWare 16.346 - The Restricted Problem of Three Bodies; NASA Science - What are Lagrange Points?; tài liệu nghiên cứu về CR3BP, hằng số Jacobi và đường vận tốc bằng không.',
    en: 'Resources: Szebehely (1967) Theory of Orbits; Murray & Dermott (1999) Solar System Dynamics, ch. 3; MIT OpenCourseWare 16.346 - The Restricted Problem of Three Bodies; NASA Science - What are Lagrange Points?; research literature on the CR3BP, the Jacobi constant and zero-velocity curves.',
  },
};

/** Model Card · B3. Measured figures: `npm run validate:cr3bp` → docs/validation/B3-cr3bp.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Mô hình động lực học lý tưởng phục vụ giáo dục (CR3BP phẳng)', en: 'Level B - Idealised dynamical model for education (planar CR3BP)' },
      body: {
        vi: 'B3 triển khai bài toán ba vật hạn chế tròn phẳng: hai vật chính khối lượng hữu hạn chuyển động tròn quanh khối tâm; vật thử khối lượng không đáng kể, không tác động ngược. Mô hình dùng hệ toạ độ quay đồng bộ và đơn vị chuẩn hoá để xác định điểm Lagrange, quỹ đạo vật thử, hằng số Jacobi và các miền khả dĩ. Điểm Lagrange, giá trị Jacobi tới hạn và ổn định tuyến tính là giải tích / nghiệm số tới độ chính xác máy; quỹ đạo là tích phân số có sai số được đo.',
        en: 'B3 implements the planar circular restricted three-body problem: two finite-mass primaries on circular orbits about the barycentre and a massless test body with no back-reaction. A synodic frame and normalised units are used for the Lagrange points, test-body orbits, the Jacobi constant and allowed regions. Lagrange points, critical Jacobi values and linear stability are analytic / root-found to machine precision; orbits are numerical integrations with measured error.',
      },
    },
  ],
  fidelityNote: {
    vi: 'Mức B là phân loại nội bộ của USAC SimLab. Kết quả số chỉ được xem là đã kiểm chứng trong phạm vi các bộ tham số, dung sai và phép thử được công bố dưới đây.',
    en: 'Level B is USAC SimLab’s internal scale. Numerical results count as validated only within the parameter sets, tolerances and tests published below.',
  },
  equations: [],
  methods: [
    {
      title: { vi: '1. Tham số khối lượng và hệ đơn vị', en: '1. Mass parameter and units' },
      tex: ['\\mu=\\frac{m_2}{m_1+m_2},\\quad 0<\\mu\\le\\tfrac12,\\qquad P_1=(-\\mu,0),\\quad P_2=(1-\\mu,0)', 'r_1=\\sqrt{(x+\\mu)^2+y^2},\\qquad r_2=\\sqrt{(x-1+\\mu)^2+y^2}'],
      body: {
        vi: 'Quy ước $m_1 \\ge m_2$. Tổng khối lượng, khoảng cách hai vật chính, tốc độ góc và hằng số hấp dẫn chuẩn hoá đều bằng 1. Toạ độ, vận tốc và thời gian không thứ nguyên; khi hiển thị đại lượng vật lý, đơn vị độ dài là khoảng cách $d$ và đơn vị thời gian là $1/n$, $n = \\sqrt{G(m_1+m_2)/d^3}$ (Trái Đất–Mặt Trăng với $d$ = 384 400 km: $2\\pi/n$ = 27,28 ngày). Hệ Mặt Trời – Trái Đất dùng khối lượng Trái Đất + Mặt Trăng làm $m_2$.',
        en: 'Convention $m_1 \\ge m_2$. Total mass, primary separation, angular speed and the gravitational constant are all 1. Coordinates, velocities and time are dimensionless; for display the length unit is the separation $d$ and the time unit is $1/n$, $n = \\sqrt{G(m_1+m_2)/d^3}$ (Earth–Moon with $d$ = 384,400 km: $2\\pi/n$ = 27.28 d). Sun–Earth uses Earth + Moon as $m_2$.',
      },
    },
    {
      title: { vi: '2. Thế hiệu dụng và phương trình chuyển động', en: '2. Effective potential and equations of motion' },
      tex: ['\\Omega=\\tfrac12(x^2+y^2)+\\frac{1-\\mu}{r_1}+\\frac{\\mu}{r_2}', '\\ddot x-2\\dot y=\\frac{\\partial\\Omega}{\\partial x},\\qquad \\ddot y+2\\dot x=\\frac{\\partial\\Omega}{\\partial y}'],
      body: {
        vi: 'Áp dụng trong hệ quy chiếu quay đồng bộ của bài toán phẳng. Thế hiệu dụng gồm thành phần ly tâm; các số hạng $\\mp 2\\dot y, \\dot x$ là Coriolis của hệ quay.',
        en: 'Valid in the synodic frame of the planar problem. The effective potential includes the centrifugal term; the $\\mp 2\\dot y, \\dot x$ terms are the rotating-frame Coriolis terms.',
      },
    },
    {
      title: { vi: '3. Điểm Lagrange', en: '3. Lagrange points' },
      tex: ['\\nabla\\Omega=0,\\qquad L_{4,5}=\\left(\\tfrac12-\\mu,\\ \\pm\\tfrac{\\sqrt3}{2}\\right),\\qquad C_i=2\\Omega(L_i),\\quad C_{L4}=C_{L5}=3-\\mu+\\mu^2'],
      body: {
        vi: '$L_1, L_2, L_3$: nghiệm của $\\Omega_x(x, 0) = 0$ bằng chia đôi có khoảng kẹp tự động theo $\\mu$ - $(-\\mu, 1-\\mu)$, $(1-\\mu, 2+\\mu)$, $(-2-\\mu, -\\mu)$ - tới độ chính xác máy. Phần dư $|\\nabla\\Omega(L_i)|$ được kiểm tra. Toạ độ chỉ được đổi sang km sau khi đã tính trong hệ chuẩn hoá.',
        en: '$L_1, L_2, L_3$: roots of $\\Omega_x(x, 0) = 0$ by bisection with brackets set from $\\mu$ - $(-\\mu, 1-\\mu)$, $(1-\\mu, 2+\\mu)$, $(-2-\\mu, -\\mu)$ - to machine precision. Residuals $|\\nabla\\Omega(L_i)|$ are checked. Coordinates are converted to km only after being solved in normalised units.',
      },
    },
    {
      title: { vi: '4. Hằng số Jacobi và miền Hill', en: '4. Jacobi constant and Hill regions' },
      tex: ['C=2\\Omega-(\\dot x^2+\\dot y^2),\\qquad \\dot x^2+\\dot y^2=2\\Omega-C'],
      body: {
        vi: 'Vận tốc là vận tốc **trong hệ quay**. Miền khả dĩ $2\\Omega \\ge C$; miền cấm $2\\Omega < C$; đường vận tốc bằng không $2\\Omega = C$. Trạng thái cổ chai $L_1, L_2, L_3$ được xác định bằng so sánh $C$ với $C_i$ tính từ cùng $\\mu$: đóng nếu $C > C_i$, vừa chạm nếu $|C - C_i| \\le 10^{-9}$, mở nếu $C < C_i$ - không dùng ngưỡng cố định. Miền Hill trên hình được tính trên lưới 3 điểm ảnh; đường biên là nơi dấu của $2\\Omega - C$ đổi.',
        en: 'Velocities are **rotating-frame** velocities. Allowed region $2\\Omega \\ge C$; forbidden $2\\Omega < C$; zero-velocity curve $2\\Omega = C$. The state of the $L_1, L_2, L_3$ necks compares $C$ with the $C_i$ from the same $\\mu$: closed if $C > C_i$, touching if $|C - C_i| \\le 10^{-9}$, open if $C < C_i$ - no fixed thresholds. The Hill region is drawn on a 3-pixel grid; the boundary is where $2\\Omega - C$ changes sign.',
      },
    },
    {
      title: { vi: '5. Ổn định tuyến tính và tiêu chuẩn Routh', en: '5. Linear stability and Routh’s criterion' },
      tex: ['\\Lambda^2+(4-\\Omega_{xx}-\\Omega_{yy})\\Lambda+(\\Omega_{xx}\\Omega_{yy}-\\Omega_{xy}^2)=0,\\quad \\Lambda=\\lambda^2', '\\mu_R=\\tfrac12\\left(1-\\sqrt{23/27}\\right)\\approx 0{,}0385209'],
      body: {
        vi: 'Ổn định tuyến tính được tính **trực tiếp** từ Hessian giải tích của $\\Omega$ tại mỗi điểm (ổn định khi cả hai nghiệm $\\Lambda$ thực và âm) - một phép tính độc lập với công thức Routh. Kết luận chỉ về điểm cân bằng trong mô hình lý tưởng; không khẳng định quỹ đạo lân cận tuần hoàn hay ổn định trước mọi nhiễu loạn.',
        en: 'Linear stability is computed **directly** from the analytic Hessian of $\\Omega$ at each point (stable when both roots $\\Lambda$ are real and negative) - independent of the Routh formula. The conclusion concerns the equilibrium in the ideal model only; it does not claim nearby orbits are periodic or stable against every perturbation.',
      },
    },
    {
      title: { vi: '6. Tích phân số', en: '6. Numerical integration' },
      tex: ['\\delta_C=\\max_{0\\le t\\le T}\\frac{|C(t)-C(0)|}{|C(0)|}'],
      body: {
        vi: 'DOPRI5 (Dormand–Prince 5(4)) với rtol chọn được 10⁻⁸/10⁻¹⁰/10⁻¹², atol = rtol/100, $h_{\\max}$ = 0,05; $\\delta_C$ tính trên **mọi** bước được chấp nhận, kèm số bước chấp nhận/từ chối. Tích phân dừng và báo khi $r_1 < 0{,}01$ hoặc $r_2 < 0{,}003$ (mô hình khối điểm và kiểm soát bước không còn tin cậy) hoặc $r > 6$. Các chỉ số sai số **không** gộp: phần dư Lagrange, $\\delta_C$, sai khác giữa các dung sai, sai khác với RK4 độc lập được báo cáo riêng.',
        en: 'DOPRI5 (Dormand–Prince 5(4)) with selectable rtol 10⁻⁸/10⁻¹⁰/10⁻¹², atol = rtol/100, $h_{\\max}$ = 0.05; $\\delta_C$ is evaluated on **every** accepted step, with accepted/rejected step counts. Integration stops with a message if $r_1 < 0.01$ or $r_2 < 0.003$ (point-mass model and step control no longer reliable) or $r > 6$. Error measures are **not** merged: Lagrange residuals, $\\delta_C$, differences between tolerances and against an independent RK4 are reported separately.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Hai vật chính chuyển động tròn quanh khối tâm với tốc độ góc không đổi.',
      'Vật thử có khối lượng không đáng kể, không ảnh hưởng đến hai vật chính.',
      'Mô hình phẳng; chưa xét chuyển động ngoài mặt phẳng quỹ đạo.',
      'Chỉ hấp dẫn Newton trong CR3BP - không lực đẩy, áp suất bức xạ, lực cản hay thiên thể thứ tư.',
      'Kích thước các vật và vùng tô màu được đơn giản hoá để quan sát, không theo tỉ lệ vật lý.',
    ],
    en: [
      'Primaries on circular orbits about the barycentre at constant angular speed.',
      'Massless test body with no effect on the primaries.',
      'Planar model; no out-of-plane motion.',
      'Newtonian gravity in the CR3BP only - no thrust, radiation pressure, drag or fourth body.',
      'Body sizes and shading are simplified for visibility, not to physical scale.',
    ],
  },
  validity: {
    vi: ['0 < μ ≤ 0,5 (m₁ ≥ m₂).', 'Chuyển động phẳng trong hệ quay đồng bộ.', 'Không tại điểm kỳ dị r₁ = 0 hoặc r₂ = 0.', 'Phân tích miền Hill dùng C tính từ cùng trạng thái và cùng đơn vị chuẩn hoá.'],
    en: ['0 < μ ≤ 0.5 (m₁ ≥ m₂).', 'Planar motion in the synodic frame.', 'Away from the singularities r₁ = 0, r₂ = 0.', 'Hill-region analysis uses C from the same state and normalised units.'],
  },
  validationText: {
    vi: 'Tái lập bằng `npm run validate:cr3bp` (→ `docs/validation/B3-cr3bp.json`), Trái Đất–Mặt Trăng μ = 0,0121506:\n\n- **Vị trí Lagrange:** L1 = 0,836915; L2 = 1,155682; L3 = −1,005063; L4,5 = (0,487849; ±0,866025); phần dư |∇Ω| ≤ 1,1 × 10⁻¹⁵.\n- **Jacobi tới hạn:** C_L1 = 3,188341; C_L2 = 3,172160; C_L3 = 3,012147; C_L4 = 2,987997 trùng 3 − μ + μ² tới 10⁻¹⁵.\n- **Ổn định:** L1–L3 không ổn định (tốc độ tăng 2,93; 2,16; 0,18 trên đơn vị thời gian), L4–L5 ổn định; phân tích trị riêng cho ổn định tại 0,999 μ_R và không ổn định tại 1,001 μ_R.\n- **Giữ cân bằng:** đặt đúng tại L4, v = 0: lệch 0 sau t = 100; tại L1 (không ổn định): lệch 1,9 × 10⁻¹² sau t = 5.\n- **Hội tụ (T = 20):** với rtol 10⁻⁸ → 10⁻¹²: sai số vị trí so với nghiệm rtol 10⁻¹³ giảm từ 9 × 10⁻¹¹ → 2 × 10⁻¹³ (quanh L4) và 6 × 10⁻⁷ → 5 × 10⁻¹¹ (quỹ đạo hỗn loạn); δ_C tương ứng 2 × 10⁻¹² → 5 × 10⁻¹⁵ và 1,1 × 10⁻⁸ → 1 × 10⁻¹².\n- **Đối chiếu độc lập:** RK4 bước cố định h = 10⁻⁴ khớp nghiệm tham chiếu DOPRI5 tới ≤ 3,5 × 10⁻¹² (cả ba trường hợp, kể cả quỹ đạo hỗn loạn).\n\nCác ngưỡng trên áp dụng cho các bộ tham số và thời gian tích phân đã nêu; quỹ đạo hỗn loạn dài hơn sẽ khuếch đại sai số theo hàm mũ.',
    en: 'Reproduce with `npm run validate:cr3bp` (→ `docs/validation/B3-cr3bp.json`), Earth–Moon μ = 0.0121506:\n\n- **Lagrange positions:** L1 = 0.836915; L2 = 1.155682; L3 = −1.005063; L4,5 = (0.487849, ±0.866025); residual |∇Ω| ≤ 1.1 × 10⁻¹⁵.\n- **Critical Jacobi values:** C_L1 = 3.188341; C_L2 = 3.172160; C_L3 = 3.012147; C_L4 = 2.987997, equal to 3 − μ + μ² to 10⁻¹⁵.\n- **Stability:** L1–L3 unstable (growth rates 2.93, 2.16, 0.18 per time unit), L4–L5 stable; the eigen-analysis gives stable at 0.999 μ_R and unstable at 1.001 μ_R.\n- **Equilibrium hold:** exactly at L4, v = 0: zero offset after t = 100; at L1 (unstable): 1.9 × 10⁻¹² after t = 5.\n- **Convergence (T = 20):** rtol 10⁻⁸ → 10⁻¹²: position error vs an rtol 10⁻¹³ solution falls from 9 × 10⁻¹¹ → 2 × 10⁻¹³ (near L4) and 6 × 10⁻⁷ → 5 × 10⁻¹¹ (chaotic orbit); δ_C correspondingly 2 × 10⁻¹² → 5 × 10⁻¹⁵ and 1.1 × 10⁻⁸ → 1 × 10⁻¹².\n- **Independent cross-check:** fixed-step RK4 with h = 10⁻⁴ matches the DOPRI5 reference to ≤ 3.5 × 10⁻¹² (all three cases, including the chaotic orbit).\n\nThese bounds apply to the stated parameters and integration span; longer chaotic runs amplify errors exponentially.',
  },
  errors: { vi: [], en: [] },
  validation: { vi: [], en: [] },
  limitations: {
    vi: [
      'Không có nhiễu loạn từ thiên thể khác, lực đẩy, điều khiển quỹ đạo hay áp suất bức xạ.',
      'Không mô tả chuyển động ba chiều; không có thuật toán tìm quỹ đạo tuần hoàn (Lyapunov, halo) - các cấu trúc này chỉ xuất hiện nếu điều kiện đầu phù hợp.',
      'Không có độ lệch tâm của quỹ đạo vật chính (ER3BP).',
      'Phân loại ổn định của điểm Lagrange không thay thế phân tích ổn định dài hạn của một quỹ đạo thực.',
    ],
    en: [
      'No perturbations from other bodies, thrust, orbit control or radiation pressure.',
      'No 3D motion; no periodic-orbit finder (Lyapunov, halo) - such structures appear only from suitable initial conditions.',
      'No primary eccentricity (ER3BP).',
      'Lagrange-point stability does not replace a long-term stability analysis of a real orbit.',
    ],
  },
  references: [
    'Szebehely, V. (1967). Theory of Orbits: The Restricted Problem of Three Bodies. Academic Press.',
    'Murray, C. D. & Dermott, S. F. (1999). Solar System Dynamics, ch. 3. Cambridge University Press.',
    'MIT OpenCourseWare 16.346 Astrodynamics - The Restricted Problem of Three Bodies.',
    'NASA Science - What are Lagrange Points?',
    'Dormand, J. R. & Prince, P. J. (1980). J. Comput. Appl. Math. 6, 19.',
    'Brozović, M. et al. (2015). Icarus 246, 317 (Pluto–Charon masses).',
  ],
};
