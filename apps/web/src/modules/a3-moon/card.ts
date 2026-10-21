import type { ModelCard } from '../types';

/**
 * Model Card · A3 - Các pha Mặt Trăng.
 * Measured figures come from `npm run validate:moon` (docs/validation/A3-moon.json, 2026-10-19).
 */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Lớp 1 - Dữ liệu thiên văn được tính toán', en: 'Layer 1 - Computed astronomical data' },
      body: {
        vi: '**Mức A - Mô hình thiên văn:** Vị trí tương đối và pha Mặt Trăng được xác định bằng thuật toán thiên văn rút gọn. Kết quả phục vụ mục đích học tập, trực quan hóa hình học và khảo sát sự biến đổi theo thời gian; không thay thế dữ liệu thiên văn chính xác dùng cho quan trắc chuyên nghiệp. Lớp này gồm: thời điểm các pha chính, tỷ phần chiếu sáng, góc ly giác, khoảng cách, giờ mọc/lặn và toạ độ chân trời hiển thị trong bảng Số liệu.',
        en: '**Level A - Astronomical model:** The Moon’s relative position and phase are computed with abridged astronomical algorithms. Results serve learning, geometric visualisation and studying change over time; they do not replace precise astronomical data used for professional observation. This layer comprises the principal-phase instants, illuminated fraction, elongation, distance, rise/set times and horizon coordinates shown in the Readouts panel.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Lớp 2 - Mô hình hình học được đơn giản hóa', en: 'Layer 2 - Simplified geometric model' },
      body: {
        vi: '**Mức C - Mô hình minh họa:** Hình nhìn từ cực Bắc hoàng đạo vẽ quỹ đạo Mặt Trăng là đường tròn trong mặt phẳng hoàng đạo (bỏ độ nghiêng 5,1° và độ lệch tâm). Khoảng cách giữa các thiên thể không theo tỷ lệ thực. Chỉ các **góc** là giá trị tính toán thật: hiệu kinh độ λ☾ − λ☉ và góc giờ của người quan sát.',
        en: '**Level C - Illustrative model:** The view from the north ecliptic pole draws the lunar orbit as a circle in the ecliptic plane (5.1° inclination and eccentricity dropped). Distances between bodies are not to scale. Only the **angles** are computed values: the longitude difference λ☾ − λ☉ and the observer’s hour angle.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Lớp 3 - Hình ảnh trực quan phục vụ dạy học', en: 'Layer 3 - Teaching visuals' },
      body: {
        vi: '**Mức C - Mô hình minh họa:** Hình dạng pha và toàn cảnh chân trời được giản lược để phù hợp với giao diện trực quan; hình minh họa không được xem là bản tái tạo chính xác của cảnh quan quan sát tại một thời điểm cụ thể. Bề mặt Mặt Trăng là ảnh chụp trăng tròn (G. H. Revera, CC BY-SA 3.0); vùng tối được tô theo tỷ phần chiếu sáng k nhưng không tái tạo độ nghiêng biểu kiến của vành sáng. Màu bầu trời là minh hoạ.',
        en: '**Level C - Illustrative model:** The phase shape and horizon panorama are simplified for an intuitive interface; the drawings are not an exact reconstruction of the sky at a given instant. The lunar surface is a full-Moon photograph (G. H. Revera, CC BY-SA 3.0); the dark part follows the illuminated fraction k but not the apparent tilt of the bright limb. Sky colours are illustrative.',
      },
    },
  ],
  fidelityNote: {
    vi: 'Các mức A và C là thang phân loại nội bộ của SimLab, không phải hệ thống chứng nhận độ chính xác thiên văn được chuẩn hóa quốc tế.',
    en: 'Levels A and C are SimLab’s internal classification, not an internationally standardised certification of astronomical accuracy.',
  },
  equations: [],
  methods: [
    {
      title: { vi: 'Góc ly giác Mặt Trời – Mặt Trăng', en: 'Sun–Moon elongation' },
      tex: ['\\cos\\psi = \\cos\\beta\\,\\cos(\\lambda - \\lambda_\\odot)'],
      body: {
        vi: 'Trong đó ψ là góc ly giác địa tâm; β và λ lần lượt là vĩ độ, kinh độ hoàng đạo của Mặt Trăng; λ☉ là kinh độ hoàng đạo của Mặt Trời. Các tọa độ phải được xác định theo cùng hệ quy chiếu và cùng thời điểm.',
        en: 'ψ is the geocentric elongation; β and λ are the Moon’s ecliptic latitude and longitude; λ☉ is the Sun’s ecliptic longitude. All coordinates must refer to the same frame and the same instant.',
      },
    },
    {
      title: { vi: 'Góc pha và tỷ phần chiếu sáng', en: 'Phase angle and illuminated fraction' },
      tex: ['i = \\operatorname{atan2}(R\\sin\\psi,\\; \\Delta - R\\cos\\psi)', 'k = \\tfrac12\\,(1 + \\cos i)'],
      body: {
        vi: 'Trong đó i là góc pha tại Mặt Trăng; R là khoảng cách Trái Đất – Mặt Trời; Δ là khoảng cách Trái Đất – Mặt Trăng, với hai khoảng cách sử dụng cùng đơn vị. Tỷ phần chiếu sáng của đĩa Mặt Trăng được biểu diễn bằng 100k%.\n\nCông thức mô tả hình học chiếu sáng của một thiên thể hình cầu; không trực tiếp mô phỏng độ sáng quang học, đặc tính phản xạ của bề mặt hay cấu trúc địa hình Mặt Trăng.',
        en: 'i is the phase angle at the Moon; R is the Earth–Sun distance; Δ is the Earth–Moon distance, both in the same unit. The illuminated fraction of the disk is shown as 100k %.\n\nThe formula describes the illumination geometry of a sphere; it does not model optical brightness, surface reflectance or lunar topography.',
      },
    },
    {
      title: { vi: 'Xác định thời điểm các pha chính', en: 'Instants of the principal phases' },
      tex: ['\\lambda_{\\text{☾}} - \\lambda_\\odot = 0°,\\ 90°,\\ 180°,\\ 270°', '\\mathrm{JDE} = 2451550{,}09766 + 29{,}530588861\\,k + \\dots + \\textstyle\\sum_j A_j \\sin\\theta_j(k)'],
      body: {
        vi: 'Thời điểm trăng non, thượng huyền, trăng tròn và hạ huyền được xác định theo hiệu kinh độ hoàng đạo biểu kiến địa tâm giữa Mặt Trăng và Mặt Trời, tương ứng với các giá trị 0°, 90°, 180° và 270°.\n\nViệc xác định mốc pha chính được thực hiện riêng với phép tính tỷ phần chiếu sáng, nhằm phân biệt thời điểm thiên văn quy ước với hình dạng pha tại một thời điểm bất kỳ. SimLab tính các mốc này bằng thuật toán Meeus (chương 49: pha trung bình, các số hạng tuần hoàn và 14 số hạng hành tinh), cho kết quả theo thời gian TT, rồi đổi sang UT bằng ΔT.',
        en: 'New moon, first quarter, full moon and last quarter are defined by the apparent geocentric ecliptic longitude difference between Moon and Sun of 0°, 90°, 180° and 270°.\n\nThe principal phases are computed separately from the illuminated fraction, to distinguish the conventional astronomical instant from the phase shape at an arbitrary time. SimLab uses Meeus’ algorithm (ch. 49: mean phase, periodic terms and 14 planetary terms), which yields TT, converted to UT with ΔT.',
      },
    },
    {
      title: { vi: 'Điều kiện Mặt Trăng mọc và lặn', en: 'Moonrise and moonset condition' },
      tex: ['h_{\\rm topo} \\approx -0{,}5666° - s_{\\rm Moon}', 'h_{\\rm geo} \\approx -0{,}5666° - s_{\\rm Moon} + \\pi_{\\rm Moon}'],
      body: {
        vi: 'Dòng thứ nhất dùng khi xét độ cao hình học **địa hình** (topocentric) của tâm Mặt Trăng, dòng thứ hai khi xét độ cao hình học **địa tâm**. Trong đó s_Moon là bán kính góc biểu kiến của Mặt Trăng; π_Moon là thị sai ngang Mặt Trăng. Giá trị 0,5666° tương ứng với quy ước khúc xạ khí quyển trung bình 34 phút cung.\n\n**SimLab dùng độ cao địa hình** (đã hiệu chỉnh thị sai trước khi so sánh), nên áp dụng công thức thứ nhất, với $s = \\arcsin(0{,}2725\\,\\sin\\pi)$.\n\nĐây là điều kiện độ cao để xác định sự kiện mọc/lặn, không phải công thức độc lập để xác định thời điểm. Thời điểm được tìm bằng cách quét độ cao mỗi 10 phút rồi chia đôi khoảng tới khi sai số dưới 0,1 giây. Kết quả còn phụ thuộc vào vị trí địa lý, tọa độ thiên thể, thời điểm tính toán và mô hình khúc xạ được sử dụng.',
        en: 'The first line applies to the **topocentric** geometric altitude of the Moon’s centre, the second to the **geocentric** geometric altitude. s_Moon is the apparent angular radius; π_Moon the horizontal parallax. 0.5666° corresponds to the conventional mean refraction of 34 arcminutes.\n\n**SimLab uses the topocentric altitude** (parallax applied before the comparison), hence the first condition, with $s = \\arcsin(0.2725\\,\\sin\\pi)$.\n\nThis is an altitude condition defining the event, not a stand-alone formula for its time. Times are found by scanning the altitude every 10 min, then bisecting to < 0.1 s. Results also depend on location, body coordinates, epoch and the refraction model.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Vị trí Mặt Trăng dùng chuỗi tính toán thiên văn rút gọn (Astronomical Almanac); kết quả có thể sai lệch so với niên giám hoặc lịch thiên văn tham chiếu.',
      'ΔT = TT − UT1 được nội suy theo năm từ bảng giá trị quan sát (Espenak & Meeus; IERS) cho 1900–2025. Sau 2025, ΔT được giữ ở 69,2 s; đây chỉ là xấp xỉ vì ΔT tương lai không dự báo chính xác được.',
      'Trái Đất được coi là hình cầu khi hiệu chỉnh thị sai; khúc xạ là giá trị trung bình 34′ (không xét nhiệt độ, áp suất).',
      'Mô hình hình học giản lược không tái tạo đầy đủ độ nghiêng biểu kiến của ranh giới sáng – tối trong mọi góc nhìn.',
      'Hình minh họa được thiết kế để hỗ trợ nhận thức không gian và diễn giải pha, không nhằm thay thế ảnh quan sát hoặc dữ liệu thiên văn chuyên dụng.',
      'Khung nhìn trên xuống (hệ hoàng đạo địa tâm, cố định theo sao): Mặt Trăng đặt theo kinh độ λ, vĩ độ β và khoảng cách thật (theo tỉ lệ); quỹ đạo vẽ là đường đi thật ±15 ngày của chuỗi Almanac (thấy độ lệch tâm, cận điểm/viễn điểm, nhiễu loạn). Trái Đất nghiêng ε, quay theo giờ sao GMST, chiếu sáng theo hướng Mặt Trời thật (đường phân chia ngày – đêm theo mùa). Mặt Trăng quay đồng bộ với tốc độ đều theo kinh độ trung bình L nên bình động kinh độ λ − L (≲ ±8°) xuất hiện tự nhiên; bỏ qua bình động vĩ độ và độ nghiêng 1,54° của trục Mặt Trăng. Ô phụ: quỹ đạo lệch tâm của Trái Đất (e = 0,0167, cận nhật ϖ = 102,94°, Standish J2000). Texture Solar System Scope (CC BY 4.0), kích thước thiên thể phóng đại.',
    ],
    en: [
      'The lunar position uses an abridged series (Astronomical Almanac); results may differ from almanacs or reference ephemerides.',
      'ΔT = TT − UT1 is interpolated by year from observed values (Espenak & Meeus; IERS) for 1900–2025. After 2025 ΔT is held at 69.2 s - an approximation, as future ΔT cannot be predicted precisely.',
      'Spherical Earth for the parallax correction; mean refraction of 34′ (no temperature/pressure dependence).',
      'The simplified geometry does not fully reproduce the apparent tilt of the terminator for every viewpoint.',
      'Illustrations support spatial understanding and phase interpretation; they do not replace observations or specialised astronomical data.',
      'Top view (geocentric ecliptic frame fixed to the stars): the Moon is placed at its true λ, β and distance (to scale); the drawn orbit is the real ±15-day Almanac path (eccentricity, perigee/apogee, perturbations visible). The Earth is tilted by ε, turned by GMST and lit from the true Sun direction (seasonal terminator). The Moon spins uniformly at the mean longitude L, so the libration in longitude λ − L (≲ ±8°) appears naturally; latitude libration and the 1.54° lunar axial tilt are ignored. Inset: Earth’s eccentric orbit (e = 0.0167, perihelion ϖ = 102.94°, Standish J2000). Solar System Scope textures (CC BY 4.0); body sizes enlarged.',
    ],
  },
  validity: { vi: ['Khoảng thời gian thiết kế: 1900–2100.'], en: ['Design period: 1900–2100.'] },
  scope: {
    vi: 'Độ chính xác thực tế trong phạm vi này phụ thuộc vào thuật toán xác định vị trí thiên thể, mô hình thời gian và phương pháp tính sự kiện. Phạm vi thiết kế không đồng nghĩa với việc mọi thời điểm trong khoảng đều đã được kiểm chứng với cùng một mức sai số. **Phạm vi đã kiểm định thực tế:** pha chính 2000–2030; mọc/lặn và tỷ phần chiếu sáng 2024–2025; vĩ độ −33,9° đến +59,9°.',
    en: 'Actual accuracy within this period depends on the position algorithm, the time model and the event method. The design period does not mean every instant has been verified to the same error. **Range actually validated:** principal phases 2000–2030; rise/set and illuminated fraction 2024–2025; latitudes −33.9° to +59.9°.',
  },
  validationText: {
    vi: `Mô hình được đối chiếu tự động với **JPL Horizons** (NASA, ephemeris DE441). Có thể tái lập bằng \`node reference/fetch_horizons_moon.mjs\` rồi \`npm run validate:moon\`; ngưỡng sai số được khoá trong bộ test.

- **Thời điểm 4 pha chính:** 1 533 sự kiện từ 01/2000 đến 12/2030. Sai số tuyệt đối trung vị **0,1 phút**, 95% sự kiện dưới **0,2 phút**, lớn nhất **0,3 phút**. Phương pháp tìm nghiệm trên chuỗi rút gọn dùng trước đây cho sai số lớn nhất 29 phút.
- **Giờ mọc/lặn:** 8 474 sự kiện năm 2024–2025 tại 6 địa điểm: Sydney −33,9°, xích đạo, TP.HCM, Hà Nội, London, Oslo +59,9°. Trung vị **0,6 phút**, 95% dưới **1,5 phút**, lớn nhất **4,0 phút** (Oslo), không bỏ sót sự kiện nào. Độ lệch hệ thống −0,5 phút chủ yếu do Horizons làm tròn thời điểm xuống phút. Sai số tăng theo vĩ độ: lớn nhất 2,3 phút ở Hà Nội, 2,9 phút ở London, 4,0 phút ở Oslo.
- **Tỷ phần chiếu sáng:** 2 925 mẫu cách nhau 6 giờ trong 2024–2025. Trung vị **0,03 điểm %**, lớn nhất **0,19 điểm %**.`,
    en: `The model is checked automatically against **JPL Horizons** (NASA, DE441 ephemeris). Reproduce with \`node reference/fetch_horizons_moon.mjs\` then \`npm run validate:moon\`; thresholds are locked in the test suite.

- **Principal phase instants:** 1,533 events from 01/2000 to 12/2030. Median absolute error **0.1 min**, 95% below **0.2 min**, maximum **0.3 min**. The previous root-finding on the abridged series reached 29 min.
- **Rise/set times:** 8,474 events in 2024–2025 at 6 sites: Sydney −33.9°, the equator, Ho Chi Minh City, Hanoi, London, Oslo +59.9°. Median **0.6 min**, 95% below **1.5 min**, maximum **4.0 min** (Oslo), no missed events. The −0.5 min bias mostly comes from Horizons truncating times to the minute. Errors grow with latitude: maximum 2.3 min in Hanoi, 2.9 min in London, 4.0 min in Oslo.
- **Illuminated fraction:** 2,925 samples every 6 h in 2024–2025. Median **0.03 percentage points**, maximum **0.19 percentage points**.`,
  },
  validation: {
    vi: [
      'Mốc kiểm tra điểm theo USNO: trăng non 11/01/2024 11:57 UTC; trăng tròn 25/01/2024 17:54 UTC. Bộ tham chiếu Horizons cho đúng các mốc này (11:57:25 và 17:54:00 UTC).',
      'Ví dụ 49.a của Meeus (trăng non tháng 2/1977, JDE 2443192,65118) được tái tạo chính xác tới 10⁻⁴ ngày.',
    ],
    en: [
      'USNO spot checks: new moon 2024-01-11 11:57 UTC; full moon 2024-01-25 17:54 UTC. The Horizons reference gives exactly these (11:57:25 and 17:54:00 UTC).',
      'Meeus Example 49.a (new moon of Feb 1977, JDE 2443192.65118) reproduced to 10⁻⁴ day.',
    ],
  },
  errors: { vi: [], en: [] },
  limitations: {
    vi: [
      'Không mô phỏng đầy đủ hiện tượng dao động biểu kiến của Mặt Trăng (libration).',
      'Không tái tạo ánh sáng tro (earthshine), đặc tính phản xạ bề mặt hoặc biến thiên độ sáng thực tế.',
      'Không mô hình hóa chi tiết điều kiện khí quyển, địa hình đường chân trời và các vật cản tại địa điểm quan sát.',
      'Hình học minh họa được giản lược về tỷ lệ và góc nhìn; không nên sử dụng như dự báo quan sát chính xác.',
      'Chưa kiểm định: vĩ độ trên 60° (nơi Mặt Trăng có thể không mọc hoặc không lặn trong ngày), các năm ngoài phạm vi kiểm định nêu trên, và gợi ý nhật/nguyệt thực (chỉ dựa trên vĩ độ hoàng đạo β, không phải dự báo thực).',
    ],
    en: [
      'Lunar libration is not fully modelled.',
      'No earthshine, surface reflectance or real brightness variation.',
      'No detailed atmospheric conditions, local horizon profile or obstructions.',
      'The illustrative geometry is simplified in scale and viewpoint; do not use it as a precise observing forecast.',
      'Not yet validated: latitudes above 60° (where the Moon may not rise or set on a given day), years outside the validated range above, and the eclipse hints (based on ecliptic latitude β only, not an eclipse prediction).',
    ],
  },
  references: [
    'U.S. Naval Observatory - Phases of the Moon and Percent of the Moon Illuminated.',
    'U.S. Naval Observatory - Rise, Set, and Twilight Definitions.',
    'U.S. Naval Observatory - Astronomical Glossary.',
    'Meeus, J. (1998). Astronomical Algorithms, 2nd ed., ch. 15, 40, 47–49. Willmann-Bell.',
    'The Astronomical Almanac - low-precision formulae for the Moon.',
    'JPL Horizons System (Giorgini et al. 1996); planetary and lunar ephemeris DE441 (Park et al. 2021, AJ 161, 105).',
    'Espenak, F. & Meeus, J. - NASA “Delta T” tables; IERS Bulletin A.',
  ],
};
