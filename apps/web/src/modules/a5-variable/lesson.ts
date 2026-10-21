import type { Lesson } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Đọc và diễn giải đường cong ánh sáng từ chuỗi quan trắc có thời điểm lấy mẫu không đều.',
      'Sử dụng chu kỳ đồ Lomb–Scargle để tìm kiếm tín hiệu tuần hoàn và nhận diện các nghiệm alias.',
      'Gấp pha dữ liệu theo chu kỳ thử nhằm đánh giá mức độ lặp lại của biến thiên độ sáng.',
      'Giải thích mối liên hệ giữa chu kỳ pulsation và độ sáng tuyệt đối của sao Cepheid cổ điển.',
      'Ước lượng khoảng cách từ môđun khoảng cách, đồng thời nhận biết ảnh hưởng của hấp thụ liên sao và sai số hiệu chuẩn.',
    ],
    en: [
      'Read and interpret light curves from unevenly sampled observations.',
      'Use the Lomb–Scargle periodogram to search for periodic signals and recognise aliases.',
      'Phase-fold data at a trial period to judge how well the variation repeats.',
      'Explain the link between pulsation period and absolute magnitude for classical Cepheids.',
      'Estimate distance from the distance modulus, recognising the effects of interstellar extinction and calibration uncertainty.',
    ],
  },
  durationMin: 40,
  prerequisites: {
    vi: 'Cấp sao biểu kiến và cấp sao tuyệt đối, logarit cơ số 10, đồ thị dữ liệu theo thời gian và kiến thức cơ bản về chuyển động tuần hoàn.',
    en: 'Apparent and absolute magnitudes, base-10 logarithms, time-series plots and basic periodic motion.',
  },
  background: [
    {
      title: { vi: 'Từ dữ liệu trắc quang đến khoảng cách thiên thể', en: 'From photometry to stellar distances' },
      body: {
        vi: 'Một ngôi sao không nhất thiết phát sáng ổn định theo thời gian. Bằng cách theo dõi sự thay đổi cấp sao, chúng ta có thể nhận diện chu kỳ biến quang, nghiên cứu đặc tính vật lý của ngôi sao và, trong những trường hợp phù hợp, ước lượng khoảng cách từ Trái Đất đến nó.\n\nMô-đun này đưa người học đi qua một quy trình phân tích trắc quang cơ bản: khảo sát đường cong ánh sáng, tìm chu kỳ bằng phương pháp Lomb–Scargle, gấp pha để kiểm chứng kết quả và vận dụng định luật Leavitt đối với sao Cepheid cổ điển.',
        en: 'A star does not necessarily shine steadily. By tracking its magnitude we can identify a period of variability, study its physical nature and, in suitable cases, estimate its distance from Earth.\n\nThis module walks through a basic photometric analysis: examine the light curve, find the period with the Lomb–Scargle method, fold the data to check it, and apply the Leavitt law to classical Cepheids.',
      },
    },
    {
      title: { vi: 'Trắc quang và đường cong ánh sáng', en: 'Photometry and light curves' },
      body: {
        vi: 'Trắc quang là phương pháp đo thông lượng bức xạ nhận được từ một thiên thể trong một dải bước sóng xác định. Trong hệ cấp sao, mối liên hệ giữa thông lượng F và cấp sao m được viết dưới dạng:\n\n$$m = -2{,}5\\log_{10}(F/F_0)$$\n\nTrong đó $F_0$ là thông lượng chuẩn của hệ cấp sao đang sử dụng.\n\nDo thang cấp sao có chiều ngược với thông lượng, giá trị cấp sao nhỏ hơn tương ứng với thiên thể sáng hơn. Đường cong ánh sáng biểu diễn sự biến thiên cấp sao theo thời gian, qua đó cho phép khảo sát biên độ, hình dạng và tính tuần hoàn của tín hiệu.\n\nTrong mô phỏng này, cần phân biệt các **tham số tham chiếu lấy từ danh mục** sao biến quang với **chuỗi số liệu tổng hợp** được tạo để phục vụ thực hành. Dữ liệu mô phỏng giúp kiểm soát thời điểm lấy mẫu và mức nhiễu, nhưng không thay thế chuỗi quan trắc thực.',
        en: 'Photometry measures the radiative flux received from an object in a given band. In the magnitude system flux F and magnitude m are related by\n\n$$m = -2.5\\log_{10}(F/F_0)$$\n\nwhere $F_0$ is the reference flux of the magnitude system.\n\nBecause the scale runs opposite to flux, a smaller magnitude means a brighter object. A light curve shows magnitude versus time, revealing amplitude, shape and periodicity.\n\nIn this simulator, distinguish **reference parameters taken from variable-star catalogues** from the **synthetic time series** generated for practice. Simulated data let us control sampling and noise, but they do not replace real observations.',
      },
    },
    {
      title: { vi: 'Tìm chu kỳ bằng Lomb–Scargle', en: 'Finding the period with Lomb–Scargle' },
      body: {
        vi: 'Phương pháp Lomb–Scargle được sử dụng rộng rãi để phát hiện tín hiệu tuần hoàn trong dữ liệu lấy mẫu không đều. Thuật toán khảo sát một dải tần số, đánh giá mức độ phù hợp của mô hình tuần hoàn tại từng tần số và xác định những đỉnh công suất đáng quan tâm.\n\nTừ tần số f, chu kỳ tương ứng được tính bởi:\n\n$$P = \\frac{1}{f}$$\n\nĐỉnh phổ cao nhất là một **ứng viên** cho chu kỳ của tín hiệu, nhưng không mặc nhiên là nghiệm đúng. Lấy mẫu thưa, cửa sổ quan sát, nhiễu và hình dạng đường cong không hình sin có thể tạo ra các đỉnh phụ hoặc nghiệm alias.\n\nVì vậy, kết quả tìm chu kỳ cần được kiểm tra bằng cách gấp pha, đánh giá mức độ phù hợp của đường cong và, khi cần, khảo sát ý nghĩa thống kê của các đỉnh phổ.',
        en: 'The Lomb–Scargle method is widely used to detect periodic signals in unevenly sampled data. It scans a range of frequencies, measures how well a periodic model fits at each, and identifies the significant power peaks.\n\nThe period follows from the frequency:\n\n$$P = \\frac{1}{f}$$\n\nThe highest peak is a **candidate** period, not automatically the right one. Sparse sampling, the observing window, noise and non-sinusoidal shapes can create secondary peaks or aliases.\n\nThe result must therefore be checked by folding, by judging the fit, and when needed by assessing the statistical significance of the peaks.',
      },
    },
    {
      title: { vi: 'Gấp pha và kiểm chứng chu kỳ', en: 'Phase folding and checking the period' },
      body: {
        vi: 'Gấp pha là phép biến đổi thời gian quan sát sang pha của chu kỳ giả định:\n\n$$\\phi_i = \\operatorname{frac}\\left(\\frac{t_i - t_0}{P}\\right)$$\n\nTrong đó $t_0$ là mốc pha được chọn, còn P là chu kỳ thử.\n\nKhi chu kỳ phù hợp, những quan sát thuộc các chu kỳ khác nhau có xu hướng xếp thành cùng một đường cong, làm nổi bật cấu trúc biến thiên lặp lại của ngôi sao.\n\nGấp pha không tạo ra thông tin quan sát mới. Đây là phép sắp xếp lại dữ liệu để kiểm tra giả thuyết về tính tuần hoàn. Một đường cong trông có vẻ mượt cũng chưa đủ để khẳng định chu kỳ là duy nhất, đặc biệt khi số điểm đo ít hoặc dữ liệu có nhiều nghiệm alias.',
        en: 'Folding converts observation times into phases of a trial period:\n\n$$\\phi_i = \\operatorname{frac}\\left(\\frac{t_i - t_0}{P}\\right)$$\n\nwhere $t_0$ is the chosen phase origin and P the trial period.\n\nAt the right period, points from different cycles line up on one curve, revealing the repeating variation.\n\nFolding creates no new information; it rearranges the data to test a periodicity hypothesis. A smooth-looking curve is not enough to prove the period is unique, especially with few points or many aliases.',
      },
    },
    {
      title: { vi: 'Định luật Leavitt: chu kỳ và độ sáng', en: 'The Leavitt law: period and luminosity' },
      body: {
        vi: 'Đối với sao Cepheid cổ điển thuộc phạm vi hiệu chuẩn phù hợp, chu kỳ pulsation có quan hệ thực nghiệm với độ sáng tuyệt đối. Dạng quan hệ sử dụng trong mô phỏng (Benedict và cộng sự 2007) là:\n\n$$M_V = -2{,}43\\,(\\log_{10}P - 1) - 4{,}05$$\n\nTrong đó P là chu kỳ tính bằng ngày, còn $M_V$ là cấp sao tuyệt đối trong dải V theo hệ hiệu chuẩn được lựa chọn.\n\nQuan hệ này cho phép ước lượng độ sáng tuyệt đối từ chu kỳ, sau đó so sánh với cấp sao biểu kiến để suy ra khoảng cách. Việc áp dụng đòi hỏi xác định đúng loại sao, chế độ pulsation, dải trắc quang và quy ước **cấp sao trung bình** (trung bình theo cường độ ⟨V⟩, không phải cấp sao tức thời). Hiệu ứng hấp thụ liên sao cũng phải được hiệu chỉnh hoặc đưa vào mô hình.',
        en: 'For classical Cepheids within a suitable calibration, the pulsation period is empirically related to absolute magnitude. The form used here (Benedict et al. 2007) is\n\n$$M_V = -2.43\\,(\\log_{10}P - 1) - 4.05$$\n\nwith P in days and $M_V$ the V-band absolute magnitude in the chosen calibration.\n\nIt gives the absolute magnitude from the period, which is then compared with the apparent magnitude to infer distance. Applying it requires the right class of star, pulsation mode, photometric band and **mean-magnitude** convention (intensity mean ⟨V⟩, not an instantaneous magnitude). Interstellar extinction must also be corrected or modelled.',
      },
    },
    {
      title: { vi: 'Từ môđun khoảng cách đến khoảng cách thiên thể', en: 'From distance modulus to distance' },
      body: {
        vi: 'Môđun khoảng cách hiệu chỉnh hấp thụ được xác định bởi:\n\n$$\\mu_0 = m_V - A_V - M_V$$\n\nKhoảng cách tương ứng là:\n\n$$d = 10^{(\\mu_0 + 5)/5}\\ \\mathrm{pc}$$\n\nTrong đó $m_V$ là cấp sao biểu kiến, $A_V$ là độ hấp thụ liên sao trong dải V, $M_V$ là cấp sao tuyệt đối và pc là parsec.\n\nKhoảng cách suy ra không chỉ phụ thuộc vào độ chính xác của phép đo cấp sao và chu kỳ, mà còn chịu ảnh hưởng của độ phân tán của quan hệ Leavitt, hiệu chuẩn điểm không và ước lượng độ hấp thụ. Vì vậy, kết quả cần được hiểu là một **ước lượng phụ thuộc mô hình**, không phải giá trị chính xác tuyệt đối.',
        en: 'The extinction-corrected distance modulus is\n\n$$\\mu_0 = m_V - A_V - M_V$$\n\nand the distance\n\n$$d = 10^{(\\mu_0 + 5)/5}\\ \\mathrm{pc}$$\n\nwith $m_V$ the apparent magnitude, $A_V$ the V-band extinction, $M_V$ the absolute magnitude, in parsecs.\n\nThe distance depends not only on the period and magnitude measurements but also on the scatter of the Leavitt relation, its zero-point calibration and the extinction estimate. Treat it as a **model-dependent estimate**, not an exact value.',
      },
    },
  ],
  activities: [
    {
      title: { vi: 'Thử nghiệm 1 - Khám phá chu kỳ', en: 'Experiment 1 - Explore the period' },
      text: {
        vi: 'Quan sát chuỗi điểm trắc quang và chu kỳ đồ Lomb–Scargle. Xác định đỉnh phổ nổi bật, ghi lại chu kỳ tương ứng $P_{\\rm GLS}$ và đối chiếu với chu kỳ tham chiếu $P_{\\rm ref}$ của cấu hình mẫu.',
        en: 'Look at the photometric series and the Lomb–Scargle periodogram. Identify the main peak, note its period $P_{\\rm GLS}$ and compare with the preset’s reference period $P_{\\rm ref}$.',
      },
      params: { star: 'dcep' },
    },
    {
      title: { vi: 'Thử nghiệm 2 - Kiểm chứng bằng gấp pha', en: 'Experiment 2 - Check by folding' },
      text: {
        vi: 'Thay đổi chu kỳ thử $P_{\\rm thử}$ và quan sát mức độ các điểm đo xếp thành đường cong lặp lại. So sánh một giá trị gần đỉnh phổ với một giá trị lệch đáng kể để nhận biết ảnh hưởng của chu kỳ lên cấu trúc pha.',
        en: 'Change the trial period $P_{\\rm trial}$ and watch how well the points line up. Compare a value near the peak with one far off to see how the period shapes the phase structure.',
      },
      params: { star: 'dcep', ptry: 5.74 },
    },
    {
      title: { vi: 'Thử nghiệm 3 - Ước lượng khoảng cách', en: 'Experiment 3 - Estimate the distance' },
      text: {
        vi: 'Sử dụng chu kỳ tìm được để tính cấp sao tuyệt đối theo quan hệ Leavitt. Sau đó đưa cấp sao biểu kiến trung bình ⟨V⟩ và độ hấp thụ liên sao $A_V$ vào môđun khoảng cách để ước lượng khoảng cách của ngôi sao. Thử đặt $A_V = 0$ để thấy khoảng cách thay đổi thế nào.',
        en: 'Use the period you found to compute the absolute magnitude from the Leavitt law. Then put the mean apparent magnitude ⟨V⟩ and the extinction $A_V$ into the distance modulus to estimate the distance. Try $A_V = 0$ to see how the distance changes.',
      },
      params: { star: 'dcep' },
    },
    {
      title: { vi: 'Câu hỏi suy ngẫm - nhiễu và số lần quan sát', en: 'Reflection - noise and sampling' },
      text: {
        vi: 'Nếu giữ nguyên đường cong ánh sáng nhưng tăng mức nhiễu hoặc giảm số lần quan sát, kết quả tìm chu kỳ và khoảng cách sẽ thay đổi như thế nào? Thử với Algol: vì sao một thành phần điều hoà thường cho chu kỳ bằng một nửa, và 3 thành phần thì khắc phục được?',
        en: 'Keeping the light curve but increasing the noise or reducing the number of observations, how do the period and distance change? Try Algol: why does a single harmonic often give half the period, and why do 3 harmonics fix it?',
      },
      params: { star: 'algol', nterms: 1, n: 80, T: 40 },
    },
  ],
  quiz: [
    {
      q: { vi: 'Vì sao phương pháp Lomb–Scargle phù hợp với chuỗi quan trắc có thời điểm lấy mẫu không đều?', en: 'Why is Lomb–Scargle suited to unevenly sampled observations?' },
      options: [
        { vi: 'Vì nó đánh giá mức phù hợp của tín hiệu tuần hoàn trực tiếp tại các thời điểm quan sát', en: 'It evaluates the fit of a periodic signal directly at the observation times' },
        { vi: 'Vì nó tự nội suy dữ liệu thành chuỗi cách đều', en: 'It interpolates the data onto an even grid' },
        { vi: 'Vì nó không bị ảnh hưởng bởi nhiễu', en: 'It is immune to noise' },
      ],
      answer: 0,
      explain: { vi: 'Phương pháp không yêu cầu dữ liệu phải được lấy mẫu cách đều như những phương pháp phân tích phổ cổ điển dựa trên chuỗi đều.', en: 'It does not require evenly spaced samples, unlike classical spectral methods.' },
    },
    {
      q: { vi: 'Đỉnh công suất cao nhất trong chu kỳ đồ có luôn là chu kỳ thực của ngôi sao không?', en: 'Is the highest periodogram peak always the star’s true period?' },
      options: [{ vi: 'Có', en: 'Yes' }, { vi: 'Không', en: 'No' }],
      answer: 1,
      explain: { vi: 'Cần kiểm tra alias, cửa sổ quan sát, mức nhiễu, độ phủ pha và hình dạng đường cong; trong một số trường hợp cần thêm kiểm định thống kê hoặc mô hình nhiều thành phần điều hòa.', en: 'Check aliases, the observing window, noise, phase coverage and curve shape; sometimes a statistical test or a multi-harmonic model is needed.' },
    },
    {
      q: { vi: 'Điều kiện quan trọng khi sử dụng định luật Leavitt để tính khoảng cách là gì?', en: 'What is essential when using the Leavitt law for distance?' },
      options: [
        { vi: 'Chỉ cần biết chu kỳ', en: 'Only the period is needed' },
        { vi: 'Đúng lớp sao và phạm vi hiệu chuẩn; dùng cấp sao trung bình theo đúng định nghĩa; hiệu chỉnh hấp thụ liên sao', en: 'Right class of star and calibration range; the defined mean magnitude; extinction corrected' },
        { vi: 'Dùng cấp sao tại thời điểm sáng nhất', en: 'Use the magnitude at maximum light' },
      ],
      answer: 1,
      explain: { vi: 'Ngôi sao phải thuộc đúng lớp đối tượng và phạm vi hiệu chuẩn; chu kỳ và cấp sao trung bình phải tuân theo định nghĩa của quan hệ được sử dụng; hấp thụ liên sao phải được hiệu chỉnh hoặc mô hình hóa.', en: 'The star must belong to the calibrated class; period and mean magnitude must follow the relation’s definitions; extinction must be corrected or modelled.' },
    },
    {
      q: { vi: 'Vì sao không thể bỏ qua độ hấp thụ liên sao khi ước lượng khoảng cách?', en: 'Why can’t extinction be ignored when estimating distance?' },
      options: [
        { vi: 'Vì bụi làm sao trông mờ hơn, khiến khoảng cách bị ước lượng quá lớn', en: 'Dust makes the star look fainter, so the distance is overestimated' },
        { vi: 'Vì bụi làm chu kỳ dài ra', en: 'Dust lengthens the period' },
        { vi: 'Không ảnh hưởng gì', en: 'It has no effect' },
      ],
      answer: 0,
      explain: { vi: 'Bụi liên sao làm suy giảm thông lượng nhận được, khiến cấp sao biểu kiến lớn hơn cấp sao tương ứng nếu không có hấp thụ. Nếu không hiệu chỉnh, môđun khoảng cách và khoảng cách suy ra có thể bị sai lệch.', en: 'Interstellar dust dims the received flux, making the apparent magnitude larger than without extinction; uncorrected, the modulus and distance are biased.' },
    },
  ],
  instructor: {
    vi: '**Tài nguyên tham khảo:** Scargle (1982), ApJ 263, 835; VanderPlas (2018), ApJS 236, 16; Benedict et al. (2007), AJ 133, 1810; AAVSO - tài liệu giáo dục về sao biến quang và chu kỳ của δ Cephei; GCVS và AAVSO VSX để tra cứu đặc trưng sao biến quang.',
    en: '**References:** Scargle (1982), ApJ 263, 835; VanderPlas (2018), ApJS 236, 16; Benedict et al. (2007), AJ 133, 1810; AAVSO educational material on variable stars and δ Cephei; GCVS and AAVSO VSX for variable-star parameters.',
  },
};
