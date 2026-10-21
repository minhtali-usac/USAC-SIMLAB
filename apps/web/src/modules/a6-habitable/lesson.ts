import type { Lesson } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Tính thông lượng sao tới hành tinh theo định luật nghịch đảo bình phương khoảng cách.',
      'Giải thích ý nghĩa vật lý của bốn biên vùng sinh sống Kopparapu và phân biệt biên bảo thủ với biên lạc quan.',
      'Giải thích vì sao vùng sinh sống gần hơn quanh sao lùn đỏ và xa hơn quanh sao nóng, sáng.',
      'Phân biệt nhiệt độ cân bằng bức xạ T_eq với nhiệt độ bề mặt.',
      'Nhận biết giới hạn của khái niệm: “nằm trong vùng sinh sống” không đồng nghĩa với “có sự sống”.',
    ],
    en: [
      'Compute the stellar flux reaching a planet with the inverse-square law.',
      'Explain the physics of the four Kopparapu HZ boundaries and distinguish conservative from optimistic edges.',
      'Explain why the HZ lies closer to red dwarfs and farther from hot, luminous stars.',
      'Distinguish the radiative equilibrium temperature T_eq from the surface temperature.',
      'Recognise the limits of the concept: “inside the HZ” does not mean “has life”.',
    ],
  },
  durationMin: 35,
  prerequisites: {
    vi: 'Định luật nghịch đảo bình phương của ánh sáng, độ trưng và nhiệt độ hiệu dụng của sao, định luật Stefan–Boltzmann.',
    en: 'Inverse-square law of light, stellar luminosity and effective temperature, the Stefan–Boltzmann law.',
  },
  background: [
    {
      title: { vi: 'Vùng sinh sống là gì?', en: 'What is the habitable zone?' },
      body: {
        vi: 'Vùng sinh sống quanh sao (HZ) là dải khoảng cách mà tại đó một hành tinh đá **giống Trái Đất**, có khí quyển N₂–H₂O–CO₂, có thể duy trì nước lỏng trên bề mặt. Đây là một **đánh giá bức xạ – nhiệt**, không phải phép thử sự sống.\n\nThông lượng sao giảm theo bình phương khoảng cách:\n\n$$\\frac{S_p}{S_\\oplus}=\\frac{L/L_\\odot}{(r/\\text{au})^2}.$$\n\nVì vậy một sao sáng gấp 4 lần Mặt Trời có HZ xa hơn khoảng 2 lần.',
        en: 'The circumstellar habitable zone (HZ) is the range of distances at which an **Earth-like** rocky planet with an N₂–H₂O–CO₂ atmosphere could keep liquid water on its surface. It is a **radiative–thermal assessment**, not a test for life.\n\nStellar flux falls with the square of distance:\n\n$$\\frac{S_p}{S_\\oplus}=\\frac{L/L_\\odot}{(r/\\text{au})^2}.$$\n\nSo a star 4× as luminous as the Sun has an HZ about 2× farther out.',
      },
    },
    {
      title: { vi: 'Bốn biên Kopparapu', en: 'The four Kopparapu boundaries' },
      body: {
        vi: 'Mô hình khí hậu 1D (Kopparapu et al. 2013, 2014) cho thông lượng hiệu dụng $S_{{\\rm eff},j}(T_{\\rm eff})$ tại mỗi biên; khoảng cách biên là $r_{{\\rm HZ},j}=\\sqrt{(L/L_\\odot)/S_{{\\rm eff},j}}$ au.\n\n- **Sao Kim gần đây** (biên trong, lạc quan) - theo bằng chứng thực nghiệm từ Sao Kim.\n- **Nhà kính mất kiểm soát** (biên trong, bảo thủ) - hơi nước tích tụ đến khi đại dương bốc hơi hết.\n- **Nhà kính cực đại** (biên ngoài, bảo thủ) - thêm CO₂ làm tăng hiệu ứng nhà kính nhưng cũng tăng tán xạ Rayleigh; vượt điểm này, sự ấm lên không còn bù được thông lượng giảm.\n- **Sao Hoả sơ khai** (biên ngoài, lạc quan) - theo bằng chứng nước lỏng trên Sao Hoả cổ.\n\n$S_{\\rm eff}$ phụ thuộc $T_{\\rm eff}$ vì sao lạnh phát nhiều hồng ngoại: hồng ngoại ít bị tán xạ Rayleigh và bị H₂O, CO₂ hấp thụ mạnh hơn.',
        en: 'A 1-D climate model (Kopparapu et al. 2013, 2014) gives the effective flux $S_{{\\rm eff},j}(T_{\\rm eff})$ at each edge; the boundary distance is $r_{{\\rm HZ},j}=\\sqrt{(L/L_\\odot)/S_{{\\rm eff},j}}$ au.\n\n- **Recent Venus** (inner, optimistic) - empirical, from Venus.\n- **Runaway greenhouse** (inner, conservative) - water vapour builds up until the oceans evaporate.\n- **Maximum greenhouse** (outer, conservative) - more CO₂ adds greenhouse warming but also Rayleigh scattering; beyond this point warming can no longer offset the reduced flux.\n- **Early Mars** (outer, optimistic) - empirical, from evidence of water on ancient Mars.\n\n$S_{\\rm eff}$ depends on $T_{\\rm eff}$ because cool stars emit more infrared, which is less Rayleigh-scattered and more strongly absorbed by H₂O and CO₂.',
      },
    },
    {
      title: { vi: 'Nhiệt độ cân bằng không phải nhiệt độ bề mặt', en: 'Equilibrium temperature is not surface temperature' },
      body: {
        vi: 'Cân bằng năng lượng hấp thụ và bức xạ cho\n\n$$T_{\\rm eq}=\\left[\\frac{L(1-A_B)}{16\\pi\\sigma r^2}\\right]^{1/4},$$\n\nvới $A_B$ là suất phản chiếu Bond. Công thức bỏ qua hiệu ứng nhà kính: Trái Đất có $T_{\\rm eq}$ ≈ 255 K (−18 °C) trong khi nhiệt độ bề mặt trung bình ≈ 288 K (15 °C). Chênh lệch ~33 K chính là hiệu ứng nhà kính.',
        en: 'Balancing absorbed and emitted energy gives\n\n$$T_{\\rm eq}=\\left[\\frac{L(1-A_B)}{16\\pi\\sigma r^2}\\right]^{1/4},$$\n\nwith $A_B$ the Bond albedo. It ignores the greenhouse effect: Earth has $T_{\\rm eq}$ ≈ 255 K (−18 °C) whereas its mean surface temperature is ≈ 288 K (15 °C). The ~33 K gap is the greenhouse effect.',
      },
    },
    {
      title: { vi: 'Ngoài vùng sinh sống quanh sao', en: 'Beyond the circumstellar HZ' },
      body: {
        vi: 'Nằm trong HZ **không** đảm bảo có nước hay sự sống. Hành tinh quanh sao lùn đỏ thường bị khoá thuỷ triều và chịu bùng nổ sao mạnh; sao nặng sống quá ngắn để sự sống kịp phát triển; khí quyển có thể bị thổi bay.\n\n**Vùng sinh sống thiên hà** là một khái niệm *khác*: vùng trong Ngân Hà có đủ nguyên tố nặng để tạo hành tinh đá nhưng ít siêu tân tinh. Mô-đun này không mô phỏng vùng sinh sống thiên hà.',
        en: 'Being inside the HZ does **not** guarantee water or life. Red-dwarf planets are often tidally locked and face strong flares; massive stars live too briefly for life to develop; atmospheres can be stripped.\n\nThe **galactic habitable zone** is a *different* concept: the region of the Milky Way with enough heavy elements for rocky planets but few supernovae. This module does not simulate it.',
      },
    },
  ],
  activities: [
    {
      title: { vi: 'Thí nghiệm 1 - Hệ Mặt Trời', en: 'Experiment 1 - The Solar System' },
      text: {
        vi: 'Đọc bốn biên của Mặt Trời. Sao Kim, Trái Đất, Sao Hoả nằm ở vùng nào? Đặt hành tinh thử ở 1 au và đổi A_B từ 0,3 sang 0,77 (suất phản chiếu Bond của Sao Kim, NASA Fact Sheet): T_eq thay đổi thế nào? Vì sao bề mặt Sao Kim vẫn nóng ~737 K?',
        en: 'Read the Sun’s four boundaries. Which zone are Venus, Earth and Mars in? Put the test planet at 1 au and change A_B from 0.3 to 0.77 (Venus’s Bond albedo, NASA Fact Sheet): how does T_eq change? Why is Venus’s surface still ~737 K?',
      },
      params: { sys: 'sun', d: 1, alb: 0.3 },
    },
    {
      title: { vi: 'Thí nghiệm 2 - TRAPPIST-1 và giới hạn mô hình', en: 'Experiment 2 - TRAPPIST-1 and model limits' },
      text: {
        vi: 'Chọn TRAPPIST-1 (T_eff = 2566 K). Những hành tinh nào nằm trong dải thông lượng bảo thủ? Vì sao giao diện báo kết quả “chỉ minh hoạ”?',
        en: 'Choose TRAPPIST-1 (T_eff = 2566 K). Which planets fall in the conservative flux range? Why does the interface flag the result as “illustration only”?',
      },
      params: { sys: 'trappist1', d: 0.02925 },
    },
    {
      title: { vi: 'Thí nghiệm 3 - Sao nặng hơn, khối lượng hành tinh', en: 'Experiment 3 - Heavier star, planet mass' },
      text: {
        vi: 'Chọn sao tuỳ chỉnh 1,5 M☉: HZ dịch ra xa bao nhiêu, tuổi thọ sao còn bao nhiêu? Sau đó đổi khối lượng hành tinh 0,1 → 5 M⊕: biên nào thay đổi?',
        en: 'Choose a 1.5 M☉ custom star: how far does the HZ move, and what is the star’s lifetime? Then change the planet mass 0.1 → 5 M⊕: which boundary moves?',
      },
      params: { sys: 'custom', mstar: 1.5, mp: 1 },
    },
    {
      title: { vi: 'Suy ngẫm', en: 'Reflection' },
      text: {
        vi: 'Viết 3–4 câu: một hành tinh “nằm trong vùng sinh sống bảo thủ theo mô hình” cho ta biết gì và không cho ta biết gì? Cần thêm quan trắc nào (khí quyển, khối lượng, hoạt động sao) để đánh giá khả năng sinh sống?',
        en: 'Write 3–4 sentences: what does “inside the conservative HZ according to the model” tell us, and what does it not? Which extra observations (atmosphere, mass, stellar activity) are needed to assess habitability?',
      },
    },
  ],
  quiz: [
    {
      q: { vi: 'Sao có độ trưng gấp 4 lần Mặt Trời (cùng T_eff): HZ xa hơn khoảng', en: 'A star 4× as luminous as the Sun (same T_eff): the HZ is farther by about' },
      options: [{ vi: '×2', en: '×2' }, { vi: '×4', en: '×4' }, { vi: '×16', en: '×16' }],
      answer: 0,
      explain: { vi: 'r_HZ = √(L/S_eff), nên r_HZ ∝ √L khi S_eff không đổi.', en: 'r_HZ = √(L/S_eff), so r_HZ ∝ √L at fixed S_eff.' },
    },
    {
      q: { vi: 'Vì sao biên “nhà kính cực đại” tồn tại?', en: 'Why does the “maximum greenhouse” limit exist?' },
      options: [
        { vi: 'CO₂ không còn hấp thụ hồng ngoại', en: 'CO₂ stops absorbing infrared' },
        { vi: 'Tán xạ Rayleigh của CO₂ tăng nhanh hơn hiệu ứng sưởi ấm, nên không bù được thông lượng giảm', en: 'CO₂ Rayleigh scattering grows faster than its warming, so it cannot offset the lower flux' },
        { vi: 'Nước đóng băng hết', en: 'All water freezes' },
      ],
      answer: 1,
      explain: { vi: 'Hiệu ứng nhà kính và tán xạ Rayleigh của CO₂ cạnh tranh; vượt điểm cực đại, thêm CO₂ không làm hành tinh ấm thêm.', en: 'CO₂ greenhouse warming and Rayleigh scattering compete; past the maximum, extra CO₂ no longer warms the planet.' },
    },
    {
      q: { vi: 'Trái Đất có T_eq ≈ 255 K nhưng nhiệt độ bề mặt ≈ 288 K vì', en: 'Earth has T_eq ≈ 255 K but a surface temperature ≈ 288 K because' },
      options: [{ vi: 'Hiệu ứng nhà kính', en: 'The greenhouse effect' }, { vi: 'Nhiệt nội tại của lõi', en: 'Internal heat from the core' }, { vi: 'Công thức T_eq sai', en: 'The T_eq formula is wrong' }],
      answer: 0,
      explain: { vi: 'T_eq chỉ cân bằng bức xạ, không tính khí quyển giữ nhiệt.', en: 'T_eq is a pure radiative balance without an atmosphere trapping heat.' },
    },
    {
      q: { vi: 'Một hành tinh nằm trong HZ bảo thủ theo mô hình. Kết luận đúng là', en: 'A planet lies in the model’s conservative HZ. The correct conclusion is' },
      options: [
        { vi: 'Hành tinh có sự sống', en: 'The planet has life' },
        { vi: 'Thông lượng nhận được cho phép nước lỏng nếu hành tinh giống Trái Đất', en: 'Its flux would allow liquid water if the planet is Earth-like' },
        { vi: 'Hành tinh chắc chắn có đại dương', en: 'The planet certainly has oceans' },
      ],
      answer: 1,
      explain: { vi: 'HZ là điều kiện bức xạ cần, không đủ; còn phụ thuộc khí quyển, khối lượng, lịch sử và hoạt động sao.', en: 'The HZ is a necessary radiative condition, not a sufficient one; it also depends on atmosphere, mass, history and stellar activity.' },
    },
  ],
  instructor: {
    vi: 'Nhấn mạnh ngôn ngữ thận trọng: “nằm trong dải thông lượng của vùng sinh sống theo mô hình”, không nói “có thể sống được”. Tài liệu: Kopparapu et al. 2013 (arXiv:1301.6674), 2014 (doi:10.1088/2041-8205/787/2/L29); NASA Science - The Habitable Zone.',
    en: 'Insist on careful wording: “within the model HZ flux range”, not “habitable”. References: Kopparapu et al. 2013 (arXiv:1301.6674), 2014 (doi:10.1088/2041-8205/787/2/L29); NASA Science - The Habitable Zone.',
  },
};
