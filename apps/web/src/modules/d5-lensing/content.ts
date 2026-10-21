import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Giải thích sự lệch của ánh sáng khi đi gần một khối lượng và tính góc lệch $4GM/(c^2b)$, gồm giá trị 1,75″ ở rìa Mặt Trời.',
      'Thiết lập phương trình thấu kính cho thấu kính điểm, tìm vị trí hai ảnh và điều kiện tạo vòng Einstein.',
      'Tính bán kính Einstein $\\theta_E$ và độ phóng đại của từng ảnh.',
      'Đọc đường cong vi thấu kính (microlensing) và giải thích ý nghĩa của $u_0$ và $t_E$.',
    ],
    en: [
      'Explain the bending of light near a mass and compute the deflection $4GM/(c^2b)$, including 1.75″ at the solar limb.',
      'Set up the lens equation for a point lens, find the two image positions and the condition for an Einstein ring.',
      'Compute the Einstein radius $\\theta_E$ and the magnification of each image.',
      'Read a microlensing light curve and interpret $u_0$ and $t_E$.',
    ],
  },
  durationMin: 40,
  prerequisites: { vi: 'D2 - Geodesic Schwarzschild; hình học góc nhỏ; giải phương trình bậc hai.', en: 'D2 - Schwarzschild geodesics; small-angle geometry; solving quadratic equations.' },
  background: [
    {
      title: { vi: 'Khối lượng như một thấu kính', en: 'Mass as a lens' },
      body: {
        vi: 'Không–thời gian cong làm tia sáng đi gần một khối lượng bị lệch hướng. Khi một thiên thể ở xa, một thấu kính (sao, thiên hà, đám thiên hà) và người quan sát gần như thẳng hàng, ánh sáng có thể tới ta theo nhiều đường: ta thấy nhiều ảnh, cung sáng, vòng Einstein, hoặc độ sáng của nguồn tăng lên tạm thời. Mô-đun D5 xét trường hợp đơn giản nhất nhưng được dùng rộng rãi: **thấu kính khối điểm** trong xấp xỉ trường yếu và thấu kính mỏng.',
        en: 'Curved spacetime bends light passing near a mass. When a distant source, a lens (star, galaxy, cluster) and the observer are nearly aligned, light can reach us along several paths: we see multiple images, arcs, an Einstein ring, or a temporary brightening of the source. Module D5 treats the simplest yet widely used case: the **point-mass lens** in the weak-field, thin-lens approximation.',
      },
    },
    {
      title: { vi: '1. Góc lệch của ánh sáng', en: '1. The deflection angle' },
      body: {
        vi: 'Thuyết tương đối rộng cho góc lệch của một tia sáng đi qua khối lượng $M$ với tham số va chạm $b \\gg GM/c^2$:\n\n$$\\hat\\alpha = \\frac{4GM}{c^2 b}.$$\n\nGiá trị này **gấp đôi** kết quả thu được khi coi ánh sáng là hạt chịu hấp dẫn Newton (Soldner 1801); một nửa đến từ độ cong của thời gian, một nửa từ độ cong của không gian. Ở rìa Mặt Trời ($b = R_\\odot$) góc lệch là 1,75″. Đoàn thám hiểm nhật thực 1919 của Dyson, Eddington & Davidson đo được $1{,}98″ \\pm 0{,}12″$ (Sobral) và $1{,}61″ \\pm 0{,}30″$ (Príncipe), ủng hộ dự đoán của Einstein.',
        en: 'General relativity gives the deflection of a ray passing a mass $M$ at impact parameter $b \\gg GM/c^2$:\n\n$$\\hat\\alpha = \\frac{4GM}{c^2 b}.$$\n\nThis is **twice** the value obtained by treating light as particles under Newtonian gravity (Soldner 1801); half comes from the curvature of time and half from the curvature of space. At the solar limb ($b = R_\\odot$) the deflection is 1.75″. The 1919 eclipse expeditions of Dyson, Eddington & Davidson measured $1.98″ \\pm 0.12″$ (Sobral) and $1.61″ \\pm 0.30″$ (Príncipe), supporting Einstein’s prediction.',
      },
    },
    {
      title: { vi: '2. Phương trình thấu kính và bán kính Einstein', en: '2. The lens equation and the Einstein radius' },
      body: {
        vi: 'Gọi $\\beta$ là góc giữa nguồn thật và thấu kính, $\\theta$ là góc của ảnh, $D_l$, $D_s$, $D_{ls}$ là khoảng cách tới thấu kính, tới nguồn và từ thấu kính tới nguồn. Hình học góc nhỏ cho\n\n$$\\beta = \\theta - \\frac{\\theta_E^2}{\\theta},\\qquad \\theta_E = \\sqrt{\\frac{4GM}{c^2}\\,\\frac{D_{ls}}{D_l D_s}}.$$\n\n$\\theta_E$ là **bán kính Einstein**: thang góc tự nhiên của bài toán. Một sao $0{,}5\\,M_\\odot$ ở 4 kpc thấu kính một sao ở 8 kpc có $\\theta_E \\approx 0{,}71$ mili giây cung, quá nhỏ để tách các ảnh bằng kính thiên văn quang học.',
        en: 'Let $\\beta$ be the angle between the true source and the lens, $\\theta$ the image angle, and $D_l$, $D_s$, $D_{ls}$ the distances to the lens, to the source and from lens to source. Small-angle geometry gives\n\n$$\\beta = \\theta - \\frac{\\theta_E^2}{\\theta},\\qquad \\theta_E = \\sqrt{\\frac{4GM}{c^2}\\,\\frac{D_{ls}}{D_l D_s}}.$$\n\n$\\theta_E$ is the **Einstein radius**: the natural angular scale of the problem. A $0.5\\,M_\\odot$ star at 4 kpc lensing a star at 8 kpc has $\\theta_E \\approx 0.71$ milliarcseconds, far too small to resolve the images with optical telescopes.',
      },
    },
    {
      title: { vi: '3. Hai ảnh, vòng Einstein và độ phóng đại', en: '3. Two images, the Einstein ring and magnification' },
      body: {
        vi: 'Phương trình thấu kính là phương trình bậc hai theo $\\theta$, nên thấu kính điểm luôn cho **hai ảnh**\n\n$$\\theta_\\pm = \\tfrac12\\left(\\beta \\pm \\sqrt{\\beta^2 + 4\\theta_E^2}\\right),$$\n\nmột ở ngoài vòng $\\theta_E$ cùng phía nguồn, một ở trong vòng phía đối diện. Khi nguồn thẳng hàng ($\\beta = 0$), do đối xứng tròn, ảnh trở thành **vòng Einstein** bán kính $\\theta_E$. Vì thấu kính bảo toàn độ sáng bề mặt, độ phóng đại bằng tỉ số diện tích ảnh và nguồn. Với $u = \\beta/\\theta_E$:\n\n$$A = \\frac{u^2 + 2}{u\\sqrt{u^2 + 4}},\\qquad A_\\pm = \\frac{A \\pm 1}{2}.$$\n\nKhi $u \\ll 1$, $A \\approx 1/u$: nguồn càng thẳng hàng càng sáng. Với nguồn điểm $A \\to \\infty$ khi $u \\to 0$; nguồn thật có kích thước hữu hạn nên độ phóng đại cực đại hữu hạn.',
        en: 'The lens equation is quadratic in $\\theta$, so a point lens always gives **two images**\n\n$$\\theta_\\pm = \\tfrac12\\left(\\beta \\pm \\sqrt{\\beta^2 + 4\\theta_E^2}\\right),$$\n\none outside the $\\theta_E$ circle on the source’s side and one inside it on the opposite side. When the source is aligned ($\\beta = 0$), circular symmetry turns the image into an **Einstein ring** of radius $\\theta_E$. Because lensing conserves surface brightness, the magnification is the ratio of image to source area. With $u = \\beta/\\theta_E$:\n\n$$A = \\frac{u^2 + 2}{u\\sqrt{u^2 + 4}},\\qquad A_\\pm = \\frac{A \\pm 1}{2}.$$\n\nFor $u \\ll 1$, $A \\approx 1/u$: the closer the alignment, the brighter. A point source has $A \\to \\infty$ as $u \\to 0$; a real source has finite size, so the peak magnification is finite.',
      },
    },
    {
      title: { vi: '4. Vi thấu kính', en: '4. Microlensing' },
      body: {
        vi: 'Khi thấu kính là một ngôi sao trong Ngân Hà, hai ảnh cách nhau chưa tới một mili giây cung nên không tách được; ta chỉ thấy **tổng độ sáng tăng rồi giảm** khi thấu kính đi ngang nguồn (Paczyński 1986). Với chuyển động thẳng đều,\n\n$$u(t) = \\sqrt{u_0^2 + \\left(\\frac{t - t_0}{t_E}\\right)^2},$$\n\ntrong đó $u_0$ là khoảng cách góc nhỏ nhất (theo $\\theta_E$), $t_0$ là thời điểm cực đại và $t_E = \\theta_E/\\mu_{\\rm rel}$ là **thời gian Einstein** ($\\mu_{\\rm rel}$ là chuyển động riêng tương đối). Đường cong đối xứng, không phụ thuộc màu sắc - hai dấu hiệu giúp phân biệt vi thấu kính với sao biến quang. Các khảo sát như OGLE và MOA dùng phương pháp này để phát hiện hành tinh quanh các sao xa.',
        en: 'When the lens is a star in the Galaxy the two images are less than a milliarcsecond apart and cannot be resolved; we see only the **total brightness rise and fall** as the lens passes the source (Paczyński 1986). For uniform motion\n\n$$u(t) = \\sqrt{u_0^2 + \\left(\\frac{t - t_0}{t_E}\\right)^2},$$\n\nwhere $u_0$ is the minimum separation (in $\\theta_E$), $t_0$ the time of maximum and $t_E = \\theta_E/\\mu_{\\rm rel}$ the **Einstein time** ($\\mu_{\\rm rel}$ the relative proper motion). The curve is symmetric and achromatic - two signatures that distinguish microlensing from variable stars. Surveys such as OGLE and MOA use it to discover planets around distant stars.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Vòng Einstein', en: 'Experiment 1 - The Einstein ring' }, text: { vi: 'Kéo thiên hà nguồn tới đúng sau thấu kính ($\\beta = 0$). Ảnh trở thành vòng có bán kính bằng bao nhiêu $\\theta_E$? Sau đó dịch nguồn ra một chút và quan sát vòng tách thành hai cung.', en: 'Drag the source galaxy directly behind the lens ($\\beta = 0$). What radius, in $\\theta_E$, does the ring have? Then move the source slightly and watch the ring split into two arcs.' }, params: { mode: 'image', sx: 0, sy: 0 } },
    { title: { vi: 'Thử nghiệm 2 - Hai ảnh', en: 'Experiment 2 - Two images' }, text: { vi: 'Đặt nguồn tại $\\beta = 0{,}5\\,\\theta_E$. Đọc $\\theta_+$, $\\theta_-$ và kiểm tra bằng công thức nghiệm. Ảnh nào sáng hơn? Kiểm tra $A_+ - A_- = 1$.', en: 'Put the source at $\\beta = 0.5\\,\\theta_E$. Read $\\theta_+$, $\\theta_-$ and check them with the quadratic formula. Which image is brighter? Check that $A_+ - A_- = 1$.' }, params: { mode: 'image', sx: 0.5, sy: 0 } },
    { title: { vi: 'Thử nghiệm 3 - Đường cong vi thấu kính', en: 'Experiment 3 - A microlensing light curve' }, text: { vi: 'Chọn chế độ vi thấu kính với $u_0 = 0{,}1$. Độ phóng đại cực đại là bao nhiêu? So với xấp xỉ $A \\approx 1/u_0$. Đổi $t_E$: hình dạng đường cong thay đổi thế nào?', en: 'Choose microlensing with $u_0 = 0.1$. What is the peak magnification? Compare with $A \\approx 1/u_0$. Change $t_E$: how does the shape change?' }, params: { mode: 'micro', u0: 0.1 } },
    { title: { vi: 'Thử nghiệm 4 - Bán kính Einstein trong Ngân Hà', en: 'Experiment 4 - Einstein radii in the Galaxy' }, text: { vi: 'Với $M = 0{,}5\\,M_\\odot$, $D_s = 8$ kpc, đổi $D_l$ từ 1 tới 7 kpc. $\\theta_E$ lớn nhất ở đâu? Vì sao $\\theta_E \\to 0$ khi thấu kính tiến sát nguồn?', en: 'With $M = 0.5\\,M_\\odot$, $D_s = 8$ kpc, vary $D_l$ from 1 to 7 kpc. Where is $\\theta_E$ largest? Why does $\\theta_E \\to 0$ as the lens approaches the source?' }, params: { M: 0.5, Dl: 4, Ds: 8 } },
  ],
  quiz: [
    { q: { vi: 'Một thấu kính khối điểm luôn tạo ra:', en: 'A point-mass lens always produces:' }, options: [{ vi: 'Hai ảnh (hoặc một vòng khi thẳng hàng)', en: 'Two images (or a ring when aligned)' }, { vi: 'Một ảnh', en: 'One image' }, { vi: 'Bốn ảnh', en: 'Four images' }], answer: 0, explain: { vi: 'Phương trình thấu kính là bậc hai theo $\\theta$; ảnh trong có thể rất mờ.', en: 'The lens equation is quadratic in $\\theta$; the inner image may be very faint.' } },
    { q: { vi: 'Ánh sáng sượt qua rìa Mặt Trời bị lệch khoảng:', en: 'Light grazing the solar limb is deflected by about:' }, options: [{ vi: '1,75″', en: '1.75″' }, { vi: '0,87″', en: '0.87″' }, { vi: '43″', en: '43″' }], answer: 0, explain: { vi: '$4GM_\\odot/(c^2R_\\odot) \\approx 1{,}75″$; 0,87″ là giá trị “Newton”, chỉ bằng một nửa.', en: '$4GM_\\odot/(c^2R_\\odot) \\approx 1.75″$; 0.87″ is the “Newtonian” half value.' } },
    { q: { vi: 'Với $u = 1$, độ phóng đại tổng là:', en: 'At $u = 1$ the total magnification is:' }, options: [{ vi: '$3/\\sqrt5 \\approx 1{,}34$', en: '$3/\\sqrt5 \\approx 1.34$' }, { vi: '1', en: '1' }, { vi: '2', en: '2' }], answer: 0, explain: { vi: '$A = (1 + 2)/(1 \\cdot \\sqrt5)$. Đây là ngưỡng thường dùng để định nghĩa một sự kiện vi thấu kính.', en: '$A = (1 + 2)/(1 \\cdot \\sqrt5)$. This is the threshold often used to define a microlensing event.' } },
    { q: { vi: 'Dấu hiệu nào giúp phân biệt vi thấu kính với sao biến quang?', en: 'Which signature distinguishes microlensing from a variable star?' }, options: [{ vi: 'Đường cong đối xứng và không phụ thuộc màu', en: 'A symmetric, achromatic light curve' }, { vi: 'Độ sáng tuần hoàn', en: 'Periodic brightness' }], answer: 0, explain: { vi: 'Thấu kính hấp dẫn bẻ cong mọi bước sóng như nhau và chuyển động tương đối là thẳng đều.', en: 'Gravitational lensing bends all wavelengths equally and the relative motion is uniform.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Schneider, Ehlers & Falco (1992) Gravitational Lenses, ch. 2; Paczyński (1986) ApJ 304, 1; Dyson, Eddington & Davidson (1920) Phil. Trans. R. Soc. A 220, 291; Witt & Mao (1994) ApJ 430, 505 - độ phóng đại của nguồn có kích thước hữu hạn. Gợi ý thảo luận: vì sao thấu kính đôi (sao có hành tinh) tạo đường cong có các đỉnh nhọn tại đường tới hạn (caustic)?',
    en: 'Resources: Schneider, Ehlers & Falco (1992) Gravitational Lenses, ch. 2; Paczyński (1986) ApJ 304, 1; Dyson, Eddington & Davidson (1920) Phil. Trans. R. Soc. A 220, 291; Witt & Mao (1994) ApJ 430, 505 - finite-source magnification. Discussion: why does a binary lens (a star with a planet) produce sharp spikes at caustic crossings?',
  },
};

/** Model Card · D5. Measured figures: `npm run validate:lens` → docs/validation/D5-lensing.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Thấu kính khối điểm: ảnh, độ phóng đại, $\\theta_E$, vi thấu kính', en: 'Level A - Point-mass lens: images, magnification, $\\theta_E$, microlensing' },
      body: { vi: 'Vị trí ảnh, độ phóng đại từng ảnh và tổng, bán kính Einstein (góc và trong mặt phẳng thấu kính), đường cong vi thấu kính và góc lệch được tính giải tích trong xấp xỉ trường yếu, thấu kính mỏng.', en: 'Image positions, individual and total magnifications, the Einstein radius (angular and in the lens plane), the microlensing light curve and the deflection angle are analytic in the weak-field, thin-lens approximation.' },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Ảnh dò tia ngược', en: 'Level B - Inverse-ray-shot image' },
      body: { vi: 'Ảnh được tạo bằng cách ánh xạ từng điểm ảnh (bước 2 hoặc 3 pixel) qua phương trình thấu kính tới mặt phẳng nguồn; độ chính xác phụ thuộc độ phân giải lưới. Phương pháp này được kiểm chứng định lượng bằng phép đo độ phóng đại dưới đây.', en: 'The image is made by mapping each pixel (2 or 3 px steps) through the lens equation to the source plane; accuracy depends on the grid resolution. The method is validated quantitatively by the magnification measurements below.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Hình dạng nguồn', en: 'Level C - Source appearance' },
      body: { vi: 'Thiên hà nguồn là hình xoắn ốc tạo theo thủ tục (trang trí); ở chế độ vi thấu kính, nguồn là một vết Gauss có bán kính đặc trưng $0{,}035\\,\\theta_E$.', en: 'The source galaxy is a procedural spiral (decorative); in microlensing mode the source is a Gaussian spot of characteristic radius $0.035\\,\\theta_E$.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, B, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Phương trình thấu kính và bán kính Einstein', en: '1. Lens equation and Einstein radius' },
      tex: ['\\boldsymbol\\beta=\\boldsymbol\\theta-\\theta_E^2\\,\\frac{\\boldsymbol\\theta}{|\\boldsymbol\\theta|^2},\\qquad \\theta_E=\\sqrt{\\frac{4GM}{c^2}\\,\\frac{D_{ls}}{D_lD_s}},\\qquad R_E=\\theta_E D_l', '\\hat\\alpha=\\frac{4GM}{c^2b}'],
      body: {
        vi: 'Trong đó $\\boldsymbol\\beta$, $\\boldsymbol\\theta$ là vị trí góc (vectơ 2 chiều) của nguồn và ảnh trên bầu trời, đo từ thấu kính; $M$ là khối lượng thấu kính; $D_l$, $D_s$ là khoảng cách tới thấu kính và nguồn, $D_{ls} = D_s - D_l$ (khoảng cách Euclid, phù hợp trong Ngân Hà); $R_E$ là bán kính Einstein trong mặt phẳng thấu kính; $b$ là tham số va chạm. Phần ảnh dùng đơn vị $\\theta_E = 1$.',
        en: '$\\boldsymbol\\beta$, $\\boldsymbol\\theta$ are the 2-D angular positions of source and image on the sky, measured from the lens; $M$ the lens mass; $D_l$, $D_s$ the distances to lens and source, $D_{ls} = D_s - D_l$ (Euclidean, appropriate within the Galaxy); $R_E$ the Einstein radius in the lens plane; $b$ the impact parameter. The image panel uses units $\\theta_E = 1$.',
      },
    },
    {
      title: { vi: '2. Ảnh, độ phóng đại và vi thấu kính', en: '2. Images, magnification and microlensing' },
      tex: ['\\theta_\\pm=\\tfrac12\\left(\\beta\\pm\\sqrt{\\beta^2+4\\theta_E^2}\\right),\\qquad A=\\frac{u^2+2}{u\\sqrt{u^2+4}},\\qquad A_\\pm=\\frac{A\\pm1}{2}', 'u(t)=\\sqrt{u_0^2+\\left(\\frac{t-t_0}{t_E}\\right)^2}'],
      body: {
        vi: 'Trong đó $u = \\beta/\\theta_E$, $A$ là độ phóng đại tổng của nguồn điểm, $A_\\pm$ là độ phóng đại của từng ảnh (giá trị tuyệt đối; ảnh trong có chẵn lẻ âm), $u_0$ là tham số va chạm nhỏ nhất, $t_0$ là thời điểm cực đại, $t_E$ là thời gian Einstein.',
        en: '$u = \\beta/\\theta_E$, $A$ the total point-source magnification, $A_\\pm$ the individual magnifications (absolute values; the inner image has negative parity), $u_0$ the minimum impact parameter, $t_0$ the time of maximum, $t_E$ the Einstein time.',
      },
    },
  ],
  assumptions: {
    vi: ['Thấu kính khối điểm, trường yếu ($b \\gg GM/c^2$), thấu kính mỏng.', 'Khoảng cách Euclid $D_{ls} = D_s - D_l$; không dùng khoảng cách góc vũ trụ học.', 'Vi thấu kính: chuyển động tương đối thẳng đều, nguồn và thấu kính đơn (không có hệ đôi), không có thị sai quỹ đạo của Trái Đất.'],
    en: ['Point-mass lens, weak field ($b \\gg GM/c^2$), thin lens.', 'Euclidean distances $D_{ls} = D_s - D_l$; no cosmological angular-diameter distances.', 'Microlensing: uniform relative motion, single source and single lens (no binaries), no orbital parallax of Earth.'],
  },
  validity: { vi: ['Thấu kính sao và hành tinh trong Ngân Hà: $0{,}01 \\le M/M_\\odot \\le 100$, $D_l < D_s \\le 20$ kpc. Với thấu kính là thiên hà hay đám thiên hà cần khoảng cách vũ trụ học và mô hình khối lượng mở rộng.'], en: ['Stellar and planetary lenses in the Galaxy: $0.01 \\le M/M_\\odot \\le 100$, $D_l < D_s \\le 20$ kpc. Galaxy or cluster lenses need cosmological distances and extended mass models.'] },
  scope: { vi: 'Các biểu thức giải tích là chính xác trong xấp xỉ đã nêu; phần dò tia được kiểm chứng bằng phép đo độ phóng đại.', en: 'The analytic expressions are exact within the stated approximations; the ray shooting is validated by magnification measurements.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:lens\` → \`docs/validation/D5-lensing.json\`; ngưỡng khoá trong \`packages/sim-core/test/lens-d5.test.ts\`.

- **Dò tia ngược so với nghiệm chính xác:** đếm diện tích trên lưới ảnh 3 000 × 3 000 ánh xạ vào một nguồn đĩa đều. Nguồn thẳng hàng bán kính $\\rho = 0{,}1\\,\\theta_E$: $A = 20{,}0251$ so với $\\sqrt{1 + 4/\\rho^2} = 20{,}0250$ (Witt & Mao 1994), sai lệch $5\\times10^{-6}$.
- **Nguồn nhỏ** ($\\rho = 0{,}02$) tại $u$ = 0,1; 0,3; 0,5; 1: sai lệch so với $A(u)$ nguồn điểm lần lượt 0,62%; 0,28%; 0,22%; 0,03% - đúng bằng hiệu ứng kích thước nguồn, tăng khi $u$ giảm.
- **Phương trình thấu kính:** $\\theta_\\pm$ thoả phương trình tới $2\\times10^{-15}$; $A_+ - A_- = 1$ tới $4\\times10^{-16}$.
- **Góc lệch ở rìa Mặt Trời:** 1,751″ ($R_\\odot$ danh định IAU 2015). **$\\theta_E$** của sao 0,5 $M_\\odot$ ở 4 kpc, nguồn ở 8 kpc: 0,713 mas.`,
    en: `Reproducible report: \`npm run validate:lens\` → \`docs/validation/D5-lensing.json\`; thresholds locked in \`packages/sim-core/test/lens-d5.test.ts\`.

- **Inverse ray shooting vs exact results:** image-plane area on a 3,000 × 3,000 grid mapping into a uniform disk source. Aligned source of radius $\\rho = 0.1\\,\\theta_E$: $A = 20.0251$ vs $\\sqrt{1 + 4/\\rho^2} = 20.0250$ (Witt & Mao 1994), difference $5\\times10^{-6}$.
- **Small source** ($\\rho = 0.02$) at $u$ = 0.1, 0.3, 0.5, 1: differences from the point-source $A(u)$ of 0.62%, 0.28%, 0.22%, 0.03% - exactly the finite-source effect, growing as $u$ decreases.
- **Lens equation:** $\\theta_\\pm$ satisfy it to $2\\times10^{-15}$; $A_+ - A_- = 1$ to $4\\times10^{-16}$.
- **Solar-limb deflection:** 1.751″ (IAU 2015 nominal $R_\\odot$). **$\\theta_E$** of a 0.5 $M_\\odot$ star at 4 kpc, source at 8 kpc: 0.713 mas.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có thấu kính đôi (đường tới hạn, caustic), thấu kính mở rộng (SIS, NFW) hay cắt xén ngoài.', 'Đường cong vi thấu kính dùng nguồn điểm (không có hiệu ứng kích thước nguồn hay tối rìa).', 'Không có thị sai vi thấu kính hay chuyển động quỹ đạo của Trái Đất.'],
    en: ['No binary lenses (caustics), extended lenses (SIS, NFW) or external shear.', 'The microlensing curve uses a point source (no finite-source or limb-darkening effects).', 'No microlensing parallax or Earth’s orbital motion.'],
  },
  references: [
    'Einstein, A. (1936). Lens-like action of a star by the deviation of light in the gravitational field. Science 84, 506.',
    'Dyson, F. W., Eddington, A. S. & Davidson, C. (1920). A determination of the deflection of light by the Sun’s gravitational field. Phil. Trans. R. Soc. A 220, 291.',
    'Schneider, P., Ehlers, J. & Falco, E. E. (1992). Gravitational Lenses. Springer, ch. 2.',
    'Paczyński, B. (1986). Gravitational microlensing by the galactic halo. ApJ 304, 1.',
    'Witt, H. J. & Mao, S. (1994). Can lensed stars be regarded as pointlike for microlensing by MACHOs? ApJ 430, 505.',
  ],
};
