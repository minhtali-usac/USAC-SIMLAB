import type { Lesson, ModelCard } from '../types';
import { refF } from '../visibility';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Cảm nhận độ lớn của tốc độ ánh sáng $c = 299\\,792\\,458$ m/s qua các hành trình thật: Mặt Trăng, Mặt Trời, các hành tinh, các sao và thiên hà.',
      'Tính thời gian ánh sáng $t = d/c$ và đổi giữa km, đơn vị thiên văn (au), năm ánh sáng và parsec.',
      'Giải thích vì sao khoảng cách trong Hệ Mặt Trời thay đổi theo ngày và hệ quả của điều đó với liên lạc tàu vũ trụ.',
      'Hiểu rằng nhìn một thiên thể xa là nhìn trạng thái của nó trong quá khứ.',
    ],
    en: [
      'Grasp the magnitude of the speed of light $c = 299\\,792\\,458$ m/s through real journeys: Moon, Sun, planets, stars and galaxies.',
      'Compute light times $t = d/c$ and convert between km, astronomical units (au), light-years and parsecs.',
      'Explain why Solar System distances change from day to day and what that means for spacecraft communication.',
      'Understand that seeing a distant object means seeing its past.',
    ],
  },
  durationMin: 25,
  prerequisites: { vi: 'Vận tốc, quãng đường, thời gian; luỹ thừa của 10.', en: 'Speed, distance and time; powers of ten.' },
  background: [
    {
      title: { vi: 'Nhanh nhất nhưng không tức thời', en: 'The fastest, but not instantaneous' },
      body: {
        vi: 'Ánh sáng nhanh tới mức trong đời sống hằng ngày nó có vẻ tức thời: mỗi giây nó đi được khoảng 7,5 vòng quanh xích đạo Trái Đất. Nhưng ở thang thiên văn, thời gian truyền sáng trở nên đáng kể: vài giây tới Mặt Trăng, vài phút tới Mặt Trời và các hành tinh trong, vài giờ tới rìa Hệ Mặt Trời, nhiều năm tới các sao gần nhất. Mô-đun F3 “bắn” một tia sáng đi với đúng tốc độ thật, có thể tua nhanh, qua những khoảng cách đó.',
        en: 'Light is so fast that in daily life it seems instantaneous: every second it travels about 7.5 times around Earth’s equator. On astronomical scales, however, the travel time becomes significant: seconds to the Moon, minutes to the Sun and inner planets, hours to the edge of the Solar System and years to the nearest stars. Module F3 “fires” a light beam at the true speed, with optional fast-forward, across those distances.',
      },
    },
    {
      title: { vi: '1. Một hằng số được định nghĩa chính xác', en: '1. An exactly defined constant' },
      body: {
        vi: 'Từ năm 1983, mét được định nghĩa thông qua tốc độ ánh sáng, nên $c = 299\\,792\\,458$ m/s là **chính xác**, không có sai số đo. Thời gian để ánh sáng đi hết quãng đường $d$ trong chân không là\n\n$$t = \\frac{d}{c}.$$\n\nĐơn vị thiên văn được IAU (2012) định nghĩa chính xác là $1\\ \\text{au} = 149\\,597\\,870\\,700$ m, nên ánh sáng đi 1 au mất 499,004784 s (khoảng 8 phút 19 giây). Một năm ánh sáng là quãng đường ánh sáng đi trong một năm Julius (365,25 ngày); một parsec bằng khoảng 3,2616 năm ánh sáng.',
        en: 'Since 1983 the metre has been defined through the speed of light, so $c = 299\\,792\\,458$ m/s is **exact**, with no measurement uncertainty. The time for light to cover a distance $d$ in vacuum is\n\n$$t = \\frac{d}{c}.$$\n\nThe astronomical unit is defined exactly by the IAU (2012) as $1\\ \\text{au} = 149\\,597\\,870\\,700$ m, so light crosses 1 au in 499.004784 s (about 8 min 19 s). A light-year is the distance light travels in one Julian year (365.25 days); a parsec is about 3.2616 light-years.',
      },
    },
    {
      title: { vi: '2. Khoảng cách thay đổi từng ngày', en: '2. Distances that change every day' },
      body: {
        vi: 'Quỹ đạo của Mặt Trăng và các hành tinh là elip và các vật chuyển động không ngừng, nên thời gian ánh sáng thay đổi theo ngày:\n\n- Mặt Trăng: khoảng 1,19–1,36 giây (cận điểm – viễn điểm). Các nhà khoa học đo khoảng cách Mặt Trăng tới cỡ milimét bằng cách bắn laser vào gương phản xạ do các sứ mệnh Apollo để lại và đo thời gian khứ hồi khoảng 2,5 giây.\n- Mặt Trời: khoảng 490–508 giây (cận nhật đầu tháng 1, viễn nhật đầu tháng 7).\n- Sao Hoả: khoảng 3 tới hơn 22 phút một chiều, tuỳ vị trí tương đối của hai hành tinh.\n\nMô-đun tính các khoảng cách này **cho ngày hôm nay** từ cùng lịch thiên văn với A3 và E1.',
        en: 'The orbits of the Moon and planets are ellipses and the bodies are always moving, so light times change from day to day:\n\n- Moon: about 1.19–1.36 s (perigee – apogee). Scientists measure the Moon’s distance to the millimetre by firing lasers at retroreflectors left by the Apollo missions and timing the ≈ 2.5 s round trip.\n- Sun: about 490–508 s (perihelion in early January, aphelion in early July).\n- Mars: from about 3 to more than 22 minutes one way, depending on where the two planets are.\n\nThe module computes these distances **for today** from the same ephemerides as A3 and E1.',
      },
    },
    {
      title: { vi: '3. Nhìn xa là nhìn về quá khứ', en: '3. Looking far is looking back' },
      body: {
        vi: `Ánh sáng từ Proxima Centauri (cách 4,25 năm ánh sáng) mà ta thấy tối nay đã rời ngôi sao hơn bốn năm trước. Ánh sáng từ tâm Ngân Hà xuất phát khoảng 26 700 năm trước; từ thiên hà Andromeda (khoảng 2,56 triệu năm ánh sáng), từ trước khi những công cụ đá đầu tiên của tổ tiên loài người được chế tác. Ở những khoảng cách lớn hơn, sự giãn nở của vũ trụ phải được tính tới${refF('; mô-đun F4 tiếp tục hành trình tới ánh sáng cổ nhất mà ta quan sát được')}.`,
        en: `Light from Proxima Centauri (4.25 light-years away) seen tonight left the star more than four years ago. Light from the Galactic Centre set out about 26,700 years ago; from the Andromeda Galaxy (about 2.56 million light-years), before the first stone tools of human ancestors were made. At greater distances cosmic expansion must be taken into account${refF('; module F4 continues the journey to the oldest light we can observe')}.`,
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Khứ hồi tới Mặt Trăng', en: 'Experiment 1 - A round trip to the Moon' }, text: { vi: 'Bật “Khứ hồi” ở tốc độ 1×. Tia sáng quay lại sau bao lâu? So với $2d/c$ dùng khoảng cách Mặt Trăng hôm nay trong bảng số liệu.', en: 'Turn on “Round trip” at 1×. How long until the light returns? Compare with $2d/c$ using today’s Moon distance in the readouts.' }, params: { s: 'moon', rt: true, sp: 0 } },
    { title: { vi: 'Thử nghiệm 2 - Lái xe trên Sao Hoả', en: 'Experiment 2 - Driving on Mars' }, text: { vi: 'Đọc bảng tín hiệu tới các hành tinh. Nếu xe tự hành gửi về ảnh một tảng đá phía trước, sớm nhất bao lâu sau nó mới nhận được lệnh “dừng lại”?', en: 'Read the table of signal times. If a rover sends a picture of a rock ahead, how soon at the earliest can it receive the “stop” command?' }, params: { s: 'inner' } },
    { title: { vi: 'Thử nghiệm 3 - Tới rìa Hệ Mặt Trời', en: 'Experiment 3 - To the edge of the Solar System' }, text: { vi: 'Chọn “Hệ Mặt Trời” với tốc độ 1 giờ/giây. Ghi lại thời điểm tia sáng đi qua từng hành tinh. Vì sao thứ tự đi qua chính là thứ tự khoảng cách tới Mặt Trời?', en: 'Choose “Solar System” at 1 h/s. Note when the beam passes each planet. Why is the order of passing exactly the order of distance from the Sun?' }, params: { s: 'outer', sp: 4 } },
    { title: { vi: 'Thử nghiệm 4 - Hai triệu rưỡi năm', en: 'Experiment 4 - Two and a half million years' }, text: { vi: 'Chọn “Thiên hà”. Vì sao trục được vẽ theo thang logarit? Ước lượng: nếu vẽ tuyến tính, tâm Ngân Hà sẽ nằm ở đâu so với Andromeda?', en: 'Choose “Galaxies”. Why is the axis logarithmic? Estimate where the Galactic Centre would sit relative to Andromeda on a linear axis.' }, params: { s: 'galaxy' } },
  ],
  quiz: [
    { q: { vi: 'Ánh sáng Mặt Trời tới Trái Đất mất khoảng:', en: 'Sunlight reaches Earth in about:' }, options: [{ vi: '8 phút 19 giây', en: '8 min 19 s' }, { vi: '8 giây', en: '8 s' }, { vi: '8 giờ', en: '8 h' }], answer: 0, explain: { vi: '$1\\ \\text{au}/c = 499{,}005$ s.', en: '$1\\ \\text{au}/c = 499.005$ s.' } },
    { q: { vi: 'Vì sao thời gian tín hiệu tới Sao Hoả thay đổi từ khoảng 3 tới 22 phút?', en: 'Why does the signal time to Mars range from about 3 to 22 minutes?' }, options: [{ vi: 'Khoảng cách Trái Đất – Sao Hoả thay đổi khi hai hành tinh quay quanh Mặt Trời', en: 'The Earth–Mars distance changes as both orbit the Sun' }, { vi: 'Tốc độ ánh sáng thay đổi', en: 'The speed of light changes' }, { vi: 'Khí quyển Sao Hoả làm chậm tín hiệu', en: 'Mars’s atmosphere slows the signal' }], answer: 0, explain: { vi: '$c$ không đổi trong chân không; chỉ khoảng cách thay đổi.', en: '$c$ is constant in vacuum; only the distance changes.' } },
    { q: { vi: 'Một parsec xấp xỉ bằng:', en: 'One parsec is approximately:' }, options: [{ vi: '3,26 năm ánh sáng', en: '3.26 light-years' }, { vi: '1 năm ánh sáng', en: '1 light-year' }, { vi: '206 265 năm ánh sáng', en: '206,265 light-years' }], answer: 0, explain: { vi: '1 pc = 206 265 au ≈ 3,2616 năm ánh sáng.', en: '1 pc = 206,265 au ≈ 3.2616 light-years.' } },
  ],
  instructor: {
    vi: 'Nguồn gốc: phát triển từ mô phỏng “Speed of light” của lss-lab (github.com/MinhMPA/lss-lab). Khác bản gốc: khoảng cách trong Hệ Mặt Trời theo lịch thiên văn ngày hôm nay; khoảng cách sao và thiên hà theo các phép đo đã công bố (Gaia DR3, Hipparcos, GRAVITY, Pietrzyński et al. 2019, McConnachie et al. 2005).',
    en: 'Origin: developed from lss-lab’s “Speed of light” (github.com/MinhMPA/lss-lab). Unlike the original, Solar System distances follow today’s ephemerides; stellar and galactic distances use published measurements (Gaia DR3, Hipparcos, GRAVITY, Pietrzyński et al. 2019, McConnachie et al. 2005).',
  },
};

/** Model Card · F3. Figures reproduced by packages/sim-core/test/lighttime-f3.test.ts. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Thời gian ánh sáng', en: 'Level A - Light-travel times' },
      body: { vi: 'Thời gian ánh sáng $t = d/c$ với $c$ chính xác; khoảng cách Mặt Trăng, Mặt Trời và hành tinh từ lịch thiên văn tại ngày hôm nay; khoảng cách sao và thiên hà từ các phép đo có trích dẫn.', en: 'Light times $t = d/c$ with exact $c$; Moon, Sun and planet distances from ephemerides for today; stellar and galactic distances from cited measurements.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Hình vẽ', en: 'Level C - Drawing' },
      body: { vi: 'Các thiên thể được xếp trên một đường thẳng theo khoảng cách hôm nay, không theo hướng thật. Cảnh Mặt Trăng đúng tỉ lệ cả kích thước lẫn khoảng cách; các cảnh khác phóng to kích thước; cảnh thiên hà dùng trục logarit.', en: 'Bodies are placed on one line by today’s distance, not by their true directions. The Moon scene is to scale in both size and distance; other scenes enlarge sizes; the galaxy scene uses a logarithmic axis.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Thời gian ánh sáng và đơn vị', en: '1. Light time and units' },
      tex: ['t=\\frac dc,\\qquad c=299\\,792\\,458\\ \\mathrm{m\\,s^{-1}}', '1\\ \\mathrm{au}=149\\,597\\,870\\,700\\ \\mathrm m,\\qquad 1\\ \\mathrm{pc}=\\frac{648\\,000}{\\pi}\\ \\mathrm{au},\\qquad 1\\ \\mathrm{ly}=c\\times365.25\\ \\mathrm d'],
      body: {
        vi: 'Trong đó $d$ là khoảng cách hình học giữa tâm hai thiên thể. Bỏ qua hiệu chỉnh thời gian ánh sáng trong lịch thiên văn (vị trí tại thời điểm phát, sai khác tương đối $< 10^{-4}$) và trễ Shapiro (cỡ vài chục micro giây trong Hệ Mặt Trời).',
        en: '$d$ is the geometric centre-to-centre distance. The light-time correction of the ephemeris (position at emission time, relative effect $< 10^{-4}$) and the Shapiro delay (tens of microseconds within the Solar System) are ignored.',
      },
    },
    {
      title: { vi: '2. Nguồn khoảng cách', en: '2. Distance sources' },
      tex: ['d_{\\star}=\\frac{1\\ \\mathrm{pc}}{\\varpi\\,[\\mathrm{arcsec}]}'],
      body: {
        vi: 'Mặt Trăng: lý thuyết Meeus (ch. 47) như A3. Mặt Trời và hành tinh: phần tử trung bình JPL (Standish) như E1. Proxima Centauri: thị sai Gaia DR3 $\\varpi = 768{,}0665$ mas (4,2465 năm ánh sáng). Sirius: Hipparcos 379,21 mas (van Leeuwen 2007). Tâm Ngân Hà: $R_0 = 8\\,178$ pc (GRAVITY Collaboration 2019). Đám Mây Magellan Lớn: 49,59 kpc (Pietrzyński et al. 2019). Andromeda: 785 ± 25 kpc (McConnachie et al. 2005). Với vài triệu năm ánh sáng, khác biệt giữa các định nghĩa khoảng cách vũ trụ học là không đáng kể.',
        en: 'Moon: Meeus theory (ch. 47) as in A3. Sun and planets: JPL mean elements (Standish) as in E1. Proxima Centauri: Gaia DR3 parallax $\\varpi = 768.0665$ mas (4.2465 ly). Sirius: Hipparcos 379.21 mas (van Leeuwen 2007). Galactic Centre: $R_0 = 8,178$ pc (GRAVITY Collaboration 2019). Large Magellanic Cloud: 49.59 kpc (Pietrzyński et al. 2019). Andromeda: 785 ± 25 kpc (McConnachie et al. 2005). At a few million light-years the differences between cosmological distance definitions are negligible.',
      },
    },
  ],
  assumptions: {
    vi: ['Ánh sáng truyền trong chân không theo đường thẳng.', 'Ngày tính là ngày theo đồng hồ của thiết bị.'],
    en: ['Light travels in vacuum along straight lines.', 'The date is taken from the device clock.'],
  },
  validity: { vi: ['Khoảng cách Hệ Mặt Trời hợp lệ 1800–2050 (theo E1).'], en: ['Solar System distances valid 1800–2050 (as in E1).'] },
  scope: { vi: 'Sai số của thời gian ánh sáng bằng sai số tương đối của khoảng cách đầu vào.', en: 'The light-time error equals the relative error of the input distance.' },
  validationText: {
    vi: `Ngưỡng khoá trong \`packages/sim-core/test/lighttime-f3.test.ts\`.

- 1 au → 499,004784 s.
- Trong năm 2026: Mặt Trăng 1,19–1,36 s; Mặt Trời 490–508 s (lấy mẫu mỗi 12 giờ).
- Trái Đất – Sao Hoả luôn trong 3–23 phút một chiều (800 ngày từ 1/1/2026); Mặt Trời – Sao Hải Vương 4,0–4,25 giờ.
- Proxima Centauri 4,2465 năm ánh sáng; Andromeda 2,56 triệu năm ánh sáng (từ các khoảng cách đã trích dẫn).`,
    en: `Thresholds locked in \`packages/sim-core/test/lighttime-f3.test.ts\`.

- 1 au → 499.004784 s.
- Over 2026: Moon 1.19–1.36 s; Sun 490–508 s (sampled every 12 h).
- Earth – Mars always within 3–23 min one way (800 days from 2026-01-01); Sun – Neptune 4.0–4.25 h.
- Proxima Centauri 4.2465 ly; Andromeda 2.56 million ly (from the cited distances).`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Vị trí hành tinh có sai số cỡ $10^{-4}$ au (phần tử trung bình).', 'Không vẽ hướng thật của các thiên thể; không có tàu vũ trụ cụ thể.'],
    en: ['Planet positions carry errors of order $10^{-4}$ au (mean elements).', 'True directions are not drawn; no specific spacecraft.'],
  },
  references: [
    'BIPM (2019). The International System of Units (SI), 9th ed.',
    'IAU (2012). Resolution B2: re-definition of the astronomical unit of length.',
    'Gaia Collaboration, Vallenari, A. et al. (2023). Gaia Data Release 3. A&A 674, A1.',
    'van Leeuwen, F. (2007). Validation of the new Hipparcos reduction. A&A 474, 653.',
    'GRAVITY Collaboration (2019). A geometric distance measurement to the Galactic center black hole with 0.3% uncertainty. A&A 625, L10.',
    'Pietrzyński, G. et al. (2019). A distance to the Large Magellanic Cloud that is precise to one per cent. Nature 567, 200.',
    'McConnachie, A. W. et al. (2005). Distances and metallicities for 17 Local Group galaxies. MNRAS 356, 979.',
    'Meeus, J. (1998). Astronomical Algorithms, 2nd ed. Willmann-Bell.',
    'lss-lab - Speed of light (github.com/MinhMPA/lss-lab).',
  ],
};
