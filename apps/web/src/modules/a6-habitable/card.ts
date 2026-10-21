import type { ModelCard } from '../types';

/** Model Card · A6. Measured figures: `npm run validate:hz` → docs/validation/A6-habitable.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Biên vùng sinh sống, thông lượng và T_eq theo công thức công bố', en: 'Level A - HZ boundaries, flux and T_eq from published formulas' },
      body: {
        vi: 'Mô-đun đánh giá **điều kiện bức xạ – nhiệt** của một hành tinh so với vùng sinh sống quanh sao (HZ) theo các biên thông lượng hiệu dụng của Kopparapu et al. (2013, 2014). Đây **không phải** công cụ phát hiện sự sống: nằm trong HZ chỉ có nghĩa là thông lượng nhận được nằm trong dải mà mô hình khí hậu 1D cho phép nước lỏng tồn tại trên bề mặt một hành tinh giống Trái Đất.',
        en: 'The module assesses a planet’s **radiative–thermal conditions** against the circumstellar habitable zone (HZ) using the effective-flux boundaries of Kopparapu et al. (2013, 2014). It is **not** a life detector: being in the HZ only means the received flux lies in the range where a 1-D climate model allows surface liquid water on an Earth-like planet.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Sao tuỳ chỉnh: quan hệ khối lượng – độ trưng dãy chính (xấp xỉ ±20–50%)', en: 'Custom star: main-sequence mass–luminosity relation (±20–50%)' },
      body: {
        vi: 'Khi chọn “sao tuỳ chỉnh”, L và T_eff được ước lượng từ khối lượng bằng các luật luỹ thừa gần đúng; chỉ dùng để khám phá xu hướng.',
        en: 'For the “custom star”, L and T_eff are estimated from mass with approximate power laws; for exploring trends only.',
      },
    },
  ],
  fidelityNote: {
    vi: 'Mức A, C là phân loại nội bộ của USAC SimLab: Mức A nghĩa là công thức và hệ số tái lập đúng nguồn đã công bố, không có nghĩa là mô hình khí hậu đầy đủ.',
    en: 'Levels A, C are USAC SimLab’s internal scale: Level A means formulas and coefficients reproduce the published source, not that the climate model is complete.',
  },
  equations: [],
  methods: [
    {
      title: { vi: '1. Thông lượng tới hành tinh', en: '1. Incident flux' },
      tex: ['\\frac{S_p}{S_\\oplus}=\\frac{L/L_\\odot}{(r/\\text{au})^2}'],
      body: {
        vi: '$S_p$ là thông lượng sao tới hành tinh ở khoảng cách $r$, $S_\\oplus$ là thông lượng Trái Đất nhận được ở 1 au (≈ 1361 W m⁻², IAU 2015). Hành tinh được xếp vùng bằng **so sánh thông lượng** $S_p$ với $S_{{\\rm eff},j}$ - tương đương so sánh khoảng cách khi quỹ đạo tròn.',
        en: '$S_p$ is the stellar flux at distance $r$; $S_\\oplus$ the flux Earth receives at 1 au (≈ 1361 W m⁻², IAU 2015). The planet is classified by **comparing fluxes** $S_p$ with $S_{{\\rm eff},j}$ - equivalent to comparing distances for a circular orbit.',
      },
    },
    {
      title: { vi: '2. Thông lượng hiệu dụng tại mỗi biên', en: '2. Effective flux at each boundary' },
      tex: ['S_{{\\rm eff},j}=S_{{\\rm eff}\\odot,j}+a_jT\'+b_jT\'^2+c_jT\'^3+d_jT\'^4,\\qquad T\'=T_{\\rm eff}-5780\\,\\text{K}'],
      body: {
        vi: 'Mỗi biên $j$ có **một bộ hệ số riêng** $(S_{{\\rm eff}\\odot},a,b,c,d)$ (Kopparapu et al. 2014, hành tinh 1 M⊕). Hệ số đã được đối chiếu với chương trình tham chiếu `hzcalc.py` của chính tác giả. Với biên “nhà kính mất kiểm soát” có thêm bộ hệ số cho 0,1 M⊕ và 5 M⊕; ba biên còn lại chỉ công bố cho 1 M⊕.',
        en: 'Each boundary $j$ has **its own coefficient set** $(S_{{\\rm eff}\\odot},a,b,c,d)$ (Kopparapu et al. 2014, 1 M⊕ planet). The coefficients were checked against the authors’ reference code `hzcalc.py`. The runaway-greenhouse limit also has fits for 0.1 M⊕ and 5 M⊕; the other three are published for 1 M⊕ only.',
      },
    },
    {
      title: { vi: '3. Khoảng cách biên', en: '3. Boundary distance' },
      tex: ['r_{{\\rm HZ},j}=\\sqrt{\\frac{L/L_\\odot}{S_{{\\rm eff},j}}}\\;\\text{au}'],
      body: {
        vi: 'Ký hiệu $r_{\\rm HZ}$ dành cho khoảng cách biên, phân biệt với khoảng cách $r$ của hành tinh đang xét.\n\n- **Sao Kim gần đây** - biên trong **lạc quan**: dựa trên bằng chứng Sao Kim không còn nước bề mặt từ ~1 tỉ năm trước.\n- **Nhà kính mất kiểm soát** - biên trong **bảo thủ**: hơi nước tăng đến mức đại dương bốc hơi hoàn toàn.\n- **Nhà kính cực đại** - biên ngoài **bảo thủ**: thêm CO₂ thì hiệu ứng nhà kính tăng nhưng tán xạ Rayleigh của chính CO₂ cũng tăng; vượt qua điểm này, sự ấm lên không còn bù được thông lượng giảm. (Không phải “CO₂ hết sưởi ấm”.)\n- **Sao Hoả sơ khai** - biên ngoài **lạc quan**: dựa trên bằng chứng có nước lỏng trên Sao Hoả ~3,8 tỉ năm trước.',
        en: '$r_{\\rm HZ}$ denotes a boundary distance, distinct from the planet’s distance $r$.\n\n- **Recent Venus** - **optimistic** inner edge: based on evidence that Venus has lacked surface water for ~1 Gyr.\n- **Runaway greenhouse** - **conservative** inner edge: water vapour builds up until the oceans evaporate completely.\n- **Maximum greenhouse** - **conservative** outer edge: adding CO₂ increases the greenhouse effect but also CO₂’s own Rayleigh scattering; beyond this point warming can no longer offset the reduced flux. (Not “CO₂ stops warming”.)\n- **Early Mars** - **optimistic** outer edge: based on evidence of liquid water on Mars ~3.8 Gyr ago.',
      },
    },
    {
      title: { vi: '4. Nhiệt độ cân bằng bức xạ', en: '4. Radiative equilibrium temperature' },
      tex: ['T_{\\rm eq}=\\left[\\frac{L\\,(1-A_B)}{16\\pi\\sigma r^2}\\right]^{1/4}'],
      body: {
        vi: '$A_B$ là **suất phản chiếu Bond** (tỉ lệ năng lượng phản xạ trên mọi bước sóng và mọi hướng), $\\sigma$ là hằng số Stefan–Boltzmann; giả định nhiệt phân bố đều quanh hành tinh và độ phát xạ bằng 1. $T_{\\rm eq}$ **không phải nhiệt độ bề mặt**: không có hiệu ứng nhà kính. Trái Đất: $T_{\\rm eq}$ ≈ 255 K nhưng nhiệt độ bề mặt trung bình ≈ 288 K.',
        en: '$A_B$ is the **Bond albedo** (fraction of energy reflected over all wavelengths and directions), $\\sigma$ the Stefan–Boltzmann constant; full heat redistribution and unit emissivity assumed. $T_{\\rm eq}$ is **not a surface temperature**: there is no greenhouse effect. Earth: $T_{\\rm eq}$ ≈ 255 K but a mean surface temperature ≈ 288 K.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Hành tinh đá khối lượng tham chiếu 1 M⊕ (biên trong bảo thủ có thêm 0,1 và 5 M⊕).',
      'Mô hình khí hậu 1D bức xạ – đối lưu, không mây; khí quyển N₂–H₂O–CO₂ giống Trái Đất.',
      'Biên trong do H₂O chi phối, biên ngoài do CO₂ chi phối.',
      'Hệ số đa thức hợp lệ cho 2600 K ≤ T_eff ≤ 7200 K.',
      'T_eq dùng suất phản chiếu Bond, phân bố nhiệt đều; không tính khoá thuỷ triều.',
      'Không tính tiến hoá độ sáng sao theo thời gian; quỹ đạo tròn bán kính r.',
    ],
    en: [
      'Rocky planet of reference mass 1 M⊕ (the conservative inner edge also has 0.1 and 5 M⊕).',
      'Cloud-free 1-D radiative–convective climate model; Earth-like N₂–H₂O–CO₂ atmosphere.',
      'Inner edge controlled by H₂O, outer edge by CO₂.',
      'Polynomial coefficients valid for 2600 K ≤ T_eff ≤ 7200 K.',
      'T_eq uses the Bond albedo and full redistribution; no tidal locking.',
      'No stellar luminosity evolution; circular orbit of radius r.',
    ],
  },
  validity: {
    vi: [
      '2600 K ≤ T_eff ≤ 7200 K. Ngoài dải này mô hình không kẹp âm thầm: đa thức được tính tại biên gần nhất và kết quả được gắn nhãn rõ “chỉ minh hoạ”.',
      'Sao dãy chính FGKM; không áp dụng cho sao khổng lồ, sao lùn trắng hay hệ sao đôi chặt.',
    ],
    en: [
      '2600 K ≤ T_eff ≤ 7200 K. Outside this range the model does not clamp silently: the polynomial is evaluated at the nearest edge and the result is explicitly labelled “illustration only”.',
      'FGKM main-sequence stars; not for giants, white dwarfs or close binaries.',
    ],
  },
  scope: {
    vi: 'Kết quả cho biết vị trí của hành tinh so với **dải thông lượng** của HZ theo mô hình, không đánh giá khí quyển thực, nước, hoạt động sao, từ trường hay sự sống.',
    en: 'The result states where the planet lies relative to the model HZ **flux range**; it does not assess the real atmosphere, water, stellar activity, magnetic field or life.',
  },
  validationText: {
    vi: 'Tái lập bằng `npm run validate:hz` (→ `docs/validation/A6-habitable.json`):\n\n- Hệ Mặt Trời (T_eff = 5780 K, 1 M⊕): 0,7504 / 0,9504 / 1,6760 / 1,7678 au, so với giá trị công bố 0,75 / 0,95 / 1,68 / 1,77 au (sai khác ≤ 0,004 au, trong độ làm tròn).\n- T_eq Trái Đất: 254,6 K (A_B = 0,30) và 254,0 K (A_B = 0,306, NASA Earth Fact Sheet) so với ≈ 255 K.\n- Bốn biên giữ đúng thứ tự trên toàn dải 2600–7200 K; $S_p(r_{\\rm HZ}) = S_{\\rm eff}$ với sai số tương đối 2·10⁻¹⁶.\n\nPhạm vi kiểm chứng: tái lập công thức và hệ số đã công bố; **không** kiểm chứng bản thân mô hình khí hậu.',
    en: 'Reproduce with `npm run validate:hz` (→ `docs/validation/A6-habitable.json`):\n\n- Solar System (T_eff = 5780 K, 1 M⊕): 0.7504 / 0.9504 / 1.6760 / 1.7678 au vs published 0.75 / 0.95 / 1.68 / 1.77 au (≤ 0.004 au, within rounding).\n- Earth T_eq: 254.6 K (A_B = 0.30) and 254.0 K (A_B = 0.306, NASA Earth Fact Sheet) vs ≈ 255 K.\n- The four edges stay ordered across 2600–7200 K; $S_p(r_{\\rm HZ}) = S_{\\rm eff}$ to 2·10⁻¹⁶ relative.\n\nScope: reproduces the published formulas and coefficients; it does **not** validate the climate model itself.',
  },
  errors: {
    vi: ['Thông số hệ sao từ NASA Exoplanet Archive (pscomppars, truy vấn 2026-10-20); sai số L và a của từng hệ lan truyền vào vị trí biên (ví dụ Kepler-186 f: a = 0,432 ± 0,171 au).'],
    en: ['Star-system values from the NASA Exoplanet Archive (pscomppars, queried 2026-10-20); L and a uncertainties propagate into boundary positions (e.g. Kepler-186 f: a = 0.432 ± 0.171 au).'],
  },
  validation: { vi: [], en: [] },
  limitations: {
    vi: [
      'Không có mây, không có khí quyển khác Trái Đất (H₂, khí quyển mỏng…), không tính nhiệt triều hay nhiệt nội tại.',
      'Không tính độ lệch tâm quỹ đạo (thông lượng trung bình quỹ đạo khác $L/a^2$ một hệ số $(1-e^2)^{-1/2}$).',
      'Không tính hoạt động sao, mất khí quyển, khoá thuỷ triều quanh sao lùn đỏ.',
      'Vùng sinh sống thiên hà là chủ đề khác, không được mô phỏng ở đây.',
    ],
    en: [
      'No clouds, no non-Earth-like atmospheres (H₂, thin atmospheres…), no tidal or internal heating.',
      'No orbital eccentricity (the orbit-averaged flux differs from $L/a^2$ by $(1-e^2)^{-1/2}$).',
      'No stellar activity, atmospheric escape or tidal locking around red dwarfs.',
      'The galactic habitable zone is a separate topic, not simulated here.',
    ],
  },
  references: [
    'Kopparapu, R. K. et al. (2013). Habitable zones around main-sequence stars: new estimates. ApJ 765, 131. arXiv:1301.6674.',
    'Kopparapu, R. K. et al. (2014). Habitable zones around main-sequence stars: dependence on planetary mass. ApJL 787, L29. doi:10.1088/2041-8205/787/2/L29.',
    'Kopparapu, R. K. - hzcalc.py (reference implementation of the 2014 coefficients), personal.ems.psu.edu/~jfk4.',
    'Kasting, J. F., Whitmire, D. P. & Reynolds, R. T. (1993). Icarus 101, 108.',
    'NASA Exoplanet Archive - Planetary Systems Composite Parameters (pscomppars).',
    'NASA Science - The Habitable Zone.',
    'IAU 2015 Resolution B3 (nominal solar values).',
  ],
};
