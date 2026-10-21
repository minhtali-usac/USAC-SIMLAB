import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Giải thích quang sai tương đối tính và tính được góc biểu kiến $\\theta\'$ của một ngôi sao khi người quan sát chuyển động.',
      'Tính hệ số Doppler $D$ và dự đoán màu, độ sáng của sao ở phía trước và phía sau.',
      'Giải thích vì sao nửa bầu trời phía trước bị dồn vào một nón hẹp có nửa góc mở $\\arccos\\beta$.',
      'Phân biệt điều một máy ảnh thực sự ghi lại với hiện tượng co độ dài Lorentz.',
    ],
    en: [
      'Explain relativistic aberration and compute the apparent angle $\\theta\'$ of a star seen by a moving observer.',
      'Compute the Doppler factor $D$ and predict the colour and brightness of stars ahead and behind.',
      'Explain why the forward half of the sky is squeezed into a narrow cone of half-angle $\\arccos\\beta$.',
      'Distinguish what a camera actually records from Lorentz length contraction.',
    ],
  },
  durationMin: 30,
  prerequisites: { vi: 'C1, C2 - giãn thời gian, biến đổi Lorentz; hiệu ứng Doppler cổ điển; bức xạ vật đen và nhiệt độ màu.', en: 'C1, C2 - time dilation, Lorentz transformation; the classical Doppler effect; blackbody radiation and colour temperature.' },
  background: [
    {
      title: { vi: 'Bầu trời của một con tàu siêu tốc', en: 'The sky from a very fast ship' },
      body: {
        vi: 'Các ngôi sao gần như đứng yên so với nhau, nên ta coi chúng nằm trong một hệ quán tính $S$. Một con tàu chuyển động với vận tốc $\\beta = v/c$ hướng tới một ngôi sao đích. Hai hiệu ứng làm bầu trời của tàu khác hẳn bầu trời của $S$: **quang sai** thay đổi hướng của tia sáng, còn **hiệu ứng Doppler** thay đổi tần số và năng lượng của nó. Mô-đun C4 đặt hai bầu trời cạnh nhau để so sánh.',
        en: 'The stars are nearly at rest relative to one another, so we treat them as an inertial frame $S$. A ship moves with speed $\\beta = v/c$ towards a target star. Two effects make the ship’s sky very different from that of $S$: **aberration** changes the direction of light rays, and the **Doppler effect** changes their frequency and energy. Module C4 shows the two skies side by side.',
      },
    },
    {
      title: { vi: '1. Quang sai tương đối tính', en: '1. Relativistic aberration' },
      body: {
        vi: 'Gọi $\\theta$ là góc giữa hướng bay và hướng tới ngôi sao, đo trong $S$; $\\theta\'$ là góc tương ứng trên tàu. Biến đổi Lorentz của vectơ 4-xung lượng photon cho\n\n$$\\cos\\theta\' = \\frac{\\cos\\theta + \\beta}{1 + \\beta\\cos\\theta}.$$\n\nVới $\\theta = 90°$ ta có $\\cos\\theta\' = \\beta$: toàn bộ nửa bầu trời phía trước bị nén vào nón có nửa góc mở $\\arccos\\beta$ (khoảng 25,8° tại $\\beta = 0{,}9$). Các sao phía sau cũng bị kéo về phía trước. Đây là phiên bản tương đối tính của hiện tượng mưa thẳng đứng trông như xiên về phía trước khi ta chạy.',
        en: 'Let $\\theta$ be the angle between the direction of motion and the direction to a star, measured in $S$; $\\theta\'$ the corresponding angle on the ship. The Lorentz transformation of the photon 4-momentum gives\n\n$$\\cos\\theta\' = \\frac{\\cos\\theta + \\beta}{1 + \\beta\\cos\\theta}.$$\n\nFor $\\theta = 90°$ one gets $\\cos\\theta\' = \\beta$: the whole forward half of the sky is compressed into a cone of half-angle $\\arccos\\beta$ (about 25.8° at $\\beta = 0.9$). Stars behind are also pulled forward. This is the relativistic version of vertical rain appearing to slant towards you as you run.',
      },
    },
    {
      title: { vi: '2. Hiệu ứng Doppler, màu và độ sáng', en: '2. Doppler effect, colour and brightness' },
      body: {
        vi: 'Tần số nhận được trên tàu là $\\nu\' = D\\,\\nu$ với hệ số Doppler\n\n$$D = \\gamma\\,(1 + \\beta\\cos\\theta) = \\frac{1}{\\gamma\\,(1 - \\beta\\cos\\theta\')}.$$\n\nPhía trước $D = \\sqrt{(1+\\beta)/(1-\\beta)} > 1$ (dịch xanh), phía sau $D < 1$ (dịch đỏ). Vì $I_\\nu/\\nu^3$ là bất biến Lorentz, phổ vật đen nhiệt độ $T$ được nhìn như phổ vật đen nhiệt độ $T\' = D\\,T$. Với một nguồn điểm ở rất xa (sóng phẳng), mật độ năng lượng và do đó thông lượng bolometric biến đổi theo $D^2$, nên cấp sao thay đổi\n\n$$m\' = m - 5\\log_{10} D.$$\n\nSao phía trước trở nên trắng–xanh và sáng hơn; sao phía sau đỏ dần, mờ đi và có thể dịch ra ngoài vùng nhìn thấy.',
        en: 'The frequency received on the ship is $\\nu\' = D\\,\\nu$ with the Doppler factor\n\n$$D = \\gamma\\,(1 + \\beta\\cos\\theta) = \\frac{1}{\\gamma\\,(1 - \\beta\\cos\\theta\')}.$$\n\nAhead $D = \\sqrt{(1+\\beta)/(1-\\beta)} > 1$ (blueshift), behind $D < 1$ (redshift). Since $I_\\nu/\\nu^3$ is Lorentz invariant, a blackbody of temperature $T$ is seen as a blackbody of temperature $T\' = D\\,T$. For a very distant point source (a plane wave), the energy density and hence the bolometric flux scale as $D^2$, so the magnitude changes by\n\n$$m\' = m - 5\\log_{10} D.$$\n\nStars ahead turn blue-white and brighter; stars behind redden, fade and may shift out of the visible band.',
      },
    },
    {
      title: { vi: '3. Nền vi sóng vũ trụ và giới hạn của “cầu vồng sao”', en: '3. The microwave background and the “starbow”' },
      body: {
        vi: 'Nền vi sóng vũ trụ có nhiệt độ $T_0 = 2{,}72548$ K (Fixsen 2009). Phía trước tàu, nó được nhìn như vật đen $D\\,T_0$; để đạt 3000 K cần $D \\approx 1101$, tức $\\beta \\approx 0{,}9999983$ ($\\gamma \\approx 550$). Ý tưởng phổ biến về một “cầu vồng sao” (starbow) với các dải màu xếp vòng quanh hướng bay đã được McKinley & Doherty (1979) phân tích: vì phổ sao trải rộng, kết quả thực tế là sự dịch màu và thay đổi độ sáng liên tục chứ không phải các vòng màu rõ rệt.',
        en: 'The cosmic microwave background has temperature $T_0 = 2.72548$ K (Fixsen 2009). Ahead of the ship it appears as a blackbody at $D\\,T_0$; reaching 3000 K requires $D \\approx 1101$, i.e. $\\beta \\approx 0.9999983$ ($\\gamma \\approx 550$). The popular idea of a “starbow” - coloured rings around the direction of motion - was analysed by McKinley & Doherty (1979): because stellar spectra are broad, the real result is a continuous shift of colour and brightness, not distinct coloured rings.',
      },
    },
    {
      title: { vi: '4. Nhìn thấy khác với đo đạc', en: '4. Seeing is not measuring' },
      body: {
        vi: 'Hình ảnh trong mô-đun là những gì một **máy ảnh** ghi lại: ánh sáng tới cùng một lúc vào ống kính, dù rời các ngôi sao vào những thời điểm khác nhau. Điều này khác với co độ dài Lorentz, vốn là kết quả **đo đạc** bằng các đồng hồ đã đồng bộ. Terrell (1959) và Penrose (1959) chỉ ra rằng một vật thể nhỏ chuyển động gần $c$ được nhìn thấy như bị **xoay** chứ không bị dẹt.',
        en: 'The images in this module are what a **camera** records: light arriving at the lens at the same moment, although it left the stars at different times. This differs from Lorentz length contraction, which is the result of **measurement** with synchronised clocks. Terrell (1959) and Penrose (1959) showed that a small object moving near $c$ is seen **rotated**, not flattened.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Bay tới Betelgeuse', en: 'Experiment 1 - Flying to Betelgeuse' }, text: { vi: 'Tăng $\\beta$ từ 0 lên 0,9 và so sánh hai bầu trời. Các sao của chòm Lạp Hộ quanh hướng bay dồn lại thế nào? Đo bán kính đường nét đứt (ảnh của bán cầu phía trước) và so với $\\arccos\\beta$.', en: 'Raise $\\beta$ from 0 to 0.9 and compare the two skies. How do the Orion stars around the direction of motion crowd together? Measure the dashed circle (image of the forward hemisphere) and compare with $\\arccos\\beta$.' }, params: { target: 'betelgeuse', beta: 0.9, cmp: true } },
    { title: { vi: 'Thử nghiệm 2 - Phía trước và phía sau', en: 'Experiment 2 - Ahead and behind' }, text: { vi: 'Đặt $\\beta = 0{,}99$. Đọc $D$ phía trước và phía sau, kiểm tra rằng tích của chúng bằng 1. Một sao 5 500 K ở phía trước có nhiệt độ màu bao nhiêu?', en: 'Set $\\beta = 0.99$. Read $D$ ahead and behind and check that their product is 1. What colour temperature does a 5,500 K star ahead show?' }, params: { target: 'vega', beta: 0.99 } },
    { title: { vi: 'Thử nghiệm 3 - Nền vi sóng nóng lên', en: 'Experiment 3 - The microwave background heats up' }, text: { vi: 'Dùng $T\' = D\\,T_0$ để tìm $\\beta$ sao cho nền vi sóng phía trước đạt 3 000 K. Kéo thanh $\\beta$ tới gần giá trị đó và kiểm tra bằng số liệu $D$ phía trước.', en: 'Use $T\' = D\\,T_0$ to find the $\\beta$ at which the forward microwave background reaches 3,000 K. Move the $\\beta$ slider close to it and check with the forward $D$ readout.' }, params: { beta: 0.999998 } },
  ],
  quiz: [
    { q: { vi: 'Khi bay gần tốc độ ánh sáng, phần lớn các ngôi sao xuất hiện:', en: 'Flying near the speed of light, most stars appear:' }, options: [{ vi: 'Dồn về phía trước', en: 'Crowded ahead' }, { vi: 'Dồn về phía sau', en: 'Crowded behind' }, { vi: 'Phân bố đều', en: 'Evenly spread' }], answer: 0, explain: { vi: 'Quang sai nén cả bầu trời về phía hướng bay.', en: 'Aberration compresses the whole sky towards the direction of motion.' } },
    { q: { vi: 'Tại $\\beta = 0{,}6$, hệ số Doppler phía trước là:', en: 'At $\\beta = 0.6$ the forward Doppler factor is:' }, options: [{ vi: '2', en: '2' }, { vi: '1,25', en: '1.25' }, { vi: '1,6', en: '1.6' }], answer: 0, explain: { vi: '$D = \\sqrt{1{,}6/0{,}4} = 2$.', en: '$D = \\sqrt{1.6/0.4} = 2$.' } },
    { q: { vi: 'Vì sao hình ảnh máy ảnh ghi lại không cho thấy vật thể bị co dẹt?', en: 'Why doesn’t a camera image show objects flattened?' }, options: [{ vi: 'Ánh sáng tới máy ảnh cùng lúc đã rời các điểm của vật vào các thời điểm khác nhau', en: 'Light reaching the camera together left different points of the object at different times' }, { vi: 'Vì co độ dài không có thật', en: 'Because length contraction is not real' }], answer: 0, explain: { vi: 'Hiệu ứng thời gian truyền sáng biến co độ dài thành sự xoay biểu kiến (Terrell–Penrose).', en: 'Light-travel-time effects turn contraction into an apparent rotation (Terrell–Penrose).' } },
  ],
  instructor: {
    vi: 'Tài nguyên: McKinley & Doherty (1979) Am. J. Phys. 47, 309; Rindler (2006) Relativity, §4; Terrell (1959) Phys. Rev. 116, 1041; Penrose (1959) Proc. Camb. Phil. Soc. 55, 137; Ballesteros (2012) EPL 97, 34008 (nhiệt độ từ B−V). Gợi ý thảo luận: vì sao độ sáng tăng theo $D^2$ với nguồn điểm nhưng theo $D^4$ với một mặt phát sáng có diện tích biểu kiến xác định?',
    en: 'Resources: McKinley & Doherty (1979) Am. J. Phys. 47, 309; Rindler (2006) Relativity, §4; Terrell (1959) Phys. Rev. 116, 1041; Penrose (1959) Proc. Camb. Phil. Soc. 55, 137; Ballesteros (2012) EPL 97, 34008 (temperature from B−V). Discussion: why does brightness scale as $D^2$ for a point source but as $D^4$ for the surface brightness of an extended emitter?',
  },
};

/** Model Card · C4. Measured figures: `npm run validate:sr` → docs/validation/C-special-relativity.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Quang sai và Doppler tương đối tính', en: 'Level A - Relativistic aberration and Doppler' },
      body: {
        vi: 'Hướng biểu kiến, hệ số Doppler, nhiệt độ màu $T\' = D\\,T$ và thay đổi cấp sao $-5\\log_{10}D$ được tính bằng công thức chính xác; các sao sáng có tên dùng toạ độ và chỉ số màu thật từ Yale Bright Star Catalogue.',
        en: 'Apparent directions, Doppler factors, colour temperatures $T\' = D\\,T$ and magnitude changes $-5\\log_{10}D$ use exact formulae; named bright stars use real coordinates and colour indices from the Yale Bright Star Catalogue.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Sao mờ nền và cách hiển thị', en: 'Level C - Faint background stars and display' },
      body: {
        vi: '1 800 sao mờ có vị trí, cấp sao và nhiệt độ ngẫu nhiên (trang trí). Màu là màu sRGB của vật đen $T\'$ (giới hạn 60 000 K); sao có $T\' < 2\\,200$ K được làm mờ dần vì phần lớn bức xạ đã ra ngoài vùng nhìn thấy; chỉ vẽ sao có $m\' \\le 7{,}5$.',
        en: '1,800 faint stars have random positions, magnitudes and temperatures (decorative). Colours are the sRGB colour of a blackbody at $T\'$ (capped at 60,000 K); stars with $T\' < 2,200$ K are faded because most of their emission has left the visible band; only stars with $m\' \\le 7.5$ are drawn.',
      },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Quang sai', en: '1. Aberration' },
      tex: ["\\cos\\theta'=\\frac{\\cos\\theta+\\beta}{1+\\beta\\cos\\theta},\\qquad \\theta'_{90^\\circ}=\\arccos\\beta"],
      body: {
        vi: 'Trong đó $\\theta$ là góc giữa hướng bay và hướng tới sao (nơi ánh sáng đến từ đó) đo trong hệ nghỉ của các sao, $\\theta\'$ là góc đo trên tàu. Phương vị quanh hướng bay không đổi. Bầu trời được vẽ bằng phép chiếu phương vị cách đều quanh hướng bay: bán kính trên hình tỉ lệ với $\\theta\'$.',
        en: '$\\theta$ is the angle between the direction of motion and the direction to the star (where the light comes from) in the stars’ rest frame; $\\theta\'$ is measured on the ship. The azimuth about the direction of motion is unchanged. The sky is drawn in an azimuthal equidistant projection about the direction of motion: the radius on the picture is proportional to $\\theta\'$.',
      },
    },
    {
      title: { vi: '2. Doppler, màu và cấp sao', en: '2. Doppler, colour and magnitude' },
      tex: ["D=\\gamma(1+\\beta\\cos\\theta)=\\frac{1}{\\gamma(1-\\beta\\cos\\theta')},\\qquad T'=D\\,T,\\qquad m'=m-5\\log_{10}D", 'T_{\\rm eff}=4600\\left(\\frac{1}{0.92\\,(B-V)+1.7}+\\frac{1}{0.92\\,(B-V)+0.62}\\right)\\ \\mathrm K'],
      body: {
        vi: 'Trong đó $D$ là hệ số Doppler, $T$ là nhiệt độ của sao suy từ chỉ số màu $B-V$ theo công thức Ballesteros (2012), $m$ là cấp sao trong danh mục. Thông lượng bolometric của một nguồn điểm ở vô cực biến đổi theo $D^2$; mô-đun áp dụng hệ số này cho cấp sao nhìn thấy $V$, một xấp xỉ vì phổ sao dịch sang dải bước sóng khác.',
        en: '$D$ is the Doppler factor, $T$ the stellar temperature from the colour index $B-V$ via Ballesteros (2012), $m$ the catalogue magnitude. The bolometric flux of a point source at infinity scales as $D^2$; the module applies this factor to the visual magnitude $V$, an approximation because the spectrum shifts into a different band.',
      },
    },
  ],
  assumptions: {
    vi: ['Các sao ở vô cực và đứng yên trong một hệ quán tính (bỏ qua thị sai và chuyển động riêng).', 'Phổ sao là vật đen; nhiệt độ từ $B-V$ theo Ballesteros (2012).', 'Tàu chuyển động thẳng đều; ảnh là ảnh chụp tức thời của máy ảnh trên tàu.'],
    en: ['Stars at infinity and at rest in one inertial frame (parallax and proper motion ignored).', 'Stellar spectra are blackbodies; temperatures from $B-V$ via Ballesteros (2012).', 'The ship moves uniformly; the image is an instantaneous camera snapshot.'],
  },
  validity: { vi: ['$0 \\le \\beta \\le 1 - 10^{-8}$; sai số làm tròn của $\\gamma$ khoảng $10^{-16}/(1-\\beta)$.'], en: ['$0 \\le \\beta \\le 1 - 10^{-8}$; the rounding error of $\\gamma$ is about $10^{-16}/(1-\\beta)$.'] },
  scope: { vi: 'Hướng và hệ số Doppler là chính xác; màu và cấp sao hiển thị là xấp xỉ có ghi rõ ở trên.', en: 'Directions and Doppler factors are exact; displayed colours and magnitudes are the approximations stated above.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:sr\` → \`docs/validation/C-special-relativity.json\`; ngưỡng khoá trong \`packages/sim-core/test/sr-c.test.ts\`.

- **Đối chiếu độc lập:** với 4 000 hướng ngẫu nhiên và $0 \\le \\beta < 0{,}999999$, công thức quang sai và hệ số Doppler được so với phép tăng tốc Lorentz 3 chiều đầy đủ của vectơ 4-xung lượng photon: sai lệch lớn nhất của $\\cos\\theta\'$ là $2{,}2\\times10^{-15}$, của $D$ là $4{,}2\\times10^{-13}$ (tương đối); hai dạng của $D$ (theo $\\theta$ và theo $\\theta\'$) trùng nhau.
- **Nón phía trước:** tại $\\beta = 0{,}9$, nửa góc mở $\\arccos\\beta = 25{,}84°$.
- **Nền vi sóng 3 000 K phía trước:** $D = 1100{,}7$, $1 - \\beta = 1{,}65\\times10^{-6}$.`,
    en: `Reproducible report: \`npm run validate:sr\` → \`docs/validation/C-special-relativity.json\`; thresholds locked in \`packages/sim-core/test/sr-c.test.ts\`.

- **Independent cross-check:** for 4,000 random directions and $0 \\le \\beta < 0.999999$ the aberration and Doppler formulae are compared with a full 3-D Lorentz boost of the photon 4-momentum: maximum difference $2.2\\times10^{-15}$ in $\\cos\\theta\'$ and $4.2\\times10^{-13}$ (relative) in $D$; the two forms of $D$ (in terms of $\\theta$ and of $\\theta\'$) agree.
- **Forward cone:** at $\\beta = 0.9$ the half-angle $\\arccos\\beta = 25.84°$.
- **Microwave background at 3,000 K ahead:** $D = 1100.7$, $1 - \\beta = 1.65\\times10^{-6}$.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có dải Ngân Hà, thiên hà hay nền vi sóng được vẽ như ảnh; không mô phỏng sự xoay Terrell của vật thể mở rộng.', 'Độ sáng dùng hệ số bolometric $D^2$ cho cấp sao $V$; không tính đáp ứng phổ của mắt hay cảm biến.', 'Toạ độ J2000, bỏ qua tiến động và chuyển động riêng.'],
    en: ['No Milky Way band, galaxies or rendered microwave background; no Terrell rotation of extended objects.', 'Brightness uses the bolometric factor $D^2$ for the $V$ magnitude; no spectral response of the eye or sensor.', 'J2000 coordinates; precession and proper motion ignored.'],
  },
  references: [
    'McKinley, J. M. & Doherty, P. (1979). In search of the “starbow”: The appearance of the starfield from a relativistic spaceship. Am. J. Phys. 47, 309.',
    'Terrell, J. (1959). Invisibility of the Lorentz contraction. Phys. Rev. 116, 1041.',
    'Penrose, R. (1959). The apparent shape of a relativistically moving sphere. Proc. Camb. Phil. Soc. 55, 137.',
    'Rindler, W. (2006). Relativity: Special, General, and Cosmological, 2nd ed. Oxford University Press, §4.',
    'Ballesteros, F. J. (2012). New insights into black bodies. EPL 97, 34008.',
    'Fixsen, D. J. (2009). The temperature of the cosmic microwave background. ApJ 707, 916.',
    'Hoffleit, D. & Warren, W. H. (1991). The Bright Star Catalogue, 5th revised ed. Yale University Observatory.',
  ],
};
