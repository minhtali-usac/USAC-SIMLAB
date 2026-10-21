import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Phát biểu hai tiên đề của thuyết tương đối hẹp và suy ra hệ số Lorentz $\\gamma$ từ đồng hồ ánh sáng.',
      'Phân biệt thời gian riêng $\\tau$ (đo bằng đồng hồ đi cùng vật) với thời gian toạ độ $t$ (đo trong một hệ quán tính khác).',
      'Vận dụng giãn thời gian và co độ dài để giải thích vì sao muon sinh ra ở thượng tầng khí quyển tới được mặt đất.',
      'Chứng tỏ hai cách giải thích trong hai hệ quy chiếu cho cùng một kết quả đo được.',
    ],
    en: [
      'State the two postulates of special relativity and derive the Lorentz factor $\\gamma$ from a light clock.',
      'Distinguish proper time $\\tau$ (measured by a clock moving with the object) from coordinate time $t$ (measured in another inertial frame).',
      'Use time dilation and length contraction to explain why muons created in the upper atmosphere reach the ground.',
      'Show that the explanations in two frames give the same measurable result.',
    ],
  },
  durationMin: 35,
  prerequisites: { vi: 'Định lý Pythagoras; vận tốc, quãng đường và thời gian; hàm mũ; khái niệm hệ quy chiếu quán tính.', en: 'Pythagoras’ theorem; speed, distance and time; the exponential function; inertial frames.' },
  background: [
    {
      title: { vi: 'Hai tiên đề của Einstein', en: 'Einstein’s two postulates' },
      body: {
        vi: 'Thuyết tương đối hẹp (Einstein 1905) dựa trên hai tiên đề:\n\n1. Các định luật vật lý có cùng dạng trong mọi hệ quy chiếu quán tính.\n2. Tốc độ ánh sáng trong chân không có cùng giá trị $c = 299\\,792\\,458$ m/s trong mọi hệ quán tính, không phụ thuộc chuyển động của nguồn hay người quan sát.\n\nHai tiên đề này buộc thời gian và không gian phải phụ thuộc vào hệ quy chiếu. Mô-đun C1 cho thấy hệ quả đơn giản nhất: **giãn thời gian**.',
        en: 'Special relativity (Einstein 1905) rests on two postulates:\n\n1. The laws of physics have the same form in every inertial frame.\n2. The speed of light in vacuum has the same value $c = 299\\,792\\,458$ m/s in every inertial frame, independent of the motion of source or observer.\n\nTogether these force time and space to depend on the frame of reference. Module C1 shows the simplest consequence: **time dilation**.',
      },
    },
    {
      title: { vi: '1. Đồng hồ ánh sáng', en: '1. The light clock' },
      body: {
        vi: 'Một xung ánh sáng nảy qua lại giữa hai gương song song cách nhau $L$. Trong hệ nghỉ của đồng hồ, mỗi nhịp (đi và về) kéo dài\n\n$$\\Delta\\tau = \\frac{2L}{c}.$$\n\nTrong hệ phòng thí nghiệm $S$, đồng hồ chuyển động ngang với vận tốc $v$; trong nửa nhịp, xung ánh sáng đi theo cạnh huyền của tam giác vuông có hai cạnh góc vuông là $L$ và $v\\,\\Delta t/2$. Vì ánh sáng vẫn đi với tốc độ $c$:\n\n$$\\left(\\frac{c\\,\\Delta t}{2}\\right)^2 = L^2 + \\left(\\frac{v\\,\\Delta t}{2}\\right)^2 \\;\\Longrightarrow\\; \\Delta t = \\gamma\\,\\Delta\\tau,\\qquad \\gamma = \\frac{1}{\\sqrt{1 - \\beta^2}},\\quad \\beta = \\frac vc.$$\n\nVì $\\gamma \\ge 1$, nhịp của đồng hồ chuyển động **dài hơn** khi đo trong hệ $S$: đồng hồ chuyển động chạy chậm so với các đồng hồ đồng bộ của $S$. Khoảng cách giữa hai gương vuông góc với vận tốc nên không bị co.',
        en: 'A light pulse bounces between two parallel mirrors a distance $L$ apart. In the clock’s rest frame each tick (there and back) lasts\n\n$$\\Delta\\tau = \\frac{2L}{c}.$$\n\nIn the laboratory frame $S$ the clock moves sideways at speed $v$; during half a tick the pulse runs along the hypotenuse of a right triangle with legs $L$ and $v\\,\\Delta t/2$. Since light still travels at $c$:\n\n$$\\left(\\frac{c\\,\\Delta t}{2}\\right)^2 = L^2 + \\left(\\frac{v\\,\\Delta t}{2}\\right)^2 \\;\\Longrightarrow\\; \\Delta t = \\gamma\\,\\Delta\\tau,\\qquad \\gamma = \\frac{1}{\\sqrt{1 - \\beta^2}},\\quad \\beta = \\frac vc.$$\n\nSince $\\gamma \\ge 1$, the moving clock’s tick is **longer** as measured in $S$: a moving clock runs slow compared with the synchronised clocks of $S$. The mirror separation is perpendicular to the velocity and is not contracted.',
      },
    },
    {
      title: { vi: '2. Thời gian riêng và thời gian toạ độ', en: '2. Proper time and coordinate time' },
      body: {
        vi: '**Thời gian riêng** $\\tau$ là thời gian đọc trên một đồng hồ đi cùng vật; nó là một đại lượng bất biến, mọi hệ quán tính đều tính ra cùng giá trị. **Thời gian toạ độ** $t$ là thời gian đo bằng các đồng hồ đã đồng bộ, đứng yên trong một hệ quán tính cụ thể. Với chuyển động thẳng đều,\n\n$$c^2\\,d\\tau^2 = c^2\\,dt^2 - dx^2 \\;\\Longrightarrow\\; d\\tau = \\frac{dt}{\\gamma}.$$\n\nGiãn thời gian **đối xứng** giữa hai hệ quán tính: mỗi hệ thấy đồng hồ của hệ kia chạy chậm. Điều này không mâu thuẫn, vì việc so sánh hai đồng hồ ở hai nơi khác nhau phụ thuộc vào định nghĩa đồng thời (mô-đun C2).',
        en: '**Proper time** $\\tau$ is the time read on a clock carried with the object; it is invariant - every inertial frame computes the same value. **Coordinate time** $t$ is measured by synchronised clocks at rest in a particular inertial frame. For uniform motion,\n\n$$c^2\\,d\\tau^2 = c^2\\,dt^2 - dx^2 \\;\\Longrightarrow\\; d\\tau = \\frac{dt}{\\gamma}.$$\n\nTime dilation is **symmetric** between two inertial frames: each sees the other’s clock run slow. There is no contradiction, because comparing clocks at different places depends on the definition of simultaneity (module C2).',
      },
    },
    {
      title: { vi: '3. Muon tia vũ trụ', en: '3. Cosmic-ray muons' },
      body: {
        vi: 'Tia vũ trụ va chạm với hạt nhân trong khí quyển tạo ra pion, rồi pion phân rã thành muon, phần lớn ở độ cao khoảng 15 km. Muon không bền, thời gian sống riêng trung bình $\\tau_0 = 2{,}1969811\\ \\mu\\text s$ (PDG). Số muon còn lại sau thời gian riêng $\\tau$ là\n\n$$N = N_0\\,e^{-\\tau/\\tau_0}.$$\n\nNếu bỏ qua tương đối tính, một muon dù đi gần $c$ cũng chỉ đi được trung bình $c\\tau_0 \\approx 659$ m, và gần như không muon nào tới được mặt đất. Thực tế ta đo được rất nhiều muon ở mực nước biển (Rossi & Hall 1941; Frisch & Smith 1963).',
        en: 'Cosmic rays strike nuclei in the atmosphere producing pions, which decay into muons, mostly at altitudes of about 15 km. The muon is unstable with mean proper lifetime $\\tau_0 = 2.1969811\\ \\mu\\text s$ (PDG). The number left after proper time $\\tau$ is\n\n$$N = N_0\\,e^{-\\tau/\\tau_0}.$$\n\nIgnoring relativity, a muon moving at nearly $c$ would travel on average only $c\\tau_0 \\approx 659$ m, and almost none would reach the ground. In fact many muons are detected at sea level (Rossi & Hall 1941; Frisch & Smith 1963).',
      },
    },
    {
      title: { vi: '4. Một kết quả đo, hai cách giải thích', en: '4. One measurement, two explanations' },
      body: {
        vi: 'Gọi $h$ là độ cao sinh muon và $\\beta$ là vận tốc của nó (giả sử không đổi).\n\n- **Hệ Trái Đất:** thời gian bay là $t = h/(\\beta c)$; đồng hồ của muon chỉ trôi $\\tau = t/\\gamma$.\n- **Hệ muon:** muon đứng yên; bề dày khí quyển chuyển động về phía nó bị **co độ dài** còn $h/\\gamma$, nên mặt đất tới sau thời gian riêng $\\tau = (h/\\gamma)/(\\beta c)$.\n\nHai cách cho **cùng** một thời gian riêng, nên cùng một tỉ lệ sống sót:\n\n$$\\frac{N}{N_0} = \\exp\\!\\left(-\\frac{h}{\\gamma\\,\\beta c\\,\\tau_0}\\right).$$\n\nVới $\\beta = 0{,}9995$ ($\\gamma \\approx 31{,}6$) và $h = 15$ km, khoảng 49% số muon còn lại, so với chỉ khoảng $10^{-10}$ nếu không có giãn thời gian.',
        en: 'Let $h$ be the production altitude and $\\beta$ the muon speed (assumed constant).\n\n- **Earth frame:** the flight time is $t = h/(\\beta c)$; the muon’s clock advances only $\\tau = t/\\gamma$.\n- **Muon frame:** the muon is at rest; the atmosphere rushing towards it is **length-contracted** to $h/\\gamma$, so the ground arrives after proper time $\\tau = (h/\\gamma)/(\\beta c)$.\n\nBoth give **the same** proper time and hence the same survival fraction:\n\n$$\\frac{N}{N_0} = \\exp\\!\\left(-\\frac{h}{\\gamma\\,\\beta c\\,\\tau_0}\\right).$$\n\nWith $\\beta = 0.9995$ ($\\gamma \\approx 31.6$) and $h = 15$ km about 49% of the muons survive, compared with only about $10^{-10}$ without time dilation.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Đếm nhịp ở nửa tốc độ ánh sáng', en: 'Experiment 1 - Counting ticks at half the speed of light' }, text: { vi: 'Đặt $\\beta = 0{,}5$. Tính $\\gamma$ bằng công thức rồi so với số liệu. Khi đồng hồ đứng yên đếm được 100 nhịp, đồng hồ chuyển động đếm được khoảng bao nhiêu nhịp (cả hai đều đo trong hệ $S$)?', en: 'Set $\\beta = 0.5$. Compute $\\gamma$ and compare with the readout. When the resting clock has ticked 100 times, about how many ticks has the moving clock made (both measured in $S$)?' }, params: { beta: 0.5 } },
    { title: { vi: 'Thử nghiệm 2 - Đường chéo của ánh sáng', en: 'Experiment 2 - The light’s diagonal' }, text: { vi: 'Tăng $\\beta$ lên 0,99. Quan sát đường đi của xung sáng trong đồng hồ chuyển động. Dùng định lý Pythagoras để giải thích vì sao $\\gamma \\approx 7{,}09$.', en: 'Raise $\\beta$ to 0.99. Watch the pulse path in the moving clock. Use Pythagoras’ theorem to explain why $\\gamma \\approx 7.09$.' }, params: { beta: 0.99 } },
    { title: { vi: 'Thử nghiệm 3 - Muon từ 15 km', en: 'Experiment 3 - Muons from 15 km' }, text: { vi: 'Với $\\beta_\\mu = 0{,}9995$ và $h = 15$ km, so sánh tỉ lệ sống sót có và không có giãn thời gian. Đọc thêm thời gian bay trong hệ Trái Đất, thời gian trôi trên đồng hồ muon và bề dày khí quyển trong hệ muon; kiểm tra rằng $(h/\\gamma)/(\\beta c)$ bằng $t/\\gamma$.', en: 'With $\\beta_\\mu = 0.9995$ and $h = 15$ km, compare the survival fraction with and without time dilation. Also read the Earth-frame flight time, the time on the muon’s clock and the atmosphere thickness in the muon frame; check that $(h/\\gamma)/(\\beta c)$ equals $t/\\gamma$.' }, params: { mb: 0.9995, h: 15 } },
    { title: { vi: 'Thử nghiệm 4 - Muon chậm hơn', en: 'Experiment 4 - Slower muons' }, text: { vi: 'Giảm $\\beta_\\mu$ xuống 0,99 rồi 0,95. Tỉ lệ sống sót giảm nhanh thế nào? Vì sao chủ yếu muon năng lượng cao tới được mặt đất?', en: 'Lower $\\beta_\\mu$ to 0.99 and then 0.95. How fast does the survival fraction drop? Why do mainly high-energy muons reach the ground?' }, params: { mb: 0.99, h: 15 } },
  ],
  quiz: [
    { q: { vi: 'Hệ số Lorentz tại $v = 0{,}9c$ là:', en: 'The Lorentz factor at $v = 0.9c$ is:' }, options: [{ vi: '1,11', en: '1.11' }, { vi: '2,29', en: '2.29' }, { vi: '4,36', en: '4.36' }, { vi: '9', en: '9' }], answer: 1, explain: { vi: '$\\gamma = 1/\\sqrt{1 - 0{,}81} = 1/\\sqrt{0{,}19} \\approx 2{,}294$.', en: '$\\gamma = 1/\\sqrt{1 - 0.81} = 1/\\sqrt{0.19} \\approx 2.294$.' } },
    { q: { vi: 'Đại lượng nào mọi hệ quán tính đều đo được cùng giá trị?', en: 'Which quantity has the same value in every inertial frame?' }, options: [{ vi: 'Thời gian riêng giữa hai sự kiện trên đường thế giới của một vật', en: 'The proper time between two events on a body’s worldline' }, { vi: 'Thời gian toạ độ giữa hai sự kiện', en: 'The coordinate time between two events' }, { vi: 'Độ dài của một thước chuyển động', en: 'The length of a moving rod' }], answer: 0, explain: { vi: 'Thời gian riêng được xác định từ khoảng bất biến $c^2 d\\tau^2 = c^2 dt^2 - dx^2$.', en: 'Proper time follows from the invariant interval $c^2 d\\tau^2 = c^2 dt^2 - dx^2$.' } },
    { q: { vi: 'Trong hệ nghỉ của muon, vì sao nó tới được mặt đất?', en: 'In the muon’s rest frame, why does it reach the ground?' }, options: [{ vi: 'Bề dày khí quyển chuyển động bị co lại còn $h/\\gamma$', en: 'The moving atmosphere is contracted to $h/\\gamma$' }, { vi: 'Đồng hồ của chính nó chạy chậm', en: 'Its own clock runs slow' }, { vi: 'Nó đi nhanh hơn ánh sáng', en: 'It moves faster than light' }], answer: 0, explain: { vi: 'Trong hệ nghỉ của mình, muon có thời gian sống bình thường $\\tau_0$; quãng đường phải đi bị co.', en: 'In its own rest frame the muon has its normal lifetime $\\tau_0$; the distance it must cover is contracted.' } },
    { q: { vi: 'Hai hệ quán tính chuyển động đều với nhau. Điều nào đúng?', en: 'Two inertial frames move uniformly relative to each other. Which is true?' }, options: [{ vi: 'Mỗi hệ thấy đồng hồ của hệ kia chạy chậm', en: 'Each sees the other’s clocks run slow' }, { vi: 'Chỉ một hệ thấy đồng hồ của hệ kia chạy chậm', en: 'Only one sees the other’s clocks run slow' }], answer: 0, explain: { vi: 'Giãn thời gian đối xứng giữa các hệ quán tính; sự bất đối xứng chỉ xuất hiện khi một đồng hồ đổi hệ quán tính (nghịch lý sinh đôi, C2).', en: 'Time dilation is symmetric between inertial frames; asymmetry appears only when one clock changes frame (twin paradox, C2).' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Taylor & Wheeler (1992) Spacetime Physics, ch. 1–4; Rindler (2006) Relativity: Special, General and Cosmological, ch. 2–3; phim “Time Dilation: An Experiment with Mu-Mesons” (Frisch & Smith, 1962) và bài báo Am. J. Phys. 31, 342 (1963); PDG Review “Cosmic Rays”. Gợi ý thảo luận: mô hình vận tốc không đổi bỏ qua việc muon mất khoảng 2 GeV do ion hoá khi xuyên qua khí quyển.',
    en: 'Resources: Taylor & Wheeler (1992) Spacetime Physics, ch. 1–4; Rindler (2006) Relativity: Special, General and Cosmological, ch. 2–3; the film “Time Dilation: An Experiment with Mu-Mesons” (Frisch & Smith, 1962) and Am. J. Phys. 31, 342 (1963); PDG Review “Cosmic Rays”. Discussion: the constant-speed model ignores the ≈ 2 GeV muons lose to ionisation crossing the atmosphere.',
  },
};

/** Model Card · C1. Measured figures: `npm run validate:sr` → docs/validation/C-special-relativity.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Giãn thời gian, co độ dài và quy luật phân rã', en: 'Level A - Time dilation, length contraction and decay law' },
      body: {
        vi: 'Các đại lượng $\\gamma$, độ dài nhịp đồng hồ trong hai hệ, thời gian bay, thời gian riêng của muon, bề dày khí quyển co lại và tỉ lệ sống sót được tính bằng công thức giải tích chính xác của thuyết tương đối hẹp, với hằng số $c$ (SI) và $\\tau_0$ (PDG).',
        en: 'The quantities $\\gamma$, the tick length in both frames, the flight time, the muon’s proper time, the contracted atmosphere and the survival fraction are computed from the exact analytic formulae of special relativity, with $c$ (SI) and $\\tau_0$ (PDG).',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Hoạt ảnh đồng hồ ánh sáng', en: 'Level C - Light-clock animation' },
      body: {
        vi: 'Xung ánh sáng được làm chậm để mắt theo dõi được; tỉ lệ thời gian giữa hai đồng hồ ($\\gamma$) là đúng, còn tốc độ hiển thị tuyệt đối thì không.',
        en: 'The light pulse is slowed so the eye can follow it; the timing ratio between the clocks ($\\gamma$) is correct, the absolute displayed speed is not.',
      },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Hệ số Lorentz và giãn thời gian', en: '1. Lorentz factor and time dilation' },
      tex: ['\\gamma=\\frac{1}{\\sqrt{(1-\\beta)(1+\\beta)}}=\\cosh\\eta,\\qquad \\beta=\\frac vc=\\tanh\\eta', '\\Delta t=\\gamma\\,\\Delta\\tau,\\qquad \\Delta\\tau=\\frac{2L}{c}'],
      body: {
        vi: 'Trong đó $\\beta$ là vận tốc tương đối tính theo đơn vị $c$; $\\eta$ là rapidity; $\\Delta\\tau$ là một nhịp đồng hồ trong hệ nghỉ của nó (thời gian riêng), $\\Delta t$ là cùng nhịp đó đo trong hệ phòng thí nghiệm $S$ (thời gian toạ độ). Giao diện biểu diễn thời gian theo đơn vị $L/c$.',
        en: '$\\beta$ is the speed in units of $c$; $\\eta$ the rapidity; $\\Delta\\tau$ one tick in the clock’s rest frame (proper time), $\\Delta t$ the same tick measured in the lab frame $S$ (coordinate time). The interface expresses time in units of $L/c$.',
      },
    },
    {
      title: { vi: '2. Muon: thời gian bay, co độ dài và tỉ lệ sống sót', en: '2. Muons: flight time, contraction and survival' },
      tex: ['t=\\frac{h}{\\beta c},\\qquad \\tau=\\frac t\\gamma,\\qquad h\'=\\frac h\\gamma', '\\frac{N}{N_0}=\\exp\\!\\left(-\\frac{\\tau}{\\tau_0}\\right),\\qquad \\left.\\frac{N}{N_0}\\right|_{\\tau\\to t}=\\exp\\!\\left(-\\frac{t}{\\tau_0}\\right)'],
      body: {
        vi: 'Trong đó $h$ là độ cao sinh muon (đo trong hệ Trái Đất), $\\beta$ là vận tốc muon (giả sử không đổi), $\\tau_0 = 2{,}1969811\\ \\mu$s là thời gian sống riêng trung bình, $h\'$ là bề dày khí quyển trong hệ nghỉ của muon. Biểu thức có chỉ số $\\tau \\to t$ (đường “không giãn thời gian” trên đồ thị) dùng thời gian toạ độ $t$ thay cho thời gian riêng, tức bỏ qua giãn thời gian.',
        en: '$h$ is the production altitude (Earth frame), $\\beta$ the muon speed (assumed constant), $\\tau_0 = 2.1969811\\ \\mu$s the mean proper lifetime, $h\'$ the atmosphere thickness in the muon rest frame. The expression labelled $\\tau \\to t$ (the “no time dilation” curve) uses the coordinate time $t$ instead of proper time, i.e. it ignores time dilation.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Hệ quy chiếu quán tính, chuyển động thẳng đều.',
      'Muon đi thẳng đứng với vận tốc không đổi; bỏ qua mất năng lượng do ion hoá (khoảng 2 GeV khi xuyên qua toàn bộ khí quyển, PDG) và tán xạ.',
      'Mọi muon sinh ra cùng một độ cao $h$ với cùng một vận tốc.',
    ],
    en: [
      'Inertial frames, uniform motion.',
      'Muons travel vertically at constant speed; ionisation energy loss (≈ 2 GeV across the whole atmosphere, PDG) and scattering are ignored.',
      'All muons are produced at one altitude $h$ with one speed.',
    ],
  },
  validity: {
    vi: ['Đồng hồ ánh sáng: $0 \\le \\beta \\le 0{,}999$.', 'Muon: $0{,}9 \\le \\beta_\\mu \\le 0{,}99999$, $1 \\le h \\le 30$ km.'],
    en: ['Light clock: $0 \\le \\beta \\le 0.999$.', 'Muons: $0.9 \\le \\beta_\\mu \\le 0.99999$, $1 \\le h \\le 30$ km.'],
  },
  scope: { vi: 'Các công thức là chính xác trong mô hình; giới hạn chủ yếu nằm ở giả định vận tốc không đổi của muon.', en: 'The formulae are exact within the model; the main limitation is the constant-speed muon assumption.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:sr\` → \`docs/validation/C-special-relativity.json\`; ngưỡng khoá trong \`packages/sim-core/test/sr-c.test.ts\`.

- **Độ chính xác của $\\gamma$:** sai số tương đối bị giới hạn bởi việc làm tròn chính $\\beta$ trong float64, xấp xỉ $10^{-16}/(1-\\beta)$: $3\\times10^{-16}$ tại $1-\\beta = 10^{-3}$, $1{,}4\\times10^{-11}$ tại $10^{-6}$, $1{,}4\\times10^{-8}$ tại $10^{-9}$. Trong miền của mô-đun ($\\beta \\le 0{,}99999$) sai số nhỏ hơn $10^{-10}$.
- **Muon, cấu hình mặc định** ($\\beta = 0{,}9995$, $\\gamma = 31{,}63$, $h = 15$ km): thời gian bay 50,06 µs; tỉ lệ sống sót **48,65%** tính trong hệ Trái Đất và trong hệ muon trùng nhau tới $10^{-16}$; tỉ lệ “cổ điển” $1{,}3\\times10^{-10}$. $c\\tau_0 = 658{,}64$ m.
- $\\gamma(0{,}5) = 1{,}1547$; $\\gamma(0{,}9) = 2{,}2942$; $\\gamma(0{,}99) = 7{,}0888$ (test).`,
    en: `Reproducible report: \`npm run validate:sr\` → \`docs/validation/C-special-relativity.json\`; thresholds locked in \`packages/sim-core/test/sr-c.test.ts\`.

- **Accuracy of $\\gamma$:** the relative error is limited by the float64 rounding of $\\beta$ itself, about $10^{-16}/(1-\\beta)$: $3\\times10^{-16}$ at $1-\\beta = 10^{-3}$, $1.4\\times10^{-11}$ at $10^{-6}$, $1.4\\times10^{-8}$ at $10^{-9}$. Within the module’s range ($\\beta \\le 0.99999$) the error is below $10^{-10}$.
- **Muons, default set-up** ($\\beta = 0.9995$, $\\gamma = 31.63$, $h = 15$ km): flight time 50.06 µs; survival **48.65%** computed in the Earth frame and in the muon frame agree to $10^{-16}$; the “classical” fraction is $1.3\\times10^{-10}$. $c\\tau_0 = 658.64$ m.
- $\\gamma(0.5) = 1.1547$; $\\gamma(0.9) = 2.2942$; $\\gamma(0.99) = 7.0888$ (test).`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: [
      'Muon thật có phổ năng lượng rộng (năng lượng trung bình ở mặt đất khoảng 4 GeV), phân bố góc tới và độ cao sinh khác nhau; mô hình dùng một vận tốc và một độ cao.',
      'Mất năng lượng do ion hoá làm $\\gamma$ giảm dọc đường đi, nên tỉ lệ sống sót thật thấp hơn mô hình vận tốc không đổi.',
      'Không mô phỏng gia tốc hay hệ quy chiếu phi quán tính.',
    ],
    en: [
      'Real muons have a broad energy spectrum (mean energy at the ground about 4 GeV), a range of zenith angles and production heights; the model uses one speed and one height.',
      'Ionisation losses reduce $\\gamma$ along the path, so the true survival fraction is lower than in the constant-speed model.',
      'No acceleration or non-inertial frames.',
    ],
  },
  references: [
    'Einstein, A. (1905). Zur Elektrodynamik bewegter Körper. Ann. Phys. 17, 891.',
    'Taylor, E. F. & Wheeler, J. A. (1992). Spacetime Physics, 2nd ed. W. H. Freeman, ch. 1–4.',
    'Rossi, B. & Hall, D. B. (1941). Variation of the rate of decay of mesotrons with momentum. Phys. Rev. 59, 223.',
    'Frisch, D. H. & Smith, J. H. (1963). Measurement of the relativistic time dilation using μ-mesons. Am. J. Phys. 31, 342.',
    'Particle Data Group, Workman, R. L. et al. (2022). Review of Particle Physics. PTEP 2022, 083C01 - muon lifetime; Review “Cosmic Rays”.',
  ],
};
