import type { ReactNode } from 'react';
import { useT, type L } from '../i18n';
import { FidelityBadge } from '../components/FidelityBadge';
import { useSettings, type Quality } from '../store/settings';
import { Segmented } from '../components/Controls';
import { MathText } from '../components/Tex';
import { SiteFooter, CLUB_EMAIL, CLUB_FANPAGE } from '../components/SiteFooter';
import { MODULES, GROUPS } from '../modules/registry';
import { ASTROSPHERE_URL } from '../modules/images';
import { PHYSICS_TESTS } from './Home';

/** Paragraph with **bold** and $TeX$ support. */
function P({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return <p>{parts.map((s, i) => (s.startsWith('**') ? <strong key={i}><MathText text={s.slice(2, -2)} /></strong> : <MathText key={i} text={s} />))}</p>;
}

/** Number of reproducible reports in docs/validation (one per `npm run validate:*` output file). */
const VALIDATION_REPORTS = 17;

const IMAGE_CREDITS: { href: string; caption: L; credit: string; license: string }[] = [
  { href: 'https://commons.wikimedia.org/wiki/File:The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg', caption: { vi: 'Mặt Trời ở bước sóng cực tím - SDO/AIA, ngày 19/8/2010, màu giả', en: 'The Sun in extreme ultraviolet - SDO/AIA, 19 Aug 2010, false colour' }, credit: 'NASA/SDO (AIA)', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg', caption: { vi: 'Trăng tròn - ảnh chụp qua kính thiên văn, năm 2010', en: 'Full Moon - photographed through a telescope, 2010' }, credit: 'Gregory H. Revera', license: 'CC BY-SA 3.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Kepler186f-ArtistConcept-20140417.jpg', caption: { vi: 'Kepler-186f - tranh minh họa của họa sĩ, không phải ảnh chụp', en: 'Kepler-186f - artist’s concept, not a photograph' }, credit: 'NASA Ames/SETI Institute/JPL-Caltech', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:RS_Puppis.jpg', caption: { vi: 'RS Puppis - sao Cepheid có chu kỳ 41,4 ngày và tiếng vọng ánh sáng trong bụi, ảnh Hubble', en: 'RS Puppis - a 41.4-day Cepheid with a light echo in dust, Hubble image' }, credit: 'NASA/ESA/Hubble Heritage (STScI/AURA)', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Kepler186f-ComparisonGraphic-20140417.jpg', caption: { vi: 'Vùng sinh sống được của Kepler-186 so với Hệ Mặt Trời - đồ họa so sánh theo tỷ lệ', en: 'Habitable zone of Kepler-186 compared with the Solar System - to-scale comparison graphic' }, credit: 'NASA Ames/SETI Institute/JPL-Caltech', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Lspn_comet_halley.jpg', caption: { vi: 'Sao chổi Halley ngày 8/3/1986 - độ lệch tâm quỹ đạo e = 0,967, chu kỳ khoảng 76 năm', en: 'Comet Halley on 8 Mar 1986 - orbital eccentricity e = 0.967, period about 76 years' }, credit: 'NASA/W. Liller', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:OSIRIS_Mars_true_color.jpg', caption: { vi: 'Sao Hỏa màu thật - ảnh từ thiết bị OSIRIS trên tàu Rosetta, năm 2007', en: 'Mars in true colour - OSIRIS on Rosetta, 2007' }, credit: 'ESA & MPS for OSIRIS Team', license: 'CC BY-SA 3.0 IGO' },
  { href: 'https://commons.wikimedia.org/wiki/File:Saturn_during_Equinox.jpg', caption: { vi: 'Sao Thổ trong kỳ phân điểm năm 2008 - Cassini; Telesto và Calypso nằm tại L4/L5 của Tethys', en: 'Saturn at the 2008 equinox - Cassini; Telesto and Calypso sit at Tethys’s L4/L5' }, credit: 'NASA/JPL/Space Science Institute', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Antennae_galaxies_xl.jpg', caption: { vi: 'Thiên hà Râu NGC 4038/4039 đang va chạm - ảnh Hubble', en: 'The colliding Antennae galaxies NGC 4038/4039 - Hubble image' }, credit: 'NASA, ESA, Hubble Heritage Team (STScI/AURA)', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Top_of_Atmosphere.jpg', caption: { vi: 'Thượng tầng khí quyển nhìn từ ISS - bối cảnh độ cao hình thành muon do tia vũ trụ', en: 'Upper atmosphere seen from the ISS - the altitude where cosmic-ray muons form' }, credit: 'NASA Earth Observatory', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg', caption: { vi: 'Tinh vân Lạp Hộ - ảnh ghép Hubble; ánh sáng đến từ một vùng có thời gian truyền ánh sáng khoảng 1.350 năm', en: 'Orion Nebula - Hubble mosaic; its light has travelled about 1,350 years' }, credit: 'NASA, ESA, M. Robberto (STScI/ESA), Hubble Orion Treasury Team', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:ESO-VLT-Laser-phot-33a-07.jpg', caption: { vi: 'Dải Ngân Hà trên kính thiên văn VLT, Chile', en: 'The Milky Way over the VLT, Chile' }, credit: 'ESO/Y. Beletsky', license: 'CC BY 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:GPS_Satellite_NASA_art-iif.jpg', caption: { vi: 'Vệ tinh GPS Block IIF - hình minh họa', en: 'GPS Block IIF satellite - illustration' }, credit: 'NASA', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Mercury_in_color_-_Prockter07-edit1.jpg', caption: { vi: 'Sao Thủy - ảnh màu tăng cường từ MESSENGER; liên hệ với chuyển động cận nhật tiến', en: 'Mercury - enhanced-colour MESSENGER image; linked to perihelion precession' }, credit: 'NASA/JHU APL/Carnegie Institution of Washington', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Black_hole_-_Messier_87_crop_max_res.jpg', caption: { vi: 'Bóng lỗ đen M87* - ảnh đầu tiên do Event Horizon Telescope công bố năm 2019', en: 'The shadow of M87* - the first Event Horizon Telescope image, 2019' }, credit: 'Event Horizon Telescope Collaboration', license: 'CC BY 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:A_Horseshoe_Einstein_Ring_from_Hubble.JPG', caption: { vi: '“Móng ngựa vũ trụ” LRG 3-757 - vòng Einstein gần trọn vẹn, ảnh Hubble', en: 'The “Cosmic Horseshoe” LRG 3-757 - a nearly complete Einstein ring, Hubble image' }, credit: 'ESA/Hubble & NASA', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:NASA-HS201427a-HubbleUltraDeepField2014-20140603.jpg', caption: { vi: 'Hubble Ultra Deep Field 2014 - trường ảnh chứa khoảng 10.000 thiên hà', en: 'Hubble Ultra Deep Field 2014 - a field of about 10,000 galaxies' }, credit: 'NASA, ESA, H. Teplitz & M. Rafelski (IPAC/Caltech), A. Koekemoer (STScI), R. Windhorst (ASU), Z. Levay (STScI)', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg', caption: { vi: '“Viên bi xanh” - Trái Đất nhìn từ tàu Apollo 17, ngày 7/12/1972', en: '“The Blue Marble” - Earth from Apollo 17, 7 Dec 1972' }, credit: 'NASA/Apollo 17 crew', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Crab_Nebula_in_Multiple_Wavelengths.png', caption: { vi: 'Tinh vân Con Cua ở sáu vùng phổ - ảnh ghép màu giả', en: 'The Crab Nebula in six bands - false-colour composite' }, credit: 'NRAO/AUI, NASA/JPL-Caltech/R. Gehrz, NASA/ESA/J. Hester & A. Loll, NASA/Swift, NASA/CXC/SAO, NASA/DOE/Fermi LAT; ghép bởi Torres997', license: 'CC BY-SA 3.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Lightning_over_Oradea_Romania_2.jpg', caption: { vi: 'Sét trên ngoại ô Oradea, Romania, ngày 17/8/2005', en: 'Lightning over Oradea, Romania, 17 Aug 2005' }, credit: 'Mircea Madau', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Apollo_11_Lunar_Laser_Ranging_Experiment.jpg', caption: { vi: 'Gương phản xạ laser Apollo 11 trên Mặt Trăng', en: 'Apollo 11 laser retroreflector on the Moon' }, credit: 'NASA', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:WMAP_2012.png', caption: { vi: 'Nền vi sóng vũ trụ - bản đồ 9 năm của WMAP', en: 'Cosmic microwave background - WMAP 9-year map' }, credit: 'NASA / WMAP Science Team', license: 'Public Domain' },
  { href: 'https://commons.wikimedia.org/wiki/File:Cosmic_web.jpg', caption: { vi: 'Mạng lưới vật chất tối trong mô phỏng Millennium', en: 'The dark-matter web of the Millennium Simulation' }, credit: 'Volker Springel / Max Planck Institute for Astrophysics', license: 'CC BY-SA 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:The_FLAMINGO_project_%E2%80%93_cosmological_hydrodynamical_simulations_for_large-scale_structure_and_galaxy_cluster_surveys.jpg', caption: { vi: 'Lát 40 Mpc qua mô phỏng FLAMINGO', en: 'A 40 Mpc slice through the FLAMINGO simulation' }, credit: 'Schaye, Kugel, Schaller, Helly et al. (MNRAS 526, 4978)', license: 'CC BY 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Supernova_1994D_in_Galaxy_NGC_4526_(1999-19-813).jpg', caption: { vi: 'Siêu tân tinh Ia 1994D trong thiên hà NGC 4526', en: 'Type Ia supernova 1994D in NGC 4526' }, credit: 'NASA, ESA, The Hubble Key Project Team and The High-Z Supernova Search Team', license: 'Public Domain' },
  { href: 'https://www.solarsystemscope.com/textures/', caption: { vi: 'Bản đồ bề mặt 3D của Mặt Trời, các hành tinh, Mặt Trăng và vành Sao Thổ', en: '3D surface maps of the Sun, planets, Moon and Saturn’s rings' }, credit: 'Solar System Scope (dựa trên dữ liệu NASA)', license: 'CC BY 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:ESO_-_Milky_Way.jpg', caption: { vi: 'Toàn cảnh Ngân Hà - ảnh nền bầu trời sử dụng trong các mô phỏng', en: 'Milky Way panorama - sky backdrop used in the simulators' }, credit: 'ESO/S. Brunier', license: 'CC BY 4.0' },
];

/**
 * Headline validation results. Every figure is copied from a reproducible report in docs/validation
 * (`npm run validate`) - update them together.
 */
const HIGHLIGHTS: { code: string; what: L; ref: L; result: L }[] = [
  { code: 'A1', what: { vi: 'Vị trí biểu kiến của Mặt Trời, 1990–2040 (494 thời điểm)', en: 'Apparent position of the Sun, 1990–2040 (494 epochs)' }, ref: { vi: 'JPL Horizons DE441', en: 'JPL Horizons DE441' }, result: { vi: "RMS $13''$, lớn nhất $34''$", en: "RMS $13''$, max $34''$" } },
  { code: 'A3', what: { vi: 'Thời điểm trăng non, trăng tròn và hai pha bán nguyệt (1 533 pha)', en: 'Times of new, full and quarter moons (1,533 phases)' }, ref: { vi: 'JPL Horizons DE441', en: 'JPL Horizons DE441' }, result: { vi: 'trung vị 3 s, lớn nhất 17 s', en: 'median 3 s, max 17 s' } },
  { code: 'E1', what: { vi: 'Vị trí nhật tâm của Sao Thuỷ, 1980–2050 (góc lệch)', en: 'Heliocentric position of Mercury, 1980–2050 (angular offset)' }, ref: { vi: 'JPL Horizons DE441', en: 'JPL Horizons DE441' }, result: { vi: "RMS $8''$", en: "RMS $8''$" } },
  { code: 'B4', what: { vi: 'Năng lượng hệ Mặt Trời – Sao Mộc – Sao Thổ sau 1 000 năm (Yoshida bậc 4)', en: 'Sun–Jupiter–Saturn energy after 1,000 years (4th-order Yoshida)' }, ref: { vi: 'Bảo toàn năng lượng', en: 'Energy conservation' }, result: { vi: '$|\\Delta E/E| = 2{,}3\\times10^{-11}$', en: '$|\\Delta E/E| = 2.3\\times10^{-11}$' } },
  { code: 'D2', what: { vi: 'Tiến động cận điểm từ tích phân đường trắc địa (6 quỹ đạo, tới $e = 0{,}6$)', en: 'Periapsis advance from geodesic integration (6 orbits, up to $e = 0.6$)' }, ref: { vi: 'Nghiệm chính xác qua tích phân elliptic', en: 'Exact elliptic-integral solution' }, result: { vi: 'sai lệch tương đối $\\le 5{,}4\\times10^{-11}$', en: 'relative error $\\le 5.4\\times10^{-11}$' } },
  { code: 'D3', what: { vi: 'Bán kính góc của bóng lỗ đen do shader dò tia tính', en: 'Angular radius of the black-hole shadow from the ray-tracing shader' }, ref: { vi: 'Công thức Synge (1966)', en: 'Synge (1966) formula' }, result: { vi: 'sai lệch tương đối $\\le 2{,}8\\times10^{-5}$', en: 'relative error $\\le 2.8\\times10^{-5}$' } },
  { code: 'D5', what: { vi: 'Độ phóng đại của nguồn có kích thước hữu hạn ($\\rho = 0{,}1$, thẳng hàng)', en: 'Finite-source magnification ($\\rho = 0.1$, aligned)' }, ref: { vi: 'Nghiệm giải tích $\\sqrt{1 + 4/\\rho^2}$', en: 'Analytic $\\sqrt{1 + 4/\\rho^2}$' }, result: { vi: '$20{,}0251$ so với $20{,}0250$', en: '$20.0251$ vs $20.0250$' } },
  { code: 'F8', what: { vi: 'Mật độ vật chất $\\Omega_m$ từ 580 siêu tân tinh Ia (ΛCDM phẳng, chỉ sai số thống kê)', en: 'Matter density $\\Omega_m$ from 580 SNe Ia (flat ΛCDM, statistical errors only)' }, ref: { vi: 'Dữ liệu Union2.1 (Suzuki et al. 2012)', en: 'Union2.1 data (Suzuki et al. 2012)' }, result: { vi: '$\\Omega_m = 0{,}278 \\pm 0{,}020$', en: '$\\Omega_m = 0.278 \\pm 0.020$' } },
];

const SOURCES: { name: ReactNode; text: L }[] = [
  { name: <>JPL Horizons (DE441)</>, text: { vi: 'lịch thiên văn chuẩn dùng làm giá trị tham chiếu cho Mặt Trời, Mặt Trăng và tám hành tinh trong các báo cáo kiểm chứng A1, A3 và E1.', en: 'the reference ephemeris for the Sun, Moon and eight planets in the A1, A3 and E1 validation reports.' } },
  { name: <>E. M. Standish, <i>Keplerian Elements for Approximate Positions of the Major Planets</i> (JPL)</>, text: { vi: 'phần tử quỹ đạo gần đúng của các hành tinh, hiệu lực 1800–2050.', en: 'approximate planetary orbital elements, valid 1800–2050.' } },
  { name: <>J. Meeus, <i>Astronomical Algorithms</i>, 2nd ed. (Willmann-Bell, 1998)</>, text: { vi: 'thuật toán vị trí Mặt Trời, pha Mặt Trăng, thời gian sao và khúc xạ khí quyển.', en: 'algorithms for the Sun’s position, lunar phases, sidereal time and atmospheric refraction.' } },
  { name: <><i>The Astronomical Almanac</i></>, text: { vi: 'chuỗi lượng giác độ chính xác thấp cho vị trí Mặt Trăng.', en: 'low-precision trigonometric series for the Moon’s position.' } },
  { name: <>D. Hoffleit &amp; W. H. Warren, <i>The Bright Star Catalogue</i>, 5th ed. (1991)</>, text: { vi: 'toạ độ J2000, cấp sao V và chỉ số màu B−V của các sao sáng.', en: 'J2000 coordinates, V magnitudes and B−V colours of bright stars.' } },
  { name: <>NASA Exoplanet Archive</>, text: { vi: 'thông số các hệ ngoại hành tinh đã xác nhận (bảng pscomppars).', en: 'parameters of confirmed exoplanet systems (pscomppars table).' } },
  { name: <>NASA Planetary Fact Sheet</>, text: { vi: 'các đặc trưng vật lý cơ bản của hành tinh.', en: 'basic physical properties of the planets.' } },
  { name: <>Kopparapu et al. (2013, ApJ 765, 131; 2014, ApJL 787, L29)</>, text: { vi: 'biên vùng sinh sống được theo mô hình khí hậu một chiều.', en: 'habitable-zone limits from one-dimensional climate models.' } },
  { name: <>Planck Collaboration (2020), A&amp;A 641, A6</>, text: { vi: 'các tham số vũ trụ học Planck 2018.', en: 'the Planck 2018 cosmological parameters.' } },
  { name: <>Suzuki et al. (2012), ApJ 746, 85 - Union2.1</>, text: { vi: 'môđun khoảng cách của 580 siêu tân tinh Ia.', en: 'distance moduli of 580 Type Ia supernovae.' } },
  { name: <>CODATA 2018 · SI 2019 · IAU 2012 B2, IAU 2015 B3</>, text: { vi: 'hằng số vật lý, đơn vị thiên văn và các giá trị danh định của Mặt Trời và hành tinh.', en: 'physical constants, the astronomical unit and nominal solar and planetary values.' } },
];

const GROUP_COLOR: Record<string, string> = { A: 'var(--grpA)', B: 'var(--grpB)', C: 'var(--grpC)', D: 'var(--grpD)', E: 'var(--grpE)', F: 'var(--grpF)' };

export function About() {
  const { t, tx, lang } = useT();
  const { quality, set } = useSettings();
  const T = (l: L) => <P>{tx(l)}</P>;
  const ready = MODULES.filter((m) => m.ready);
  const stats: [number | string, L][] = [
    [ready.length, { vi: 'mô phỏng đang hoạt động', en: 'live simulations' }],
    [GROUPS.length, { vi: 'nhóm chủ đề', en: 'topic groups' }],
    [PHYSICS_TESTS, { vi: 'phép kiểm thử vật lý', en: 'physics tests' }],
    [VALIDATION_REPORTS, { vi: 'báo cáo kiểm chứng tái lập', en: 'reproducible validation reports' }],
  ];
  return (
    <div className="page about">
      {/* ── Hero ── */}
      <header className="about-hero">
        <div className="hero-kicker">{tx({ vi: 'Giới thiệu', en: 'About' })}</div>
        <h1>USAC SimLab</h1>
        <div className="about-sub">{tx({ vi: 'Phòng thí nghiệm mô phỏng thiên văn học của CLB Thiên văn USAC', en: 'The astronomy simulation laboratory of the USAC Astronomy Club' })}</div>
        <p className="about-lead">{tx({ vi: 'Mỗi mô phỏng là một phòng thí nghiệm nhỏ: bạn đặt câu hỏi, thay đổi tham số, đo kết quả - và biết chính xác mô hình đang dựa trên những giả định nào.', en: 'Each simulation is a small laboratory: you ask a question, change the parameters, measure the outcome - and know exactly which assumptions the model rests on.' })}</p>
        <div className="about-stats">
          {stats.map(([n, l]) => <div key={l.en}><b>{n}</b><span>{tx(l)}</span></div>)}
        </div>
        <div className="about-cta">
          <a className="btn primary" href="#/m/b1">{tx({ vi: 'Bắt đầu với Quỹ đạo Kepler', en: 'Start with Kepler Orbits' })}</a>
          <a className="btn" href="#/">{tx({ vi: 'Xem tất cả mô phỏng', en: 'Browse all simulations' })}</a>
        </div>
      </header>

      {/* ── 1. Mission ── */}
      <h2>{tx({ vi: '1. Vì sao có USAC SimLab', en: '1. Why USAC SimLab' })}</h2>
      {T({ vi: 'Phần lớn những gì thiên văn học nghiên cứu không thể chạm tới hay nhìn trực tiếp: quỹ đạo kéo dài hàng thế kỷ, thời gian giãn ra gần vận tốc ánh sáng, ánh sáng bị bẻ cong quanh lỗ đen, cấu trúc trải dài hàng trăm triệu năm ánh sáng. Người học thường chỉ gặp những hiện tượng ấy qua phương trình và hình minh hoạ tĩnh.', en: 'Most of what astronomy studies cannot be touched or seen directly: orbits that last centuries, time dilating near the speed of light, light bending around black holes, structures spanning hundreds of millions of light-years. Learners usually meet these only through equations and static pictures.' })}
      {T({ vi: '**USAC SimLab** (USAC Astronomy Simulation Laboratory) biến các phương trình đó thành những mô hình có thể quan sát, thao tác và đo đạc ngay trên trình duyệt - miễn phí, song ngữ Việt – Anh, không cần cài đặt. Hệ thống do **Nhóm dự án Giáo dục Thiên văn và Khoa học Thực nghiệm – Câu lạc bộ Thiên văn USAC** phát triển, phục vụ học sinh, sinh viên, giáo viên và những người yêu thiên văn từ mức nhập môn tới các chủ đề chuyên sâu.', en: '**USAC SimLab** (USAC Astronomy Simulation Laboratory) turns those equations into models you can observe, manipulate and measure in the browser - free, bilingual Vietnamese–English, with nothing to install. It is developed by the **Astronomy Education and Experimental Science Project Team – USAC Astronomy Club** for students, teachers and astronomy enthusiasts, from introductory level to advanced topics.' })}
      <div className="about-grid three">
        {([
          [{ vi: 'Học khoa học từ những phép tính đáng tin cậy', en: 'Learning science from trustworthy calculations' }, { vi: 'Mỗi mô phỏng được xây dựng trên các phép tính vật lý, với công thức và hằng số đi kèm nguồn tham khảo để người học có thể tìm hiểu sâu hơn. Hình ảnh trực quan giúp những khái niệm khó trở nên dễ hình dung, nhưng điều quan trọng vẫn là các phép tính và nguyên lý vật lý đứng sau chúng.', en: 'Every simulation is built on physical calculations, with formulas and constants accompanied by references so learners can dig deeper. Visuals make difficult concepts easier to picture, but what matters most are the calculations and physical principles behind them.' }],
          [{ vi: 'Hiểu cả mô hình lẫn giới hạn của nó', en: 'Understanding a model and its limits' }, { vi: 'Trong khoa học, hiểu một kết quả cũng quan trọng như biết kết quả ấy được tạo ra bằng cách nào và có thể áp dụng đến đâu. Vì vậy, mỗi mô phỏng đều có một **Model Card** - hồ sơ trình bày các phương trình được sử dụng, những giả định của mô hình, phạm vi áp dụng, sai số đã được kiểm tra và những vấn đề chưa thể kết luận chỉ từ mô phỏng đó.', en: 'In science, understanding a result matters as much as knowing how it was produced and how far it applies. That is why every simulation has a **Model Card** - a record of the equations used, the model’s assumptions, its domain of validity, the errors that have been checked and the questions that cannot be settled by the simulation alone.' }],
          [{ vi: 'Khám phá bằng cách đặt câu hỏi và thử nghiệm', en: 'Exploring by asking questions and experimenting' }, { vi: 'Người học không chỉ quan sát một hiện tượng hay đọc kết quả có sẵn, mà còn được khuyến khích tự đặt câu hỏi, thay đổi tham số, đưa ra dự đoán và đối chiếu với kết quả thu được. Qua quá trình thử nghiệm, các khái niệm vật lý dần trở nên gần gũi và dễ hiểu hơn. Mỗi thiết lập mô phỏng cũng có thể được lưu ngay trong đường dẫn, giúp người học chia sẻ kết quả, trao đổi với bạn bè hoặc cùng khám phá một vấn đề trong lớp học.', en: 'Learners do not just watch a phenomenon or read ready-made results; they are encouraged to ask their own questions, change parameters, make predictions and compare them with what they obtain. Through experimenting, physical concepts gradually become familiar and easier to understand. Every simulation setup can also be saved right in the link, so learners can share results, discuss them with friends or explore a problem together in class.' }],
        ] as [L, L][]).map(([h, b]) => (
          <div className="about-card" key={h.en}><h3>{tx(h)}</h3><P>{tx(b)}</P></div>
        ))}
      </div>

      {/* ── 2. Content ── */}
      <h2>{tx({ vi: '2. Nội dung', en: '2. What’s inside' })}</h2>
      {T({ vi: 'Sáu nhóm chủ đề đi từ bầu trời quen thuộc tới cấu trúc lớn của vũ trụ. Mỗi mô phỏng gắn một mức trung thực khoa học (A, B hoặc C, xem mục 4).', en: 'Six topic groups lead from the familiar sky to the large-scale structure of the Universe. Every simulation carries a scientific-fidelity level (A, B or C, see section 4).' })}
      <div className="about-grid">
        {GROUPS.map((g) => {
          const mods = ready.filter((m) => m.group === g.id);
          return (
            <div className="about-card group" key={g.id} style={{ borderTopColor: GROUP_COLOR[g.id] }}>
              <div className="about-group-head"><span className="gl" style={{ background: GROUP_COLOR[g.id] }}>{g.id}</span><h3>{tx(g.title)}</h3></div>
              <p className="about-dim">{tx(g.blurb)}</p>
              <ul className="about-mods">
                {mods.map((m) => (
                  <li key={m.id}><a href={`#/m/${m.id}`}><span className="about-code">{m.code}</span>{tx(m.title)}</a> <FidelityBadge level={m.fidelity} short /></li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── 3. Learning path ── */}
      <h2>{tx({ vi: '3. Một bài học diễn ra thế nào', en: '3. How a lesson works' })}</h2>
      {T({ vi: 'Cấu trúc bài học tham khảo cách tiếp cận sư phạm của Nebraska Astronomy Applet Project (NAAP) và được phát triển thêm với hồ sơ mô hình và kiểm chứng định lượng.', en: 'The lesson structure draws on the pedagogy of the Nebraska Astronomy Applet Project (NAAP), extended with model documentation and quantitative validation.' })}
      <ol className="about-steps">
        {([
          [{ vi: 'Kiến thức nền', en: 'Background' }, { vi: 'Khái niệm, phương trình và ký hiệu cần thiết, trình bày ngắn gọn với nguồn tham khảo gốc.', en: 'The concepts, equations and notation needed, concisely and with original references.' }],
          [{ vi: 'Mô phỏng', en: 'Simulation' }, { vi: 'Thao tác trực tiếp với mô hình; số liệu đọc ra có đơn vị và hệ quy chiếu rõ ràng.', en: 'Manipulate the model directly; every readout has explicit units and frame.' }],
          [{ vi: 'Thử nghiệm', en: 'Experiments' }, { vi: 'Mỗi thử nghiệm nạp sẵn tham số và đặt một câu hỏi để dự đoán, đo và giải thích.', en: 'Each experiment preloads parameters and poses a question to predict, measure and explain.' }],
          [{ vi: 'Kiểm tra', en: 'Check' }, { vi: 'Câu hỏi trắc nghiệm có lời giải thích, giúp nhận ra chỗ còn hiểu sai.', en: 'Multiple-choice questions with explanations that expose remaining misconceptions.' }],
        ] as [L, L][]).map(([h, b], i) => (
          <li key={h.en}><span className="about-step-n">{i + 1}</span><div><strong>{tx(h)}</strong><p>{tx(b)}</p></div></li>
        ))}
      </ol>
      {T({ vi: 'Giao diện có ba cấp độ hiển thị - **khám phá**, **học sinh**, **chuyên sâu** - để cùng một mô phỏng phục vụ được lớp nhập môn lẫn người muốn đọc phương trình và sai số.', en: 'The interface has three display levels - **explore**, **student** and **advanced** - so the same simulation serves an introductory class as well as readers who want the equations and error budgets.' })}

      {/* ── 4. Fidelity ── */}
      <h2>{tx({ vi: '4. Ba mức trung thực khoa học', en: '4. Three levels of scientific fidelity' })}</h2>
      {T({ vi: 'Không phải mô phỏng nào cũng có cùng mục đích. Nhãn mức trung thực cho biết nên đọc kết quả như một phép tính chính xác, một phép tính số có sai số được kiểm soát, hay một hình minh hoạ khái niệm.', en: 'Not every simulation has the same purpose. The fidelity label tells you whether to read a result as an exact calculation, a numerical computation with controlled error, or a conceptual illustration.' })}
      <div className="about-grid three">
        {([
          ['A', { vi: 'Chính xác theo lý thuyết', en: 'Theoretically exact' }, { vi: 'Nghiệm giải tích hoặc công thức chuẩn, kiểm tra được độc lập. Ví dụ: định luật Kepler, phép biến đổi Lorentz, biên vùng sinh sống được.', en: 'Analytic solutions or standard formulas that can be checked independently. Examples: Kepler’s laws, the Lorentz transformation, habitable-zone limits.' }],
          ['B', { vi: 'Mô phỏng số có kiểm soát sai số', en: 'Numerical, with controlled error' }, { vi: 'Tích phân số với bậc hội tụ, bảo toàn và sai số được đo. Ví dụ: bài toán N vật, CR3BP, đường trắc địa, dò tia quanh lỗ đen.', en: 'Numerical integration with measured convergence order, conservation and error. Examples: N-body, the CR3BP, geodesics, black-hole ray tracing.' }],
          ['C', { vi: 'Minh hoạ khái niệm', en: 'Conceptual illustration' }, { vi: 'Hình biểu diễn giúp hiểu một ý tưởng trừu tượng nhưng không phải hình ảnh vật lý thật, ví dụ biểu đồ nhúng của không-thời gian. Luôn có nhãn rõ ràng.', en: 'A picture that helps grasp an abstract idea but is not a physical image, such as a spacetime embedding diagram. Always clearly labelled.' }],
        ] as ['A' | 'B' | 'C', L, L][]).map(([lv, h, b]) => (
          <div className="about-card" key={lv}><h3><FidelityBadge level={lv} short /> {tx(h)}</h3><P>{tx(b)}</P></div>
        ))}
      </div>

      {/* ── 5. Validation ── */}
      <h2>{tx({ vi: '5. Kiểm chứng, không chỉ minh hoạ', en: '5. Validated, not just illustrated' })}</h2>
      <p>
        {tx({ vi: 'Toàn bộ vật lý nằm trong lõi ', en: 'All physics lives in the core ' })}<code>@usac/sim-core</code>
        {tx({ vi: ' - các hàm thuần, số thực 64 bit, tách biệt khỏi giao diện. ', en: ' - pure functions in 64-bit floating point, separate from the interface. ' })}
        <strong>{PHYSICS_TESTS}</strong>
        {tx({ vi: ' phép kiểm thử tự động đối chiếu kết quả với nghiệm giải tích, định luật bảo toàn và dữ liệu tham chiếu; ', en: ' automated tests compare results with analytic solutions, conservation laws and reference data; ' })}
        <strong>{VALIDATION_REPORTS}</strong>
        {tx({ vi: ' báo cáo kiểm chứng tái lập được bằng lệnh ', en: ' validation reports can be regenerated with ' })}<code>npm run validate</code>
        {tx({ vi: ', và các con số trong Model Card được trích nguyên từ những báo cáo đó. Một số kết quả tiêu biểu:', en: ', and the figures in each Model Card are quoted directly from those reports. Selected results:' })}
      </p>
      <div className="table-scroll">
        <table>
          <thead><tr><th>{tx({ vi: 'Mã', en: 'Code' })}</th><th>{tx({ vi: 'Đại lượng kiểm chứng', en: 'Quantity checked' })}</th><th>{tx({ vi: 'Tham chiếu', en: 'Reference' })}</th><th>{tx({ vi: 'Sai lệch / kết quả', en: 'Deviation / result' })}</th></tr></thead>
          <tbody>
            {HIGHLIGHTS.filter((h) => MODULES.some((m) => m.code === h.code)).map((h) => (
              <tr key={h.code}>
                <td><a href={`#/m/${h.code.toLowerCase()}`} className="about-code">{h.code}</a></td>
                <td><MathText text={tx(h.what)} /></td>
                <td><MathText text={tx(h.ref)} /></td>
                <td className="num"><MathText text={tx(h.result)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {T({ vi: 'Vượt qua kiểm thử không có nghĩa là mô hình không có giới hạn. Độ chính xác thực tế luôn gắn với giả định và phạm vi được ghi trong Model Card của từng mô phỏng, mở bằng nút ⓘ.', en: 'Passing tests does not mean a model has no limits. Real accuracy is always tied to the assumptions and domain stated in each simulation’s Model Card, opened with the ⓘ button.' })}
      <div className="about-card">
        <h3>{tx({ vi: 'Model Card gồm những gì', en: 'What a Model Card contains' })}</h3>
        <ul>
          {(tx({ vi: 'Phương trình và phương pháp số, kèm định nghĩa mọi ký hiệu|Giả định và phạm vi hiệu lực|Kết quả kiểm chứng định lượng, trích từ báo cáo tái lập|Sai số đã biết và giới hạn của mô hình|Tài liệu tham khảo gốc', en: 'Equations and numerical methods, with every symbol defined|Assumptions and domain of validity|Quantitative validation results, quoted from reproducible reports|Known errors and limitations|Original references' })).split('|').map((x) => <li key={x}>{x}</li>)}
        </ul>
      </div>

      {/* ── 6. Sources ── */}
      <h2>{tx({ vi: '6. Dữ liệu và tài liệu tham khảo chính', en: '6. Main data and references' })}</h2>
      <ul className="about-sources">{SOURCES.map((s, i) => <li key={i}><strong>{s.name}</strong> - {tx(s.text)}</li>)}</ul>
      {T({ vi: 'Ngoài ra, mỗi mô phỏng còn dùng các công trình chuyên ngành riêng, được liệt kê đầy đủ trong mục tài liệu tham khảo của Model Card tương ứng.', en: 'Each simulation also draws on specialised literature, listed in full in the references of its Model Card.' })}

      {/* ── 7. Images ── */}
      <h2>{tx({ vi: '7. Hình ảnh thiên văn', en: '7. Astronomical images' })}</h2>
      {T({ vi: 'Ảnh trên các thẻ mô-đun được chọn từ Wikimedia Commons và các kho lưu trữ của NASA, ESA/Hubble, ESO, Event Horizon Telescope. Ảnh chỉ để tạo bối cảnh: tranh của hoạ sĩ, ảnh màu giả và ảnh màu tăng cường được ghi rõ trong chú thích, và không được dùng thay cho kết quả của mô hình.', en: 'Images on the module cards come from Wikimedia Commons and the archives of NASA, ESA/Hubble, ESO and the Event Horizon Telescope. They provide context only: artists’ concepts, false-colour and enhanced-colour images are labelled as such in the captions and are never a substitute for model results.' })}
      <div className="table-scroll">
        <table>
          <thead><tr><th>{tx({ vi: 'Hình ảnh / tài nguyên', en: 'Image / resource' })}</th><th>{tx({ vi: 'Tác giả / đơn vị', en: 'Author / organisation' })}</th><th>{tx({ vi: 'Giấy phép', en: 'Licence' })}</th></tr></thead>
          <tbody>
            {IMAGE_CREDITS.map((im) => (
              <tr key={im.href}><td><a href={im.href} target="_blank" rel="noopener">{tx(im.caption)}</a></td><td>{im.credit}</td><td>{im.license}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 8. Credits ── */}
      <h2>{tx({ vi: '8. Ghi công', en: '8. Acknowledgements' })}</h2>
      {T({ vi: 'USAC SimLab được phát triển bởi Nhóm dự án Giáo dục Thiên văn và Khoa học Thực nghiệm thuộc Câu lạc bộ Thiên văn USAC. Trong quá trình xây dựng, nhóm tham khảo các dự án giáo dục thiên văn, kế thừa một số công cụ sẵn có và sử dụng các phần mềm mã nguồn mở để phát triển hệ thống. Chúng tôi trân trọng ghi nhận những đóng góp và nguồn tài nguyên đã hỗ trợ dự án.', en: 'USAC SimLab is developed by the Astronomy Education and Experimental Science Project Team of the USAC Astronomy Club. In building it, the team drew on other astronomy-education projects, built upon some existing tools and used open-source software. We gratefully acknowledge the contributions and resources that have supported the project.' })}
      <ul className="about-sources">
        <li><strong>Nebraska Astronomy Applet Project (NAAP), University of Nebraska–Lincoln</strong> - {tx({ vi: 'nguồn tham khảo cho cách tổ chức bài học theo trình tự kiến thức nền, mô phỏng, khám phá và kiểm tra. USAC SimLab phát triển hệ thống theo định hướng riêng, không sao chép mã nguồn, hình ảnh hay văn bản của NAAP.', en: 'a reference for organising lessons as background, simulation, exploration and assessment. USAC SimLab is developed along its own lines and copies no NAAP source code, images or text.' })}</li>
        <li><strong><a href="https://github.com/MinhMPA/lss-lab" target="_blank" rel="noopener">lss-lab</a></strong> - {lang === 'vi'
          ? <>dự án do <strong>TS. Nguyễn Nhật Minh</strong>, Trưởng nhóm nghiên cứu Vật lý Thiên văn và Vũ trụ học tại <strong>Trung tâm Quốc tế Khoa học và Giáo dục Liên ngành (ICISE), Quy Nhơn</strong>, đồng thời là đồng nghiên cứu viên tại <strong>Viện Kavli Vật lý và Toán học của Vũ trụ (Kavli IPMU), Đại học Tokyo</strong>, phát triển. Một số mô-đun thuộc nhóm F của USAC SimLab được phát triển dựa trên bộ công cụ này. Trong quá trình tích hợp, nhóm xây dựng lại giao diện và chuyển phần tính toán vật lý vào lõi có kiểm thử. Nguồn gốc và những thay đổi của từng mô-đun được ghi rõ trong Model Card tương ứng.</>
          : <>a project developed by <strong>Dr. Nguyen Nhat Minh</strong>, head of the Astrophysics and Cosmology research group at the <strong>International Centre for Interdisciplinary Science and Education (ICISE), Quy Nhon</strong>, and associate researcher at the <strong>Kavli Institute for the Physics and Mathematics of the Universe (Kavli IPMU), University of Tokyo</strong>. Several F-group modules of USAC SimLab are developed from this toolkit. During integration the team rebuilt the interface and moved the physics into the tested core. The origin of each module and the changes made are stated in its Model Card.</>}</li>
        <li><strong>Solar System Scope</strong> - {tx({ vi: 'nguồn tài nguyên mô hình 3D về Mặt Trời, các hành tinh và Mặt Trăng được sử dụng trong dự án theo giấy phép CC BY 4.0.', en: '3D model resources of the Sun, planets and Moon, used in the project under the CC BY 4.0 licence.' })}</li>
        <li><strong>{tx({ vi: 'Các phần mềm mã nguồn mở', en: 'Open-source software' })}</strong> - {tx({ vi: 'USAC SimLab sử dụng React, three.js, React Three Fiber, KaTeX, Vite và Vitest trong quá trình xây dựng giao diện, đồ họa, hiển thị công thức và kiểm thử phần mềm.', en: 'USAC SimLab uses React, three.js, React Three Fiber, KaTeX, Vite and Vitest for its interface, graphics, formula rendering and software testing.' })}</li>
      </ul>
      {T({ vi: 'Phần mã nguồn, đồ họa và nội dung còn lại do Nhóm dự án Giáo dục Thiên văn và Khoa học Thực nghiệm thuộc CLB Thiên văn USAC nghiên cứu và phát triển. Đối với các thành phần có nguồn gốc từ dự án khác, nhóm ghi nhận xuất xứ trong phạm vi tương ứng và trình bày những thay đổi đã thực hiện nhằm bảo đảm tính minh bạch về nguồn gốc của hệ thống.', en: 'All other code, graphics and content were researched and developed by the Astronomy Education and Experimental Science Project Team of the USAC Astronomy Club. For components originating from other projects, the team acknowledges their origin within the corresponding scope and documents the changes made, so that the provenance of the system remains transparent.' })}
      {T({ vi: 'USAC SimLab cũng là kết quả của việc tiếp cận những tri thức, công trình và công cụ được cộng đồng khoa học và công nghệ chia sẻ. Chúng tôi trân trọng những đóng góp ấy và xem việc ghi công đầy đủ, tôn trọng giấy phép sử dụng và minh bạch về quá trình phát triển là một phần trong trách nhiệm của người làm khoa học.', en: 'USAC SimLab is also the result of access to knowledge, work and tools shared by the scientific and technology communities. We value these contributions and regard full acknowledgement, respect for licences and transparency about the development process as part of the responsibility of doing science.' })}

      {/* ── 9. AstroSphere ── */}
      <h2>{tx({ vi: '9. AstroSphere - mô phỏng thiên cầu', en: '9. AstroSphere - the celestial-sphere simulator' })}</h2>
      <div className="about-card">
        {T({ vi: '**AstroSphere** là dự án song hành của nhóm, tập trung vào hình học thiên cầu: hệ toạ độ xích đạo và chân trời, chuyển động nhật động của bầu trời, thiên thể mọc – lặn và vị trí các sao. AstroSphere xây trực giác về bầu trời; USAC SimLab mở rộng sang cơ học thiên thể, thuyết tương đối, vật lý thiên thể và vũ trụ học.', en: '**AstroSphere** is the team’s companion project, focused on the geometry of the celestial sphere: equatorial and horizontal coordinates, the diurnal motion of the sky, rising and setting, and star positions. AstroSphere builds intuition for the sky; USAC SimLab extends it to celestial mechanics, relativity, astrophysics and cosmology.' })}
        <p><a className="btn" href={ASTROSPHERE_URL} target="_blank" rel="noopener">{tx({ vi: 'Mở AstroSphere ↗', en: 'Open AstroSphere ↗' })}</a></p>
      </div>

      {/* ── 10. Performance ── */}
      <h2>{tx({ vi: '10. Hiệu năng', en: '10. Performance' })}</h2>
      {T({ vi: 'Trên máy cấu hình thấp, hãy bật **chế độ tiết kiệm**: độ phân giải canvas và khối lượng dò tia được giảm. Chế độ này chỉ ảnh hưởng tới độ chi tiết hình ảnh; lõi vật lý và các con số hiển thị không thay đổi.', en: 'On low-end devices, turn on **saver mode**: canvas resolution and ray-tracing workload are reduced. It only affects image detail; the physics core and the numbers shown are unchanged.' })}
      <Segmented<Quality> value={quality} onChange={(v) => set({ quality: v })} options={[{ value: 'high', label: t('qualityHigh') }, { value: 'saver', label: t('qualitySaver') }]} />

      {/* ── 11. Feedback ── */}
      <h2>{tx({ vi: '11. Góp ý và báo lỗi', en: '11. Feedback and bug reports' })}</h2>
      {T({ vi: 'Một sai sót trong công thức, một hằng số lệch, một câu giải thích chưa chuẩn - mọi phản hồi đều giúp SimLab chính xác hơn. Khi gửi, xin kèm đường dẫn mô phỏng (đường dẫn đã chứa toàn bộ tham số), mô tả điều bạn quan sát và điều bạn kỳ vọng; với vấn đề khoa học, xin kèm phương trình hoặc tài liệu đối chiếu.', en: 'An error in a formula, a wrong constant, an imprecise explanation - every report makes SimLab more accurate. Please include the simulation link (it already contains all parameters), what you observed and what you expected; for scientific issues, include the equation or a reference to compare against.' })}
      <div className="about-grid two">
        <a className="about-card about-contact" href={`mailto:${CLUB_EMAIL}`}><span>Email</span><b>{CLUB_EMAIL}</b></a>
        <a className="about-card about-contact" href={CLUB_FANPAGE} target="_blank" rel="noopener"><span>{tx({ vi: 'Fanpage CLB Thiên văn USAC', en: 'USAC Astronomy Club fanpage' })}</span><b>facebook.com/clbusac</b></a>
      </div>

      <p className="about-closing">{tx({ vi: 'Mô phỏng để khám phá - khám phá để hiểu - hiểu để tiếp tục đặt câu hỏi.', en: 'Simulate to explore - explore to understand - understand to keep asking.' })}</p>
      <SiteFooter />
    </div>
  );
}
