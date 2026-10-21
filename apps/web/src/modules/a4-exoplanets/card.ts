import type { ModelCard } from '../types';

/**
 * Model Card · A4 - Săn ngoại hành tinh.
 * Measured figures: `npm run validate:exo` → docs/validation/A4-exoplanets.json (2026-10-19).
 */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Lớp 1 - Mô hình vật lý định lượng', en: 'Layer 1 - Quantitative physical model' },
      body: {
        vi: '**Mức A - Mô hình vật lý định lượng.** Mô phỏng sử dụng các quan hệ động lực học quỹ đạo Kepler, công thức biên độ vận tốc xuyên tâm và mô hình đường cong quá cảnh có xét hiện tượng tối sáng ở rìa sao. Hệ thống cho phép khảo sát mối liên hệ giữa các tham số vật lý của hệ sao – hành tinh và tín hiệu quan sát tương ứng. Lớp này gồm K, đường cong RV, vị trí hành tinh trên bầu trời, thời điểm tiếp xúc, T₁₄, tham số va chạm và độ sâu quá cảnh.',
        en: '**Level A - Quantitative physical model.** The simulator uses Keplerian orbital dynamics, the radial-velocity semi-amplitude formula and a limb-darkened transit light-curve model, so the link between the system’s physical parameters and the observed signals can be explored. This layer comprises K, the RV curve, the planet’s sky position, contact times, T₁₄, the impact parameter and the transit depth.',
      },
    },
    {
      fidelity: 'B',
      label: { vi: 'Lớp 2 - Dữ liệu đo tổng hợp', en: 'Layer 2 - Synthetic measurements' },
      body: {
        vi: 'Các điểm đo RV và trắc quang là **dữ liệu tổng hợp**: mô hình cộng nhiễu Gauss trắng có seed cố định (độ lệch chuẩn σ do người dùng chọn), không phải dữ liệu quan sát thật.',
        en: 'The RV and photometric points are **synthetic**: the model plus seeded white Gaussian noise (σ chosen by the user), not real observations.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Lớp 3 - Hình minh hoạ', en: 'Layer 3 - Illustrations' },
      body: {
        vi: 'Hình nhìn từ trên phóng đại biên độ "lắc" của sao và kích thước các vật. Hình nhìn từ Trái Đất giữ đúng tỉ lệ R_p/R★ và vị trí (X, Y) trên bầu trời. Màu sao suy ra từ nhiệt độ hiệu dụng; dịch màu theo Doppler được phóng đại để dễ thấy.',
        en: 'The top view exaggerates the stellar wobble and body sizes. The view from Earth keeps the true R_p/R★ and sky position (X, Y). The star colour follows its effective temperature; the Doppler colour shift is exaggerated for visibility.',
      },
    },
  ],
  fidelityNote: {
    vi: 'Mức A, B, C là phân loại nội bộ của USAC SimLab, không phải chứng nhận độ chính xác theo một tiêu chuẩn quốc tế.',
    en: 'Levels A, B, C are USAC SimLab’s internal classification, not a certification of accuracy against an international standard.',
  },
  equations: [],
  methods: [
    {
      title: { vi: '1. Vận tốc xuyên tâm của sao chủ', en: '1. Radial velocity of the host star' },
      tex: [
        'K=\\left(\\frac{2\\pi G}{P}\\right)^{1/3}\\frac{M_p\\sin i}{(M_*+M_p)^{2/3}}\\frac{1}{\\sqrt{1-e^2}}',
        'v_r(t)=\\gamma+K\\left[\\cos(\\nu(t)+\\omega)+e\\cos\\omega\\right]',
        'M(t)=\\frac{2\\pi}{P}(t-T_p),\\qquad M=E-e\\sin E,\\qquad \\tan\\frac{\\nu}{2}=\\sqrt{\\frac{1+e}{1-e}}\\tan\\frac{E}{2}',
      ],
      body: {
        vi: 'Trong đó G là hằng số hấp dẫn; P là chu kỳ quỹ đạo; M★ và M_p lần lượt là khối lượng sao chủ và hành tinh; i là góc nghiêng quỹ đạo; e là độ lệch tâm; γ là vận tốc hệ thống (đặt bằng 0 - mô hình vận tốc tương đối); ν(t) là dị thường thực. **ω là góc cận điểm của quỹ đạo hành tinh** theo quy ước Winn (2010), dùng chung cho RV và hình học quá cảnh; với quy ước này v_r đi từ dương sang âm khi hành tinh qua trước đĩa sao.\n\nM, E và ν lần lượt là dị thường trung bình, dị thường lệch tâm và dị thường thực; T_p là thời điểm qua cận điểm. **Đại lượng tiến triển tuyến tính theo thời gian là dị thường trung bình M**, không phải dị thường thực ν: thanh thời gian và trục "pha" của đồ thị đều là (t − t_tr)/P, với t_tr là thời điểm giữa quá cảnh (giao hội trong, ν = 90° − ω).',
        en: 'G is the gravitational constant; P the period; M★ and M_p the stellar and planetary masses; i the inclination; e the eccentricity; γ the systemic velocity (set to 0 - relative velocities); ν(t) the true anomaly. **ω is the argument of periastron of the planet’s orbit** (Winn 2010 convention), shared by the RV and the transit geometry; with this convention v_r goes from positive to negative as the planet crosses the disk.\n\nM, E and ν are the mean, eccentric and true anomalies; T_p is the time of periastron. **The quantity that advances linearly in time is the mean anomaly M**, not the true anomaly ν: the time bar and the “phase” axis are (t − t_tr)/P, where t_tr is mid-transit (inferior conjunction, ν = 90° − ω).',
      },
    },
    {
      title: { vi: '2. Đường cong ánh sáng khi hành tinh quá cảnh', en: '2. Transit light curve' },
      tex: [
        '\\frac{I(\\mu)}{I(1)}=1-u_1(1-\\mu)-u_2(1-\\mu)^2',
        'F(t)=1-\\frac{\\displaystyle\\int_{\\mathcal O(t)}I(\\mu)\\,dA}{\\displaystyle\\int_{\\mathcal S}I(\\mu)\\,dA}',
        '\\delta_{\\mathrm{uniform}}\\simeq\\left(\\frac{R_p}{R_*}\\right)^2',
        'X=-r\\cos(\\omega+\\nu),\\quad Y=-r\\sin(\\omega+\\nu)\\cos i,\\quad Z=r\\sin(\\omega+\\nu)\\sin i,\\quad r=\\frac{a(1-e^2)}{1+e\\cos\\nu}',
      ],
      body: {
        vi: 'Trong đó μ = cos θ, với θ là góc giữa pháp tuyến bề mặt sao và hướng quan sát; u₁, u₂ là các hệ số tối sáng phụ thuộc vào đặc tính sao và dải bước sóng quan sát. 𝒮 là toàn bộ đĩa sao chiếu lên mặt phẳng quan sát, còn 𝒪(t) là phần đĩa sao bị hành tinh che khuất tại thời điểm t. Tích phân được tính theo N = 400 vành đồng tâm (độ dài cung chính xác của mỗi vành nằm trong đĩa hành tinh).\n\nKhoảng cách tâm d(t) = √(X² + Y²) lấy từ vị trí Kepler thật của hành tinh (Z > 0: hành tinh ở phía trước sao), nên **đường cong quá cảnh xét đầy đủ quỹ đạo lệch tâm**.\n\nVới đĩa sao đồng đều, độ sâu xấp xỉ bằng (R_p/R★)². Khi có tối sáng ở rìa, độ sâu được đọc từ đường cong đã tích phân và **khác** xấp xỉ hình học: giao diện hiển thị riêng hai giá trị.',
        en: 'μ = cos θ, θ being the angle between the stellar surface normal and the line of sight; u₁, u₂ are limb-darkening coefficients depending on the star and the band. 𝒮 is the projected stellar disk, 𝒪(t) the part occulted at time t. The integral uses N = 400 concentric rings (exact arc length of each ring inside the planet disk).\n\nThe centre separation d(t) = √(X² + Y²) comes from the planet’s true Keplerian position (Z > 0: planet in front), so **the transit fully accounts for eccentric orbits**.\n\nFor a uniform disk the depth is ≈ (R_p/R★)². With limb darkening the depth is read from the integrated curve and **differs** from the geometric estimate: the interface shows both values.',
      },
    },
    {
      title: { vi: '3. Thời lượng quá cảnh và tham số va chạm', en: '3. Transit duration and impact parameter' },
      tex: [
        'b=\\frac{a\\cos i}{R_*}\\,\\frac{1-e^2}{1+e\\sin\\omega}',
        'T_{14}^{\\rm tròn}=\\frac{P}{\\pi}\\arcsin\\left[\\frac{\\sqrt{(1+k)^2-b^2}}{(a/R_*)\\sin i}\\right]',
      ],
      body: {
        vi: 'k = R_p/R★ là tỷ số bán kính; b là tham số va chạm tại giao hội; a/R★ là bán trục lớn chuẩn hóa (tính từ định luật Kepler III với M★ + M_p). **T₁₄ hiển thị được tính bằng số**: tìm các thời điểm tiếp xúc t₁…t₄ nơi d(t) = 1 ± k trên quỹ đạo Kepler (chia đôi tới 10⁻¹² P), nên đúng cho mọi e. Công thức tròn ở trên (Seager & Mallén-Ornelas 2003) và xấp xỉ lệch tâm của Winn (2010) chỉ dùng để đối chiếu.',
        en: 'k = R_p/R★; b is the impact parameter at conjunction; a/R★ the scaled semi-major axis (Kepler’s third law with M★ + M_p). **The displayed T₁₄ is computed numerically**: contact times t₁…t₄ where d(t) = 1 ± k on the Keplerian orbit (bisection to 10⁻¹² P), valid for any e. The circular formula above (Seager & Mallén-Ornelas 2003) and Winn’s (2010) eccentric approximation are used only as cross-checks.',
      },
    },
    {
      title: { vi: '4. Các đại lượng vật lý suy ra và chỉ số SNR', en: '4. Derived quantities and SNR' },
      tex: [
        '\\rho_p=\\frac{3M_p}{4\\pi R_p^3}',
        '\\mathrm{SNR}_{\\mathrm{RV}}\\simeq \\frac{K}{\\sigma_{\\mathrm{RV}}}\\sqrt{\\frac{N}{2}},\\qquad \\mathrm{SNR}_{\\mathrm{tr}}\\simeq \\frac{\\delta}{\\sigma_{\\mathrm{phot}}}\\sqrt{N_{\\mathrm{in}}},\\quad N_{\\rm in}=\\frac{T_{14}}{\\Delta t}',
      ],
      body: {
        vi: 'Độ sâu quá cảnh, thời lượng quá cảnh và biên độ vận tốc xuyên tâm là các đại lượng dẫn xuất từ mô hình; chúng không phải những thông số độc lập với các tham số đầu vào.\n\nσ_RV là độ lệch chuẩn nhiễu vận tốc; N là số phép đo RV (mặc định 40, giả định phân bố đều theo pha); σ_phot là độ lệch chuẩn nhiễu trắc quang; δ là độ sâu đọc từ đường cong; N_in là số phép đo độc lập trong **một** lần quá cảnh với chu kỳ lấy mẫu Δt (mặc định 2 phút). Giao diện hiển thị các giá trị N, σ, Δt đang dùng cạnh mỗi SNR. Đây là các ước lượng đơn giản trong xấp xỉ nhiễu trắng, không thay thế phân tích độ bất định của phép khớp mô hình khi có nhiễu tương quan hoặc sai số hệ thống.',
        en: 'Depth, duration and RV semi-amplitude are derived from the model, not independent of the inputs.\n\nσ_RV is the RV noise; N the number of RV epochs (default 40, assumed uniform in phase); σ_phot the photometric noise; δ the depth read from the curve; N_in the number of independent points inside **one** transit for cadence Δt (default 2 min). The interface shows the N, σ, Δt used next to each SNR. These are simple white-noise estimates, not a substitute for a full fit uncertainty analysis with correlated noise or systematics.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Chuyển động quỹ đạo được mô tả bằng mô hình Kepler cho hệ sao – hành tinh (hai vật).',
      'Cả đường cong RV và đường cong quá cảnh đều dùng cùng quỹ đạo lệch tâm (e, ω); T₁₄ tính bằng số từ quỹ đạo này.',
      'Sao chủ được mô hình hóa bằng đĩa có phân bố cường độ sáng theo định luật tối sáng bậc hai.',
      'Hành tinh là vật thể chắn sáng hoàn toàn; không xét sự truyền sáng qua khí quyển, ánh sáng phản xạ hoặc phát xạ từ hành tinh (không có che khuất thứ cấp).',
      'Chưa mô phỏng hoạt động sao, đốm sao, biến thiên nội tại của sao, hiệu ứng thủy triều, hiệu ứng Rossiter–McLaughlin hoặc ảnh hưởng của các hành tinh khác.',
      'Quy ước đơn vị như NASA Exoplanet Archive: R♃ = 71 492 km, R⊕ = 6 378,1 km (bán kính xích đạo danh định IAU 2015).',
    ],
    en: [
      'Keplerian two-body orbit for the star–planet system.',
      'The RV curve and the transit use the same eccentric orbit (e, ω); T₁₄ is computed numerically from it.',
      'Star modelled as a disk with a quadratic limb-darkening law.',
      'Fully opaque planet; no atmospheric transmission, reflected light or planetary emission (no secondary eclipse).',
      'No stellar activity, spots, intrinsic variability, tides, Rossiter–McLaughlin effect or additional planets.',
      'Units as in the NASA Exoplanet Archive: R♃ = 71,492 km, R⊕ = 6,378.1 km (IAU 2015 nominal equatorial radii).',
    ],
  },
  validity: {
    vi: ['Độ lệch tâm 0 ≤ e ≤ 0,9 (RV và hình học quá cảnh).', 'Tỷ số bán kính 0 < R_p/R★ < 1.', 'Điều kiện có quá cảnh: b < 1 + R_p/R★.'],
    en: ['Eccentricity 0 ≤ e ≤ 0.9 (RV and transit geometry).', 'Radius ratio 0 < R_p/R★ < 1.', 'Transit occurs when b < 1 + R_p/R★.'],
  },
  scope: {
    vi: 'Miền áp dụng nêu trên là phạm vi thiết kế của mô hình, không đồng nghĩa với việc mọi cấu hình đều có cùng độ chính xác số học. Các kiểm định dưới đây nêu rõ miền tham số đã đối chiếu.',
    en: 'The ranges above are the design scope; they do not mean every configuration has the same numerical accuracy. The validation below states the parameter ranges actually checked.',
  },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:exo\` → \`docs/validation/A4-exoplanets.json\`; dữ liệu nghiệm công bố: \`node reference/fetch_exoplanet_archive.mjs\`. Ngưỡng được khoá trong bộ test.

- **Đường cong quá cảnh, đĩa đều:** tích phân 400 vành so với diện tích chồng lấp giải tích chính xác của hai đường tròn. Kiểm trên 205 trường hợp với k ∈ {0,01; 0,05; 0,1; 0,15; 0,3} và 41 vị trí d từ tâm tới tiếp xúc. Sai lệch tuyệt đối thông lượng lớn nhất **4,8×10⁻⁶**.
- **Đường cong quá cảnh, có tối rìa:** so với một phép tích phân **độc lập**, cầu phương 2D trong toạ độ cực trên đĩa hành tinh (500 × 1 000 điểm). Kiểm trên 165 trường hợp, (u₁, u₂) ∈ {(0,4; 0,26), (0,6; 0,1), (0,2; 0,4)}. Sai lệch tuyệt đối lớn nhất **5,2×10⁻⁶**. Tính tương đối theo độ sâu thì sai lệch lên tới 4% nhưng chỉ ở sát tiếp xúc, nơi phần bị che rất nhỏ. Nghiệm giải tích Mandel & Agol (2002) cho tối rìa bậc hai chưa được dùng làm chuẩn.
- **Hình học lệch tâm:** khi e = 0, T₁₄ tính số khớp công thức tròn chính xác tới 1,2×10⁻¹⁰. Với e = 0,1–0,5 và ω = 0–270°, T₁₄ tính số lệch xấp xỉ Winn (2010) tối đa 0,08%. Đường cong RV tương quan 1,000000000000 với dZ/dt, xác nhận quy ước dấu.
- **Cấu hình mẫu so với giá trị công bố trong chính nghiệm được trích dẫn:**
  - HD 209458 b (Torres 2008): K +0,04%, a/R★ +0,03%, b −0,8%.
  - HD 189733 b (Addison 2019): K −0,01%, a/R★ +0,05%, b +0,06%, T₁₄ +0,08%.
  - TRAPPIST-1 e (Agol 2021): a/R★ −0,13%, b −0,15%, T₁₄ +0,12%.
  - 51 Peg b (Cont 2026): K +0,3%.
  - Sao Mộc, Trái Đất: K −0,2% và −0,6% so với 12,5 và 0,09 m/s (kiểm tra bậc độ lớn).`,
    en: `Reproducible report: \`npm run validate:exo\` → \`docs/validation/A4-exoplanets.json\`; published solutions: \`node reference/fetch_exoplanet_archive.mjs\`. Thresholds are locked in the test suite.

- **Transit curve, uniform disk:** 400-ring integration vs the exact analytic overlap area of two circles. Checked on 205 cases with k ∈ {0.01, 0.05, 0.1, 0.15, 0.3} and 41 separations from centre to contact. Maximum absolute flux error **4.8×10⁻⁶**.
- **Transit curve, limb-darkened:** vs an **independent** 2-D polar quadrature over the planet disk (500 × 1,000 points). Checked on 165 cases, (u₁, u₂) ∈ {(0.4, 0.26), (0.6, 0.1), (0.2, 0.4)}. Maximum absolute error **5.2×10⁻⁶**. Relative to the depth, errors reach 4% but only right at contact, where the occulted part is tiny. The Mandel & Agol (2002) analytic solution for quadratic limb darkening has not yet been used as a reference.
- **Eccentric geometry:** for e = 0 the numerical T₁₄ matches the circular formula to 1.2×10⁻¹⁰. For e = 0.1–0.5 and ω = 0–270° it differs from Winn’s (2010) approximation by at most 0.08%. The RV curve correlates at 1.000000000000 with dZ/dt, confirming the sign convention.
- **Presets vs the values published in the cited solution:**
  - HD 209458 b (Torres 2008): K +0.04%, a/R★ +0.03%, b −0.8%.
  - HD 189733 b (Addison 2019): K −0.01%, a/R★ +0.05%, b +0.06%, T₁₄ +0.08%.
  - TRAPPIST-1 e (Agol 2021): a/R★ −0.13%, b −0.15%, T₁₄ +0.12%.
  - 51 Peg b (Cont 2026): K +0.3%.
  - Jupiter, Earth: K −0.2% and −0.6% vs 12.5 and 0.09 m/s (order-of-magnitude checks).`,
  },
  validation: {
    vi: [
      'Mỗi cấu hình mẫu dùng **một** nghiệm tham số duy nhất (ghi rõ tài liệu gốc ngay dưới ô chọn); các tham số không có trong nghiệm được ghi là giả định.',
      'Độ sâu "công bố" trong mỗi bài có định nghĩa riêng (có hoặc không tối rìa, dải phổ khác nhau), nên chỉ được hiển thị để tham khảo, không dùng làm ngưỡng kiểm định.',
    ],
    en: [
      'Each preset uses **one** parameter solution (cited under the selector); inputs missing from that solution are labelled as assumptions.',
      'Published “depths” have paper-specific definitions (with/without limb darkening, different bands), so they are shown for reference only, not used as validation thresholds.',
    ],
  },
  errors: { vi: [], en: [] },
  limitations: {
    vi: [
      'Mô hình RV không bao gồm nhiễu do hoạt động sao, nhiều hành tinh và các sai lệch thiết bị.',
      'Mô hình quá cảnh chưa xét truyền sáng khí quyển, đốm sao, biến thiên nội tại của sao, che khuất thứ cấp và hiệu ứng quang học bậc cao.',
      'Hệ số tối rìa u₁, u₂ do người dùng chọn, không tự suy ra từ T_eff, log g và dải phổ.',
      'Giá trị SNR phụ thuộc vào cấu hình thiết bị, số phép đo, chu kỳ lấy mẫu và giả định về nhiễu.',
      'Kết quả mô phỏng và các con số hiển thị không thay thế dữ liệu quan sát hoặc quá trình khớp mô hình với dữ liệu thực.',
    ],
    en: [
      'The RV model omits stellar-activity noise, multiple planets and instrumental systematics.',
      'The transit model omits atmospheric transmission, spots, intrinsic variability, secondary eclipse and higher-order optical effects.',
      'Limb-darkening coefficients u₁, u₂ are user-set, not derived from T_eff, log g and band.',
      'SNR values depend on instrument, number of epochs, cadence and noise assumptions.',
      'Simulated results do not replace observations or fitting models to real data.',
    ],
  },
  references: [
    'Lovis, C. & Fischer, D. (2010). Radial Velocity Techniques for Exoplanets. In Exoplanets, ed. S. Seager.',
    'Mandel, K. & Agol, E. (2002). Analytic Light Curves for Planetary Transit Searches. ApJ 580, L171–L175. doi:10.1086/345520',
    'Seager, S. & Mallén-Ornelas, G. (2003). A Unique Solution of Planet and Star Parameters from an Extrasolar Planet Transit Light Curve. ApJ 585, 1038.',
    'Winn, J. N. (2010). Transits and Occultations. In Exoplanets, ed. S. Seager. arXiv:1001.2010',
    'Torres, G., Winn, J. N. & Holman, M. J. (2008). ApJ 677, 1324 - HD 209458 b, HD 189733 b solutions.',
    'Addison, B. et al. (2019). PASP 131, 115003 - HD 189733 b.',
    'Agol, E. et al. (2021). PSJ 2, 1 - TRAPPIST-1.',
    'Cont, D. et al. (2026). A&A 710, A345 - 51 Peg b (Archive default solution).',
    'NASA Exoplanet Archive - HD 209458 overview: https://exoplanetarchive.ipac.caltech.edu/overview/HD_209458',
    'NASA Exoplanet Archive - How Predicted Observables for Exoplanets are Calculated: https://exoplanetarchive.ipac.caltech.edu/docs/poet_calculations.html',
  ],
};
