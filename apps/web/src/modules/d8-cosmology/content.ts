import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Viết phương trình Friedmann với các thành phần bức xạ, vật chất, độ cong và hằng số vũ trụ, và giải thích ý nghĩa của từng tham số mật độ $\\Omega$.',
      'Tính hệ số tỉ lệ $a(t)$, tuổi vũ trụ và thời gian nhìn lại từ $H_0$ và các tham số mật độ.',
      'Hiểu dịch chuyển đỏ vũ trụ $1 + z = 1/a$ là hệ quả của sự giãn nở không gian.',
      'Phân biệt khoảng cách đồng chuyển động, khoảng cách độ sáng và khoảng cách đường kính góc.',
      'So sánh các mô hình vũ trụ: Einstein–de Sitter, mở, đóng, de Sitter và ΛCDM.',
    ],
    en: [
      'Write the Friedmann equation with radiation, matter, curvature and a cosmological constant, and explain each density parameter $\\Omega$.',
      'Compute the scale factor $a(t)$, the age of the Universe and look-back times from $H_0$ and the density parameters.',
      'Understand cosmological redshift $1 + z = 1/a$ as a consequence of the expansion of space.',
      'Distinguish comoving, luminosity and angular-diameter distances.',
      'Compare cosmological models: Einstein–de Sitter, open, closed, de Sitter and ΛCDM.',
    ],
  },
  durationMin: 45,
  prerequisites: { vi: 'Định luật Hubble $v = H_0 d$; tích phân xác định; hàm $a(t)$ và đạo hàm.', en: 'Hubble’s law $v = H_0 d$; definite integrals; a function $a(t)$ and its derivative.' },
  background: [
    {
      title: { vi: 'Vũ trụ đồng nhất và đẳng hướng', en: 'A homogeneous and isotropic Universe' },
      body: {
        vi: 'Ở thang lớn (hàng trăm Mpc), vũ trụ gần như đồng nhất và đẳng hướng. Khi đó hình học không–thời gian được mô tả bằng metric Friedmann–Lemaître–Robertson–Walker (FLRW), và toàn bộ sự giãn nở được gói trong một hàm duy nhất: **hệ số tỉ lệ** $a(t)$, với quy ước $a(t_0) = 1$ hôm nay. Khoảng cách vật lý giữa hai thiên hà đứng yên trong toạ độ đồng chuyển động là $d(t) = a(t)\\,\\chi$, và tốc độ giãn nở là tham số Hubble $H = \\dot a/a$.',
        en: 'On large scales (hundreds of Mpc) the Universe is nearly homogeneous and isotropic. Spacetime is then described by the Friedmann–Lemaître–Robertson–Walker (FLRW) metric, and the whole expansion is captured by one function: the **scale factor** $a(t)$, normalised to $a(t_0) = 1$ today. The physical distance between two galaxies at rest in comoving coordinates is $d(t) = a(t)\\,\\chi$, and the expansion rate is the Hubble parameter $H = \\dot a/a$.',
      },
    },
    {
      title: { vi: '1. Phương trình Friedmann', en: '1. The Friedmann equation' },
      body: {
        vi: 'Áp dụng phương trình Einstein cho metric FLRW cho\n\n$$H^2(a) = H_0^2\\left[\\Omega_r a^{-4} + \\Omega_m a^{-3} + \\Omega_k a^{-2} + \\Omega_\\Lambda\\right],\\qquad \\Omega_k = 1 - \\Omega_r - \\Omega_m - \\Omega_\\Lambda.$$\n\nMỗi thành phần loãng đi theo một cách riêng: bức xạ $\\propto a^{-4}$ (số photon loãng $a^{-3}$ và mỗi photon mất năng lượng $a^{-1}$), vật chất $\\propto a^{-3}$, hằng số vũ trụ không đổi. $\\Omega_k = 0$ ứng với không gian phẳng; $\\Omega_k > 0$ không gian mở (cong âm), $\\Omega_k < 0$ không gian đóng (cong dương). Phương trình gia tốc\n\n$$\\frac{\\ddot a}{a} = -H_0^2\\left[\\Omega_r a^{-4} + \\tfrac12\\Omega_m a^{-3}\\right] + H_0^2\\,\\Omega_\\Lambda$$\n\ncho thấy vật chất và bức xạ làm giãn nở chậm lại, còn hằng số vũ trụ làm nó tăng tốc.',
        en: 'Einstein’s equations applied to the FLRW metric give\n\n$$H^2(a) = H_0^2\\left[\\Omega_r a^{-4} + \\Omega_m a^{-3} + \\Omega_k a^{-2} + \\Omega_\\Lambda\\right],\\qquad \\Omega_k = 1 - \\Omega_r - \\Omega_m - \\Omega_\\Lambda.$$\n\nEach component dilutes differently: radiation $\\propto a^{-4}$ (photon number dilutes as $a^{-3}$ and each photon loses energy as $a^{-1}$), matter $\\propto a^{-3}$, the cosmological constant stays constant. $\\Omega_k = 0$ corresponds to flat space; $\\Omega_k > 0$ to open (negatively curved) and $\\Omega_k < 0$ to closed (positively curved) space. The acceleration equation\n\n$$\\frac{\\ddot a}{a} = -H_0^2\\left[\\Omega_r a^{-4} + \\tfrac12\\Omega_m a^{-3}\\right] + H_0^2\\,\\Omega_\\Lambda$$\n\nshows that matter and radiation decelerate the expansion while the cosmological constant accelerates it.',
      },
    },
    {
      title: { vi: '2. Tuổi vũ trụ và các mô hình mẫu', en: '2. The age of the Universe and sample models' },
      body: {
        vi: 'Từ $dt = da/(aH)$, tuổi vũ trụ khi hệ số tỉ lệ bằng $a$ là\n\n$$t(a) = \\int_0^{a} \\frac{da\'}{a\'\\,H(a\')}.$$\n\n- **Einstein–de Sitter** ($\\Omega_m = 1$): $a \\propto t^{2/3}$, $t_0 = 2/(3H_0) \\approx 9{,}6$ tỉ năm với $H_0 = 67{,}66$ - trẻ hơn những ngôi sao cổ nhất.\n- **Vũ trụ đóng** ($\\Omega_m = 3$, $\\Omega_\\Lambda = 0$): giãn nở tới $a_{\\max} = \\Omega_m/(\\Omega_m - 1) = 1{,}5$ rồi co lại.\n- **de Sitter** ($\\Omega_\\Lambda = 1$): $a \\propto e^{H_0 t}$, không có Vụ Nổ Lớn ở thời điểm hữu hạn.\n- **ΛCDM Planck 2018** ($H_0 = 67{,}66$ km/s/Mpc, $\\Omega_m = 0{,}3111$): tuổi **13,79 tỉ năm**; giãn nở chuyển từ giảm tốc sang tăng tốc khi $z = 0{,}64$.',
        en: 'From $dt = da/(aH)$, the age when the scale factor equals $a$ is\n\n$$t(a) = \\int_0^{a} \\frac{da\'}{a\'\\,H(a\')}.$$\n\n- **Einstein–de Sitter** ($\\Omega_m = 1$): $a \\propto t^{2/3}$, $t_0 = 2/(3H_0) \\approx 9.6$ Gyr for $H_0 = 67.66$ - younger than the oldest stars.\n- **Closed universe** ($\\Omega_m = 3$, $\\Omega_\\Lambda = 0$): expands to $a_{\\max} = \\Omega_m/(\\Omega_m - 1) = 1.5$ and then recollapses.\n- **de Sitter** ($\\Omega_\\Lambda = 1$): $a \\propto e^{H_0 t}$, with no Big Bang at a finite time.\n- **ΛCDM Planck 2018** ($H_0 = 67.66$ km/s/Mpc, $\\Omega_m = 0.3111$): age **13.79 Gyr**; the expansion switches from deceleration to acceleration at $z = 0.64$.',
      },
    },
    {
      title: { vi: '3. Dịch chuyển đỏ vũ trụ', en: '3. Cosmological redshift' },
      body: {
        vi: 'Ánh sáng phát ra khi hệ số tỉ lệ bằng $a$ có bước sóng bị kéo dài cùng không gian:\n\n$$1 + z = \\frac{\\lambda_{\\text{thu}}}{\\lambda_{\\text{phát}}} = \\frac{1}{a}.$$\n\nĐây không phải hiệu ứng Doppler của vật bay trong một không gian có sẵn: thiên hà đứng yên trong toạ độ đồng chuyển động, chính khoảng cách giữa chúng tăng lên. Với $z \\ll 1$, $cz \\approx H_0 d$ - định luật Hubble–Lemaître.',
        en: 'Light emitted when the scale factor was $a$ has its wavelength stretched with space:\n\n$$1 + z = \\frac{\\lambda_{\\rm obs}}{\\lambda_{\\rm emit}} = \\frac{1}{a}.$$\n\nThis is not a Doppler shift of objects flying through pre-existing space: galaxies sit at fixed comoving coordinates and the distances between them grow. For $z \\ll 1$, $cz \\approx H_0 d$ - the Hubble–Lemaître law.',
      },
    },
    {
      title: { vi: '4. Các khoảng cách vũ trụ học', en: '4. Cosmological distances' },
      body: {
        vi: 'Trong vũ trụ giãn nở, “khoảng cách” phụ thuộc vào cách đo (Hogg 1999):\n\n$$D_C = \\frac{c}{H_0}\\int_0^z \\frac{dz\'}{E(z\')},\\qquad E(z) = \\frac{H(z)}{H_0},$$\n\n- $D_C$: khoảng cách **đồng chuyển động** - độ dài một sợi thước nối hai thiên hà nếu ta “dừng” giãn nở hôm nay.\n- $D_M$: khoảng cách đồng chuyển động ngang, bằng $D_C$ khi không gian phẳng, có thêm hàm $\\sinh$ hoặc $\\sin$ khi $\\Omega_k \\ne 0$.\n- $D_L = (1+z)\\,D_M$: khoảng cách **độ sáng**, dùng với ngọn nến chuẩn như siêu tân tinh Ia (F8).\n- $D_A = D_M/(1+z)$: khoảng cách **đường kính góc**, dùng với thước chuẩn. Trong ΛCDM, $D_A$ đạt cực đại quanh $z \\approx 1{,}6$: thiên hà xa hơn lại trông **to hơn**.',
        en: 'In an expanding universe “distance” depends on how it is measured (Hogg 1999):\n\n$$D_C = \\frac{c}{H_0}\\int_0^z \\frac{dz\'}{E(z\')},\\qquad E(z) = \\frac{H(z)}{H_0},$$\n\n- $D_C$: **comoving** distance - the length of a ruler joining two galaxies if expansion were “paused” today.\n- $D_M$: transverse comoving distance, equal to $D_C$ in flat space, with a $\\sinh$ or $\\sin$ when $\\Omega_k \\ne 0$.\n- $D_L = (1+z)\\,D_M$: **luminosity** distance, used with standard candles such as type Ia supernovae (F8).\n- $D_A = D_M/(1+z)$: **angular-diameter** distance, used with standard rulers. In ΛCDM $D_A$ peaks near $z \\approx 1.6$: more distant galaxies look **larger** again.',
      },
    },
    {
      title: { vi: '5. Các kỷ nguyên, số phận và mặt phẳng $\\Omega_m$-$\\Omega_\\Lambda$', en: '5. Eras, fate and the $\\Omega_m$-$\\Omega_\\Lambda$ plane' },
      body: {
        vi: 'Tỉ phần mật độ của từng thành phần thay đổi theo thời gian:\n\n$$\\Omega_i(a) = \\frac{\\Omega_i\\,a^{-n_i}}{E^2(a)},\\qquad n_r = 4,\\ n_m = 3,\\ n_k = 2,\\ n_\\Lambda = 0,$$\n\nnên vũ trụ lần lượt trải qua kỷ nguyên **bức xạ**, **vật chất** rồi **hằng số vũ trụ**. Với Planck 2018, vật chất bằng bức xạ khi $a_{\\rm eq} = \\Omega_r/\\Omega_m$ ($z \\approx 3400$), vật chất bằng $\\Lambda$ khi $a = (\\Omega_m/\\Omega_\\Lambda)^{1/3}$ ($z = 0{,}30$).\n\nGia tốc lại bắt đầu **sớm hơn**, ở $z = 0{,}64$, vì đại lượng quyết định $\\ddot a$ là $\\rho + 3p/c^2$ chứ không phải $\\rho$: tham số giảm tốc\n\n$$q = -\\frac{\\ddot a\\,a}{\\dot a^2} = \\frac{\\Omega_r a^{-4} + \\tfrac12\\Omega_m a^{-3} - \\Omega_\\Lambda}{E^2(a)}$$\n\nđổi dấu khi $\\Omega_\\Lambda = \\tfrac12\\Omega_m a^{-3}$ (bỏ qua bức xạ). Hôm nay $q_0 = \\tfrac12\\Omega_m - \\Omega_\\Lambda$, nên trên mặt phẳng $\\Omega_m$-$\\Omega_\\Lambda$ đường $\\Omega_\\Lambda = \\Omega_m/2$ chia vũ trụ đang tăng tốc và đang giảm tốc.\n\nSố phận được đọc từ nghiệm của $E^2(a) = 0$ (Felten & Isaacman 1986):\n\n- Nghiệm $a_{\\max} > 1$: giãn nở dừng lại rồi **co lại** thành Vụ Co Lớn. Với $\\Omega_\\Lambda = 0$ điều này xảy ra khi và chỉ khi $\\Omega_m > 1$; khi $\\Omega_\\Lambda > 0$ cần $\\Omega_m$ lớn hơn nhiều.\n- Nghiệm $a_{\\min} < 1$: vũ trụ chưa từng nhỏ hơn $a_{\\min}$, tức là **không có Vụ Nổ Lớn**, chỉ có một cú “nảy”. Điều này xảy ra khi $\\Omega_\\Lambda$ đủ lớn, ví dụ $\\Omega_\\Lambda > 1{,}71$ với $\\Omega_m = 0{,}3$.\n\nĐường phẳng $\\Omega_\\Lambda = 1 - \\Omega_m$ tách vũ trụ mở và đóng. Hình học và số phận chỉ trùng nhau khi $\\Lambda = 0$: với hằng số vũ trụ dương, một vũ trụ đóng vẫn có thể giãn nở mãi.',
        en: 'The share of each component changes with time:\n\n$$\\Omega_i(a) = \\frac{\\Omega_i\\,a^{-n_i}}{E^2(a)},\\qquad n_r = 4,\\ n_m = 3,\\ n_k = 2,\\ n_\\Lambda = 0,$$\n\nso the Universe passes through **radiation**, **matter** and **cosmological-constant** eras. For Planck 2018, matter equals radiation at $a_{\\rm eq} = \\Omega_r/\\Omega_m$ ($z \\approx 3400$) and matter equals $\\Lambda$ at $a = (\\Omega_m/\\Omega_\\Lambda)^{1/3}$ ($z = 0.30$).\n\nAcceleration nevertheless begins **earlier**, at $z = 0.64$, because $\\ddot a$ is governed by $\\rho + 3p/c^2$ rather than $\\rho$: the deceleration parameter\n\n$$q = -\\frac{\\ddot a\\,a}{\\dot a^2} = \\frac{\\Omega_r a^{-4} + \\tfrac12\\Omega_m a^{-3} - \\Omega_\\Lambda}{E^2(a)}$$\n\nchanges sign when $\\Omega_\\Lambda = \\tfrac12\\Omega_m a^{-3}$ (radiation neglected). Today $q_0 = \\tfrac12\\Omega_m - \\Omega_\\Lambda$, so on the $\\Omega_m$-$\\Omega_\\Lambda$ plane the line $\\Omega_\\Lambda = \\Omega_m/2$ separates accelerating from decelerating universes.\n\nThe fate follows from the roots of $E^2(a) = 0$ (Felten & Isaacman 1986):\n\n- A root $a_{\\max} > 1$: the expansion halts and **recollapses** into a Big Crunch. With $\\Omega_\\Lambda = 0$ this happens if and only if $\\Omega_m > 1$; with $\\Omega_\\Lambda > 0$ a much larger $\\Omega_m$ is needed.\n- A root $a_{\\min} < 1$: the Universe was never smaller than $a_{\\min}$, so there is **no Big Bang**, only a “bounce”. This happens for large enough $\\Omega_\\Lambda$, for instance $\\Omega_\\Lambda > 1.71$ when $\\Omega_m = 0.3$.\n\nThe flat line $\\Omega_\\Lambda = 1 - \\Omega_m$ separates open from closed universes. Geometry and fate coincide only when $\\Lambda = 0$: with a positive cosmological constant a closed universe can still expand forever.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Vũ trụ không có năng lượng tối', en: 'Experiment 1 - A Universe without dark energy' }, text: { vi: 'Chọn Einstein-de Sitter. Tuổi vũ trụ là bao nhiêu? Kiểm tra $t_0 = 2/(3H_0)$ và so với thời gian Hubble $1/H_0$ trong bảng số liệu. Kết quả này mâu thuẫn thế nào với tuổi của các cụm sao cầu cổ nhất (khoảng 12-13 tỉ năm)?', en: 'Choose Einstein-de Sitter. What is the age? Check $t_0 = 2/(3H_0)$ and compare with the Hubble time $1/H_0$ in the readouts. How does this conflict with the ages of the oldest globular clusters (about 12-13 Gyr)?' }, params: { preset: 'eds' } },
    { title: { vi: 'Thử nghiệm 2 - Vụ Co Lớn', en: 'Experiment 2 - The Big Crunch' }, text: { vi: 'Chọn vũ trụ đóng $\\Omega_m = 3$. Đọc $a_{\\max}$ và thời điểm Vụ Co Lớn trên đồ thị $a(t)$, rồi so với nghiệm cycloid: $a_{\\max} = \\Omega_m/(\\Omega_m - 1)$, $t_{\\rm crunch} = \\pi\\Omega_m/[H_0(\\Omega_m - 1)^{3/2}]$. Trên khung $\\Omega_i(a)$, vì sao $\\Omega_m(a)$ tăng vọt khi gần $a_{\\max}$?', en: 'Choose the closed universe $\\Omega_m = 3$. Read $a_{\\max}$ and the time of the Big Crunch on the $a(t)$ plot and compare with the cycloid: $a_{\\max} = \\Omega_m/(\\Omega_m - 1)$, $t_{\\rm crunch} = \\pi\\Omega_m/[H_0(\\Omega_m - 1)^{3/2}]$. In the $\\Omega_i(a)$ panel, why does $\\Omega_m(a)$ shoot up near $a_{\\max}$?' }, params: { preset: 'closed' } },
    { title: { vi: 'Thử nghiệm 3 - Đi lên trên mặt phẳng $\\Omega_m$-$\\Omega_\\Lambda$', en: 'Experiment 3 - Climbing the $\\Omega_m$-$\\Omega_\\Lambda$ plane' }, text: { vi: 'Giữ $\\Omega_m = 0{,}3$ và tăng $\\Omega_\\Lambda$ từ 0 tới 2,5. Điểm chọn lần lượt cắt đường $q_0 = 0$ (ở $\\Omega_\\Lambda = 0{,}15$), đường phẳng (ở $0{,}7$) rồi đi vào vùng không có Vụ Nổ Lớn (từ khoảng $1{,}71$). Quan sát tuổi vũ trụ và hình dạng $a(t)$ ở mỗi bước.', en: 'Keep $\\Omega_m = 0.3$ and raise $\\Omega_\\Lambda$ from 0 to 2.5. The point crosses the $q_0 = 0$ line (at $\\Omega_\\Lambda = 0.15$), the flat line (at $0.7$) and then enters the no-Big-Bang region (from about $1.71$). Watch the age and the shape of $a(t)$ at each step.' }, params: { preset: 'planck', Om: 0.3, OL: 0, rad: false } },
    { title: { vi: 'Thử nghiệm 4 - Ba mốc của ΛCDM', en: 'Experiment 4 - Three milestones of ΛCDM' }, text: { vi: 'Chọn Planck 2018 (có bức xạ). Đọc dịch chuyển đỏ khi vật chất bằng bức xạ, khi giãn nở bắt đầu tăng tốc và khi vật chất bằng $\\Lambda$. Vì sao gia tốc bắt đầu ($z = 0{,}64$) **trước** khi $\\Lambda$ chiếm ưu thế ($z = 0{,}30$)?', en: 'Choose Planck 2018 (with radiation). Read the redshifts of matter-radiation equality, of the onset of acceleration and of matter-$\\Lambda$ equality. Why does acceleration begin ($z = 0.64$) **before** $\\Lambda$ dominates ($z = 0.30$)?' }, params: { preset: 'planck' } },
    { title: { vi: 'Thử nghiệm 5 - Dữ liệu siêu tân tinh nói gì?', en: 'Experiment 5 - What do the supernovae say?' }, text: { vi: 'Bật vùng tin cậy từ 580 siêu tân tinh Ia (cùng phép suy luận của F8). Vùng 99,7% có chạm vùng giảm tốc không? Có loại được vũ trụ đóng hay vũ trụ mở không? Vì sao cần thêm phông nền vi sóng (gần như nằm trên đường phẳng) để xác định riêng $\\Omega_m$ và $\\Omega_\\Lambda$?', en: 'Turn on the confidence regions from 580 SNe Ia (the same inference as F8). Does the 99.7% region reach the decelerating zone? Can it rule out closed or open universes? Why is the cosmic microwave background (lying close to the flat line) needed to pin down $\\Omega_m$ and $\\Omega_\\Lambda$ separately?' }, params: { preset: 'planck', sn: true } },
    { title: { vi: 'Thử nghiệm 6 - Một thiên hà ở $z = 2$', en: 'Experiment 6 - A galaxy at $z = 2$' }, text: { vi: 'Với ΛCDM Planck, đặt $z = 2$. Ánh sáng đã đi bao lâu? Vũ trụ bao nhiêu tuổi khi ánh sáng xuất phát? Hôm nay thiên hà cách ta bao xa (đồng chuyển động)? Giải thích vì sao khoảng cách này lớn hơn quãng đường ánh sáng đã đi.', en: 'With Planck ΛCDM set $z = 2$. How long has the light travelled? How old was the Universe when it left? How far is the galaxy today (comoving)? Explain why this exceeds the light-travel distance.' }, params: { preset: 'planck', z: 2 } },
  ],
  quiz: [
    { q: { vi: 'Ánh sáng từ một thiên hà ở $z = 1$ phát ra khi vũ trụ có hệ số tỉ lệ:', en: 'Light from a galaxy at $z = 1$ left when the scale factor was:' }, options: [{ vi: '$a = 1/2$', en: '$a = 1/2$' }, { vi: '$a = 1/4$', en: '$a = 1/4$' }, { vi: '$a = 1$', en: '$a = 1$' }], answer: 0, explain: { vi: '$a = 1/(1+z) = 0{,}5$: mọi khoảng cách đồng chuyển động khi đó bằng một nửa hôm nay.', en: '$a = 1/(1+z) = 0.5$: all comoving separations were half of today’s.' } },
    { q: { vi: '$\\Omega_k = 0$ nghĩa là:', en: '$\\Omega_k = 0$ means:' }, options: [{ vi: 'Không gian phẳng: tổng mật độ bằng mật độ tới hạn', en: 'Flat space: the total density equals the critical density' }, { vi: 'Không có vật chất', en: 'No matter' }, { vi: 'Vũ trụ đứng yên', en: 'A static Universe' }], answer: 0, explain: { vi: 'Hình học không gian là Euclid; vũ trụ vẫn có thể giãn nở.', en: 'Spatial geometry is Euclidean; the Universe can still expand.' } },
    { q: { vi: 'Mật độ năng lượng bức xạ giảm nhanh hơn vật chất vì:', en: 'Radiation energy density falls faster than matter because:' }, options: [{ vi: 'Ngoài việc loãng theo thể tích, mỗi photon còn bị dịch đỏ', en: 'Besides diluting with volume, each photon is redshifted' }, { vi: 'Photon bị hấp thụ', en: 'Photons are absorbed' }], answer: 0, explain: { vi: '$\\rho_r \\propto a^{-3}\\cdot a^{-1} = a^{-4}$.', en: '$\\rho_r \\propto a^{-3}\\cdot a^{-1} = a^{-4}$.' } },
    { q: { vi: 'Khoảng cách nào dùng với ngọn nến chuẩn (siêu tân tinh Ia)?', en: 'Which distance is used with standard candles (type Ia supernovae)?' }, options: [{ vi: 'Khoảng cách độ sáng $D_L$', en: 'The luminosity distance $D_L$' }, { vi: 'Khoảng cách đường kính góc $D_A$', en: 'The angular-diameter distance $D_A$' }], answer: 0, explain: { vi: 'Thông lượng $F = L/(4\\pi D_L^2)$.', en: 'The flux is $F = L/(4\\pi D_L^2)$.' } },
    { q: { vi: 'Vũ trụ có $\\Omega_m = 0{,}3$, $\\Omega_\\Lambda = 0{,}1$ hôm nay đang:', en: 'A universe with $\\Omega_m = 0.3$, $\\Omega_\\Lambda = 0.1$ is today:' }, options: [{ vi: 'Giảm tốc, vì $q_0 = 0{,}15 - 0{,}1 > 0$', en: 'Decelerating, since $q_0 = 0.15 - 0.1 > 0$' }, { vi: 'Tăng tốc, vì $\\Omega_\\Lambda > 0$', en: 'Accelerating, since $\\Omega_\\Lambda > 0$' }, { vi: 'Đứng yên', en: 'Static' }], answer: 0, explain: { vi: 'Gia tốc cần $\\Omega_\\Lambda > \\Omega_m/2$: áp suất âm của $\\Lambda$ phải thắng lực hút của vật chất.', en: 'Acceleration needs $\\Omega_\\Lambda > \\Omega_m/2$: the negative pressure of $\\Lambda$ must beat the pull of matter.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Ryden (2017) Introduction to Cosmology, 2nd ed., ch. 4–6; Hogg (1999) “Distance measures in cosmology”, arXiv:astro-ph/9905116; Planck Collaboration (2020) A&A 641, A6. Gợi ý thảo luận: mô-đun F4 trình bày các khoảng cách bằng một quạt khảo sát thiên hà; F8 dùng $D_L$ để suy luận $\\Omega_m$, $\\Omega_\\Lambda$ từ siêu tân tinh thật.',
    en: 'Resources: Ryden (2017) Introduction to Cosmology, 2nd ed., ch. 4–6; Hogg (1999) “Distance measures in cosmology”, arXiv:astro-ph/9905116; Planck Collaboration (2020) A&A 641, A6. Discussion: module F4 presents the distances with a galaxy-survey fan; F8 uses $D_L$ to infer $\\Omega_m$, $\\Omega_\\Lambda$ from real supernovae.',
  },
};

/** Model Card · D8. Measured figures: `npm run validate:cosmology` → docs/validation/D8-cosmology.json; cosmo-stellar.test.ts; lookback-f4.test.ts. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Tuổi, thời gian nhìn lại, khoảng cách, số phận', en: 'Level A - Ages, look-back times, distances, fate' },
      body: { vi: 'Tích phân Simpson thích nghi trên float64 của phương trình Friedmann; khoảng cách có xét độ cong ($\\sinh$/$\\sin$). Số phận (Vụ Co Lớn, cú nảy) và thời điểm bắt đầu tăng tốc lấy từ nghiệm của $E^2(a) = 0$ và $\\ddot a = 0$, tìm bằng chia đôi.', en: 'Adaptive Simpson integration of the Friedmann equation in float64; distances include curvature ($\\sinh$/$\\sin$). The fate (Big Crunch, bounce) and the onset of acceleration come from the roots of $E^2(a) = 0$ and $\\ddot a = 0$, found by bisection.' },
    },
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Lịch sử $a(t)$', en: 'Level B - History $a(t)$' },
      body: { vi: '$a(t)$ được tích phân bằng DOPRI5 ($r_{\\rm tol} = 10^{-10}$) từ phương trình gia tốc, xuôi và ngược từ hôm nay, rồi lưu khoảng 900 điểm; giá trị giữa các điểm được nội suy tuyến tính.', en: '$a(t)$ is integrated with DOPRI5 ($r_{\\rm tol} = 10^{-10}$) from the acceleration equation, forward and backward from today, and stored at about 900 points; values in between are linearly interpolated.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Ô thiên hà và sóng ánh sáng', en: 'Level C - Galaxy lattice and light wave' },
      body: { vi: 'Ô nhỏ ở góc đồ thị $a(t)$ (lưới thiên hà và sóng ánh sáng giãn theo $a$) chỉ minh hoạ khái niệm toạ độ đồng chuyển động và dịch chuyển đỏ, không đúng tỉ lệ.', en: 'The small inset on the $a(t)$ plot (a galaxy lattice and a light wave stretching with $a$) only illustrates comoving coordinates and redshift, not to scale.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, B, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, B, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Phương trình Friedmann và tuổi', en: '1. Friedmann equation and age' },
      tex: ['H^2=H_0^2\\left[\\Omega_r a^{-4}+\\Omega_m a^{-3}+\\Omega_k a^{-2}+\\Omega_\\Lambda\\right],\\qquad \\Omega_k=1-\\Omega_r-\\Omega_m-\\Omega_\\Lambda', 't(z)=\\frac{1}{H_0}\\int_0^{1/(1+z)}\\frac{da}{\\sqrt{\\Omega_r a^{-2}+\\Omega_m a^{-1}+\\Omega_k+\\Omega_\\Lambda a^2}}', '\\frac{\\ddot a}{a}=-H_0^2\\left[\\Omega_r a^{-4}+\\tfrac12\\Omega_m a^{-3}\\right]+H_0^2\\Omega_\\Lambda'],
      body: {
        vi: 'Trong đó $H_0$ là hằng số Hubble (km/s/Mpc), $\\Omega_r$, $\\Omega_m$, $\\Omega_\\Lambda$, $\\Omega_k$ là tham số mật độ hôm nay của bức xạ, vật chất, hằng số vũ trụ và độ cong. Khi bật bức xạ, $\\Omega_r h^2 = 4{,}18\\times10^{-5}$ (photon ở $T_0 = 2{,}7255$ K và 3,046 loài neutrino không khối lượng), $h = H_0/100$. Thời gian nhìn lại $t_{\\rm lb}(z) = t(0) - t(z)$.',
        en: '$H_0$ is the Hubble constant (km/s/Mpc); $\\Omega_r$, $\\Omega_m$, $\\Omega_\\Lambda$, $\\Omega_k$ are today’s density parameters of radiation, matter, the cosmological constant and curvature. With radiation on, $\\Omega_r h^2 = 4.18\\times10^{-5}$ (photons at $T_0 = 2.7255$ K and 3.046 massless neutrino species), $h = H_0/100$. The look-back time is $t_{\\rm lb}(z) = t(0) - t(z)$.',
      },
    },
    {
      title: { vi: '2. Khoảng cách', en: '2. Distances' },
      tex: ["D_C=\\frac{c}{H_0}\\int_0^z\\frac{dz'}{E(z')},\\qquad D_M=\\frac{c/H_0}{\\sqrt{|\\Omega_k|}}\\,S_k\\!\\left(\\sqrt{|\\Omega_k|}\\,\\frac{D_C}{c/H_0}\\right)", 'D_L=(1+z)\\,D_M,\\qquad D_A=\\frac{D_M}{1+z}'],
      body: {
        vi: 'Trong đó $E(z) = H(z)/H_0$; $S_k = \\sinh$ khi $\\Omega_k > 0$, $\\sin$ khi $\\Omega_k < 0$, và $D_M = D_C$ khi $\\Omega_k = 0$ (Hogg 1999).',
        en: '$E(z) = H(z)/H_0$; $S_k = \\sinh$ for $\\Omega_k > 0$, $\\sin$ for $\\Omega_k < 0$, and $D_M = D_C$ for $\\Omega_k = 0$ (Hogg 1999).',
      },
    },
    {
      title: { vi: '3. Kỷ nguyên, gia tốc và số phận', en: '3. Eras, acceleration and fate' },
      tex: ['\\Omega_i(a)=\\frac{\\Omega_i\\,a^{-n_i}}{E^2(a)},\\qquad q(a)=\\frac{\\Omega_r a^{-4}+\\tfrac12\\Omega_m a^{-3}-\\Omega_\\Lambda}{E^2(a)}', 'E^2(a_{\\max})=0\\ \\ (a_{\\max}>1),\\qquad E^2(a_{\\min})=0\\ \\ (a_{\\min}<1)'],
      body: {
        vi: 'Trong đó $n_r = 4$, $n_m = 3$, $n_k = 2$, $n_\\Lambda = 0$; $q$ là tham số giảm tốc, $q < 0$ nghĩa là giãn nở tăng tốc. Nghiệm của $E^2(a) = 0$ được tìm bằng cách quét $\\log a$ (3 000 điểm, có tìm cực tiểu bằng lát cắt vàng để không bỏ sót chỗ lõm hẹp) rồi chia đôi; $a_{\\max}$ là nghiệm gần nhất phía trên $a = 1$, $a_{\\min}$ là nghiệm gần nhất phía dưới. Có Vụ Nổ Lớn khi không có $a_{\\min}$ và tuổi hữu hạn ($\\Omega_r$, $\\Omega_m$ hoặc $\\Omega_k > 0$). Các biên trên mặt phẳng $\\Omega_m$-$\\Omega_\\Lambda$ tính với $\\Omega_r = 0$, bằng chia đôi theo $\\Omega_\\Lambda$ trên chính phép phân loại này. Vùng tin cậy siêu tân tinh dùng lưới $\\chi^2$ $49\\times65$ trên dữ liệu Union2.1 như F8.',
        en: '$n_r = 4$, $n_m = 3$, $n_k = 2$, $n_\\Lambda = 0$; $q$ is the deceleration parameter, $q < 0$ meaning accelerating expansion. Roots of $E^2(a) = 0$ are found by scanning $\\log a$ (3,000 points, with a golden-section search for minima so narrow dips are not missed) followed by bisection; $a_{\\max}$ is the nearest root above $a = 1$, $a_{\\min}$ the nearest below. There is a Big Bang when there is no $a_{\\min}$ and the age is finite ($\\Omega_r$, $\\Omega_m$ or $\\Omega_k > 0$). The boundaries on the $\\Omega_m$-$\\Omega_\\Lambda$ plane assume $\\Omega_r = 0$ and are found by bisection in $\\Omega_\\Lambda$ on this same classification. The supernova regions use a $49\\times65$ $\\chi^2$ grid on the Union2.1 data, as in F8.',
      },
    },
  ],
  assumptions: {
    vi: ['Vũ trụ FLRW đồng nhất, đẳng hướng; năng lượng tối là hằng số vũ trụ ($w = -1$).', 'Neutrino coi như không khối lượng (Planck 2018 dùng $\\sum m_\\nu = 0{,}06$ eV, ảnh hưởng nhỏ tới tuổi).', 'Bỏ qua chuyển động riêng của thiên hà.'],
    en: ['Homogeneous, isotropic FLRW universe; dark energy as a cosmological constant ($w = -1$).', 'Neutrinos treated as massless (Planck 2018 uses $\\sum m_\\nu = 0.06$ eV, a small effect on the age).', 'Peculiar velocities of galaxies ignored.'],
  },
  validity: { vi: ['$0 \\le z \\le 20$ trên thanh trượt (lõi đúng tới $z \\approx 1100$); $40 \\le H_0 \\le 100$; $0 \\le \\Omega_m \\le 3$; $-0{,}6 \\le \\Omega_\\Lambda \\le 3$.', 'Trong vũ trụ “nảy”, chỉ tồn tại các dịch chuyển đỏ $z < 1/a_{\\min} - 1$.'], en: ['$0 \\le z \\le 20$ on the slider (the core is valid to $z \\approx 1100$); $40 \\le H_0 \\le 100$; $0 \\le \\Omega_m \\le 3$; $-0.6 \\le \\Omega_\\Lambda \\le 3$.', 'In a “bounce” universe only redshifts $z < 1/a_{\\min} - 1$ exist.'] },
  scope: { vi: 'Các tích phân có dung sai $10^{-12}$; kết quả được đối chiếu với nghiệm giải tích của các mô hình đặc biệt và với công thức đóng của các biên trên mặt phẳng $\\Omega_m$-$\\Omega_\\Lambda$.', en: 'Integrals use a $10^{-12}$ tolerance; results are checked against analytic solutions of special models and against closed forms of the $\\Omega_m$-$\\Omega_\\Lambda$ boundaries.' },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:cosmology\` → \`docs/validation/D8-cosmology.json\`; ngưỡng khoá trong \`packages/sim-core/test/cosmology-d8.test.ts\`, \`cosmo-stellar.test.ts\` và \`lookback-f4.test.ts\`.

- **Tuổi:** Einstein-de Sitter 9,634 tỉ năm, trùng $2/(3H_0)$ tới $10^{-12}$; ΛCDM phẳng không bức xạ trùng công thức đóng $t_0 = \\frac{2}{3H_0\\sqrt{\\Omega_\\Lambda}}\\operatorname{arsinh}\\sqrt{\\Omega_\\Lambda/\\Omega_m}$ tới $10^{-12}$; **Planck 2018** (có bức xạ) **13,786 tỉ năm** (Planck công bố 13,787).
- **Lịch sử $a(t)$:** sai lệch tương đối lớn nhất so với $a \\propto t^{2/3}$ (EdS) là $2{,}4\\times10^{-11}$, so với $a \\propto e^{H_0 t}$ (de Sitter) là $6{,}6\\times10^{-11}$.
- **Vũ trụ đóng chỉ có vật chất** ($\\Omega_m$ = 1,5; 2; 3; 5): $a_{\\max}$ từ nghiệm của $E^2$ trùng $\\Omega_m/(\\Omega_m - 1)$ tới $10^{-15}$; thời điểm Vụ Co Lớn khớp $\\pi\\Omega_m/[H_0(\\Omega_m - 1)^{3/2}]$ trong $5\\times10^{-6}$ (ví dụ $\\Omega_m = 3$: 48,155 tỉ năm); đường cong khớp nghiệm cycloid trong $7\\times10^{-5}$ (giới hạn bởi nội suy tuyến tính giữa các điểm lưu).
- **Biên trên mặt phẳng $\\Omega_m$-$\\Omega_\\Lambda$** ($0{,}1 \\le \\Omega_m \\le 3$): biên co lại và biên không có Vụ Nổ Lớn tìm bằng số trùng công thức đóng trong Carroll, Press & Turner (1992) tới $7\\times10^{-15}$; ví dụ với $\\Omega_m = 2$: 0,04189 và 3,59627.
- **Planck 2018:** bắt đầu tăng tốc ở $z = 0{,}6416$ (không bức xạ: 0,6422, trùng $(2\\Omega_\\Lambda/\\Omega_m)^{1/3} - 1$); vật chất bằng $\\Lambda$ ở $z = 0{,}303$; vật chất bằng bức xạ ở $z = 3406$; $q_0 = -0{,}533$.
- **Ví dụ** $z = 2$ (Planck): nhìn lại 10,51 tỉ năm, vũ trụ khi đó 3,28 tỉ năm tuổi, khoảng cách đồng chuyển động 17,31 tỉ năm ánh sáng.`,
    en: `Reproducible report: \`npm run validate:cosmology\` → \`docs/validation/D8-cosmology.json\`; thresholds locked in \`packages/sim-core/test/cosmology-d8.test.ts\`, \`cosmo-stellar.test.ts\` and \`lookback-f4.test.ts\`.

- **Ages:** Einstein-de Sitter 9.634 Gyr, equal to $2/(3H_0)$ to $10^{-12}$; flat ΛCDM without radiation equal to the closed form $t_0 = \\frac{2}{3H_0\\sqrt{\\Omega_\\Lambda}}\\operatorname{arsinh}\\sqrt{\\Omega_\\Lambda/\\Omega_m}$ to $10^{-12}$; **Planck 2018** (with radiation) **13.786 Gyr** (Planck quotes 13.787).
- **History $a(t)$:** largest relative deviation from $a \\propto t^{2/3}$ (EdS) is $2.4\\times10^{-11}$, from $a \\propto e^{H_0 t}$ (de Sitter) $6.6\\times10^{-11}$.
- **Closed matter-only universes** ($\\Omega_m$ = 1.5, 2, 3, 5): $a_{\\max}$ from the root of $E^2$ equals $\\Omega_m/(\\Omega_m - 1)$ to $10^{-15}$; the Big Crunch time matches $\\pi\\Omega_m/[H_0(\\Omega_m - 1)^{3/2}]$ within $5\\times10^{-6}$ (e.g. $\\Omega_m = 3$: 48.155 Gyr); the curve follows the cycloid within $7\\times10^{-5}$ (limited by linear interpolation between stored points).
- **Boundaries on the $\\Omega_m$-$\\Omega_\\Lambda$ plane** ($0.1 \\le \\Omega_m \\le 3$): the numerical recollapse and no-Big-Bang boundaries equal the closed forms in Carroll, Press & Turner (1992) to $7\\times10^{-15}$; e.g. for $\\Omega_m = 2$: 0.04189 and 3.59627.
- **Planck 2018:** acceleration begins at $z = 0.6416$ (without radiation 0.6422, equal to $(2\\Omega_\\Lambda/\\Omega_m)^{1/3} - 1$); matter-$\\Lambda$ equality at $z = 0.303$; matter-radiation equality at $z = 3406$; $q_0 = -0.533$.
- **Example** $z = 2$ (Planck): look-back 10.51 Gyr, Universe then 3.28 Gyr old, comoving distance 17.31 billion light-years.`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không có lạm phát, năng lượng tối biến đổi $w(z)$, hay nhiễu loạn mật độ (xem F5, F6).', 'Neutrino không khối lượng; không có các giai đoạn vật lý hạt sớm.', 'Các biên trên mặt phẳng $\\Omega_m$-$\\Omega_\\Lambda$ bỏ qua bức xạ ($\\Omega_r \\sim 10^{-4}$), không ảnh hưởng tới hình vẽ.'],
    en: ['No inflation, evolving dark energy $w(z)$ or density perturbations (see F5, F6).', 'Massless neutrinos; no early particle-physics epochs.', 'The $\\Omega_m$-$\\Omega_\\Lambda$ boundaries neglect radiation ($\\Omega_r \\sim 10^{-4}$), invisible on the diagram.'],
  },
  references: [
    'Friedmann, A. (1922). Über die Krümmung des Raumes. Z. Phys. 10, 377.',
    'Lemaître, G. (1927). Un Univers homogène de masse constante et de rayon croissant. Ann. Soc. Sci. Bruxelles A 47, 49.',
    'Felten, J. E. & Isaacman, R. (1986). Scale factors R(t) and critical values of the cosmological constant Λ in Friedmann universes. Rev. Mod. Phys. 58, 689.',
    'Carroll, S. M., Press, W. H. & Turner, E. L. (1992). The cosmological constant. ARA&A 30, 499.',
    'Planck Collaboration (2020). Planck 2018 results. VI. Cosmological parameters. A&A 641, A6, Table 2.',
    'Hogg, D. W. (1999). Distance measures in cosmology. arXiv:astro-ph/9905116.',
    'Suzuki, N. et al. (2012). The Hubble Space Telescope Cluster Supernova Survey. V. ApJ 746, 85 (Union2.1).',
    'Ryden, B. (2017). Introduction to Cosmology, 2nd ed. Cambridge University Press, ch. 4-6.',
  ],
};
