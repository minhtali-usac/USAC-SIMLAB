import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Tính hai xung vận tốc và thời gian bay của chuyển Hohmann giữa hai quỹ đạo tròn đồng phẳng.',
      'Giải thích góc pha khởi hành và lý do các cơ hội hình học thuận lợi cho hành trình Trái Đất–Sao Hoả lặp lại khoảng 26 tháng.',
      'Phân biệt tổng Δv nhật tâm trong mô hình Hohmann với ngân sách vận tốc của một nhiệm vụ phóng và hạ cánh thực tế.',
      'So sánh chuyển Hohmann và bi-elliptic dựa trên tổng Δv, bán kính trung gian và thời gian bay.',
      'Nhận biết giới hạn của mô hình quỹ đạo tròn, đồng phẳng khi áp dụng cho vị trí hành tinh thực.',
    ],
    en: [
      'Compute the two velocity impulses and the flight time of a Hohmann transfer between coplanar circular orbits.',
      'Explain the departure phase angle and why favourable Earth–Mars geometry recurs about every 26 months.',
      'Distinguish the heliocentric Hohmann Δv from the velocity budget of a real launch-and-landing mission.',
      'Compare Hohmann and bi-elliptic transfers by total Δv, intermediate radius and flight time.',
      'Recognise the limits of the circular coplanar model when applied to real planet positions.',
    ],
  },
  durationMin: 40,
  prerequisites: { vi: 'B1 - Quỹ đạo Kepler và bài toán hai vật; phương trình vis-viva; vận tốc quỹ đạo tròn; khái niệm xung vận tốc.', en: 'B1 - Kepler orbits and the two-body problem; the vis-viva equation; circular orbital speed; impulsive velocity changes.' },
  background: [
    {
      title: { vi: 'Từ cơ học quỹ đạo đến thiết kế hành trình liên hành tinh', en: 'From orbital mechanics to interplanetary trajectory design' },
      body: {
        vi: 'Để đưa một tàu vũ trụ từ Trái Đất tới Sao Hoả, không thể chỉ hướng tàu tới vị trí hiện tại của hành tinh. Tàu cần đi theo một quỹ đạo chuyển tiếp sao cho nó và Sao Hoả đến cùng một vùng không gian vào cùng một thời điểm.\n\nMô-đun B2 khảo sát chuyển quỹ đạo Hohmann, góc pha khởi hành và chu kỳ giao hội giữa các hành tinh, đồng thời so sánh Hohmann với bi-elliptic để hiểu mối quan hệ giữa tổng biến thiên vận tốc, thời gian bay và hình học quỹ đạo.\n\nMô-đun có **ba lớp mô hình** liên quan nhưng không tương đương về độ chính xác:\n\n- **Hohmann lý tưởng** - hai quỹ đạo tròn đồng phẳng, bài toán hai vật.\n- **Hành tinh thực** - vị trí hành tinh từ JPL để sàng lọc những ngày có góc pha gần điều kiện Hohmann.\n- **Lambert** - quỹ đạo khớp vị trí thật của hai hành tinh lúc đi và lúc đến, cho vận tốc dư v∞ và năng lượng khởi hành C₃.\n\nKết quả pha lý tưởng là ước lượng giáo dục, không thay thế thiết kế quỹ đạo nhiệm vụ thực tế.',
        en: 'To send a spacecraft from Earth to Mars you cannot simply aim at where Mars is now. The craft must follow a transfer orbit such that it and Mars reach the same region of space at the same time.\n\nModule B2 explores the Hohmann transfer, the departure phase angle and the synodic period, and compares Hohmann with bi-elliptic transfers to show the link between total velocity change, flight time and orbit geometry.\n\nThe module has **three model layers**, related but not equally accurate:\n\n- **Ideal Hohmann** - two coplanar circles, two-body problem.\n- **Real planets** - JPL planet positions to screen dates whose phase angle is close to the Hohmann condition.\n- **Lambert** - an orbit matching the planets’ real positions at departure and arrival, giving the excess speeds v∞ and the departure energy C₃.\n\nThe ideal phase result is an educational estimate; it does not replace real mission design.',
      },
    },
    {
      title: { vi: '1. Chuyển quỹ đạo Hohmann', en: '1. The Hohmann transfer' },
      body: {
        vi: 'Chuyển Hohmann là phương án hai xung giữa hai quỹ đạo tròn đồng phẳng quanh cùng một thiên thể trung tâm. Khi đi ra ngoài, tàu tăng tốc vào một elip chuyển tiếp; sau nửa elip, tàu thực hiện xung thứ hai để khớp vận tốc với quỹ đạo đích.\n\n$$a_T = \\frac{r_1 + r_2}{2},\\qquad v^2 = \\mu_\\odot\\left(\\frac{2}{r} - \\frac{1}{a}\\right),\\qquad v_c = \\sqrt{\\frac{\\mu_\\odot}{r}}$$\n\nĐối với chuyển ra ngoài ($r_2 > r_1$):\n\n$$\\Delta v_1 = \\sqrt{\\frac{\\mu_\\odot}{r_1}}\\left(\\sqrt{\\frac{2r_2}{r_1+r_2}} - 1\\right),\\qquad \\Delta v_2 = \\sqrt{\\frac{\\mu_\\odot}{r_2}}\\left(1 - \\sqrt{\\frac{2r_1}{r_1+r_2}}\\right)$$\n\n$$t_H = \\pi\\sqrt{\\frac{a_T^3}{\\mu_\\odot}}$$\n\nVới chuyển vào trong, hai xung đổi dấu (giảm tốc, ngược chiều chuyển động); mô phỏng hiển thị xung có dấu và tổng là $|\\Delta v_1| + |\\Delta v_2|$.\n\nHohmann là nghiệm chuẩn hiệu quả về tổng Δv cho bài toán hai xung giữa các quỹ đạo tròn đồng phẳng. Khi có ràng buộc thời gian, quỹ đạo lệch tâm, độ nghiêng hay yêu cầu nhiệm vụ đặc biệt, phương án tối ưu có thể khác.',
        en: 'The Hohmann transfer is the two-impulse transfer between coplanar circular orbits about one central body. Going outward, the craft speeds up into a transfer ellipse; after half an ellipse a second impulse matches the target orbit’s speed.\n\n$$a_T = \\frac{r_1 + r_2}{2},\\qquad v^2 = \\mu_\\odot\\left(\\frac{2}{r} - \\frac{1}{a}\\right),\\qquad v_c = \\sqrt{\\frac{\\mu_\\odot}{r}}$$\n\nFor an outward transfer ($r_2 > r_1$):\n\n$$\\Delta v_1 = \\sqrt{\\frac{\\mu_\\odot}{r_1}}\\left(\\sqrt{\\frac{2r_2}{r_1+r_2}} - 1\\right),\\qquad \\Delta v_2 = \\sqrt{\\frac{\\mu_\\odot}{r_2}}\\left(1 - \\sqrt{\\frac{2r_1}{r_1+r_2}}\\right)$$\n\n$$t_H = \\pi\\sqrt{\\frac{a_T^3}{\\mu_\\odot}}$$\n\nFor an inward transfer both impulses change sign (retrograde, slowing down); the simulator shows signed impulses and the total $|\\Delta v_1| + |\\Delta v_2|$.\n\nHohmann is the standard Δv-efficient solution for two-impulse transfers between coplanar circles. With time constraints, eccentric or inclined orbits, or special mission requirements, the optimum can differ.',
      },
    },
    {
      title: { vi: '2. Góc pha và điều kiện gặp Sao Hoả', en: '2. Phase angle and meeting Mars' },
      body: {
        vi: 'Tại thời điểm khởi hành, Sao Hoả cần nằm phía trước Trái Đất một góc pha phù hợp để đến đúng điểm hẹn khi tàu tới:\n\n$$\\phi_H = \\pi - n_M t_H,\\qquad n_i = \\sqrt{\\frac{\\mu_\\odot}{r_i^3}}$$\n\nVới cấu hình Trái Đất–Sao Hoả tiêu chuẩn, $\\phi_H ≈ 44°$. Chu kỳ giao hội\n\n$$T_{\\rm syn} = \\frac{2\\pi}{|n_E - n_M|}$$\n\nvào khoảng 780 ngày: là khoảng thời gian đặc trưng để cấu hình tương đối của hai hành tinh **gần** lặp lại, không phải chu kỳ chính xác của mọi cửa sổ phóng.',
        en: 'At departure Mars must lead Earth by the right phase angle so that it reaches the meeting point when the craft does:\n\n$$\\phi_H = \\pi - n_M t_H,\\qquad n_i = \\sqrt{\\frac{\\mu_\\odot}{r_i^3}}$$\n\nFor the standard Earth–Mars case $\\phi_H ≈ 44°$. The synodic period\n\n$$T_{\\rm syn} = \\frac{2\\pi}{|n_E - n_M|}$$\n\nis about 780 days: the characteristic time for the planets’ relative geometry to **nearly** repeat, not the exact spacing of every launch window.',
      },
    },
    {
      title: { vi: '3. Vị trí hành tinh thật và cửa sổ phóng', en: '3. Real planet positions and launch windows' },
      body: {
        vi: 'Trong Hệ Mặt Trời thực, các hành tinh chuyển động theo quỹ đạo có độ lệch tâm và độ nghiêng khác nhau, nên góc pha biến đổi không đều. Chế độ **Hành tinh thực** tìm những ngày mà góc pha thực bằng góc pha Hohmann lý tưởng - một phép **sàng lọc hình học**. Từ 20/10/2026, các ngày này là 04/12/2026, 06/01/2029, 09/02/2031, 18/03/2033… cách nhau 764–809 ngày chứ không cố định 780 ngày.\n\nĐể xác định quỹ đạo thực sự bay tới đích, cần xét trạng thái vị trí và vận tốc tại thời điểm khởi hành và thời điểm đến - đó là bài toán **Lambert**. Từ nghiệm Lambert:\n\n$$\\mathbf v_{\\infty,E} = \\mathbf v_{\\rm sc}(t_0) - \\mathbf v_E(t_0),\\qquad \\mathbf v_{\\infty,M} = \\mathbf v_{\\rm sc}(t_1) - \\mathbf v_M(t_1),\\qquad C_3 = |\\mathbf v_{\\infty,E}|^2$$\n\n$C_3$ là năng lượng khởi hành đặc trưng mà tên lửa phải cung cấp sau khi thoát khỏi Trái Đất. Kết quả Lambert vẫn chỉ là một bước trong thiết kế nhiệm vụ.',
        en: 'In the real Solar System planets move on eccentric, inclined orbits, so the phase angle changes unevenly. The **Real planets** mode finds the dates when the real phase equals the ideal Hohmann phase - a **geometric screening**. From 20 Oct 2026 these dates are 4 Dec 2026, 6 Jan 2029, 9 Feb 2031, 18 Mar 2033… spaced 764–809 days apart, not a fixed 780 days.\n\nTo find an orbit that actually reaches the target, you need the position and velocity states at departure and arrival - the **Lambert** problem. From its solution:\n\n$$\\mathbf v_{\\infty,E} = \\mathbf v_{\\rm sc}(t_0) - \\mathbf v_E(t_0),\\qquad \\mathbf v_{\\infty,M} = \\mathbf v_{\\rm sc}(t_1) - \\mathbf v_M(t_1),\\qquad C_3 = |\\mathbf v_{\\infty,E}|^2$$\n\n$C_3$ is the characteristic departure energy the launcher must supply beyond Earth escape. A Lambert solution is still only one step of mission design.',
      },
    },
    {
      title: { vi: '4. Hohmann và bi-elliptic', en: '4. Hohmann versus bi-elliptic' },
      body: {
        vi: 'Bi-elliptic dùng hai elip chuyển tiếp với một điểm trung gian $r_b$ xa hơn quỹ đạo đích và **ba** xung vận tốc:\n\n$$a_1 = \\frac{r_1 + r_b}{2},\\quad a_2 = \\frac{r_2 + r_b}{2},\\quad \\Delta v_{\\rm bi} = |\\Delta v_1| + |\\Delta v_2| + |\\Delta v_3|,\\quad t_{\\rm bi} = \\pi\\sqrt{\\frac{a_1^3}{\\mu}} + \\pi\\sqrt{\\frac{a_2^3}{\\mu}}$$\n\nNgưỡng **11,94** là nơi Hohmann bằng trường hợp giới hạn $r_b \\to \\infty$ (có thời gian bay vô hạn). Trong khoảng **11,94–15,58**, tính ưu việt phụ thuộc $r_b$; trên **15,58**, mọi bi-elliptic với $r_b > r_2$ đều tốn ít Δv hơn Hohmann - trong bài toán chuyển giữa hai quỹ đạo tròn đồng phẳng. Lợi ích về Δv luôn đi kèm thời gian bay dài hơn.',
        en: 'A bi-elliptic transfer uses two transfer ellipses through an intermediate point $r_b$ beyond the target orbit and **three** impulses:\n\n$$a_1 = \\frac{r_1 + r_b}{2},\\quad a_2 = \\frac{r_2 + r_b}{2},\\quad \\Delta v_{\\rm bi} = |\\Delta v_1| + |\\Delta v_2| + |\\Delta v_3|,\\quad t_{\\rm bi} = \\pi\\sqrt{\\frac{a_1^3}{\\mu}} + \\pi\\sqrt{\\frac{a_2^3}{\\mu}}$$\n\nThe **11.94** threshold is where Hohmann equals the limiting case $r_b \\to \\infty$ (infinite flight time). Between **11.94 and 15.58** the winner depends on $r_b$; above **15.58** every bi-elliptic with $r_b > r_2$ needs less Δv than Hohmann - for transfers between coplanar circles. The Δv saving always comes with a longer flight.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Phóng sai thời điểm', en: 'Experiment 1 - Launching at the wrong time' }, text: { vi: 'Ở chế độ “Hành tinh thực”, giữ Trái Đất → Sao Hoả, chọn ngày hôm nay và chạy. Quan sát vị trí Sao Hoả khi tàu đến (vòng nét đứt) và độ lệch điểm hẹn. Sau đó bấm “Ngày pha Hohmann kế tiếp” và so sánh.', en: 'In “Real planets” mode keep Earth → Mars, choose today and run. Watch where Mars is when the craft arrives (dashed ring) and the rendezvous miss. Then press “Next Hohmann phase date” and compare.' }, params: { view: 'eph', from: 'earth', to: 'mars' } },
    { title: { vi: 'Thử nghiệm 2 - Khảo sát góc pha', en: 'Experiment 2 - Exploring the phase angle' }, text: { vi: 'So sánh góc pha tại ngày khởi hành với góc pha lý tưởng. Đổi ngày phóng vài tuần trước và sau ngày pha Hohmann: độ lệch điểm hẹn thay đổi thế nào? Vì sao các ngày pha kế tiếp không cách nhau đúng 780 ngày?', en: 'Compare the phase at the departure date with the ideal phase. Move the date a few weeks either side of the Hohmann phase date: how does the miss change? Why are successive phase dates not exactly 780 days apart?' }, params: { view: 'eph', from: 'earth', to: 'mars' } },
    { title: { vi: 'Thử nghiệm 3 - Tới Sao Mộc', en: 'Experiment 3 - To Jupiter' }, text: { vi: 'Chọn Trái Đất → Sao Mộc. So sánh thời gian bay, hai xung vận tốc và góc pha. Thảo luận vì sao các nhiệm vụ thực dùng hỗ trợ hấp dẫn hoặc quỹ đạo chuyển khác để giảm nhiên liệu hoặc đáp ứng ràng buộc thời gian.', en: 'Choose Earth → Jupiter. Compare flight time, impulses and phase angle. Discuss why real missions use gravity assists or other transfers to save propellant or meet time constraints.' }, params: { view: 'ideal', from: 'earth', to: 'jupiter' } },
    { title: { vi: 'Thử nghiệm 4 - Bi-elliptic', en: 'Experiment 4 - Bi-elliptic' }, text: { vi: 'Mở biểu đồ đánh đổi, thay đổi r_b và rê chuột theo R = r₂/r₁. Ghi lại tổng Δv cùng thời gian bay tại nơi bi-elliptic bắt đầu có lợi. Câu hỏi suy ngẫm: nếu một phương án tiết kiệm Δv nhưng bay lâu hơn nhiều, cần cân nhắc những yếu tố nào trước khi chọn cho nhiệm vụ thực?', en: 'Open the trade-off charts, change r_b and hover along R = r₂/r₁. Record total Δv and flight time where bi-elliptic starts to pay off. Reflection: if an option saves Δv but takes far longer, what must be weighed before choosing it for a real mission?' }, params: { view: 'ideal', from: 'earth', to: 'neptune', mode: 'bi', rb: 3 } },
    { title: { vi: 'Thử nghiệm 5 - Lambert và C₃', en: 'Experiment 5 - Lambert and C₃' }, text: { vi: 'Chọn chế độ Lambert, bấm “Ngày pha Hohmann kế tiếp”, rồi tìm điểm ★ trên bản đồ C₃. Ngày đi và thời gian bay tối ưu theo C₃ có trùng với Hohmann lý tưởng không? Vì sao có dải C₃ rất cao?', en: 'Choose Lambert, press “Next Hohmann phase date”, then find ★ on the C₃ map. Do the C₃-optimal date and flight time match the ideal Hohmann? Why is there a ridge of very high C₃?' }, params: { view: 'lambert', from: 'earth', to: 'mars' } },
  ],
  quiz: [
    { q: { vi: 'Cơ hội hình học thuận lợi cho chuyển quỹ đạo Trái Đất–Sao Hoả thường lặp lại sau khoảng:', en: 'Favourable Earth–Mars transfer geometry recurs about every:' }, options: [{ vi: '12 tháng', en: '12 months' }, { vi: '26 tháng (~780 ngày)', en: '26 months (~780 d)' }, { vi: '5 năm', en: '5 years' }], answer: 1, explain: { vi: 'Chu kỳ giao hội trung bình ≈ 780 ngày; khoảng cách thực giữa các lần thay đổi vì quỹ đạo lệch tâm.', en: 'Mean synodic period ≈ 780 d; the actual spacing varies because the orbits are eccentric.' } },
    { q: { vi: 'Vì sao thời gian bay Hohmann bằng nửa chu kỳ elip chuyển tiếp?', en: 'Why is the Hohmann flight time half the transfer-ellipse period?' }, options: [{ vi: 'Vì tàu đi từ cận điểm đến viễn điểm', en: 'Because the craft goes from periapsis to apoapsis' }, { vi: 'Vì Sao Hoả đi được nửa vòng', en: 'Because Mars travels half an orbit' }, { vi: 'Vì tốc độ không đổi', en: 'Because the speed is constant' }], answer: 0, explain: { vi: 'Hai quỹ đạo tròn tiếp xúc elip tại cận điểm và viễn điểm, cách nhau đúng nửa vòng.', en: 'The circles touch the ellipse at periapsis and apoapsis, exactly half an orbit apart.' } },
    { q: { vi: 'Tổng Δv Hohmann 5,59 km/s có phải tổng Δv từ mặt đất Trái Đất đến bề mặt Sao Hoả?', en: 'Is the 5.59 km/s Hohmann total the Δv from Earth’s surface to Mars’s surface?' }, options: [{ vi: 'Có', en: 'Yes' }, { vi: 'Không', en: 'No' }], answer: 1, explain: { vi: 'Đó là tổng hai xung trong mô hình nhật tâm giữa các quỹ đạo tròn lý tưởng; nhiệm vụ thực còn cần phóng khỏi Trái Đất, hiệu chỉnh, hãm hoặc chèn quỹ đạo tại Sao Hoả.', en: 'It is the sum of two impulses in the heliocentric ideal-circle model; a real mission also needs Earth launch, corrections, and braking or orbit insertion at Mars.' } },
    { q: { vi: 'Vì sao không thể kết luận bi-elliptic luôn có lợi khi r₂/r₁ > 11,94?', en: 'Why can’t we conclude bi-elliptic always wins when r₂/r₁ > 11.94?' }, options: [{ vi: 'Vì 11,94 ứng với giới hạn r_b → ∞; trong 11,94–15,58 còn tuỳ r_b, và thời gian bay cũng là tiêu chí', en: 'Because 11.94 is the r_b → ∞ limit; between 11.94 and 15.58 it depends on r_b, and flight time matters too' }, { vi: 'Vì bi-elliptic luôn tốn nhiên liệu hơn', en: 'Because bi-elliptic always costs more' }], answer: 0, explain: { vi: 'Chỉ trên ≈ 15,58 mọi r_b > r₂ mới có lợi về Δv; giới hạn r_b → ∞ có thời gian bay vô hạn.', en: 'Only above ≈ 15.58 does every r_b > r₂ save Δv; the r_b → ∞ limit has infinite flight time.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: NASA/JPL Education - “Let’s Go to Mars! Calculating Launch Windows”; JPL Horizons (vectơ trạng thái); Curtis (2020) Orbital Mechanics for Engineering Students, ch. 5, 6, 8; Vallado (2013) §6.3; Orbital Mechanics & Astrodynamics - Bi-elliptic Hohmann transfer.',
    en: 'Resources: NASA/JPL Education - “Let’s Go to Mars! Calculating Launch Windows”; JPL Horizons (state vectors); Curtis (2020) Orbital Mechanics for Engineering Students, ch. 5, 6, 8; Vallado (2013) §6.3; Orbital Mechanics & Astrodynamics - Bi-elliptic Hohmann transfer.',
  },
};

/** Model Card · B2. Measured figures: `npm run validate:transfer` → docs/validation/B2-transfer.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Hohmann, bi-elliptic, góc pha, chu kỳ giao hội, Lambert (giải tích / nghiệm số kiểm soát)', en: 'Level A - Hohmann, bi-elliptic, phase angle, synodic period, Lambert (analytic / controlled numerics)' },
      body: {
        vi: 'B2 mô phỏng chuyển quỹ đạo giữa các hành tinh bằng Hohmann và bi-elliptic trong mô hình hai vật lý tưởng; tính xung vận tốc, thời gian bay, góc pha khởi hành, chu kỳ giao hội; dùng vị trí hành tinh JPL để sàng lọc ngày có hình học gần điều kiện Hohmann; và giải bài toán Lambert giữa vị trí thật lúc đi và lúc đến để có v∞ và C₃. Ba lớp - Hohmann lý tưởng, pha theo ephemeris, Lambert - được tách riêng trên giao diện.',
        en: 'B2 models interplanetary transfers with Hohmann and bi-elliptic transfers in the ideal two-body model; computes impulses, flight time, departure phase angle and synodic period; screens dates whose geometry is near the Hohmann condition using JPL planet positions; and solves Lambert’s problem between real departure and arrival positions for v∞ and C₃. The three layers - ideal Hohmann, ephemeris phase, Lambert - are separated in the interface.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Kích thước hành tinh, tốc độ hoạt ảnh', en: 'Planet sizes, animation speed' },
      body: { vi: 'Khoảng cách theo tỉ lệ; kích thước thiên thể và tốc độ hoạt ảnh không theo tỉ lệ.', en: 'Distances to scale; body sizes and animation speed are not.' },
    },
  ],
  fidelityNote: {
    vi: 'Mức A là phân loại nội bộ của USAC SimLab, không phải chứng nhận độ chính xác theo tiêu chuẩn quốc tế. Kết quả chỉ có ý nghĩa trong phạm vi giả định và quy trình kiểm định được công bố.',
    en: 'Level A is USAC SimLab’s internal scale, not a certification against an international standard. Results are meaningful only within the stated assumptions and published validation.',
  },
  equations: [],
  methods: [
    {
      title: { vi: '1. Quỹ đạo chuyển Hohmann', en: '1. Hohmann transfer' },
      tex: ['a_T=\\frac{r_1+r_2}{2},\\quad v_c(r)=\\sqrt{\\frac{\\mu}{r}},\\quad v_T(r)=\\sqrt{\\mu\\left(\\frac{2}{r}-\\frac{1}{a_T}\\right)}', '\\Delta v_1=v_T(r_1)-v_c(r_1),\\quad \\Delta v_2=v_c(r_2)-v_T(r_2),\\quad \\Delta v_H=|\\Delta v_1|+|\\Delta v_2|,\\quad t_H=\\pi\\sqrt{\\frac{a_T^3}{\\mu}}'],
      body: {
        vi: 'Xung có dấu: dương là thuận chiều (tăng tốc), âm là ngược chiều; chuyển vào trong có cả hai xung âm. Mô hình xung tức thời - không mô phỏng thời gian đốt hữu hạn hay mất mát lực đẩy. Tổng $\\Delta v_H$ là **biến thiên vận tốc nhật tâm** trong mô hình chuyển tiếp, không phải ngân sách từ mặt đất tới điểm đến. Bán kính dùng bán trục lớn J2000 của JPL (Trái Đất 1,00000261 au, Sao Hoả 1,52371 au); hằng số $GM_\\odot$ theo DE430.',
        en: 'Signed impulses: positive is prograde (speed up), negative retrograde; an inward transfer has both negative. Impulsive model - no finite burns or thrust losses. $\\Delta v_H$ is the **heliocentric velocity change** of the transfer model, not a surface-to-destination budget. Radii are JPL J2000 semi-major axes (Earth 1.00000261 au, Mars 1.52371 au); $GM_\\odot$ from DE430.',
      },
    },
    {
      title: { vi: '2. Góc pha và chu kỳ giao hội', en: '2. Phase angle and synodic period' },
      tex: ['\\phi_H=\\pi-n_2t_H,\\qquad n_i=\\sqrt{\\frac{\\mu}{r_i^3}},\\qquad T_{\\rm syn}=\\frac{2\\pi}{|n_1-n_2|}'],
      body: {
        vi: '$\\phi_H$ là góc đích nằm **trước** vật xuất phát tại thời điểm phóng, chuẩn hoá về (−180°, 180°]; giá trị âm nghĩa là đích phải đi sau (thường gặp khi chuyển vào trong). Với bi-elliptic, điểm đến cách điểm đi 360° nên $\\phi = 2\\pi - n_2 t_{\\rm bi}$.',
        en: '$\\phi_H$ is the angle by which the target **leads** the departure body at launch, wrapped to (−180°, 180°]; negative means the target must trail (typical inward). For bi-elliptic, arrival is 360° from departure, so $\\phi = 2\\pi - n_2 t_{\\rm bi}$.',
      },
    },
    {
      title: { vi: '3. Vị trí hành tinh và ngày pha Hohmann', en: '3. Planet positions and Hohmann phase dates' },
      tex: ['\\phi(t)=\\lambda_{\\rm target}(t)-\\lambda_{\\rm dep}(t),\\qquad \\phi(t^*)=\\phi_H'],
      body: {
        vi: 'Vị trí từ phần tử gần đúng JPL Standish (Bảng 1, hoàng đạo J2000, nhật tâm, 1800–2050; sai số đo được so với DE441 xem E1). Kinh độ hoàng đạo nhật tâm $\\lambda$; thời gian TDB ≈ UTC (bỏ qua 69 s). Ngày $t^*$ tìm bằng quét bước 1 ngày rồi chia đôi tới $|\\Delta\\phi| < 10^{-9}$ rad. Đây là **phép sàng lọc hình học**: không được diễn giải là cửa sổ phóng tối ưu cho một nhiệm vụ cụ thể.',
        en: 'Positions from the JPL Standish approximate elements (Table 1, ecliptic J2000, heliocentric, 1800–2050; measured error vs DE441: see E1). Heliocentric ecliptic longitude $\\lambda$; TDB ≈ UTC (69 s neglected). Dates $t^*$ are found by a 1-day scan and bisection to $|\\Delta\\phi| < 10^{-9}$ rad. This is **geometric screening**: not to be read as the optimal launch window of any specific mission.',
      },
    },
    {
      title: { vi: '4. Bài toán Lambert, v∞ và C₃', en: '4. Lambert’s problem, v∞ and C₃' },
      tex: ['\\mathbf v_{\\infty,E}=\\mathbf v_{\\rm sc}(t_0)-\\mathbf v_E(t_0),\\quad \\mathbf v_{\\infty,M}=\\mathbf v_{\\rm sc}(t_1)-\\mathbf v_M(t_1),\\quad C_3=|\\mathbf v_{\\infty,E}|^2'],
      body: {
        vi: 'Biến phổ quát (Curtis, Thuật toán 5.2), 0 vòng, chiều thuận; nghiệm z được kẹp và chia đôi tới độ chính xác máy (không phân kỳ). Vận tốc hành tinh lấy bằng sai phân trung tâm của vị trí Standish (h = 0,05 ngày). Lambert cho chặng nhật tâm của mô hình patched conics; chưa gồm quỹ đạo đỗ, thoát khỏi Trái Đất, hãm hay chèn quỹ đạo Sao Hoả. Gần Δθ = 180° mặt phẳng quỹ đạo kém xác định và C₃ tăng vọt (dải đỏ trên bản đồ porkchop).',
        en: 'Universal variables (Curtis, Algorithm 5.2), zero revolutions, prograde; z is bracketed and bisected to machine precision (cannot diverge). Planet velocities by central differences of the Standish positions (h = 0.05 d). Lambert gives the heliocentric leg of a patched-conic model; parking orbit, Earth escape, braking and Mars orbit insertion are not included. Near Δθ = 180° the orbit plane is ill-defined and C₃ spikes (red ridge on the porkchop map).',
      },
    },
    {
      title: { vi: '5. Chuyển bi-elliptic', en: '5. Bi-elliptic transfer' },
      tex: ['a_1=\\frac{r_1+r_b}{2},\\quad a_2=\\frac{r_2+r_b}{2},\\quad \\Delta v_{\\rm bi}=\\sum_{i=1}^3|\\Delta v_i|,\\quad t_{\\rm bi}=\\pi\\sqrt{\\frac{a_1^3}{\\mu}}+\\pi\\sqrt{\\frac{a_2^3}{\\mu}}', '\\lim_{r_b\\to\\infty}\\Delta v_{\\rm bi}=(\\sqrt2-1)\\,(v_{c1}+v_{c2}),\\qquad t_{\\rm bi}\\to\\infty'],
      body: {
        vi: 'Ba xung tính trực tiếp từ vis-viva: rời quỹ đạo đầu, chuyển giữa hai elip tại $r_b$, khớp quỹ đạo đích. Ngưỡng $R_1 = 11{,}9388$: Hohmann bằng giới hạn $r_b \\to \\infty$ (một giới hạn toán học, không phải quỹ đạo bay được). $R_2 = 15{,}5817$: trên đó mọi $r_b > r_2$ đều có lợi về Δv. Hai ngưỡng được **tính số** trong lõi (chia đôi), không nhập tay. Việc so sánh phải xét cả thời gian bay.',
        en: 'The three impulses come straight from vis-viva: leave the initial orbit, switch ellipses at $r_b$, match the target orbit. Threshold $R_1 = 11.9388$: Hohmann equals the $r_b \\to \\infty$ limit (a mathematical limit, not a flyable orbit). $R_2 = 15.5817$: above it every $r_b > r_2$ saves Δv. Both thresholds are **computed** in the core (bisection), not typed in. Comparisons must include flight time.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Quỹ đạo ban đầu và quỹ đạo đích tròn, đồng phẳng, cùng tâm hấp dẫn (lớp lý tưởng); chỉ có hấp dẫn của Mặt Trời.',
      'Các xung vận tốc tức thời.',
      'Vị trí hành tinh JPL không tự biến quỹ đạo Hohmann thành nghiệm nhiệm vụ thực; chỉ lớp Lambert khớp vị trí thật hai đầu.',
      'Chưa xét nhiễu loạn hành tinh, khối lượng tàu, thời gian đốt, áp suất bức xạ và ràng buộc nhiệm vụ.',
      'Tổng Δv Hohmann là biến thiên vận tốc nhật tâm, không phải ngân sách tổng từ mặt đất tới điểm đến.',
    ],
    en: [
      'Initial and target orbits circular, coplanar, same central body (ideal layer); solar gravity only.',
      'Impulsive velocity changes.',
      'JPL positions do not turn the Hohmann orbit into a real mission solution; only the Lambert layer matches real positions at both ends.',
      'No planetary perturbations, spacecraft mass, burn duration, radiation pressure or mission constraints.',
      'The Hohmann total is a heliocentric velocity change, not a surface-to-destination budget.',
    ],
  },
  validity: {
    vi: ['Hohmann: hai quỹ đạo tròn đồng phẳng quanh cùng một thiên thể.', 'Bi-elliptic: r_b ≥ max(r₁, r₂).', 'Ngày pha và Lambert: 1800–2050 (miền của phần tử Standish).', 'Lambert: 0 vòng, chiều thuận; không có nghiệm khi Δθ ≈ 0° hoặc 180°.'],
    en: ['Hohmann: two coplanar circular orbits about one body.', 'Bi-elliptic: r_b ≥ max(r₁, r₂).', 'Phase dates and Lambert: 1800–2050 (Standish element range).', 'Lambert: zero-revolution, prograde; no solution at Δθ ≈ 0° or 180°.'],
  },
  scope: {
    vi: 'Chưa phải bộ thiết kế quỹ đạo nhiệm vụ: không tối ưu có ràng buộc, không có hỗ trợ hấp dẫn, quỹ đạo đỗ, hãm hay chèn quỹ đạo.',
    en: 'Not a mission design tool: no constrained optimisation, gravity assists, parking orbits, braking or orbit insertion.',
  },
  validationText: {
    vi: 'Tái lập bằng `npm run validate:transfer` (→ `docs/validation/B2-transfer.json`):\n\n- **Hohmann Trái Đất → Sao Hoả, r = 1 → 1,524 au:** Δv₁ = 2,946, Δv₂ = 2,650, tổng 5,596 km/s, 258,9 ngày, φ_H = 44,36° (NASA/JPL: ≈ 259 ngày, 44°). Với bán trục lớn JPL J2000 (giá trị giao diện dùng): 2,945 + 2,649 = 5,594 km/s, 258,87 ngày, φ_H = 44,35°, T_syn = 779,9 ngày.\n- **Lệch điểm hẹn của đường lý tưởng trên hành tinh thực:** −17,9° tại ngày pha 04/12/2026, vì quỹ đạo Sao Hoả lệch tâm (e ≈ 0,093, biên độ phương trình tâm ≈ 2e ≈ 10,7°); lớp Lambert khử sai lệch này theo định nghĩa.\n- **Chuyển vào trong:** hai xung âm, độ lớn trùng chuyển ra ngoài đảo chiều tới 10⁻¹⁵.\n- **Ngày pha theo ephemeris (từ 20/10/2026):** 04/12/2026, 06/01/2029, 09/02/2031, 18/03/2033, 09/05/2035, 26/07/2037; phần dư góc pha ≤ 3 × 10⁻¹² rad; khoảng cách 763,6–809,4 ngày.\n- **Bi-elliptic:** R₁ = 11,938765, R₂ = 15,581709 (tính số); tại R = 14, r_b = 1,5 r₂ thua và r_b = 100 r₂ thắng Hohmann; tại R = 20, r_b = 1,01 r₂ đã thắng; r_b = r₂ trùng Hohmann tới 10⁻¹².\n- **Lambert:** khớp Curtis Ví dụ 5.2 tới 4 chữ số; lan truyền DOPRI5 độc lập từ (r₁, v₁) tới r₂ lệch 6 × 10⁻¹⁰ km; gần Δθ = 180°, |v₁| trùng vận tốc cận điểm Hohmann tới 2,5 × 10⁻⁹.\n- **C₃ cơ hội Trái Đất → Sao Hoả 2026:** quét ±60 ngày quanh 04/12/2026, thời gian bay 150–330 ngày: C₃ nhỏ nhất 10,93 km²/s² (đi 14/11/2026, bay 270 ngày, v∞ đến 2,91 km/s) với vị trí Standish. Đây là kết quả của mô hình, chưa đối chiếu với số liệu nhiệm vụ đã công bố.',
    en: 'Reproduce with `npm run validate:transfer` (→ `docs/validation/B2-transfer.json`):\n\n- **Hohmann Earth → Mars, r = 1 → 1.524 au:** Δv₁ = 2.946, Δv₂ = 2.650, total 5.596 km/s, 258.9 d, φ_H = 44.36° (NASA/JPL: ≈ 259 d, 44°). With the JPL J2000 semi-major axes (used by the interface): 2.945 + 2.649 = 5.594 km/s, 258.87 d, φ_H = 44.35°, T_syn = 779.9 d.\n- **Rendezvous miss of the ideal path on real planets:** −17.9° at the 4 Dec 2026 phase date, because Mars’s orbit is eccentric (e ≈ 0.093, equation-of-centre amplitude ≈ 2e ≈ 10.7°); the Lambert layer removes it by construction.\n- **Inward transfer:** both impulses negative, magnitudes equal the reversed outward case to 10⁻¹⁵.\n- **Ephemeris phase dates (from 20 Oct 2026):** 4 Dec 2026, 6 Jan 2029, 9 Feb 2031, 18 Mar 2033, 9 May 2035, 26 Jul 2037; phase residual ≤ 3 × 10⁻¹² rad; spacings 763.6–809.4 d.\n- **Bi-elliptic:** R₁ = 11.938765, R₂ = 15.581709 (computed); at R = 14, r_b = 1.5 r₂ loses and r_b = 100 r₂ beats Hohmann; at R = 20, r_b = 1.01 r₂ already wins; r_b = r₂ equals Hohmann to 10⁻¹².\n- **Lambert:** matches Curtis Example 5.2 to 4 digits; independent DOPRI5 propagation from (r₁, v₁) reaches r₂ within 6 × 10⁻¹⁰ km; near Δθ = 180°, |v₁| equals the Hohmann perihelion speed to 2.5 × 10⁻⁹.\n- **C₃ of the 2026 Earth → Mars opportunity:** scanning ±60 d around 4 Dec 2026 and 150–330 d flights: minimum C₃ = 10.93 km²/s² (depart 14 Nov 2026, 270 d, arrival v∞ 2.91 km/s) with Standish positions. This is a model result, not yet compared with published mission data.',
  },
  errors: { vi: [], en: [] },
  validation: { vi: [], en: [] },
  limitations: {
    vi: [
      'Chưa phải bộ thiết kế quỹ đạo liên hành tinh có tối ưu ràng buộc nhiệm vụ; Lambert chỉ 0 vòng.',
      'Chưa tính quỹ đạo đỗ, thoát khỏi Trái Đất (từ C₃ sang Δv phóng), hãm và chèn quỹ đạo quanh Sao Hoả.',
      'Ngày pha Hohmann không đồng nghĩa với ngày phóng khả thi cho mọi tàu, tên lửa hay mục tiêu nhiệm vụ.',
      'Mô hình bi-elliptic đánh giá hiệu quả động lực học lý tưởng, chưa tính thời gian nhiệm vụ và ràng buộc kỹ thuật.',
      'Vị trí hành tinh từ phần tử gần đúng (Sao Hoả lệch ≤ 92″, Sao Mộc ≤ 516″ so với DE441 - xem E1).',
    ],
    en: [
      'Not a constrained interplanetary mission optimiser; Lambert is zero-revolution only.',
      'No parking orbit, Earth escape (C₃ to launch Δv), braking or Mars orbit insertion.',
      'A Hohmann phase date is not a feasible launch date for every spacecraft, launcher or mission goal.',
      'The bi-elliptic model rates ideal dynamical efficiency only, without mission duration or engineering constraints.',
      'Planet positions from approximate elements (Mars ≤ 92″, Jupiter ≤ 516″ vs DE441 - see E1).',
    ],
  },
  references: [
    'Curtis, H. D. (2020). Orbital Mechanics for Engineering Students, 4th ed., ch. 5 (Lambert, Algorithm 5.2), 6, 8.',
    'Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications, 4th ed., §6.3.',
    'Bate, R. R., Mueller, D. D. & White, J. E. (1971). Fundamentals of Astrodynamics. Dover.',
    'NASA/JPL Education - Let’s Go to Mars! Calculating Launch Windows.',
    'JPL Horizons - API and state-vector documentation; Standish, E. M. - Keplerian Elements for Approximate Positions of the Major Planets.',
    'Orbital Mechanics & Astrodynamics - Bi-elliptic Hohmann transfer.',
  ],
};
