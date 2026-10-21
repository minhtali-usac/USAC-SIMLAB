import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Mô tả đường đi hằng ngày của Mặt Trời trên bầu trời theo vĩ độ và mùa.',
      'Tính độ cao kinh tuyến của Mặt Trời: $h = 90° − |φ − δ|$.',
      'Giải thích nguyên nhân các mùa (trục nghiêng 23,44°), không phải do khoảng cách tới Mặt Trời.',
      'Hiểu phương trình thời gian và hình số 8 analemma.',
    ],
    en: [
      'Describe the Sun’s daily path across the sky by latitude and season.',
      'Compute the Sun’s meridian altitude: $h = 90° − |φ − δ|$.',
      'Explain the seasons (23.44° axial tilt), not the Earth–Sun distance.',
      'Understand the equation of time and the figure-eight analemma.',
    ],
  },
  durationMin: 40,
  prerequisites: { vi: 'Khái niệm kinh độ, vĩ độ; góc.', en: 'Latitude, longitude; angles.' },
  background: [
    {
      title: { vi: 'Thiên cầu và hệ toạ độ chân trời', en: 'The celestial sphere and horizon coordinates' },
      body: {
        vi: `Người quan sát thấy bầu trời như một bán cầu úp lên mặt đất. Vị trí một thiên thể được cho bởi **độ cao** h (góc trên chân trời) và **phương vị** A (tính từ Bắc qua Đông). Do Trái Đất tự quay, mọi thiên thể vẽ một vòng tròn song song với **xích đạo trời**, quanh **cực trời**. Cực Bắc trời cao đúng bằng **vĩ độ** φ của bạn.

Toạ độ xích đạo của Mặt Trời là **xích kinh** α và **xích vĩ** δ. Xích vĩ thay đổi trong năm từ −23,44° đến +23,44° vì trục Trái Đất nghiêng so với mặt phẳng quỹ đạo (**hoàng đạo**).`,
        en: `An observer sees the sky as a dome over the ground. A body’s position is given by its **altitude** h (angle above the horizon) and **azimuth** A (from North through East). As the Earth spins, every body traces a circle parallel to the **celestial equator**, around the **celestial pole**. The north celestial pole stands at an altitude equal to your **latitude** φ.

The Sun’s equatorial coordinates are **right ascension** α and **declination** δ. Declination swings between −23.44° and +23.44° over the year because the Earth’s axis is tilted relative to its orbital plane (the **ecliptic**).`,
      },
    },
    {
      title: { vi: 'Độ cao giữa trưa và các mùa', en: 'Noon altitude and the seasons' },
      body: {
        vi: `Khi qua kinh tuyến (giữa trưa thật), độ cao Mặt Trời là
$$h_{\\max} = 90° - |\\varphi - \\delta|.$$
Ở Hà Nội (φ ≈ 21°) vào hạ chí (δ = +23,44°): $h ≈ 87,6°$ - Mặt Trời gần thiên đỉnh, ở phía Bắc một chút! Vào đông chí (δ = −23,44°): $h ≈ 45,5°$.

Mùa hè nóng hơn vì Mặt Trời **lên cao hơn** (năng lượng chiếu xiên ít hơn) và **ngày dài hơn**. Thực ra Trái Đất ở **gần** Mặt Trời nhất vào đầu tháng 1 - mùa đông của Bắc bán cầu.`,
        en: `At meridian transit (true noon) the Sun’s altitude is
$$h_{\\max} = 90° - |\\varphi - \\delta|.$$
In Hanoi (φ ≈ 21°) at the June solstice (δ = +23.44°): $h ≈ 87.6°$ - almost overhead, slightly to the north! At the December solstice (δ = −23.44°): $h ≈ 45.5°$.

Summer is warmer because the Sun climbs **higher** (less oblique light) and days are **longer**. The Earth is actually **closest** to the Sun in early January - northern winter.`,
      },
    },
    {
      title: { vi: 'Phương trình thời gian và analemma', en: 'The equation of time and the analemma' },
      body: {
        vi: `Đồng hồ đo **thời gian Mặt Trời trung bình**; Mặt Trời thật có lúc đi nhanh, lúc chậm vì (1) quỹ đạo elip và (2) độ nghiêng hoàng đạo. Hiệu số gọi là **phương trình thời gian**, dao động từ ≈ −14 phút (giữa tháng 2) đến ≈ +16 phút (đầu tháng 11). Chụp Mặt Trời cùng một giờ đồng hồ mỗi ngày trong năm, ta được hình số 8: **analemma**.`,
        en: `Clocks keep **mean solar time**; the real Sun runs fast or slow because of (1) the elliptical orbit and (2) the obliquity. The difference is the **equation of time**, ranging from ≈ −14 min (mid-February) to ≈ +16 min (early November). Photograph the Sun at the same clock time every day for a year and you get a figure eight: the **analemma**.`,
      },
    },
  ],
  activities: [
    { title: { vi: 'Hạ chí ở Hà Nội', en: 'June solstice in Hanoi' }, text: { vi: 'Đặt Hà Nội, ngày 21/6. Giữa trưa Mặt Trời ở phương Bắc hay phương Nam? Đọc độ cao giữa trưa và so với công thức $90° − |φ − δ|$.', en: 'Set Hanoi, June 21. At noon is the Sun north or south of the zenith? Read the noon altitude and compare with $90° − |φ − δ|$.' }, params: { loc: 'hanoi', date: '2026-06-21', min: 720 } },
    { title: { vi: 'Mặt Trời nửa đêm', en: 'The midnight Sun' }, text: { vi: 'Chọn Tromsø (69,6°N) vào ngày 21/6 và chạy thời gian. Mặt Trời có lặn không? Còn ngày 21/12?', en: 'Pick Tromsø (69.6°N) on June 21 and run time. Does the Sun set? What about December 21?' }, params: { loc: 'tromso', date: '2026-06-21', min: 0 } },
    { title: { vi: 'Tại xích đạo', en: 'At the equator' }, text: { vi: 'Chọn xích đạo. Đường đi của Mặt Trời vuông góc với chân trời; ngày luôn ≈ 12 giờ. Vì sao?', en: 'Pick the equator. The Sun’s path is perpendicular to the horizon; days are always ≈ 12 h. Why?' }, params: { loc: 'equator', date: '2026-03-20', min: 720 } },
    { title: { vi: 'Analemma', en: 'Analemma' }, text: { vi: 'Bật analemma. Hình số 8 nghiêng thế nào ở Sydney so với Hà Nội?', en: 'Turn on the analemma. How is the figure eight tilted in Sydney vs Hanoi?' }, params: { loc: 'sydney', ana: true } },
  ],
  quiz: [
    { q: { vi: 'Ở vĩ độ φ, cực Bắc trời cao bao nhiêu trên chân trời?', en: 'At latitude φ, how high is the north celestial pole?' }, options: [{ vi: '90° − φ', en: '90° − φ' }, { vi: 'φ', en: 'φ' }, { vi: '23,44°', en: '23.44°' }, { vi: 'Luôn 45°', en: 'Always 45°' }], answer: 1, explain: { vi: 'Độ cao cực trời bằng vĩ độ - đây là cách đo vĩ độ bằng sao Bắc Cực.', en: 'The pole’s altitude equals the latitude - how navigators used Polaris.' } },
    { q: { vi: 'Nguyên nhân chính của các mùa là:', en: 'The main cause of the seasons is:' }, options: [{ vi: 'Khoảng cách Trái Đất – Mặt Trời thay đổi', en: 'The changing Earth–Sun distance' }, { vi: 'Trục quay nghiêng so với hoàng đạo', en: 'The axial tilt relative to the ecliptic' }, { vi: 'Hoạt động Mặt Trời', en: 'Solar activity' }], answer: 1, explain: { vi: 'Trái Đất gần Mặt Trời nhất vào tháng 1, giữa mùa đông Bắc bán cầu.', en: 'Earth is closest to the Sun in January, in the middle of northern winter.' } },
    { q: { vi: 'Ở xích đạo vào ngày xuân phân, độ cao Mặt Trời giữa trưa là:', en: 'At the equator on the March equinox, the noon altitude is:' }, options: [{ vi: '0°', en: '0°' }, { vi: '66,56°', en: '66.56°' }, { vi: '90°', en: '90°' }], answer: 2, explain: { vi: 'φ = 0, δ = 0 ⇒ h = 90°: Mặt Trời ở thiên đỉnh.', en: 'φ = 0, δ = 0 ⇒ h = 90°: the Sun is overhead.' } },
  ],
};

export const card: ModelCard = {
  parts: [
    { label: { vi: 'Vị trí Mặt Trời (Meeus ch. 25, ~0,01°), giờ mọc/lặn', en: 'Sun position (Meeus ch. 25, ~0.01°), rise/set times' }, fidelity: 'A' },
    { label: { vi: 'Vị trí Mặt Trăng (Almanac độ chính xác thấp, ~0,3°)', en: 'Moon position (low-precision Almanac, ~0.3°)' }, fidelity: 'A' },
    { label: { vi: 'Sao sáng có tên (toạ độ J2000 thật, bỏ qua tiến động)', en: 'Named bright stars (real J2000 coordinates, precession ignored)' }, fidelity: 'A' },
    { label: { vi: 'Màu bầu trời theo độ cao Mặt Trời', en: 'Sky colour vs solar altitude' }, fidelity: 'C' },
  ],
  equations: [
    '\\sin h = \\sin\\varphi\\sin\\delta + \\cos\\varphi\\cos\\delta\\cos H, \\quad H = \\theta_{\\rm LST} - \\alpha',
    '\\tan A = \\frac{-\\cos\\delta\\sin H}{\\sin\\delta\\cos\\varphi - \\cos\\delta\\sin\\varphi\\cos H}',
    'h_{\\max} = 90° - |\\varphi - \\delta|, \\qquad h_{\\rm rise/set} = -0{,}8333°',
    'E = y\\sin 2L_0 - 2e\\sin M + 4ey\\sin M\\cos 2L_0 - \\tfrac12 y^2\\sin 4L_0 - \\tfrac54 e^2\\sin 2M',
  ],
  assumptions: {
    vi: ['UT1 ≈ UTC (|UT1 − UTC| < 0,9 s); ΔT = TT − UT nội suy từ bảng quan trắc 1900–2025 (Espenak & Meeus / IERS), giữ 69,2 s sau 2025.', 'Khúc xạ khí quyển chuẩn (Sæmundsson, 1010 hPa, 10 °C).', 'Mặt đất phẳng, độ cao người quan sát = 0.', 'Múi giờ cố định do người dùng chọn (không tự đổi giờ mùa hè).'],
    en: ['UT1 ≈ UTC (|UT1 − UTC| < 0.9 s); ΔT = TT − UT interpolated from observed values 1900–2025 (Espenak & Meeus / IERS), held at 69.2 s after 2025.', 'Standard refraction (Sæmundsson, 1010 hPa, 10 °C).', 'Flat horizon, observer at sea level.', 'Fixed user-chosen UTC offset (no automatic DST).'],
  },
  validity: { vi: ['Năm 1950–2050 cho độ chính xác ~0,01°.', 'Mọi vĩ độ −90°…+90°, kể cả đêm/ngày địa cực.'], en: ['Years 1950–2050 for ~0.01° accuracy.', 'All latitudes −90°…+90°, including polar day/night.'] },
  errors: {
    vi: ['Toạ độ Mặt Trời so với JPL Horizons DE441 (1990–2040, 494 thời điểm): lệch góc lớn nhất 34″ (0,0095°), trung bình bình phương 13″; khoảng cách lệch ≤ 7,3 × 10⁻⁵ au.', 'Giờ mọc/lặn so với Horizons (2025; Hà Nội, TP.HCM, Helsinki 60°N, Sydney 34°S; 2920 sự kiện): sai số ≤ 0,1 phút ngoài lượng tử hoá 1 phút của dữ liệu tham chiếu.', 'Sao: bỏ qua tiến động J2000→hiện tại (≤ 0,4°) và chuyển động riêng.'],
    en: ['Solar coordinates vs JPL Horizons DE441 (1990–2040, 494 epochs): max angular error 34″ (0.0095°), rms 13″; distance ≤ 7.3 × 10⁻⁵ au.', 'Rise/set vs Horizons (2025; Hanoi, HCMC, Helsinki 60°N, Sydney 34°S; 2920 events): ≤ 0.1 min beyond the reference’s 1-min quantisation.', 'Stars: J2000→date precession (≤ 0.4°) and proper motion ignored.'],
  },
  validation: {
    vi: ['So sánh với JPL Horizons: `npm run validate:ephem` → docs/validation/A1-sun.json (test khoá ngưỡng 36″ và 0,15 phút).', 'Meeus Ví dụ 25.a (RA, Dec, R) - test.', 'GMST Meeus Ví dụ 12.a - test.', 'Phương trình thời gian +16,4 / −14,2 phút - test.', 'Độ dài ngày hạ chí Hà Nội ≈ 13 h 27 m (timeanddate.com) - test.'],
    en: ['JPL Horizons comparison: `npm run validate:ephem` → docs/validation/A1-sun.json (tests lock 36″ and 0.15 min).', 'Meeus Example 25.a (RA, Dec, R) - test.', 'GMST Meeus Example 12.a - test.', 'Equation of time +16.4 / −14.2 min - test.', 'Hanoi solstice day length ≈ 13 h 27 m (timeanddate.com) - test.'],
  },
  limitations: {
    vi: ['Không tính độ cao địa hình, ô nhiễm ánh sáng hay thời tiết.', 'Màu bầu trời và kích thước Mặt Trời/Mặt Trăng chỉ là minh hoạ.'],
    en: ['No terrain elevation, light pollution or weather.', 'Sky colour and Sun/Moon sizes are illustrative.'],
  },
  references: [
    'Meeus, J. (1998). Astronomical Algorithms, 2nd ed., ch. 12, 13, 15, 16, 25, 28. Willmann-Bell.',
    'NOAA Global Monitoring Laboratory - Solar Calculator (same algorithm family).',
    'The Astronomical Almanac - low-precision formulae for the Moon.',
    'Hoffleit, D. & Warren, W. H. (1991). The Bright Star Catalogue, 5th ed.',
  ],
};
