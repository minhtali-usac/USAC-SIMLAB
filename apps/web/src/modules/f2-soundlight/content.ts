import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Phân biệt sóng cơ học (cần môi trường vật chất) với sóng điện từ (truyền được trong chân không).',
      'So sánh sóng dọc (âm thanh trong chất lưu) với sóng ngang (ánh sáng).',
      'Tính tốc độ âm trong khí lý tưởng $v = \\sqrt{\\gamma RT/M}$ và giải thích sự phụ thuộc vào nhiệt độ và khối lượng mol.',
      'Tính tốc độ ánh sáng trong môi trường $c/n$ và ước lượng khoảng cách tới tia sét bằng độ trễ giữa chớp và sấm.',
    ],
    en: [
      'Distinguish mechanical waves (needing a material medium) from electromagnetic waves (travelling through vacuum).',
      'Compare longitudinal waves (sound in fluids) with transverse waves (light).',
      'Compute the speed of sound in an ideal gas, $v = \\sqrt{\\gamma RT/M}$, and explain its dependence on temperature and molar mass.',
      'Compute the speed of light in a medium, $c/n$, and estimate the distance to a lightning strike from the flash–thunder delay.',
    ],
  },
  durationMin: 30,
  prerequisites: { vi: 'Khái niệm sóng (bước sóng, tần số, $v = \\lambda f$); nhiệt độ tuyệt đối; khối lượng mol.', en: 'Basic waves (wavelength, frequency, $v = \\lambda f$); absolute temperature; molar mass.' },
  background: [
    {
      title: { vi: 'Hai loại sóng quen thuộc', en: 'Two familiar kinds of wave' },
      body: {
        vi: 'Âm thanh và ánh sáng đều là sóng: chúng mang năng lượng, có bước sóng, tần số và tuân theo $v = \\lambda f$. Nhưng chúng khác nhau về bản chất. Âm thanh là dao động của chính các hạt trong môi trường; ánh sáng là dao động của điện trường và từ trường, không cần hạt nào cả. Mô-đun F2 đặt hai loại sóng cạnh nhau và cho phép “rút” môi trường ra để thấy sự khác biệt.',
        en: 'Sound and light are both waves: they carry energy, have wavelength and frequency and obey $v = \\lambda f$. But their nature differs. Sound is an oscillation of the particles of the medium itself; light is an oscillation of electric and magnetic fields and needs no particles at all. Module F2 places the two side by side and lets you “remove” the medium to see the difference.',
      },
    },
    {
      title: { vi: '1. Sóng âm: sóng dọc cần môi trường', en: '1. Sound: a longitudinal wave that needs a medium' },
      body: {
        vi: 'Trong chất khí và chất lỏng, âm thanh là **sóng dọc**: các phân tử dao động **dọc** theo phương truyền, tạo ra các vùng nén (áp suất cao hơn) và vùng giãn (áp suất thấp hơn) xen kẽ. Năng lượng được truyền qua va chạm giữa các phân tử, nên **không có môi trường thì không có âm thanh**: trong chân không, loa vẫn rung nhưng không có gì để truyền dao động đi.',
        en: 'In gases and liquids sound is a **longitudinal wave**: molecules oscillate **along** the direction of travel, creating alternating compressions (higher pressure) and rarefactions (lower pressure). Energy passes through molecular collisions, so **without a medium there is no sound**: in vacuum a loudspeaker still vibrates, but nothing carries the vibration away.',
      },
    },
    {
      title: { vi: '2. Tốc độ âm', en: '2. The speed of sound' },
      body: {
        vi: 'Với khí lý tưởng, quá trình nén – giãn đủ nhanh để coi là đoạn nhiệt, và\n\n$$v = \\sqrt{\\frac{\\gamma R T}{M}},$$\n\ntrong đó $\\gamma = c_p/c_v$ là tỉ số nhiệt dung (7/5 cho khí hai nguyên tử như không khí, 5/3 cho khí một nguyên tử như heli, argon), $R = 8{,}314462618$ J/(mol·K), $T$ là nhiệt độ tuyệt đối và $M$ là khối lượng mol. Không khí khô ở 20 °C cho khoảng 343 m/s. Heli nhẹ hơn không khí khoảng 7 lần nên âm đi nhanh gần gấp ba. Trong chất lỏng và chất rắn, $v$ được quyết định bởi độ cứng so với khối lượng riêng; mô-đun dùng giá trị đo: nước tinh khiết ở 20 °C khoảng 1 482 m/s, thép không gỉ khoảng 5 790 m/s (sóng dọc).',
        en: 'In an ideal gas the compressions and rarefactions are fast enough to be adiabatic, and\n\n$$v = \\sqrt{\\frac{\\gamma R T}{M}},$$\n\nwhere $\\gamma = c_p/c_v$ is the heat-capacity ratio (7/5 for diatomic gases such as air, 5/3 for monatomic gases such as helium and argon), $R = 8.314462618$ J/(mol·K), $T$ the absolute temperature and $M$ the molar mass. Dry air at 20 °C gives about 343 m/s. Helium is about 7 times lighter than air, so sound travels almost three times faster. In liquids and solids $v$ is set by stiffness relative to density; the module uses measured values: pure water at 20 °C about 1,482 m/s, stainless steel about 5,790 m/s (longitudinal).',
      },
    },
    {
      title: { vi: '3. Ánh sáng: sóng ngang trong môi trường và chân không', en: '3. Light: a transverse wave in media and in vacuum' },
      body: {
        vi: 'Ánh sáng là **sóng ngang** của trường điện từ (F1) và truyền được trong chân không với tốc độ $c = 299\\,792\\,458$ m/s. Trong một môi trường trong suốt có chiết suất $n$, tốc độ pha là\n\n$$v = \\frac{c}{n}.$$\n\nKhông khí có $n \\approx 1{,}000293$, nước $n \\approx 1{,}333$ (ở 589 nm). Kim loại như thép phản xạ và hấp thụ ánh sáng nhìn thấy nên ánh sáng không đi xuyên qua, trong khi âm thanh lại truyền rất tốt trong thép.',
        en: 'Light is a **transverse wave** of the electromagnetic field (F1) and travels through vacuum at $c = 299\\,792\\,458$ m/s. In a transparent medium of refractive index $n$ the phase speed is\n\n$$v = \\frac{c}{n}.$$\n\nAir has $n \\approx 1.000293$, water $n \\approx 1.333$ (at 589 nm). Metals such as steel reflect and absorb visible light, so it does not pass through, while sound travels very well in steel.',
      },
    },
    {
      title: { vi: '4. Đếm giây khi có giông', en: '4. Counting seconds in a thunderstorm' },
      body: {
        vi: 'Ánh chớp đi 1 km mất khoảng 3,3 micro giây, còn sấm đi 1 km mất khoảng 2,9 giây. Nếu $\\Delta t$ là thời gian từ lúc thấy chớp tới lúc nghe sấm thì\n\n$$d = \\frac{v\\,\\Delta t}{1 - v/c} \\approx v\\,\\Delta t.$$\n\nVì $v \\approx 343$ m/s, quy tắc thực hành là **đếm số giây rồi chia cho 3** để được khoảng cách tính bằng km.',
        en: 'A lightning flash crosses 1 km in about 3.3 microseconds, while thunder needs about 2.9 seconds. If $\\Delta t$ is the time between seeing the flash and hearing the thunder,\n\n$$d = \\frac{v\\,\\Delta t}{1 - v/c} \\approx v\\,\\Delta t.$$\n\nSince $v \\approx 343$ m/s, the practical rule is to **count the seconds and divide by 3** to get the distance in kilometres.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Rút môi trường', en: 'Experiment 1 - Removing the medium' }, text: { vi: 'Chuyển từ “Không khí” sang “Chân không”. Làn nào còn sóng? Giải thích bằng bản chất của từng loại sóng.', en: 'Switch from “Air” to “Vacuum”. Which lane still has a wave? Explain from the nature of each wave.' }, params: { m: 'vacuum' } },
    { title: { vi: 'Thử nghiệm 2 - Giọng heli', en: 'Experiment 2 - Helium voice' }, text: { vi: 'Chọn heli ở 20 °C. Tốc độ âm gấp bao nhiêu lần không khí? Kiểm tra bằng $\\sqrt{(\\gamma_{\\rm He}/\\gamma_{\\rm kk})(M_{\\rm kk}/M_{\\rm He})}$. Với cùng tần số, bước sóng thay đổi thế nào?', en: 'Choose helium at 20 °C. How many times faster than air is the sound? Check with $\\sqrt{(\\gamma_{\\rm He}/\\gamma_{\\rm air})(M_{\\rm air}/M_{\\rm He})}$. At the same frequency, how does the wavelength change?' }, params: { m: 'helium', T: 20 } },
    { title: { vi: 'Thử nghiệm 3 - Mùa đông và mùa hè', en: 'Experiment 3 - Winter and summer' }, text: { vi: 'Với không khí, đổi nhiệt độ từ −20 °C tới 40 °C. Tốc độ âm thay đổi bao nhiêu phần trăm? Quy tắc “3 giây mỗi km” sai lệch bao nhiêu?', en: 'With air, change the temperature from −20 °C to 40 °C. By what percentage does the speed change? How far off is the “3 s per km” rule?' }, params: { m: 'air', T: -20 } },
    { title: { vi: 'Thử nghiệm 4 - Sét cách 5 km', en: 'Experiment 4 - Lightning 5 km away' }, text: { vi: 'Đặt khoảng cách 5 km. Đếm số giây từ lúc thấy chớp tới lúc nghe sấm trong làn dưới cùng (chạy theo thời gian thực), rồi chia cho 3 và so với khoảng cách thật.', en: 'Set the distance to 5 km. Count the seconds between flash and thunder in the bottom lane (real time), divide by 3 and compare with the true distance.' }, params: { d: 5 } },
  ],
  quiz: [
    { q: { vi: 'Vì sao trong không gian ta không nghe được tiếng nổ của một tàu vũ trụ ở xa?', en: 'Why can’t we hear a distant spacecraft explode in space?' }, options: [{ vi: 'Không có môi trường vật chất để truyền sóng âm', en: 'There is no material medium to carry sound' }, { vi: 'Âm thanh quá chậm', en: 'Sound is too slow' }, { vi: 'Tai không hoạt động trong không gian', en: 'Ears do not work in space' }], answer: 0, explain: { vi: 'Sóng âm là dao động của các hạt; chân không không có hạt.', en: 'Sound is an oscillation of particles; vacuum has none.' } },
    { q: { vi: 'Thấy chớp, 6 giây sau nghe sấm. Tia sét cách khoảng:', en: 'You see a flash and hear thunder 6 s later. The strike is about:' }, options: [{ vi: '2 km', en: '2 km' }, { vi: '6 km', en: '6 km' }, { vi: '200 m', en: '200 m' }], answer: 0, explain: { vi: '$6\\ \\text{s}\\times343\\ \\text{m/s} \\approx 2{,}06$ km.', en: '$6\\ \\text{s}\\times343\\ \\text{m/s} \\approx 2.06$ km.' } },
    { q: { vi: 'Khi nhiệt độ tuyệt đối của khí tăng 4 lần, tốc độ âm:', en: 'When a gas’s absolute temperature quadruples, the speed of sound:' }, options: [{ vi: 'Tăng 2 lần', en: 'Doubles' }, { vi: 'Tăng 4 lần', en: 'Quadruples' }, { vi: 'Không đổi', en: 'Stays the same' }], answer: 0, explain: { vi: '$v \\propto \\sqrt T$.', en: '$v \\propto \\sqrt T$.' } },
    { q: { vi: 'Âm thanh trong không khí là sóng:', en: 'Sound in air is a:' }, options: [{ vi: 'Dọc', en: 'Longitudinal wave' }, { vi: 'Ngang', en: 'Transverse wave' }], answer: 0, explain: { vi: 'Các phân tử dao động dọc theo phương truyền; chất khí không chịu được ứng suất cắt nên không có sóng ngang.', en: 'Molecules oscillate along the direction of travel; gases cannot sustain shear, so there are no transverse waves.' } },
  ],
  instructor: {
    vi: 'Nguồn gốc: phát triển từ mô phỏng “Sound and light waves” của lss-lab (github.com/MinhMPA/lss-lab); bổ sung tốc độ âm theo loại khí và nhiệt độ, số đo cho nước và thép, ánh sáng trong môi trường và mô phỏng sét – sấm theo thời gian thực. Tài nguyên: Kinsler et al. (2000) Fundamentals of Acoustics, ch. 5; Del Grosso & Mader (1972) JASA 52, 1442. Gợi ý thảo luận: vì sao trong chất rắn có cả sóng dọc lẫn sóng ngang (sóng P và S trong địa chấn học)?',
    en: 'Origin: developed from lss-lab’s “Sound and light waves” (github.com/MinhMPA/lss-lab); added sound speed by gas and temperature, measured values for water and steel, light in media and a real-time lightning–thunder race. Resources: Kinsler et al. (2000) Fundamentals of Acoustics, ch. 5; Del Grosso & Mader (1972) JASA 52, 1442. Discussion: why do solids carry both longitudinal and transverse waves (P and S waves in seismology)?',
  },
};

/** Model Card · F2. Figures reproduced by packages/sim-core/test/sound-f2.test.ts. */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'A',
      label: { vi: 'Mức A - Tốc độ âm và tốc độ ánh sáng trong môi trường', en: 'Level A - Speeds of sound and light in media' },
      body: { vi: 'Tốc độ âm trong khí lý tưởng tính từ $\\sqrt{\\gamma RT/M}$; nước và thép dùng giá trị đo có trích dẫn; tốc độ ánh sáng $c/n$; khoảng cách tia sét từ độ trễ.', en: 'Ideal-gas sound speed from $\\sqrt{\\gamma RT/M}$; measured, cited values for water and steel; light speed $c/n$; lightning distance from the delay.' },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Hình ảnh sóng', en: 'Level C - Wave pictures' },
      body: { vi: 'Hai làn trên quay chậm với thang thời gian khác nhau (làn ánh sáng chậm hơn khoảng $10^6$ lần so với làn âm thanh) để cả hai cùng nhìn thấy được; tỉ lệ bước sóng giữa các môi trường là đúng ($\\lambda = v/f$). Làn sét – sấm chạy theo thời gian thực.', en: 'The two upper lanes run in slow motion on different time scales (the light lane about $10^6$ times slower than the sound lane) so both are visible; wavelength ratios between media are correct ($\\lambda = v/f$). The lightning lane runs in real time.' },
    },
  ],
  fidelityNote: { vi: 'Mức A, C là phân loại nội bộ của USAC SimLab.', en: 'Levels A, C are USAC SimLab’s internal scale.' },
  equations: [],
  methods: [
    {
      title: { vi: '1. Tốc độ âm', en: '1. Speed of sound' },
      tex: ['v=\\sqrt{\\frac{\\gamma RT}{M}},\\qquad R=8.314462618\\ \\mathrm{J\\,mol^{-1}\\,K^{-1}}'],
      body: {
        vi: 'Trong đó $\\gamma$ là tỉ số nhiệt dung: 1,4 cho không khí khô ($M = 28{,}9647$ g/mol), 5/3 cho heli ($M = 4{,}002602$ g/mol) và argon ($M = 39{,}948$ g/mol); $T$ là nhiệt độ tuyệt đối (K). Nước tinh khiết ở 20 °C: 1 482,3 m/s (Del Grosso & Mader 1972); thép không gỉ loại 347: 5 790 m/s, sóng dọc phẳng trong khối (CRC Handbook, 65th ed.).',
        en: '$\\gamma$ is the heat-capacity ratio: 1.4 for dry air ($M = 28.9647$ g/mol), 5/3 for helium ($M = 4.002602$ g/mol) and argon ($M = 39.948$ g/mol); $T$ the absolute temperature (K). Pure water at 20 °C: 1,482.3 m/s (Del Grosso & Mader 1972); type 347 stainless steel: 5,790 m/s, plane longitudinal wave in bulk (CRC Handbook, 65th ed.).',
      },
    },
    {
      title: { vi: '2. Ánh sáng trong môi trường và khoảng cách tia sét', en: '2. Light in media and the lightning distance' },
      tex: ['v_{\\rm light}=\\frac cn,\\qquad d=\\frac{v\\,\\Delta t}{1-v/c}'],
      body: {
        vi: 'Trong đó $n$ là chiết suất ở 589 nm, 0 °C và 1 atm (không khí 1,000293; heli 1,000035; argon 1,000281; nước 1,333); thép được coi là không trong suốt. $\\Delta t$ là độ trễ giữa lúc thấy chớp và lúc nghe sấm; tiếng sấm truyền trong không khí ở nhiệt độ đã chọn.',
        en: '$n$ is the refractive index at 589 nm, 0 °C and 1 atm (air 1.000293; helium 1.000035; argon 1.000281; water 1.333); steel is treated as opaque. $\\Delta t$ is the delay between seeing the flash and hearing the thunder; thunder travels through air at the chosen temperature.',
      },
    },
  ],
  assumptions: {
    vi: ['Khí lý tưởng, khô; bỏ qua độ ẩm (độ ẩm làm tăng tốc độ âm tới khoảng 0,5%) và gió.', 'Tần số âm hiển thị là minh hoạ; tốc độ âm trong khí không phụ thuộc tần số trong mô hình này.'],
    en: ['Ideal, dry gas; humidity (which raises the speed of sound by up to about 0.5%) and wind ignored.', 'The displayed sound frequency is illustrative; the gas sound speed is frequency independent in this model.'],
  },
  validity: { vi: ['Chất khí từ −40 °C tới 60 °C; khoảng cách tia sét 0,2–10 km.'], en: ['Gases from −40 °C to 60 °C; lightning distance 0.2–10 km.'] },
  scope: { vi: 'Các công thức là chính xác trong mô hình khí lý tưởng; giá trị cho nước và thép là số đo đã công bố.', en: 'The formulae are exact within the ideal-gas model; the water and steel values are published measurements.' },
  validationText: {
    vi: `Ngưỡng khoá trong \`packages/sim-core/test/sound-f2.test.ts\`.

- Không khí khô: 343,2 m/s ở 20 °C và 331,3 m/s ở 0 °C, khớp giá trị sách giáo khoa; argon 319 m/s ở 20 °C.
- Tỉ số heli/không khí đúng bằng $\\sqrt{(\\gamma_{\\rm He}/\\gamma_{\\rm kk})(M_{\\rm kk}/M_{\\rm He})}$; heli vượt 1 000 m/s ở 20 °C.
- Nước nhanh hơn không khí 4,32 lần; thép không gỉ 16,9 lần.
- Sấm sau 3 s ⇒ 1,03 km (quy tắc “3 giây mỗi km”).`,
    en: `Thresholds locked in \`packages/sim-core/test/sound-f2.test.ts\`.

- Dry air: 343.2 m/s at 20 °C and 331.3 m/s at 0 °C, matching textbook values; argon 319 m/s at 20 °C.
- The helium/air ratio equals $\\sqrt{(\\gamma_{\\rm He}/\\gamma_{\\rm air})(M_{\\rm air}/M_{\\rm He})}$; helium exceeds 1,000 m/s at 20 °C.
- Water is 4.32 times faster than air; stainless steel 16.9 times.
- Thunder after 3 s ⇒ 1.03 km (the “3 seconds per km” rule).`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: ['Không mô phỏng hấp thụ âm, khúc xạ âm trong khí quyển phân lớp nhiệt độ hay hiệu ứng Doppler.', 'Không có sóng ngang trong chất rắn (sóng S) và tán sắc ánh sáng.'],
    en: ['No sound absorption, refraction in a temperature-layered atmosphere or Doppler effect.', 'No transverse waves in solids (S waves) or optical dispersion.'],
  },
  references: [
    'Kinsler, L. E., Frey, A. R., Coppens, A. B. & Sanders, J. V. (2000). Fundamentals of Acoustics, 4th ed. Wiley, ch. 5.',
    'Del Grosso, V. A. & Mader, C. W. (1972). Speed of sound in pure water. J. Acoust. Soc. Am. 52, 1442.',
    'Weast, R. C. (ed.) (1984). CRC Handbook of Chemistry and Physics, 65th ed. CRC Press, Boca Raton.',
    'NOAA, NASA & USAF (1976). U.S. Standard Atmosphere, 1976 - molar mass of dry air.',
    'lss-lab - Sound and light waves (github.com/MinhMPA/lss-lab).',
  ],
};
