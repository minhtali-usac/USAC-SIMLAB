import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Xác định vị trí thật của tám hành tinh tại một ngày bất kỳ bằng chuỗi VSOP87, và so sánh với mô hình phần tử Kepler gần đúng để thấy sai số tới từ đâu.',
      'Mô tả vì sao vị trí của một vệ tinh được cho tương đối so với hành tinh mẹ, và đọc sai số đã đo của từng lý thuyết vệ tinh.',
      'Dùng hướng cực quay IAU để giải thích độ nghiêng trục, mùa, và vì sao Sao Kim, Sao Thiên Vương quay ngược.',
      'Cảm nhận quy mô thật của Hệ Mặt Trời, và tính khoảng cách, tốc độ, thời gian ánh sáng, góc ly giác của hành tinh nhìn từ Trái Đất.',
      'Quan sát bóng của vệ tinh trên hành tinh và bóng của hành tinh trên vành đai, và hiểu chúng được tính ra sao.',
    ],
    en: [
      'Determine the true positions of the eight planets on any date from the VSOP87 series, and compare them with the approximate Keplerian model to see where the error comes from.',
      'Explain why a moon’s position is given relative to its parent planet, and read the measured error of each satellite theory.',
      'Use the IAU spin axes to explain axial tilt, seasons, and why Venus and Uranus rotate backwards.',
      'Grasp the true scale of the Solar System, and compute distances, speeds, light times and elongations of the planets as seen from Earth.',
      'Watch the shadows of moons on planets and of planets on rings, and understand how they are computed.',
    ],
  },
  durationMin: 45,
  prerequisites: { vi: 'B1 - Quỹ đạo Kepler, phương trình Kepler; khái niệm đơn vị thiên văn (au) và hệ toạ độ hoàng đạo.', en: 'B1 - Kepler orbits, Kepler’s equation; the astronomical unit (au) and ecliptic coordinates.' },
  background: [
    {
      title: { vi: 'Lịch thiên văn trong trình duyệt', en: 'An ephemeris in the browser' },
      body: {
        vi: 'Lịch thiên văn hiện đại như JPL DE441 được tính bằng tích phân số toàn bộ Hệ Mặt Trời và khớp với các phép đo radar, quỹ đạo tàu vũ trụ. Để chạy nhanh trong trình duyệt, E1 dùng **công thức giải tích** thay cho tích phân số: **VSOP87** cho tám hành tinh, các lý thuyết vệ tinh của Meeus, Dourneau, Laskar-Jacobson và Emelyanov-Samorodov, và mô hình quay của IAU. Mọi số liệu được kiểm chứng với JPL Horizons; Horizons chỉ dùng để đối chiếu, không được gọi khi mô phỏng chạy.\n\nPhần mã tính các chuỗi và lý thuyết này được chuyển từ **Celestia** (phần mềm mô phỏng không gian mã nguồn mở, giấy phép GNU GPL) sang TypeScript, rồi đo lại sai số trong khuôn khổ dự án này.',
        en: 'Modern ephemerides such as JPL DE441 are numerical integrations of the whole Solar System fitted to radar ranging and spacecraft tracking. To run fast in a browser, E1 uses **analytic formulae** instead: **VSOP87** for the eight planets, the satellite theories of Meeus, Dourneau, Laskar-Jacobson and Emelyanov-Samorodov, and the IAU rotation models. Every figure is checked against JPL Horizons; Horizons is used for validation only, never queried while the simulation runs.\n\nThe code that evaluates these series and theories was ported from **Celestia** (open-source space simulation software, GNU GPL) to TypeScript, and its errors were then re-measured within this project.',
      },
    },
    {
      title: { vi: '1. VSOP87: vị trí hành tinh bằng chuỗi lượng giác', en: '1. VSOP87: planet positions as trigonometric series' },
      body: {
        vi: 'VSOP87 (Bretagnon và Francou, 1988) viết kinh độ $L$, vĩ độ $B$ và bán kính $R$ nhật tâm của mỗi hành tinh dưới dạng tổng các số hạng lượng giác, theo thời gian $t$ tính bằng thiên niên kỷ Julius kể từ J2000:\n\n$$X(t)=\\sum_{k=0}^{5}t^{k}\\sum_i A_{k,i}\\cos\\left(B_{k,i}+C_{k,i}\\,t\\right),\\qquad X\\in\\{L,B,R\\}.$$\n\nMỗi số hạng là một tương tác nhiễu loạn nhỏ giữa các hành tinh, nên chuỗi mô tả được các dao động mà phần tử Kepler tuyến tính không biểu diễn nổi. Phiên bản trong E1 là bản rút gọn (khoảng 10 000 số hạng), cho sai số **dưới 1,2″** với sáu hành tinh trong 1800–2200 (Sao Thiên Vương 2,2″, Sao Hải Vương 4,4″), thay vì tới 9′ của mô hình Kepler.\n\nLưu ý: chuỗi "Trái Đất" của VSOP87 cho **tâm Trái Đất**, không phải khối tâm Trái Đất-Mặt Trăng; hai điểm này cách nhau khoảng 4 700 km, tương ứng 6,9″ khi nhìn từ Mặt Trời.',
        en: 'VSOP87 (Bretagnon and Francou, 1988) writes the heliocentric longitude $L$, latitude $B$ and radius $R$ of each planet as a sum of trigonometric terms in the time $t$, in Julian millennia since J2000:\n\n$$X(t)=\\sum_{k=0}^{5}t^{k}\\sum_i A_{k,i}\\cos\\left(B_{k,i}+C_{k,i}\\,t\\right),\\qquad X\\in\\{L,B,R\\}.$$\n\nEach term is a small perturbation between planets, so the series captures the oscillations that linear Keplerian elements cannot. The version in E1 is truncated (about 10,000 terms) and gives errors **below 1.2″** for six planets over 1800–2200 (Uranus 2.2″, Neptune 4.4″), against up to 9′ for the Kepler model.\n\nNote: the VSOP87 "Earth" series gives the **Earth’s centre**, not the Earth-Moon barycentre; the two differ by about 4,700 km, which is 6.9″ seen from the Sun.',
      },
    },
    {
      title: { vi: '2. Mô hình Kepler gần đúng (để so sánh)', en: '2. The approximate Kepler model (for comparison)' },
      body: {
        vi: 'Chọn "Kepler gần đúng" để xem mô hình đơn giản hơn, do E. M. Standish (JPL) khớp với lịch thiên văn chính xác cho 1800–2050. Mỗi hành tinh có bán trục lớn $a$, độ lệch tâm $e$, độ nghiêng $I$, kinh độ trung bình $L$, kinh độ cận điểm $\\varpi$ và kinh độ nút lên $\\Omega$, mỗi phần tử có dạng $x(T)=x_0+\\dot x\\,T$ với $T$ là số thế kỷ Julius kể từ J2000. Từ đó\n\n$$M=L-\\varpi,\\qquad \\omega=\\varpi-\\Omega,\\qquad M=E-e\\sin E.$$\n\nPhương trình Kepler được giải bằng phương pháp Newton, rồi vị trí trong mặt phẳng quỹ đạo được quay sang hệ hoàng đạo bằng ba phép quay $R_z(\\Omega)R_x(I)R_z(\\omega)$. Vì phần tử chỉ biến thiên tuyến tính, sai số lên tới 9′ với Sao Thổ do nhiễu loạn lẫn nhau giữa các hành tinh lớn. Ở mức "Sinh viên", ô "Sai khác VSOP87 - Kepler" cho thấy chính xác khoảng cách giữa hai mô hình.',
        en: 'Choose "Approx. Kepler" to see the simpler model fitted by E. M. Standish (JPL) to the precise ephemeris for 1800–2050. Each planet has a semi-major axis $a$, eccentricity $e$, inclination $I$, mean longitude $L$, longitude of perihelion $\\varpi$ and longitude of the ascending node $\\Omega$, each of the form $x(T)=x_0+\\dot x\\,T$ with $T$ in Julian centuries since J2000. Then\n\n$$M=L-\\varpi,\\qquad \\omega=\\varpi-\\Omega,\\qquad M=E-e\\sin E.$$\n\nKepler’s equation is solved by Newton’s method, then the position in the orbital plane is rotated to the ecliptic by $R_z(\\Omega)R_x(I)R_z(\\omega)$. Because the elements only vary linearly, the error reaches 9′ for Saturn, caused by the mutual perturbations of the giant planets. At the "Student" level the "VSOP87 - Kepler difference" readout shows exactly how far apart the two models are.',
      },
    },
    {
      title: { vi: '3. Vệ tinh tự nhiên', en: '3. Natural satellites' },
      body: {
        vi: 'Vị trí vệ tinh được tính **tương đối so với hành tinh mẹ**, vì chuyển động của chúng chủ yếu do hấp dẫn của hành tinh đó. Mỗi hệ dùng một lý thuyết riêng:\n\n- **Mặt Trăng:** chuỗi Meeus chương 47 (ELP-2000/82 rút gọn), lệch tối đa **38 km** (0,006°) so với Horizons.\n- **Io, Europa, Ganymede, Callisto:** Meeus chương 44, lệch 0,1-0,19°.\n- **Mimas … Iapetus:** lý thuyết Dourneau (Meeus chương 46), lệch 0,1-0,7° (Rhea 1,1°).\n- **Ariel, Umbriel, Titania, Oberon:** GUST86 (Laskar và Jacobson), lệch 0,7-1,2°.\n- **Triton:** Emelyanov và Samorodov (2015), lệch khoảng 1,2°.\n\nKhông đưa vào: Phobos và Deimos (lý thuyết cũ lệch 4-22°), Miranda (lệch 9° do lỗi pha trong dữ liệu rút gọn) và Hyperion (chuyển động hỗn loạn, lệch 1,8°). Sai số của từng vệ tinh hiện ở ô "Sai số lý thuyết" khi chọn nó.',
        en: 'A satellite’s position is computed **relative to its parent planet**, because its motion is dominated by that planet’s gravity. Each system uses its own theory:\n\n- **Moon:** the Meeus ch. 47 series (truncated ELP-2000/82), within **38 km** (0.006°) of Horizons.\n- **Io, Europa, Ganymede, Callisto:** Meeus ch. 44, within 0.1-0.19°.\n- **Mimas … Iapetus:** Dourneau’s theory (Meeus ch. 46), within 0.1-0.7° (Rhea 1.1°).\n- **Ariel, Umbriel, Titania, Oberon:** GUST86 (Laskar and Jacobson), within 0.7-1.2°.\n- **Triton:** Emelyanov and Samorodov (2015), within about 1.2°.\n\nLeft out: Phobos and Deimos (the old theory is off by 4-22°), Miranda (off by 9° because of a phase error in the truncated data) and Hyperion (chaotic motion, off by 1.8°). Each moon’s error is shown in the "Theory error" readout when you select it.',
      },
    },
    {
      title: { vi: '4. Hướng trục quay (IAU)', en: '4. Spin axes (IAU)' },
      body: {
        vi: 'Nhóm công tác của IAU về toạ độ bản đồ và các yếu tố quay công bố, cho mỗi thiên thể, hướng **cực quay** $(\\alpha_0,\\delta_0)$ (xích kinh và xích vĩ của cực bắc trong hệ xích đạo J2000) và **kinh độ kinh tuyến gốc** $W$ theo thời gian. Từ đó ma trận chuyển từ hệ gắn với thiên thể sang hệ xích đạo là\n\n$$R=R_z(\\alpha_0+90^\\circ)\\,R_x(90^\\circ-\\delta_0)\\,R_z(W).$$\n\nE1 dùng nó để đặt đúng trục và đúng pha quay của từng hành tinh và vệ tinh. Độ nghiêng trục là góc giữa trục quay và pháp tuyến quỹ đạo: 23,4° (Trái Đất), 25,2° (Sao Hoả), 26,7° (Sao Thổ), 97,8° (Sao Thiên Vương), 177,4° (Sao Kim). Các giá trị trên bằng giá trị trong bảng NASA trong khoảng 0,6° (có test). Với Sao Kim và Sao Thiên Vương, $W$ **giảm** theo thời gian, tức hai hành tinh quay ngược chiều.',
        en: 'The IAU Working Group on Cartographic Coordinates and Rotational Elements publishes, for each body, the direction of the **rotation pole** $(\\alpha_0,\\delta_0)$ (right ascension and declination of the north pole in the J2000 equatorial frame) and the **prime meridian angle** $W$ as functions of time. The rotation from the body-fixed frame to the equatorial frame is then\n\n$$R=R_z(\\alpha_0+90^\\circ)\\,R_x(90^\\circ-\\delta_0)\\,R_z(W).$$\n\nE1 uses it to set the correct axis and spin phase of every planet and moon. The axial tilt is the angle between the spin axis and the orbit normal: 23.4° (Earth), 25.2° (Mars), 26.7° (Saturn), 97.8° (Uranus), 177.4° (Venus). These agree with the NASA table to within 0.6° (tested). For Venus and Uranus $W$ **decreases** with time: they rotate backwards.',
      },
    },
    {
      title: { vi: '5. Các đại lượng quan sát', en: '5. Observable quantities' },
      body: {
        vi: 'Từ vị trí nhật tâm $\\mathbf r_p$ của hành tinh và $\\mathbf r_\\oplus$ của Trái Đất:\n\n- khoảng cách tới Trái Đất $d = |\\mathbf r_p - \\mathbf r_\\oplus|$ và thời gian ánh sáng $d/c$;\n- tốc độ quỹ đạo từ vector vận tốc, và các yếu tố tức thời $a$, $e$, $i$ tính từ vector trạng thái $(\\mathbf r,\\mathbf v)$, thoả phương trình vis-viva $v = \\sqrt{GM_\\odot(2/r - 1/a)}$;\n- **góc ly giác** - góc giữa hành tinh và Mặt Trời nhìn từ Trái Đất. Hành tinh ngoài ở gần $180^\\circ$ là **xung đối**: gần nhất và sáng nhất.\n\nThời gian trong mô phỏng là UTC; trước khi tính vị trí, nó được đổi sang thời gian động lực học TT (lệch khoảng 69 giây). Bỏ qua 69 giây này sẽ gây lệch tới 16″ với Sao Thuỷ.',
        en: 'From the heliocentric positions $\\mathbf r_p$ of the planet and $\\mathbf r_\\oplus$ of Earth:\n\n- the distance from Earth $d = |\\mathbf r_p - \\mathbf r_\\oplus|$ and the light time $d/c$;\n- the orbital speed from the velocity vector, and the osculating elements $a$, $e$, $i$ computed from the state vector $(\\mathbf r,\\mathbf v)$, which satisfy the vis-viva equation $v = \\sqrt{GM_\\odot(2/r - 1/a)}$;\n- the **elongation** - the angle between the planet and the Sun as seen from Earth. An outer planet near $180^\\circ$ is at **opposition**: closest and brightest.\n\nSimulation time is UTC; before the positions are computed it is converted to dynamical time TT (about 69 s ahead). Ignoring those 69 seconds would shift Mercury by up to 16″.',
      },
    },
    {
      title: { vi: '6. Ánh sáng và bóng', en: '6. Light and shadow' },
      body: {
        vi: 'Hình ảnh dùng cách chiếu sáng của Celestia. Bề mặt kiểu Mặt Trăng dùng mô hình **lunar-Lambert**, pha giữa định luật Lambert $N\\cdot L$ và Lommel-Seeliger $2\\,N\\cdot L/(N\\cdot L+N\\cdot V)$ theo góc pha (McEwen, 1996), nên Mặt Trăng tròn không tối ở rìa như quả cầu Lambert. Hành tinh có khí quyển có vùng chạng vạng mềm và vành sáng tán xạ ở rìa.\n\n**Bóng nhật thực và nguyệt thực** được tính ở từng điểm ảnh: phần của đĩa Mặt Trời bị che bởi một thiên thể cầu có bán kính góc $\\rho_o$, khi Mặt Trời có bán kính góc $\\rho_s$ và hai tâm cách nhau $d$, bằng diện tích giao của hai đĩa tròn chia cho $\\pi\\rho_s^2$. Phép tính dùng km thật nên bóng rơi đúng chỗ dù hình vẽ phóng đại. Hành tinh có vành đai (Sao Thổ) đổ bóng lên vành và vành đổ bóng lên hành tinh. Đây là hình ảnh minh hoạ, độ sáng không giảm theo $1/r^2$.',
        en: 'The images use Celestia’s lighting. Moon-like surfaces use the **lunar-Lambert** model, a blend of Lambert’s law $N\\cdot L$ and the Lommel-Seeliger law $2\\,N\\cdot L/(N\\cdot L+N\\cdot V)$ weighted by the phase angle (McEwen, 1996), so the full Moon is not dark at the limb like a Lambert sphere. Planets with an atmosphere get a soft twilight and a scattered glow at the limb.\n\n**Eclipse shadows** are computed per pixel: the fraction of the Sun’s disc hidden by a spherical body of angular radius $\\rho_o$, when the Sun has angular radius $\\rho_s$ and the two centres are $d$ apart, is the area of overlap of two discs divided by $\\pi\\rho_s^2$. The computation uses real kilometres, so the shadow falls in the right place even though the picture is exaggerated. A ringed planet (Saturn) shades its rings and the rings shade the planet. This is illustration: brightness does not fall off as $1/r^2$.',
      },
    },
    {
      title: { vi: '7. Quy mô của Hệ Mặt Trời', en: '7. The scale of the Solar System' },
      body: {
        vi: 'Nếu Mặt Trời là quả bóng đường kính 20 cm, Trái Đất là một hạt nhỏ khoảng 1,8 mm cách 21,5 m, còn Sao Hải Vương là hạt đậu khoảng 7 mm cách khoảng 650 m. Ánh sáng mất khoảng 8 phút 19 giây từ Mặt Trời tới Trái Đất và khoảng 4 giờ 10 phút tới Sao Hải Vương. Vì vậy mô-đun mặc định phóng to kích thước và nén khoảng cách theo logarit; chọn "Tỉ lệ thật" và "Tuyến tính" để thấy đúng tỉ lệ, rồi chọn Trái Đất và nhìn Mặt Trăng chỉ cách khoảng 30 đường kính Trái Đất.',
        en: 'If the Sun were a ball 20 cm across, Earth would be a speck about 1.8 mm across 21.5 m away, and Neptune a pea about 7 mm across some 650 m away. Light takes about 8 min 19 s from the Sun to Earth and about 4 h 10 min to Neptune. The module therefore enlarges sizes and compresses distances logarithmically by default; choose "True scale" and "Linear" to see the real proportions, then select Earth and note that the Moon is only about 30 Earth diameters away.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Bầu trời hôm nay', en: 'Experiment 1 - Today’s sky' }, text: { vi: 'Bấm "Bây giờ". Chọn từng hành tinh và đọc góc ly giác. Hành tinh nào đang gần xung đối? Hành tinh nào ở quá gần Mặt Trời để quan sát?', en: 'Press "Now". Select each planet and read its elongation. Which planet is near opposition? Which is too close to the Sun to observe?' } },
    { title: { vi: 'Thử nghiệm 2 - Tỉ lệ thật', en: 'Experiment 2 - True scale' }, text: { vi: 'Chọn kích thước "thật" và khoảng cách "tuyến tính". Bạn còn thấy được hành tinh nào? Ước lượng tỉ số giữa khoảng cách Sao Hải Vương và đường kính Mặt Trời.', en: 'Choose "true" sizes and "linear" distances. Which planets can you still see? Estimate the ratio of Neptune’s distance to the Sun’s diameter.' } },
    { title: { vi: 'Thử nghiệm 3 - Hai mô hình', en: 'Experiment 3 - Two models' }, text: { vi: 'Ở mức "Sinh viên", chọn Sao Thổ rồi đổi qua lại VSOP87 và Kepler gần đúng. Đọc ô "Sai khác VSOP87 - Kepler" ở các năm 1850, 1950, 2026 và 2150. Sai khác lớn nhất ở đâu, và vì sao nó dao động thay vì tăng đều?', en: 'At "Student" level, select Saturn and switch between VSOP87 and Approx. Kepler. Read the "VSOP87 - Kepler difference" readout in 1850, 1950, 2026 and 2150. Where is it largest, and why does it oscillate instead of growing steadily?' }, params: { sel: 'saturn' } },
    { title: { vi: 'Thử nghiệm 4 - Cộng hưởng Laplace', en: 'Experiment 4 - The Laplace resonance' }, text: { vi: 'Chọn Sao Mộc, bấm chạy với tốc độ 1 ngày/giây. Đếm số vòng Io, Europa và Ganymede hoàn thành trong cùng một khoảng thời gian. Tỉ số chu kỳ của chúng là bao nhiêu? Dùng ô "Chu kỳ quỹ đạo" để kiểm tra.', en: 'Select Jupiter and run at 1 day/s. Count how many orbits Io, Europa and Ganymede complete in the same time. What is the ratio of their periods? Check with the "Orbital period" readout.' }, params: { sel: 'jupiter', speed: 1 } },
    { title: { vi: 'Thử nghiệm 5 - Nhật thực 8/4/2024', en: 'Experiment 5 - The 8 April 2024 eclipse' }, text: { vi: 'Chọn Trái Đất, đặt ngày 8/4/2024, giờ 17 và chạy với tốc độ "1 giờ/giây". Tìm vệt bóng của Mặt Trăng chạy qua Trái Đất. Đổi sang tỉ lệ thật: bóng nhỏ đến mức nào so với đĩa Trái Đất?', en: 'Select Earth, set 8 April 2024, hour 17, and run at "1 h/s". Find the Moon’s shadow sweeping across the Earth. Switch to true scale: how small is the shadow compared with the Earth’s disc?' }, params: { sel: 'earth', date: '2024-04-08', hour: 17, speed: 0.0417 } },
    { title: { vi: 'Thử nghiệm 6 - Trục nghiêng', en: 'Experiment 6 - Tilted axes' }, text: { vi: 'Đọc "Độ nghiêng trục" của Sao Thiên Vương và Sao Kim. Hai hành tinh này có gì giống nhau về chiều quay? Nhìn Sao Thiên Vương ở hai thời điểm cách nhau 42 năm (một nửa năm của nó): cực nào hướng về Mặt Trời?', en: 'Read the "Axial tilt" of Uranus and Venus. What do they share in their sense of rotation? View Uranus at two dates 42 years apart (half its year): which pole faces the Sun?' }, params: { sel: 'uranus' } },
  ],
  quiz: [
    { q: { vi: 'Ánh sáng từ Mặt Trời tới Trái Đất mất khoảng:', en: 'Sunlight reaches Earth in about:' }, options: [{ vi: '8 phút 19 giây', en: '8 min 19 s' }, { vi: '8 giây', en: '8 s' }, { vi: '8 giờ', en: '8 h' }], answer: 0, explain: { vi: '$1\\ \\text{au}/c \\approx 499$ s.', en: '$1\\ \\text{au}/c \\approx 499$ s.' } },
    { q: { vi: 'Một hành tinh ngoài ở xung đối khi góc ly giác bằng khoảng:', en: 'An outer planet is at opposition when its elongation is about:' }, options: [{ vi: '180°', en: '180°' }, { vi: '90°', en: '90°' }, { vi: '0°', en: '0°' }], answer: 0, explain: { vi: 'Hành tinh ở phía đối diện Mặt Trời trên bầu trời.', en: 'The planet is opposite the Sun in the sky.' } },
    { q: { vi: 'Vì sao phần tử Kepler gần đúng có sai số lớn nhất với Sao Mộc và Sao Thổ?', en: 'Why are approximate Keplerian elements least accurate for Jupiter and Saturn?' }, options: [{ vi: 'Nhiễu loạn lẫn nhau giữa hai hành tinh lớn không được mô tả bằng biến thiên tuyến tính', en: 'Their strong mutual perturbations are not captured by linear rates' }, { vi: 'Vì chúng ở xa Mặt Trời nên lực hấp dẫn bằng không', en: 'Because they are far from the Sun so gravity vanishes' }, { vi: 'Vì chúng quay quá nhanh', en: 'Because they spin too fast' }], answer: 0, explain: { vi: 'Sao Mộc và Sao Thổ nhiễu loạn nhau theo chu kỳ vài chục năm; VSOP87 có các số hạng lượng giác cho chúng.', en: 'Jupiter and Saturn perturb each other with periods of decades; VSOP87 has trigonometric terms for them.' } },
    { q: { vi: 'Chuỗi VSOP87 "Trái Đất" cho vị trí của điểm nào?', en: 'Which point does the VSOP87 "Earth" series give?' }, options: [{ vi: 'Tâm Trái Đất; khối tâm Trái Đất-Mặt Trăng lệch khoảng 4 700 km', en: 'The Earth’s centre; the Earth-Moon barycentre is about 4,700 km away' }, { vi: 'Khối tâm Trái Đất-Mặt Trăng', en: 'The Earth-Moon barycentre' }, { vi: 'Khối tâm của cả Hệ Mặt Trời', en: 'The barycentre of the whole Solar System' }], answer: 0, explain: { vi: 'Đo với Horizons: lệch 0,7″ so với tâm Trái Đất nhưng 6,9″ so với khối tâm.', en: 'Measured against Horizons: 0.7″ from the Earth’s centre but 6.9″ from the barycentre.' } },
    { q: { vi: 'Io, Europa và Ganymede có chu kỳ xấp xỉ theo tỉ số:', en: 'Io, Europa and Ganymede have periods in roughly the ratio:' }, options: [{ vi: '1 : 2 : 4', en: '1 : 2 : 4' }, { vi: '1 : 3 : 9', en: '1 : 3 : 9' }, { vi: '1 : 1 : 1', en: '1 : 1 : 1' }], answer: 0, explain: { vi: '1,77 : 3,55 : 7,15 ngày: cộng hưởng Laplace, giữ cho quỹ đạo của chúng hơi lệch tâm và làm Io nóng lên.', en: '1.77 : 3.55 : 7.15 days: the Laplace resonance keeps their orbits slightly eccentric and heats Io.' } },
    { q: { vi: 'Độ nghiêng trục của Sao Kim là 177° nghĩa là:', en: 'Venus’s axial tilt of 177° means:' }, options: [{ vi: 'Nó quay ngược chiều với chuyển động quỹ đạo', en: 'It rotates opposite to its orbital motion' }, { vi: 'Nó có mùa rất rõ rệt', en: 'It has very pronounced seasons' }, { vi: 'Nó không quay', en: 'It does not rotate' }], answer: 0, explain: { vi: 'Trục gần như đảo ngược so với pháp tuyến quỹ đạo, nên Sao Kim quay ngược chiều.', en: 'The axis is almost flipped relative to the orbit normal, so Venus spins backwards.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Bretagnon và Francou (1988) A&A 202, 309 (VSOP87); Meeus (1998) Astronomical Algorithms, chương 44, 46, 47; Laskar và Jacobson (1987) A&A 188, 212 (GUST86); Archinal và cộng sự (2018) CeMDA 130, 22 (IAU WGCCRE); Standish, Keplerian Elements for Approximate Positions of the Major Planets (JPL SSD); hệ thống JPL Horizons; Celestia (celestiaproject.space). Gợi ý thảo luận: vì sao các lý thuyết vệ tinh tốt nhất gần năm 1976-1990 và kém dần xa năm đó? So sánh vị trí do mô-đun tính với Horizons cho một ngày cụ thể và giải thích nguồn gốc sai lệch.',
    en: 'Resources: Bretagnon and Francou (1988) A&A 202, 309 (VSOP87); Meeus (1998) Astronomical Algorithms, ch. 44, 46, 47; Laskar and Jacobson (1987) A&A 188, 212 (GUST86); Archinal et al. (2018) CeMDA 130, 22 (IAU WGCCRE); Standish, Keplerian Elements for Approximate Positions of the Major Planets (JPL SSD); the JPL Horizons system; Celestia (celestiaproject.space). Discussion: why are the satellite theories best near 1976-1990 and worse far from it? Compare the module’s position with Horizons for a given date and explain the source of the difference.',
  },
};

/** Model Card · E1. Measured figures: `npm run validate:e1` → docs/validation/E1-vsop87.json, E1-moons.json (2026-10-22). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Vị trí tám hành tinh theo VSOP87', en: 'Level A - Positions of the eight planets from VSOP87' },
      body: { vi: 'Vị trí nhật tâm, khoảng cách, tốc độ, thời gian ánh sáng và góc ly giác tính từ chuỗi VSOP87 rút gọn; sai số đo được so với JPL Horizons DE441 nêu bên dưới. Mô hình Kepler gần đúng của Standish được giữ làm phương án so sánh.', en: 'Heliocentric positions, distances, speeds, light times and elongations come from the truncated VSOP87 series; errors measured against JPL Horizons DE441 are given below. Standish’s approximate Keplerian model is kept for comparison.' },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Vệ tinh tự nhiên và hướng trục quay', en: 'Level B - Natural satellites and spin axes' },
      body: { vi: 'Mười bảy vệ tinh theo các lý thuyết giải tích, sai số từ 0,006° (Mặt Trăng) đến 1,2° nhìn từ hành tinh mẹ trong 1900–2100 (từng vệ tinh hiện khi chọn). Hướng cực quay theo IAU khớp độ nghiêng trục của NASA trong 0,6°; pha kinh tuyến gốc chỉ được gắn với bản đồ bề mặt của Trái Đất.', en: 'Seventeen satellites from analytic theories, with errors from 0.006° (Moon) to 1.2° as seen from the parent planet over 1900–2100 (shown per moon when selected). The IAU pole directions match NASA’s axial tilts to within 0.6°; the prime-meridian phase is tied to a surface map only for the Earth.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Hình ảnh 3D', en: 'Level C - 3D rendering' },
      body: { vi: 'Kích thước được phóng đại và khoảng cách nén logarit (trừ khi chọn tỉ lệ thật). Bề mặt hành tinh và Mặt Trăng dùng bản đồ Solar System Scope (CC BY 4.0, dựa trên dữ liệu NASA); các vệ tinh khác dùng màu trung bình với nhiễu thủ tục, không phải ảnh thật. Cách chiếu sáng, bóng và khí quyển theo mô hình đồ hoạ của Celestia; độ sáng không giảm theo $1/r^2$ và lớp khí quyển được vẽ dày hơn thực tế. Bầu trời nền là ảnh toàn cảnh Ngân Hà của ESO đặt theo toạ độ thiên hà, cùng các sao sáng nhất.', en: 'Sizes are exaggerated and distances log-compressed (unless true scale is chosen). Planet and Moon surfaces use Solar System Scope maps (CC BY 4.0, based on NASA data); the other moons use a mean colour with procedural noise, not real imagery. Lighting, shadows and atmospheres follow Celestia’s graphics model; brightness does not fall off as $1/r^2$ and the atmosphere layers are drawn thicker than real. The background is the ESO Milky Way panorama placed in galactic coordinates, plus the brightest stars.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, B, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Chuỗi VSOP87', en: '1. The VSOP87 series' },
      tex: ['X(t)=\\sum_{k=0}^{5}t^{k}\\sum_i A_{k,i}\\cos\\left(B_{k,i}+C_{k,i}\\,t\\right),\\qquad t=\\frac{\\mathrm{JD}_{\\rm TT}-2451545.0}{365250}', '\\mathbf r=R\\begin{pmatrix}\\cos B\\cos L\\\\ \\cos B\\sin L\\\\ \\sin B\\end{pmatrix}'],
      body: {
        vi: '$X$ là một trong ba biến cầu $L$, $B$, $R$ nhật tâm trong hệ hoàng đạo và phân điểm J2000 (VSOP87B), $t$ tính bằng thiên niên kỷ Julius. Vận tốc lấy từ đạo hàm giải tích của chuỗi. Chuỗi "Trái Đất" cho tâm Trái Đất; khối tâm Trái Đất-Mặt Trăng là $\\mathbf r_\\oplus+\\mathbf r_{\\rm Moon}/(1+\\mu)$ với $\\mu=81{,}30057$ (JPL DE440).',
        en: '$X$ is one of the three heliocentric spherical variables $L$, $B$, $R$ in the J2000 ecliptic and equinox frame (VSOP87B), $t$ in Julian millennia. Velocities come from the analytic derivative of the series. The "Earth" series gives the Earth’s centre; the Earth-Moon barycentre is $\\mathbf r_\\oplus+\\mathbf r_{\\rm Moon}/(1+\\mu)$ with $\\mu=81.30057$ (JPL DE440).',
      },
    },
    {
      title: { vi: '2. Mô hình Kepler gần đúng', en: '2. The approximate Kepler model' },
      tex: ['x(T)=x_0+\\dot x\\,T,\\qquad T=\\frac{\\mathrm{JD}_{\\rm TT}-2451545.0}{36525}', 'M=L-\\varpi,\\qquad \\omega=\\varpi-\\Omega,\\qquad M=E-e\\sin E', '\\mathbf r=R_z(\\Omega)\\,R_x(I)\\,R_z(\\omega)\\begin{pmatrix}a(\\cos E-e)\\\\ a\\sqrt{1-e^2}\\sin E\\\\ 0\\end{pmatrix}'],
      body: {
        vi: '$x$ là một trong sáu phần tử $a, e, I, L, \\varpi, \\Omega$ (Standish, Bảng 1, hợp lệ 1800–2050); $E$ giải bằng phương pháp Newton tới $10^{-15}$. Trong mô hình này "Trái Đất" là khối tâm Trái Đất-Mặt Trăng.',
        en: '$x$ is one of the six elements $a, e, I, L, \\varpi, \\Omega$ (Standish, Table 1, valid 1800–2050); $E$ is solved by Newton’s method to $10^{-15}$. In this model "Earth" is the Earth-Moon barycentre.',
      },
    },
    {
      title: { vi: '3. Lý thuyết vệ tinh và hệ quy chiếu', en: '3. Satellite theories and frames' },
      tex: ['\\mathbf r_{\\rm moon}=R_{\\rm ecl\\leftarrow eq}\\;R_z(\\alpha_0+90^\\circ)\\,R_x(90^\\circ-\\delta_0)\\,R_z(\\varphi_0-p)\\;\\mathbf r_{\\rm theory}'],
      body: {
        vi: '$\\mathbf r_{\\rm theory}$ là vị trí do lý thuyết cho trong hệ xích đạo của hành tinh mẹ. Hệ này được đặt vào hệ hoàng đạo J2000 bằng cực IAU $(\\alpha_0,\\delta_0)$ và một **hằng số tham chiếu $\\varphi_0$** của từng lý thuyết (Sao Mộc −20,45°, Sao Thổ 39,9°, Sao Thiên Vương 4,68° với cực đảo vì chiều quay ngược); với Sao Mộc, kinh độ của lý thuyết theo phân điểm của ngày nên có thêm số hạng tiến động $p$. Các hằng số này **không có trong mã nguồn Celestia** (hệ quy chiếu nằm trong tệp dữ liệu riêng của nó) nên được xác định bằng cách khớp với JPL Horizons; bộ test dò lại chúng từ dữ liệu và yêu cầu khớp trong 0,1°. Mặt Trăng dùng chuỗi Meeus rồi đổi từ phân điểm của ngày sang J2000 bằng các công thức tiến động chặt chẽ.',
        en: '$\\mathbf r_{\\rm theory}$ is the position given by the theory in the parent planet’s equatorial frame. That frame is placed in the J2000 ecliptic with the IAU pole $(\\alpha_0,\\delta_0)$ and one **reference-longitude constant $\\varphi_0$** per theory (Jupiter −20.45°, Saturn 39.9°, Uranus 4.68° with the opposite pole because it rotates retrograde); for Jupiter the theory’s longitudes follow the equinox of date, hence the precession term $p$. These constants are **not in the Celestia source** (the frame is declared in its data files), so they were determined by fitting to JPL Horizons; the test suite re-derives them from the data and requires agreement within 0.1°. The Moon uses the Meeus series, converted from the equinox of date to J2000 with rigorous precession formulae.',
      },
    },
    {
      title: { vi: '4. Hướng quay IAU', en: '4. IAU orientation' },
      tex: ['R_{\\rm body\\to eq}=R_z(\\alpha_0+90^\\circ)\\,R_x(90^\\circ-\\delta_0)\\,R_z(W)', '\\text{độ nghiêng}=\\angle(\\hat{\\mathbf z}_{\\rm spin},\\;\\mathbf r\\times\\mathbf v)'],
      body: {
        vi: '$\\alpha_0,\\delta_0,W$ là các hàm của thời gian trong báo cáo IAU WGCCRE (2009, 2015). Với Trái Đất, $W=190{,}147^\\circ+360{,}9856235^\\circ\\,d$ theo UT1. Số hạng thế tục được giữ trong ±50 thế kỷ, như Celestia.',
        en: '$\\alpha_0,\\delta_0,W$ are the functions of time in the IAU WGCCRE reports (2009, 2015). For the Earth, $W=190.147^\\circ+360.9856235^\\circ\\,d$ in UT1. Secular terms are clamped to ±50 centuries, as in Celestia.',
      },
    },
    {
      title: { vi: '5. Bóng nhật/nguyệt thực', en: '5. Eclipse shadows' },
      tex: ['f(\\rho_s,\\rho_o,d)=\\frac{\\rho_s^2\\arccos\\frac{d^2+\\rho_s^2-\\rho_o^2}{2d\\rho_s}+\\rho_o^2\\arccos\\frac{d^2+\\rho_o^2-\\rho_s^2}{2d\\rho_o}-\\tfrac12\\sqrt{(-d+\\rho_s+\\rho_o)(d+\\rho_s-\\rho_o)(d-\\rho_s+\\rho_o)(d+\\rho_s+\\rho_o)}}{\\pi\\rho_s^2}'],
      body: {
        vi: '$f$ là phần đĩa Mặt Trời bị che, $\\rho_s,\\rho_o$ là bán kính góc của Mặt Trời và vật che, $d$ là khoảng cách góc giữa hai tâm, tính tại mỗi điểm trên bề mặt với vị trí thật theo km. Đây là xấp xỉ cầu (hành tinh dẹt được coi là cầu); Celestia dùng suy giảm tuyến tính, E1 dùng diện tích giao chính xác.',
        en: '$f$ is the fraction of the Sun’s disc that is hidden, $\\rho_s,\\rho_o$ the angular radii of the Sun and the occulter, $d$ the angular separation of their centres, evaluated at each surface point from real positions in km. It is a spherical approximation (an oblate planet is treated as a sphere); Celestia uses a linear fall-off, E1 uses the exact overlap area.',
      },
    },
  ],
  assumptions: {
    vi: ['Hệ hoàng đạo và phân điểm J2000; vị trí hành tinh nhật tâm, vệ tinh tương đối so với hành tinh mẹ.', 'Thời gian giả định là UTC và được đổi sang TT bằng ΔT của sim-core (khoảng 69 giây hiện nay).', 'VSOP87: "Trái Đất" là tâm Trái Đất; Kepler gần đúng: "Trái Đất" là khối tâm Trái Đất-Mặt Trăng.', 'Vệ tinh coi hành tinh mẹ cố định tại vị trí của nó; không tính thời gian ánh sáng, quang sai hay nhiễu loạn của Mặt Trời lên quỹ đạo vệ tinh ngoài phần có trong lý thuyết.', 'Hành tinh coi là cầu khi tính bóng.'],
    en: ['J2000 ecliptic and equinox; planet positions heliocentric, satellites relative to their parent planet.', 'The time is UTC and is converted to TT with sim-core’s ΔT (about 69 s today).', 'VSOP87: "Earth" is the Earth’s centre; approximate Kepler: "Earth" is the Earth-Moon barycentre.', 'Satellites treat the parent planet as fixed at its position; no light time, aberration or solar perturbation beyond what is in each theory.', 'Planets are spheres when computing shadows.'],
  },
  validity: { vi: ['VSOP87 dùng được trong ±3000 năm quanh hiện tại, kiểm chứng kỹ trong 1800–2200.', 'Vệ tinh: kiểm chứng trong 1900–2100.', 'Mô hình Kepler: 1800–2050.'], en: ['VSOP87 is usable within ±3000 years of today, thoroughly checked over 1800–2200.', 'Satellites: checked over 1900–2100.', 'Kepler model: 1800–2050.'] },
  scope: { vi: 'Ngoài các miền này mô phỏng vẫn chạy nhưng giao diện hiện cảnh báo.', en: 'Outside these ranges the simulation still runs but the interface shows a warning.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:e1\` → \`docs/validation/E1-vsop87.json\` và \`E1-moons.json\`; bộ test \`ephemeris-e1.test.ts\` khoá các ngưỡng. Dữ liệu đối chiếu là 1000 thời điểm mỗi khoảng, lấy từ JPL Horizons (hệ hoàng đạo J2000, đơn vị au hoặc km, TDB).

- **Hành tinh, sai số góc nhật tâm lớn nhất, 1800–2200:** Sao Thuỷ 1,19″, Sao Kim 1,01″, Trái Đất (tâm) 0,75″, Sao Hoả 0,91″, Sao Mộc 0,94″, Sao Thổ 1,13″, Sao Thiên Vương 2,17″, Sao Hải Vương 4,41″. Mô hình Kepler thay thế cho cùng các hành tinh cho 28″, 26″, 21″, 92″, 516″, 559″, 113″, 58″ (1980–2050).
- **Trong ±3000 năm** (−3000…+3000, dùng khối tâm hệ cho Sao Hoả đến Sao Hải Vương): hành tinh trong ≤ 18″; Sao Mộc 148″, Sao Thổ 308″ ở các thế kỷ xa nhất, nhưng chỉ 2,8″ và 5,2″ trong 0–1000 sau Công nguyên. Sao Thiên Vương và Sao Hải Vương ≤ 61″ và 88″.
- **Trái Đất:** chuỗi VSOP87 lệch 0,66″ so với tâm Trái Đất (Horizons 399) nhưng 6,94″ so với khối tâm (Horizons 3); cộng thêm Mặt Trăng để có khối tâm cho 0,71″.
- **Mặt Trăng:** lệch tối đa 38 km (0,006°). **Io, Europa, Ganymede, Callisto:** 0,165°, 0,128°, 0,186°, 0,105°. **Sao Thổ:** Mimas 0,68°, Enceladus 0,22°, Tethys 0,10°, Dione 0,11°, Rhea 1,09°, Titan 0,16°, Iapetus 0,35°. **Thiên Vương:** Ariel 0,81°, Umbriel 1,19°, Titania 0,80°, Oberon 0,71°. **Triton:** 1,15° (nhìn từ hành tinh mẹ, 1900–2100).
- **Độ nghiêng trục** tính từ cực IAU và pháp tuyến quỹ đạo VSOP87 khớp bảng NASA: Trái Đất 23,4°, Sao Hoả 25,2°, Sao Mộc 3,1°, Sao Thổ 26,7°, Sao Thiên Vương 97,8°, Sao Hải Vương 28,3°, Sao Kim 177,4° (trong 0,6°).`,
    en: `Reproducible report: \`npm run validate:e1\` → \`docs/validation/E1-vsop87.json\` and \`E1-moons.json\`; the test suite \`ephemeris-e1.test.ts\` locks the thresholds. The reference data are 1000 epochs per range from JPL Horizons (J2000 ecliptic, au or km, TDB).

- **Planets, maximum heliocentric angular error, 1800–2200:** Mercury 1.19″, Venus 1.01″, Earth (centre) 0.75″, Mars 0.91″, Jupiter 0.94″, Saturn 1.13″, Uranus 2.17″, Neptune 4.41″. The Kepler model it replaces gives 28″, 26″, 21″, 92″, 516″, 559″, 113″, 58″ for the same planets (1980–2050).
- **Within ±3000 years** (−3000…+3000, system barycentres for Mars to Neptune): inner planets ≤ 18″; Jupiter 148″, Saturn 308″ in the most distant centuries, but only 2.8″ and 5.2″ in 0–1000 CE. Uranus and Neptune ≤ 61″ and 88″.
- **Earth:** the VSOP87 series is 0.66″ from the Earth’s centre (Horizons 399) but 6.94″ from the barycentre (Horizons 3); adding the Moon recovers the barycentre to 0.71″.
- **Moon:** at most 38 km (0.006°) off. **Io, Europa, Ganymede, Callisto:** 0.165°, 0.128°, 0.186°, 0.105°. **Saturn:** Mimas 0.68°, Enceladus 0.22°, Tethys 0.10°, Dione 0.11°, Rhea 1.09°, Titan 0.16°, Iapetus 0.35°. **Uranus:** Ariel 0.81°, Umbriel 1.19°, Titania 0.80°, Oberon 0.71°. **Triton:** 1.15° (as seen from the parent planet, 1900–2100).
- **Axial tilts** computed from the IAU poles and the VSOP87 orbit normals match the NASA table: Earth 23.4°, Mars 25.2°, Jupiter 3.1°, Saturn 26.7°, Uranus 97.8°, Neptune 28.3°, Venus 177.4° (within 0.6°).`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: [
      'Chưa có tiểu hành tinh và sao chổi.',
      'Không có Phobos, Deimos, Miranda, Hyperion và các vệ tinh nhỏ; lý do ghi trong mục "Vệ tinh tự nhiên".',
      'Các lý thuyết vệ tinh sai số từ vài phần mười đến khoảng một độ, đủ để hiển thị nhưng không đủ cho dự báo hiện tượng (ví dụ thời điểm chính xác của một lần che khuất).',
      'JPL Horizons chỉ dùng để kiểm chứng, không được truy vấn khi mô phỏng chạy.',
      'Sao nền và ảnh Ngân Hà bỏ qua tiến động; độ sáng và lớp khí quyển chỉ mang tính minh hoạ.',
    ],
    en: [
      'No asteroids or comets yet.',
      'No Phobos, Deimos, Miranda, Hyperion or the small moons; the reasons are in "Natural satellites".',
      'The satellite theories are off by a few tenths of a degree to about one degree: enough to draw, not enough to predict phenomena (for instance the exact moment of an occultation).',
      'JPL Horizons is used for validation only, not queried while the simulation runs.',
      'Background stars and the Milky Way image ignore precession; brightness and atmosphere layers are illustrative.',
    ],
  },
  references: [
    'Bretagnon, P. & Francou, G. (1988). Planetary theories in rectangular and spherical variables - VSOP87 solutions. A&A 202, 309.',
    'Meeus, J. (1998). Astronomical Algorithms, 2nd ed. Willmann-Bell, ch. 21, 44, 46, 47.',
    'Laskar, J. & Jacobson, R. A. (1987). GUST86 - an analytical ephemeris of the Uranian satellites. A&A 188, 212.',
    'Emelyanov, N. V. & Samorodov, M. Yu. (2015). Analytical theory of motion and new ephemeris of Triton from observations. MNRAS 454, 2205.',
    'Archinal, B. A. et al. (2018). Report of the IAU Working Group on Cartographic Coordinates and Rotational Elements: 2015. Celest. Mech. Dyn. Astr. 130, 22.',
    'McEwen, A. S. (1996). A precise lunar photometric function. Lunar and Planetary Science 27, 841.',
    'Park, R. S., Folkner, W. M., Williams, J. G. & Boggs, D. H. (2021). The JPL Planetary and Lunar Ephemerides DE440 and DE441. AJ 161, 105.',
    'Standish, E. M. Keplerian Elements for Approximate Positions of the Major Planets. JPL Solar System Dynamics (ssd.jpl.nasa.gov).',
    'Celestia Development Team. Celestia 1.7.0, GNU GPL v2 or later (celestiaproject.space): VSOP87 series, satellite theories, IAU rotation models and the lighting model were ported from its source. See NOTICE.md.',
  ],
};
