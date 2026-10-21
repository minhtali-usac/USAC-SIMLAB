import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Đọc và vẽ đường thế giới, nón ánh sáng và trục toạ độ của hai hệ quán tính trên biểu đồ Minkowski.',
      'Viết phép biến đổi Lorentz theo rapidity và giải thích vì sao nó là một “phép quay hyperbolic”.',
      'Chứng tỏ tính tương đối của đồng thời và phân loại cặp sự kiện theo khoảng bất biến $s^2$ (kiểu thời gian, kiểu ánh sáng, kiểu không gian).',
      'Giải nghịch lý sinh đôi bằng độ dài Minkowski của đường thế giới và chỉ ra nguồn gốc của sự bất đối xứng.',
    ],
    en: [
      'Read and draw worldlines, light cones and the axes of two inertial frames on a Minkowski diagram.',
      'Write the Lorentz transformation in terms of rapidity and explain why it is a “hyperbolic rotation”.',
      'Demonstrate the relativity of simultaneity and classify event pairs by the invariant interval $s^2$ (timelike, lightlike, spacelike).',
      'Resolve the twin paradox with the Minkowski length of worldlines and identify the source of the asymmetry.',
    ],
  },
  durationMin: 45,
  prerequisites: { vi: 'C1 - Đồng hồ ánh sáng và giãn thời gian; đồ thị vị trí – thời gian; hàm hyperbolic $\\cosh$, $\\sinh$, $\\tanh$.', en: 'C1 - Light clock and time dilation; position–time graphs; hyperbolic functions $\\cosh$, $\\sinh$, $\\tanh$.' },
  background: [
    {
      title: { vi: 'Không–thời gian như một hình học', en: 'Spacetime as a geometry' },
      body: {
        vi: 'Minkowski (1908) nhận thấy thuyết tương đối hẹp có thể phát biểu như hình học của một không–thời gian bốn chiều. Mỗi **sự kiện** là một điểm $(ct, x)$; chuyển động của một vật là một **đường thế giới**. Mô-đun C2 dùng một chiều không gian, đơn vị năm và năm ánh sáng, nên $c = 1$ và ánh sáng đi theo đường nghiêng 45°.',
        en: 'Minkowski (1908) realised that special relativity can be stated as the geometry of a four-dimensional spacetime. Each **event** is a point $(ct, x)$; a body’s motion is a **worldline**. Module C2 uses one spatial dimension and units of years and light-years, so $c = 1$ and light travels along 45° lines.',
      },
    },
    {
      title: { vi: '1. Phép biến đổi Lorentz và rapidity', en: '1. The Lorentz transformation and rapidity' },
      body: {
        vi: 'Hệ $S\'$ chuyển động với vận tốc $\\beta$ dọc trục $x$ của hệ $S$. Đặt rapidity $\\eta = \\operatorname{artanh}\\beta$, khi đó $\\gamma = \\cosh\\eta$, $\\gamma\\beta = \\sinh\\eta$ và\n\n$$ct\' = ct\\cosh\\eta - x\\sinh\\eta,\\qquad x\' = -ct\\sinh\\eta + x\\cosh\\eta.$$\n\nĐây là một **phép quay hyperbolic**: thay $\\cos, \\sin$ của phép quay Euclid bằng $\\cosh, \\sinh$. Hai phép tăng tốc cùng phương ghép lại bằng cách **cộng rapidity**, tương đương công thức cộng vận tốc\n\n$$\\beta_{13} = \\frac{\\beta_{12} + \\beta_{23}}{1 + \\beta_{12}\\beta_{23}} = \\tanh(\\eta_{12} + \\eta_{23}),$$\n\nnên không có tổ hợp nào vượt quá $c$. Trên biểu đồ của $S$, trục $ct\'$ (đường $x\' = 0$) có độ dốc $1/\\beta$ và trục $x\'$ (đường $ct\' = 0$) có độ dốc $\\beta$: cả hai khép lại về phía đường ánh sáng.',
        en: 'Frame $S\'$ moves with speed $\\beta$ along the $x$ axis of $S$. With rapidity $\\eta = \\operatorname{artanh}\\beta$ one has $\\gamma = \\cosh\\eta$, $\\gamma\\beta = \\sinh\\eta$ and\n\n$$ct\' = ct\\cosh\\eta - x\\sinh\\eta,\\qquad x\' = -ct\\sinh\\eta + x\\cosh\\eta.$$\n\nThis is a **hyperbolic rotation**: the $\\cos, \\sin$ of a Euclidean rotation become $\\cosh, \\sinh$. Collinear boosts compose by **adding rapidities**, equivalent to velocity addition\n\n$$\\beta_{13} = \\frac{\\beta_{12} + \\beta_{23}}{1 + \\beta_{12}\\beta_{23}} = \\tanh(\\eta_{12} + \\eta_{23}),$$\n\nso no combination exceeds $c$. On the diagram of $S$, the $ct\'$ axis (the line $x\' = 0$) has slope $1/\\beta$ and the $x\'$ axis (the line $ct\' = 0$) has slope $\\beta$: both close in towards the light line.',
      },
    },
    {
      title: { vi: '2. Tính tương đối của đồng thời', en: '2. The relativity of simultaneity' },
      body: {
        vi: 'Hai sự kiện **đồng thời trong $S$** nằm trên một đường $ct = \\text{hằng số}$. Trong $S\'$, các sự kiện đồng thời nằm trên đường $ct\' = \\text{hằng số}$, song song với trục $x\'$ - một đường nghiêng trên biểu đồ của $S$. Từ phép biến đổi Lorentz, hai sự kiện có cùng $t$ nhưng cách nhau $\\Delta x$ trong $S$ có\n\n$$c\\,\\Delta t\' = -\\gamma\\beta\\,\\Delta x \\ne 0.$$\n\nVậy “cùng lúc” không phải là khái niệm tuyệt đối: nó phụ thuộc vào hệ quy chiếu.',
        en: 'Two events **simultaneous in $S$** lie on a line $ct = \\text{const}$. In $S\'$, simultaneous events lie on lines $ct\' = \\text{const}$, parallel to the $x\'$ axis - tilted lines on the diagram of $S$. From the Lorentz transformation, two events with equal $t$ separated by $\\Delta x$ in $S$ have\n\n$$c\\,\\Delta t\' = -\\gamma\\beta\\,\\Delta x \\ne 0.$$\n\nSo “at the same time” is not absolute: it depends on the frame.',
      },
    },
    {
      title: { vi: '3. Khoảng bất biến và nhân quả', en: '3. The invariant interval and causality' },
      body: {
        vi: 'Mọi hệ quán tính đều đo được cùng một **khoảng không–thời gian**\n\n$$s^2 = (c\\,\\Delta t)^2 - \\Delta x^2.$$\n\n- $s^2 > 0$ (**kiểu thời gian**): một sự kiện nằm trong nón ánh sáng của sự kiện kia; thứ tự thời gian như nhau trong mọi hệ, nên chúng có thể liên hệ nhân quả. $\\sqrt{s^2}/c$ là thời gian riêng của một đồng hồ quán tính đi qua cả hai sự kiện.\n- $s^2 = 0$ (**kiểu ánh sáng**): chỉ một tín hiệu ánh sáng nối được hai sự kiện.\n- $s^2 < 0$ (**kiểu không gian**): tồn tại hệ thấy chúng đồng thời và hệ thấy thứ tự đảo ngược; không tín hiệu nào nối được chúng.\n\nKhi đổi hệ, một sự kiện trượt dọc **hyperbol** $s^2 = \\text{hằng số}$ chứ không rời khỏi nó.',
        en: 'All inertial frames measure the same **spacetime interval**\n\n$$s^2 = (c\\,\\Delta t)^2 - \\Delta x^2.$$\n\n- $s^2 > 0$ (**timelike**): one event lies inside the other’s light cone; the time order is the same in every frame, so they can be causally related. $\\sqrt{s^2}/c$ is the proper time of an inertial clock passing through both.\n- $s^2 = 0$ (**lightlike**): only a light signal connects them.\n- $s^2 < 0$ (**spacelike**): some frame sees them simultaneous and another sees the order reversed; no signal can connect them.\n\nUnder a change of frame an event slides along the **hyperbola** $s^2 = \\text{const}$ and never leaves it.',
      },
    },
    {
      title: { vi: '4. Nghịch lý sinh đôi', en: '4. The twin paradox' },
      body: {
        vi: 'Người ở nhà đứng yên trong $S$; người du hành bay tới một ngôi sao cách $d$ với vận tốc $\\beta$ rồi quay về. Thời gian riêng là “độ dài” Minkowski của đường thế giới:\n\n$$\\tau = \\int \\sqrt{1 - \\beta(t)^2}\\,dt.$$\n\nNgười ở nhà già thêm $t = 2d/\\beta$; người du hành chỉ già thêm $\\tau = t/\\gamma$. Ví dụ với $d = 4{,}24$ năm ánh sáng và $\\beta = 0{,}8$ ($\\gamma = 5/3$): $t = 10{,}6$ năm, $\\tau = 6{,}36$ năm. Trong hình học Minkowski, **đường thẳng (quán tính) giữa hai sự kiện có thời gian riêng lớn nhất**, ngược với hình học Euclid nơi đường thẳng là ngắn nhất.\n\nHai người **không đối xứng**: chỉ người du hành đổi hệ quán tính ở điểm quay đầu. Trên biểu đồ, đường đồng thời của người du hành “nhảy” đột ngột tại đó - đó là phần thời gian của người ở nhà mà người du hành “bỏ qua” khi đổi hệ.',
        en: 'The stay-at-home twin is at rest in $S$; the traveller flies to a star at distance $d$ with speed $\\beta$ and back. Proper time is the Minkowski “length” of a worldline:\n\n$$\\tau = \\int \\sqrt{1 - \\beta(t)^2}\\,dt.$$\n\nThe stay-at-home twin ages $t = 2d/\\beta$; the traveller only $\\tau = t/\\gamma$. For example with $d = 4.24$ ly and $\\beta = 0.8$ ($\\gamma = 5/3$): $t = 10.6$ yr, $\\tau = 6.36$ yr. In Minkowski geometry **the straight (inertial) worldline between two events has the greatest proper time**, the opposite of Euclidean geometry where the straight line is shortest.\n\nThe twins are **not symmetric**: only the traveller changes inertial frame at the turnaround. On the diagram the traveller’s line of simultaneity jumps abruptly there - the stretch of home time the traveller “skips” when switching frames.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Đồng thời là tương đối', en: 'Experiment 1 - Simultaneity is relative' }, text: { vi: 'Sự kiện B và C có cùng $ct = 2$ trong $S$. Đặt $\\beta\' = 0{,}5$ và đọc $ct\'$ của B, C. Sự kiện nào xảy ra trước trong $S\'$? Kiểm tra bằng $c\\,\\Delta t\' = -\\gamma\\beta\\,\\Delta x$.', en: 'Events B and C share $ct = 2$ in $S$. Set $\\beta\' = 0.5$ and read $ct\'$ for B and C. Which happens first in $S\'$? Check with $c\\,\\Delta t\' = -\\gamma\\beta\\,\\Delta x$.' }, params: { scene: 'events', bp: 0.5 } },
    { title: { vi: 'Thử nghiệm 2 - Đổi hệ quan sát', en: 'Experiment 2 - Changing the viewing frame' }, text: { vi: 'Kéo thanh “hệ hiển thị”: toàn bộ biểu đồ được biến đổi Lorentz. Quan sát các sự kiện trượt dọc hyperbol bất biến, trong khi đường ánh sáng giữ nguyên góc 45°.', en: 'Drag the “view frame” slider: the whole diagram is Lorentz-transformed. Watch events slide along their invariant hyperbolas while light lines stay at 45°.' }, params: { scene: 'events', view: 0.6 } },
    { title: { vi: 'Thử nghiệm 3 - Phân loại khoảng', en: 'Experiment 3 - Classifying intervals' }, text: { vi: 'Chọn sự kiện D và kéo nó lần lượt vào trong, lên trên và ra ngoài nón ánh sáng của A. Đọc phân loại của từng cặp và giải thích vì sao thứ tự của cặp kiểu không gian có thể đảo ngược khi đổi $\\beta\'$.', en: 'Select event D and drag it inside, onto and outside A’s light cone. Read each pair’s classification and explain why a spacelike pair’s order can reverse as $\\beta\'$ changes.' }, params: { scene: 'events', cone: true, hyp: true } },
    { title: { vi: 'Thử nghiệm 4 - Sinh đôi tới Proxima', en: 'Experiment 4 - Twins to Proxima' }, text: { vi: 'Chọn cảnh “Sinh đôi” với $d = 4{,}24$ năm ánh sáng và $\\beta = 0{,}8$. Tính tay $t = 2d/\\beta$ và $\\tau = t/\\gamma$ rồi so với số liệu. Ai già hơn khi gặp lại, và hơn bao nhiêu năm?', en: 'Choose the “Twins” scene with $d = 4.24$ ly and $\\beta = 0.8$. Compute $t = 2d/\\beta$ and $\\tau = t/\\gamma$ by hand and compare with the readouts. Who is older at the reunion, and by how much?' }, params: { scene: 'twins', tb: 0.8, td: 4.24 } },
  ],
  quiz: [
    { q: { vi: 'Hai sự kiện có $s^2 < 0$. Điều nào đúng?', en: 'Two events have $s^2 < 0$. Which is true?' }, options: [{ vi: 'Thứ tự thời gian của chúng phụ thuộc hệ quy chiếu', en: 'Their time order depends on the frame' }, { vi: 'Một sự kiện có thể gây ra sự kiện kia', en: 'One can cause the other' }, { vi: 'Chúng luôn đồng thời', en: 'They are always simultaneous' }], answer: 0, explain: { vi: 'Cặp kiểu không gian: có hệ thấy chúng đồng thời, có hệ thấy thứ tự ngược lại, nên không thể có quan hệ nhân quả.', en: 'Spacelike pair: some frame sees them simultaneous, another the reverse order, so no causal relation is possible.' } },
    { q: { vi: 'Với $\\beta = 0{,}8$, chuyến đi khứ hồi $2 \\times 4{,}24$ năm ánh sáng làm người du hành già thêm:', en: 'At $\\beta = 0.8$, a $2 \\times 4.24$ ly round trip ages the traveller by:' }, options: [{ vi: '6,36 năm', en: '6.36 yr' }, { vi: '10,6 năm', en: '10.6 yr' }, { vi: '8,48 năm', en: '8.48 yr' }], answer: 0, explain: { vi: '$t = 8{,}48/0{,}8 = 10{,}6$ năm; $\\tau = t/\\gamma = 10{,}6 \\times 0{,}6 = 6{,}36$ năm.', en: '$t = 8.48/0.8 = 10.6$ yr; $\\tau = t/\\gamma = 10.6 \\times 0.6 = 6.36$ yr.' } },
    { q: { vi: 'Ghép hai phép tăng tốc cùng phương với rapidity $\\eta_1$ và $\\eta_2$ cho rapidity:', en: 'Composing collinear boosts with rapidities $\\eta_1$ and $\\eta_2$ gives rapidity:' }, options: [{ vi: '$\\eta_1 + \\eta_2$', en: '$\\eta_1 + \\eta_2$' }, { vi: '$\\eta_1\\eta_2$', en: '$\\eta_1\\eta_2$' }, { vi: '$\\sqrt{\\eta_1^2 + \\eta_2^2}$', en: '$\\sqrt{\\eta_1^2 + \\eta_2^2}$' }], answer: 0, explain: { vi: 'Rapidity cộng được, như góc trong phép quay Euclid.', en: 'Rapidities add, like angles of Euclidean rotations.' } },
    { q: { vi: 'Vì sao hai anh em sinh đôi không đối xứng?', en: 'Why are the twins not symmetric?' }, options: [{ vi: 'Chỉ người du hành đổi hệ quán tính khi quay đầu', en: 'Only the traveller changes inertial frame at the turnaround' }, { vi: 'Vì người ở nhà chịu lực hấp dẫn', en: 'Because the stay-at-home twin feels gravity' }], answer: 0, explain: { vi: 'Đường thế giới của người du hành gấp khúc; đường thẳng quán tính có thời gian riêng lớn nhất.', en: 'The traveller’s worldline is kinked; the straight inertial worldline has the greatest proper time.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Minkowski (1908) “Raum und Zeit”; Taylor & Wheeler (1992) Spacetime Physics, ch. 2–5; Rindler (2006) Relativity: Special, General and Cosmological, ch. 2–3. Gợi ý thảo luận: nếu mỗi người gửi tín hiệu ánh sáng mỗi năm, người kia nhận được bao nhiêu tín hiệu trên đường đi và đường về? (Doppler tương đối tính, xem C4.)',
    en: 'Resources: Minkowski (1908) “Raum und Zeit”; Taylor & Wheeler (1992) Spacetime Physics, ch. 2–5; Rindler (2006) Relativity: Special, General and Cosmological, ch. 2–3. Discussion: if each twin sends a light signal every year, how many does the other receive on the outbound and return legs? (Relativistic Doppler, see C4.)',
  },
};

/** Model Card · C2. Measured figures: `npm run validate:sr` → docs/validation/C-special-relativity.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Biến đổi Lorentz 1+1 chiều, khoảng bất biến, thời gian riêng', en: 'Level A - 1+1D Lorentz transformation, invariant interval, proper time' },
      body: {
        vi: 'Toạ độ các sự kiện trong mọi hệ, trục và lưới của $S\'$, nón ánh sáng, hyperbol bất biến, phân loại khoảng và thời gian riêng trong nghịch lý sinh đôi đều tính bằng công thức giải tích chính xác trên float64.',
        en: 'Event coordinates in every frame, the axes and grid of $S\'$, light cones, invariant hyperbolas, interval classification and the twins’ proper times are all computed from exact analytic formulae in float64.',
      },
    },
  ],
  fidelityNote: { vi: 'Mức A là phân loại nội bộ của USAC SimLab.', en: 'Level A is USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Phép quay hyperbolic', en: '1. Hyperbolic rotation' },
      tex: ["ct'=ct\\cosh\\eta-x\\sinh\\eta,\\qquad x'=-ct\\sinh\\eta+x\\cosh\\eta,\\qquad \\beta=\\tanh\\eta", "s^2=(c\\,\\Delta t)^2-\\Delta x^2=(c\\,\\Delta t')^2-\\Delta x'^2"],
      body: {
        vi: 'Trong đó $(ct, x)$ là toạ độ sự kiện trong $S$; $(ct\', x\')$ trong hệ chuyển động với vận tốc $\\beta$ dọc trục $x$; $\\eta$ là rapidity. Thanh “hệ hiển thị” áp dụng phép biến đổi này cho toàn bộ hình vẽ; thanh $\\beta\'$ chỉ vẽ trục và lưới của hệ $S\'$ trên nền hệ đang hiển thị. Đơn vị: năm và năm ánh sáng ($c = 1$).',
        en: '$(ct, x)$ are event coordinates in $S$; $(ct\', x\')$ those in the frame moving with speed $\\beta$ along $x$; $\\eta$ is the rapidity. The “view frame” slider applies this transformation to the whole picture; the $\\beta\'$ slider only draws the axes and grid of $S\'$ over the displayed frame. Units: years and light-years ($c = 1$).',
      },
    },
    {
      title: { vi: '2. Thời gian riêng trong nghịch lý sinh đôi', en: '2. Proper time in the twin paradox' },
      tex: ['t_S=\\frac{2d}{\\beta},\\qquad \\tau=\\frac{t_S}{\\gamma}=\\int_0^{t_S}\\sqrt{1-\\beta^2}\\,dt'],
      body: {
        vi: 'Trong đó $t_S$ là thời gian người ở nhà già thêm, $\\tau$ là thời gian riêng của người du hành, $d$ là khoảng cách tới ngôi sao đo trong $S$ và $\\beta$ là vận tốc không đổi trên mỗi chặng. Điểm quay đầu là tức thời. Kết quả được kiểm tra độc lập bằng cách biến đổi Lorentz sự kiện quay đầu vào hệ của chặng đi.',
        en: '$t_S$ is the stay-at-home ageing, $\\tau$ the traveller’s proper time, $d$ the distance to the star measured in $S$ and $\\beta$ the constant speed on each leg. The turnaround is instantaneous. The result is checked independently by Lorentz-transforming the turnaround event into the outbound frame.',
      },
    },
  ],
  assumptions: {
    vi: ['Một chiều không gian, các hệ quán tính chuyển động dọc trục $x$.', 'Nghịch lý sinh đôi: quay đầu tức thời; không mô phỏng giai đoạn gia tốc hữu hạn.'],
    en: ['One spatial dimension; inertial frames moving along $x$.', 'Twin paradox: instantaneous turnaround; finite acceleration phases are not modelled.'],
  },
  validity: { vi: ['$|\\beta| \\le 0{,}99$ cho $S\'$; $|\\beta| \\le 0{,}95$ cho hệ hiển thị; $0{,}1 \\le \\beta \\le 0{,}99$ cho người du hành.'], en: ['$|\\beta| \\le 0.99$ for $S\'$; $|\\beta| \\le 0.95$ for the view frame; $0.1 \\le \\beta \\le 0.99$ for the traveller.'] },
  scope: { vi: 'Mọi công thức là chính xác; sai số chỉ do làm tròn float64.', en: 'All formulae are exact; errors come only from float64 rounding.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:sr\` → \`docs/validation/C-special-relativity.json\`; ngưỡng khoá trong \`packages/sim-core/test/sr-c.test.ts\`.

- **Bất biến của khoảng:** 2 000 cặp sự kiện ngẫu nhiên và rapidity $|\\eta| \\le 3$: sai lệch tương đối lớn nhất của $s^2$ là $6{,}7\\times10^{-14}$.
- **Cộng vận tốc:** công thức $(u+v)/(1+uv)$ so với $\\tanh(\\eta_u + \\eta_v)$ trên 2 000 cặp: sai lệch lớn nhất $3{,}3\\times10^{-16}$.
- **Nghịch lý sinh đôi:** thời gian riêng từ công thức $\\tau = t/\\gamma$ và từ phép biến đổi Lorentz của sự kiện quay đầu khớp nhau tới $5\\times10^{-15}$; với $d = 4{,}24$ năm ánh sáng, $\\beta = 0{,}8$: $t = 10{,}6$ năm, $\\tau = 6{,}36$ năm.`,
    en: `Reproducible report: \`npm run validate:sr\` → \`docs/validation/C-special-relativity.json\`; thresholds locked in \`packages/sim-core/test/sr-c.test.ts\`.

- **Interval invariance:** 2,000 random event pairs and rapidities $|\\eta| \\le 3$: maximum relative deviation of $s^2$ is $6.7\\times10^{-14}$.
- **Velocity addition:** $(u+v)/(1+uv)$ vs $\\tanh(\\eta_u + \\eta_v)$ over 2,000 pairs: maximum difference $3.3\\times10^{-16}$.
- **Twin paradox:** proper time from $\\tau = t/\\gamma$ and from the Lorentz-transformed turnaround event agree to $5\\times10^{-15}$; for $d = 4.24$ ly, $\\beta = 0.8$: $t = 10.6$ yr, $\\tau = 6.36$ yr.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Chỉ một chiều không gian; không biểu diễn được quang sai hay các phép tăng tốc khác phương (phép quay Thomas–Wigner).', 'Không có gia tốc hữu hạn hay hệ quy chiếu phi quán tính (Rindler).'],
    en: ['One spatial dimension only; no aberration or non-collinear boosts (Thomas–Wigner rotation).', 'No finite acceleration or non-inertial (Rindler) frames.'],
  },
  references: [
    'Minkowski, H. (1909). Raum und Zeit. Physikalische Zeitschrift 10, 104–111 (bài giảng tại Cologne, 1908 / lecture, Cologne 1908).',
    'Taylor, E. F. & Wheeler, J. A. (1992). Spacetime Physics, 2nd ed. W. H. Freeman, ch. 2–5.',
    'Rindler, W. (2006). Relativity: Special, General, and Cosmological, 2nd ed. Oxford University Press, ch. 2–3.',
  ],
};
