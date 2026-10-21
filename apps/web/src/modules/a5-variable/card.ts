import type { ModelCard } from '../types';

/** Model Card · A5. Measured figures: `npm run validate:var` → docs/validation/A5-variable.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Mô phỏng định lượng phục vụ giáo dục', en: 'Level B - Quantitative educational simulation' },
      body: {
        vi: 'Hệ thống kết hợp phân tích chuỗi trắc quang, tìm chu kỳ biến quang và quan hệ chu kỳ – độ sáng của sao Cepheid cổ điển để minh họa quy trình suy ra khoảng cách thiên thể. Chu đồ GLS, gấp pha, ⟨V⟩ trung bình cường độ và chuỗi Leavitt → môđun khoảng cách được tính định lượng (float64).',
        en: 'The system combines photometric time-series analysis, period search and the classical-Cepheid period–luminosity relation to illustrate how stellar distances are inferred. The GLS periodogram, folding, intensity-mean ⟨V⟩ and the Leavitt → distance-modulus chain are computed quantitatively (float64).',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Dữ liệu: tham số tham chiếu từ danh mục, chuỗi thời gian tổng hợp', en: 'Data: catalogue reference parameters, synthetic time series' },
      body: {
        vi: 'Các tham số tham chiếu (chu kỳ, khoảng cấp sao V, ⟨V⟩ khi có) được lấy từ danh mục sao biến quang. **Chuỗi thời gian, sai số đo và hình dạng đường cong được mô phỏng** theo cấu hình đã chọn: dạng đường cong là mẫu Fourier/Gauss minh hoạ, được kéo theo biên độ danh mục và dịch để ⟨V⟩ khớp giá trị danh mục. Ảnh CCD là minh hoạ. Mô hình hiện tại không được xem là một quy trình phân tích trực tiếp dữ liệu quan trắc chuyên nghiệp nếu chưa có bước nhập, xử lý và kiểm định dữ liệu thực.',
        en: 'Reference parameters (period, V range, ⟨V⟩ when known) come from variable-star catalogues. **The time series, measurement errors and curve shape are simulated**: the shape is an illustrative Fourier/Gaussian template stretched to the catalogue amplitude and shifted so ⟨V⟩ matches the catalogue. The CCD frame is an illustration. The model is not a professional pipeline for real data until import, reduction and validation of real observations are added.',
      },
    },
  ],
  fidelityNote: {
    vi: 'Mức B, C là phân loại nội bộ của USAC SimLab, không phải chứng nhận độ chính xác theo một chuẩn quốc tế.',
    en: 'Levels B, C are USAC SimLab’s internal classification, not a certification against an international standard.',
  },
  equations: [],
  methods: [
    {
      title: { vi: '1. Cấp sao và thông lượng', en: '1. Magnitude and flux' },
      tex: ['m_V=-2{,}5\\log_{10}\\left(\\frac{F_V}{F_{V,0}}\\right)'],
      body: {
        vi: 'Trong đó $F_V$ là thông lượng trong dải V và $F_{V,0}$ là thông lượng chuẩn của hệ cấp sao. Cấp sao giảm khi thông lượng tăng.\n\nĐường cong ánh sáng được hình thành từ các phép đo cấp sao theo thời gian. Giao diện phân biệt **cấp sao tức thời** (ảnh CCD), **cấp sao trung bình** ⟨V⟩ và **giá trị tham chiếu** của danh mục.',
        en: '$F_V$ is the V-band flux and $F_{V,0}$ the reference flux of the system. Magnitude decreases as flux increases.\n\nThe light curve is built from magnitude measurements over time. The interface distinguishes the **instantaneous magnitude** (CCD frame), the **mean magnitude** ⟨V⟩ and the catalogue **reference value**.',
      },
    },
    {
      title: { vi: '2. Chu kỳ đồ Lomb–Scargle tổng quát (GLS)', en: '2. Generalised Lomb–Scargle periodogram (GLS)' },
      tex: [
        'm(t_i)=c+\\sum_{k=1}^{K}\\left[a_k\\cos(2\\pi k f t_i)+b_k\\sin(2\\pi k f t_i)\\right]',
        '\\chi_f^2=\\min_{c,a_k,b_k}\\sum_i\\frac{[m_i-m(t_i)]^2}{\\sigma_i^2}',
        '\\mathcal P_{\\mathrm{GLS}}(f)=\\frac{\\chi_0^2-\\chi_f^2}{\\chi_0^2},\\qquad P=\\frac{1}{f_{\\mathrm{peak}}}',
      ],
      body: {
        vi: 'Tại mỗi tần số thử f, các hệ số được xác định bằng cách tối thiểu hóa tổng bình phương phần dư có trọng số. Mô hình tham chiếu chỉ gồm thành phần hằng số, có tổng bình phương phần dư $\\chi_0^2$. $m_i$ và $\\sigma_i$ lần lượt là cấp sao đo được và độ không đảm bảo của phép đo thứ i. Với K = 1 đây là GLS một thành phần điều hòa (Zechmeister & Kürster 2009); giao diện cho phép K = 1–4 để tái tạo tốt hơn đường cong không hình sin.\n\nLưới tần số: từ 1/25 đến 2,5 ngày⁻¹, bước $1/(8T)$ với T là thời gian theo dõi (lấy mẫu dày gấp 8 lần độ phân giải).\n\n**Công suất chuẩn hóa không tự nó là xác suất chu kỳ đúng.** Giao diện liệt kê các đỉnh ứng viên, đánh dấu các đỉnh nằm tại $f \\pm 1$, $f \\pm 2$ ngày⁻¹ (alias do chỉ quan sát ban đêm), $2f$ hoặc $f/2$, và (theo yêu cầu) tính xác suất báo động giả (FAP) bằng bootstrap: lấy mẫu lại cấp sao có hoàn lại tại các thời điểm cũ 100 lần, FAP = tỷ lệ lần đỉnh lớn nhất của dữ liệu xáo trộn ≥ đỉnh quan sát (VanderPlas 2018, §7.4).',
        en: 'At each trial frequency f the coefficients minimise the weighted residual sum of squares. The constant-only reference model has residual $\\chi_0^2$. $m_i$ and $\\sigma_i$ are the measured magnitude and its uncertainty. K = 1 is the single-harmonic GLS (Zechmeister & Kürster 2009); the interface allows K = 1–4 to fit non-sinusoidal curves better.\n\nFrequency grid: 1/25 to 2.5 d⁻¹ in steps of $1/(8T)$, T being the baseline (8× oversampling of the resolution).\n\n**Normalised power is not the probability that the period is right.** The interface lists candidate peaks, flags those at $f \\pm 1$, $f \\pm 2$ d⁻¹ (aliases of night-only sampling), $2f$ or $f/2$, and on request computes a bootstrap false-alarm probability: magnitudes resampled with replacement at the original times 100 times, FAP = fraction of shuffled maxima ≥ the observed peak (VanderPlas 2018, §7.4).',
      },
    },
    {
      title: { vi: '3. Gấp pha', en: '3. Phase folding' },
      tex: ['\\phi_i=\\operatorname{frac}\\left(\\frac{t_i-t_0}{P}\\right)'],
      body: {
        vi: 'Trong đó $t_0$ là mốc pha quy ước (ở đây $t_0 = 0$) và P là chu kỳ đang thử. Gấp pha cho phép so sánh những phép đo thuộc các chu kỳ khác nhau trên cùng một trục pha. Giao diện phân biệt ba chu kỳ: $P_{\\rm thử}$ (người học chọn, dùng để gấp pha), $P_{\\rm GLS}$ (đỉnh chu đồ) và $P_{\\rm ref}$ (tham chiếu của cấu hình mẫu). Đường cong gấp pha là công cụ kiểm chứng trực quan, không phải bằng chứng độc lập đủ để khẳng định tính duy nhất của nghiệm.',
        en: '$t_0$ is the phase origin (here $t_0 = 0$) and P the trial period. Folding compares measurements from different cycles on one phase axis. The interface separates three periods: $P_{\\rm trial}$ (chosen by the learner, used for folding), $P_{\\rm GLS}$ (periodogram peak) and $P_{\\rm ref}$ (the preset’s reference). The folded curve is a visual check, not independent proof that the solution is unique.',
      },
    },
    {
      title: { vi: '4. Quan hệ chu kỳ – độ sáng Leavitt', en: '4. Leavitt period–luminosity relation' },
      tex: ['M_V=-2{,}43\\,(\\pm0{,}12)\\left[\\log_{10}\\left(\\frac{P}{1\\,\\mathrm{ngày}}\\right)-1\\right]-4{,}05\\,(\\pm0{,}02)'],
      body: {
        vi: 'Đối với sao Cepheid cổ điển phù hợp với phạm vi hiệu chuẩn (Benedict và cộng sự 2007). $M_V$ là cấp sao tuyệt đối trong dải V và P là chu kỳ tính bằng ngày. Các hệ số thuộc một phép hiệu chuẩn cụ thể, không phải hằng số phổ quát áp dụng cho mọi lớp sao Cepheid. Sai số $\\sigma_M$ hiển thị chỉ lan truyền bất định của hai hệ số (giả định không tương quan); **độ phân tán nội tại của quan hệ chưa được cộng vào** (TODO: cần xác minh giá trị rms công bố). Giao diện chỉ bật phần khoảng cách cho Cepheid cổ điển; với RR Lyrae và Algol, phần này bị khoá kèm giải thích.',
        en: 'For classical Cepheids within the calibration (Benedict et al. 2007). $M_V$ is the V-band absolute magnitude, P the period in days. The coefficients belong to one calibration, not universal constants for every Cepheid class. The displayed $\\sigma_M$ propagates only the two coefficient uncertainties (assumed uncorrelated); **the intrinsic scatter of the relation is not yet added** (TODO: cần xác minh the published rms). The distance section is enabled only for classical Cepheids; for RR Lyrae and Algol it is locked with an explanation.',
      },
    },
    {
      title: { vi: '5. Môđun khoảng cách có hiệu chỉnh hấp thụ', en: '5. Extinction-corrected distance modulus' },
      tex: ['\\mu_0=m_V-A_V-M_V', 'd=10^{(\\mu_0+5)/5}\\ \\mathrm{pc},\\qquad \\frac{\\sigma_d}{d}=\\frac{\\ln 10}{5}\\sqrt{\\sigma_{M}^2+\\sigma_{A}^2}', '\\langle V\\rangle=-2{,}5\\log_{10}\\left\\langle 10^{-0{,}4\\,m(\\phi)}\\right\\rangle_\\phi'],
      body: {
        vi: 'Trong đó $m_V$ là cấp sao biểu kiến; $A_V$ là độ hấp thụ liên sao trong dải V; $M_V$ là cấp sao tuyệt đối; d là khoảng cách tính bằng parsec. **$m_V$ đưa vào là cấp sao trung bình theo cường độ ⟨V⟩**: mặc định tính từ mô hình GLS (K ≥ 3 thành phần) khớp với dữ liệu tại chu kỳ đã chọn; có thể chọn ⟨V⟩ danh mục để so sánh. Không dùng cấp sao tức thời trong một pha thay cho cấp sao trung bình. Khi $A_V = 0$, giao diện cảnh báo rằng đang dùng giả định không có hấp thụ liên sao, và luôn hiển thị song song khoảng cách khi không hiệu chỉnh để người học thấy tác động của $A_V$.',
        en: '$m_V$ is the apparent magnitude, $A_V$ the V-band extinction, $M_V$ the absolute magnitude, d in parsecs. **The $m_V$ used is the intensity-mean ⟨V⟩**: by default from the GLS model (K ≥ 3 harmonics) fitted to the data at the chosen period; the catalogue ⟨V⟩ can be selected for comparison. An instantaneous magnitude is never used instead of the mean. When $A_V = 0$ the interface warns that no extinction is assumed, and it always shows the uncorrected distance alongside so the effect of $A_V$ is visible.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Thời điểm quan sát không cách đều: lịch quan sát ngẫu nhiên, mỗi lần đo rơi vào ban đêm 18h–05h, trên các đêm ngẫu nhiên trong thời gian theo dõi.',
      'Sai số trắc quang mô hình hóa bằng nhiễu Gaussian trắng với cùng σ cho mọi điểm (giả định sai số độc lập, không tương quan theo thời gian); σ_i = σ được dùng làm trọng số GLS.',
      'Chuỗi trắc quang tổng hợp được tạo từ tham số và dạng đường cong mô hình. Việc lấy tham số chu kỳ hoặc cấp sao tham chiếu từ danh mục không đồng nghĩa với sử dụng dữ liệu quan trắc thô từ danh mục đó.',
      'Quan hệ Leavitt được giới hạn cho lớp sao và hệ hiệu chuẩn đã chọn; không mặc nhiên áp dụng cho sao biến quang loại khác hoặc các chế độ pulsation chưa được hiệu chuẩn tương ứng.',
      'Quan hệ chu kỳ – độ sáng có độ phân tán nội tại và có thể chịu ảnh hưởng của hấp thụ liên sao, tính kim loại và lựa chọn hiệu chuẩn.',
      'Khoảng cách suy ra có thể bị chi phối bởi sai số chu kỳ, cấp sao trung bình, độ hấp thụ và các hệ số của quan hệ Leavitt.',
    ],
    en: [
      'Uneven sampling: random nights within the baseline, one epoch per sample between 18 h and 05 h.',
      'Photometric errors are white Gaussian noise with the same σ for every point (independent, uncorrelated in time); σ_i = σ is used as the GLS weight.',
      'The synthetic series is built from reference parameters and a model curve. Taking the period or reference magnitudes from a catalogue does not mean raw catalogue observations are used.',
      'The Leavitt law is limited to the chosen class and calibration; it is not applied to other variable types or uncalibrated pulsation modes.',
      'The PL relation has intrinsic scatter and depends on extinction, metallicity and the calibration.',
      'The inferred distance may be dominated by errors in period, mean magnitude, extinction and the Leavitt coefficients.',
    ],
  },
  validity: {
    vi: [
      'Đối tượng: sao Cepheid cổ điển thuộc phạm vi hiệu chuẩn được lựa chọn.',
      'Dữ liệu: chuỗi trắc quang có thời điểm và đơn vị rõ ràng, kèm sai số đo.',
      'Khoảng thời gian quan sát phải đủ để khảo sát nhiều phần của chu kỳ và phân biệt các nghiệm chu kỳ cạnh tranh.',
      'Cấp sao dùng để tính khoảng cách phải nhất quán với dải V và định nghĩa trung bình theo cường độ của quan hệ Leavitt.',
      'Kết quả khoảng cách chỉ hợp lệ khi các hiệu chỉnh hấp thụ và giả định hiệu chuẩn được xác định rõ.',
    ],
    en: [
      'Targets: classical Cepheids within the chosen calibration.',
      'Data: photometric series with clear times and units, with errors.',
      'The baseline must cover many parts of the cycle and separate competing periods.',
      'The magnitude used must match the V band and the intensity-mean definition of the Leavitt relation.',
      'Distances are valid only with stated extinction and calibration assumptions.',
    ],
  },
  scope: {
    vi: '**Phạm vi đã kiểm định thực tế:** dữ liệu tổng hợp với N = 20–160 điểm, thời gian theo dõi T = 10–120 ngày, nhiễu σ = 0,01–0,1 mag, cho 4 sao mẫu. Kết quả trên dữ liệu thật có thể khác.',
    en: '**Range actually validated:** synthetic data with N = 20–160 points, baseline T = 10–120 days, noise σ = 0.01–0.1 mag, for the 4 sample stars. Results on real data may differ.',
  },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:var\` → \`docs/validation/A5-variable.json\`; ngưỡng khoá trong bộ test.

- **Cài đặt GLS:** so với một cài đặt độc lập, là công thức dạng đóng của Zechmeister & Kürster (2009), trên 20 chuỗi ngẫu nhiên có trọng số khác nhau. Sai lệch công suất lớn nhất **1,1×10⁻¹³**. Với hình sin không nhiễu (P = 3,7 ngày), đỉnh rơi vào 3,704 ngày, công suất 0,9993.
- **Khả năng tìm đúng chu kỳ** (đỉnh cao nhất nằm trong 1% quanh $P_{\\rm ref}$): 11 520 chuỗi tổng hợp, mỗi ô tham số 20 lần lặp, GLS một thành phần.
  - Theo thời gian theo dõi: tỷ lệ đúng 37% khi T = 10 ngày, 70% khi T = 40 ngày, 81% khi T = 120 ngày.
  - Theo số điểm: tăng từ 49% (N = 20) lên 72% (N = 160).
  - Cepheid và RR Lyrae với N ≥ 80, T ≥ 40 ngày: **95–100%**.
  - Algol (đôi che khuất) với một thành phần chỉ **16%**; đa số trường hợp sai rơi vào alias hoặc hài $P/2$. Với **K = 3 thành phần**, ở N = 40–80 và T = 40 ngày, tỷ lệ lên **75–95%**.
- **Kiểm thử điểm khoảng cách δ Cephei:** dùng $P_{\\rm ref}$ = 5,366249 ngày, ⟨V⟩ = 3,954, $A_V$ = 0,23, cho $M_V$ = −3,393 ± 0,038, $\\mu_0$ = 7,117 và d = **265 ± 5 pc**. Thị sai HST (Benedict et al. 2002) cho 273 ± 11 pc, tức lệch −2,9% hay −0,66σ. Khi tính từ chuỗi tổng hợp 120 điểm, ⟨V⟩ khớp được là 3,951.

Đây là kiểm thử điểm trên **một** sao với tham số đầu vào đã biết; không xem là xác nhận độ chính xác chung của phương pháp khoảng cách.`,
    en: `Reproducible report: \`npm run validate:var\` → \`docs/validation/A5-variable.json\`; thresholds locked in tests.

- **GLS implementation:** vs an independent implementation, the Zechmeister & Kürster (2009) closed form, on 20 random weighted series. Maximum power difference **1.1×10⁻¹³**. For a noise-free sinusoid (P = 3.7 d) the peak falls at 3.704 d with power 0.9993.
- **Period recovery** (highest peak within 1% of $P_{\\rm ref}$): 11,520 synthetic series, 20 runs per parameter cell, single-harmonic GLS.
  - By baseline: 37% at T = 10 d, 70% at 40 d, 81% at 120 d.
  - By number of points: rises from 49% (N = 20) to 72% (N = 160).
  - Cepheids and RR Lyrae with N ≥ 80, T ≥ 40 d: **95–100%**.
  - Algol (eclipsing) with one harmonic only **16%**; most failures are aliases or the $P/2$ harmonic. With **K = 3** at N = 40–80 and T = 40 d it rises to **75–95%**.
- **δ Cephei distance point check:** with $P_{\\rm ref}$ = 5.366249 d, ⟨V⟩ = 3.954, $A_V$ = 0.23 → $M_V$ = −3.393 ± 0.038, $\\mu_0$ = 7.117, d = **265 ± 5 pc**. The HST parallax (Benedict et al. 2002) gives 273 ± 11 pc, i.e. −2.9% or −0.66σ. From a 120-point synthetic series the fitted ⟨V⟩ is 3.951.

This is a point check on **one** star with known inputs, not a general validation of the distance method.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: [
      'Chuỗi trắc quang mô phỏng chưa thay thế được dữ liệu quan trắc thực từ AAVSO, TESS hoặc các khảo sát chuyên ngành khác.',
      'Lấy mẫu không đều và quan sát chủ yếu vào ban đêm có thể tạo alias và làm giảm độ tin cậy của phép tìm chu kỳ.',
      'Chu kỳ đồ dựa trên một thành phần điều hòa có thể chưa mô tả tốt dạng đường cong bất đối xứng của một số sao Cepheid và đặc biệt là sao đôi che khuất.',
      'Chưa tự động hiệu chỉnh đầy đủ hấp thụ liên sao, ảnh hưởng tính kim loại và mọi sai số hệ thống của phép hiệu chuẩn Leavitt; A_V do người dùng nhập.',
      'FAP bootstrap có độ phân giải 1/100; không thay thế phân tích thống kê đầy đủ khi có nhiễu tương quan.',
      'Khoảng cách suy ra là kết quả phụ thuộc mô hình và dữ liệu đầu vào, không phải phép đo hình học trực tiếp.',
    ],
    en: [
      'Simulated photometry does not replace real AAVSO, TESS or survey data.',
      'Uneven, night-only sampling creates aliases and lowers the reliability of period finding.',
      'A single-harmonic periodogram may poorly describe asymmetric Cepheid curves and especially eclipsing binaries.',
      'Extinction, metallicity effects and Leavitt calibration systematics are not fully corrected; A_V is user input.',
      'The bootstrap FAP has a resolution of 1/100; it does not replace a full statistical analysis with correlated noise.',
      'The inferred distance is model- and input-dependent, not a direct geometric measurement.',
    ],
  },
  references: [
    'Scargle, J. D. (1982). Studies in Astronomical Time Series Analysis. II. ApJ 263, 835.',
    'Zechmeister, M. & Kürster, M. (2009). The generalised Lomb–Scargle periodogram. A&A 496, 577.',
    'VanderPlas, J. T. (2018). Understanding the Lomb–Scargle Periodogram. ApJS 236, 16.',
    'Benedict, G. F. et al. (2007). Astrometry with HST FGS. V. Astrometric Parallaxes of Galactic Cepheid Variable Stars. AJ 133, 1810.',
    'Benedict, G. F. et al. (2002). Astrometry with HST: A Parallax of the Fundamental Distance Calibrator δ Cephei. AJ 124, 1695.',
    'AAVSO - tài liệu giáo dục về sao biến quang / educational material on variable stars.',
    'General Catalogue of Variable Stars (GCVS); AAVSO International Variable Star Index (VSX).',
  ],
};
