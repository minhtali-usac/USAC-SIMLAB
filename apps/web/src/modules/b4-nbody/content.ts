import type { Lesson, ModelCard } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: [
      'Viết được phương trình chuyển động Newton cho hệ N chất điểm và nêu các đại lượng bảo toàn của hệ cô lập.',
      'Giải thích vì sao bài toán hai vật có nghiệm giải tích còn bài toán ba vật nói chung phải giải bằng tích phân số.',
      'Phân biệt bậc chính xác của một phương pháp số với khả năng bảo toàn dài hạn của nó (symplectic và không symplectic).',
      'Nhận biết khi nào bước thời gian cố định không còn đáng tin và vì sao cần bước thích nghi trong các lần tiếp cận gần.',
      'Đánh giá độ tin cậy của một quỹ đạo số bằng độ trôi năng lượng, mômen động lượng và kiểm tra hội tụ.',
    ],
    en: [
      'Write Newton’s equations of motion for N point masses and state the conserved quantities of an isolated system.',
      'Explain why the two-body problem has an analytic solution whereas the general three-body problem must be integrated numerically.',
      'Distinguish a method’s order of accuracy from its long-term conservation properties (symplectic vs non-symplectic).',
      'Recognise when a fixed time step is no longer reliable and why close encounters need adaptive stepping.',
      'Assess a numerical orbit with energy drift, angular-momentum error and convergence tests.',
    ],
  },
  durationMin: 45,
  prerequisites: { vi: 'B1 - Quỹ đạo Kepler; định luật vạn vật hấp dẫn; định luật bảo toàn năng lượng và mômen động lượng; khái niệm đạo hàm và sai số xấp xỉ.', en: 'B1 - Kepler orbits; Newton’s law of gravitation; conservation of energy and angular momentum; derivatives and approximation error.' },
  background: [
    {
      title: { vi: 'Từ hai vật đến N vật', en: 'From two bodies to N bodies' },
      body: {
        vi: 'Bài toán hai vật (mô-đun B1) quy được về chuyển động của một vật quanh khối tâm và có nghiệm là các đường conic. Khi có từ ba vật trở lên, lực tác dụng lên mỗi vật phụ thuộc vào vị trí của tất cả các vật còn lại tại cùng thời điểm, nên quỹ đạo nói chung không thể viết thành công thức tường minh.\n\nMô-đun B4 giải trực tiếp phương trình Newton bằng **tích phân số** và cho phép so sánh bốn phương pháp: leapfrog, Yoshida bậc 4, Runge–Kutta 4 và Dormand–Prince 5(4) bước thích nghi. Mục tiêu là hiểu không chỉ quỹ đạo trông ra sao, mà còn **mức độ tin cậy** của quỹ đạo tính được.',
        en: 'The two-body problem (module B1) reduces to the motion of one body about the barycentre and is solved by conic sections. With three or more bodies the force on each body depends on the positions of all the others at the same instant, so the orbits cannot in general be written in closed form.\n\nModule B4 solves Newton’s equations directly by **numerical integration** and compares four methods: leapfrog, fourth-order Yoshida, Runge–Kutta 4 and adaptive Dormand–Prince 5(4). The aim is to understand not only what the orbits look like but how **reliable** the computed orbits are.',
      },
    },
    {
      title: { vi: '1. Phương trình chuyển động và các đại lượng bảo toàn', en: '1. Equations of motion and conserved quantities' },
      body: {
        vi: 'Với N chất điểm khối lượng $m_i$ tại vị trí $\\mathbf r_i$, gia tốc của vật $i$ là\n\n$$\\ddot{\\mathbf r}_i = \\sum_{j \\ne i} \\frac{G m_j\\,(\\mathbf r_j - \\mathbf r_i)}{|\\mathbf r_j - \\mathbf r_i|^3},\\qquad i = 1, \\dots, N.$$\n\nĐây là hệ $6N$ phương trình vi phân bậc nhất cho toạ độ và vận tốc. Vì nội lực tuân theo định luật III Newton và là lực xuyên tâm, hệ cô lập bảo toàn **động lượng toàn phần** $\\mathbf P = \\sum_i m_i\\dot{\\mathbf r}_i$, **mômen động lượng** $\\mathbf L = \\sum_i m_i\\,\\mathbf r_i \\times \\dot{\\mathbf r}_i$ và **cơ năng**\n\n$$E = \\sum_i \\tfrac12 m_i |\\dot{\\mathbf r}_i|^2 - \\sum_{i<j} \\frac{G m_i m_j}{|\\mathbf r_i - \\mathbf r_j|}.$$\n\nTrong nghiệm chính xác các đại lượng này không đổi; trong nghiệm số, độ lệch của chúng là một thước đo sai số (cần nhưng chưa đủ).',
        en: 'For N point masses $m_i$ at positions $\\mathbf r_i$, the acceleration of body $i$ is\n\n$$\\ddot{\\mathbf r}_i = \\sum_{j \\ne i} \\frac{G m_j\\,(\\mathbf r_j - \\mathbf r_i)}{|\\mathbf r_j - \\mathbf r_i|^3},\\qquad i = 1, \\dots, N.$$\n\nThis is a system of $6N$ first-order differential equations for positions and velocities. Because the internal forces obey Newton’s third law and are central, an isolated system conserves the **total momentum** $\\mathbf P = \\sum_i m_i\\dot{\\mathbf r}_i$, the **angular momentum** $\\mathbf L = \\sum_i m_i\\,\\mathbf r_i \\times \\dot{\\mathbf r}_i$ and the **energy**\n\n$$E = \\sum_i \\tfrac12 m_i |\\dot{\\mathbf r}_i|^2 - \\sum_{i<j} \\frac{G m_i m_j}{|\\mathbf r_i - \\mathbf r_j|}.$$\n\nThese are constant along the exact solution; in a numerical solution their deviation is one measure of error (necessary, not sufficient).',
      },
    },
    {
      title: { vi: '2. Vì sao bài toán ba vật khó', en: '2. Why the three-body problem is hard' },
      body: {
        vi: 'Ngoài mười tích phân cổ điển (khối tâm, động lượng, mômen động lượng, năng lượng), bài toán ba vật tổng quát **không có thêm tích phân đại số** nào (Bruns 1887); Poincaré (1890) chỉ ra rằng chuyển động có thể nhạy cảm cực độ với điều kiện ban đầu. Hai sai lệch ban đầu rất nhỏ có thể dẫn tới hai kết cục hoàn toàn khác nhau sau vài lần tiếp cận gần: đó là tính **hỗn loạn**.\n\nVẫn tồn tại những nghiệm đặc biệt có cấu trúc đẹp, chẳng hạn quỹ đạo **hình số 8** của ba vật bằng nhau (Chenciner & Montgomery 2000; điều kiện đầu và chu kỳ $T \\approx 6{,}3259$ theo Simó), trong đơn vị $G = m = 1$.',
        en: 'Beyond the ten classical integrals (centre of mass, momentum, angular momentum, energy), the general three-body problem has **no further algebraic integrals** (Bruns 1887); Poincaré (1890) showed that the motion can be extremely sensitive to initial conditions. Two tiny initial differences may lead to completely different outcomes after a few close encounters: this is **chaos**.\n\nSpecial solutions with beautiful structure still exist, for instance the **figure-eight** orbit of three equal masses (Chenciner & Montgomery 2000; initial conditions and period $T \\approx 6.3259$ from Simó), in units $G = m = 1$.',
      },
    },
    {
      title: { vi: '3. Bậc chính xác của phương pháp số', en: '3. Order of accuracy' },
      body: {
        vi: 'Một phương pháp có **bậc $p$** nếu sai số toàn cục sau một khoảng thời gian cố định tỉ lệ với $h^p$, với $h$ là bước thời gian. Giảm $h$ đi một nửa thì sai số giảm $2^p$ lần:\n\n$$\\varepsilon(h) \\approx C\\,h^p \\quad\\Longrightarrow\\quad p \\approx \\log_2\\frac{\\varepsilon(h)}{\\varepsilon(h/2)}.$$\n\n- **Leapfrog** (trôi – đẩy – trôi): bậc 2, một lần tính lực mỗi bước.\n- **Yoshida bậc 4**: ghép ba bước leapfrog với hệ số $w_1 = 1/(2 - 2^{1/3})$, $w_0 = -2^{1/3}/(2 - 2^{1/3})$; ba lần tính lực mỗi bước.\n- **RK4**: bậc 4, bốn lần tính lực mỗi bước.\n- **DOPRI5**: cặp nhúng bậc 5(4), tự ước lượng sai số mỗi bước và co giãn $h$ để giữ sai số trong dung sai.\n\nMỗi lần tính lực tốn $\\mathcal O(N^2)$ phép tính vì phải cộng lực của mọi cặp vật.',
        en: 'A method has **order $p$** if the global error after a fixed time scales as $h^p$, with $h$ the time step. Halving $h$ divides the error by $2^p$:\n\n$$\\varepsilon(h) \\approx C\\,h^p \\quad\\Longrightarrow\\quad p \\approx \\log_2\\frac{\\varepsilon(h)}{\\varepsilon(h/2)}.$$\n\n- **Leapfrog** (drift – kick – drift): order 2, one force evaluation per step.\n- **Fourth-order Yoshida**: three leapfrog substeps with coefficients $w_1 = 1/(2 - 2^{1/3})$, $w_0 = -2^{1/3}/(2 - 2^{1/3})$; three force evaluations per step.\n- **RK4**: order 4, four force evaluations per step.\n- **DOPRI5**: embedded 5(4) pair that estimates its own error each step and resizes $h$ to stay within tolerance.\n\nEach force evaluation costs $\\mathcal O(N^2)$ operations because the force of every pair must be summed.',
      },
    },
    {
      title: { vi: '4. Phương pháp symplectic và bảo toàn dài hạn', en: '4. Symplectic methods and long-term conservation' },
      body: {
        vi: 'Bậc chính xác cao chưa đảm bảo quỹ đạo tốt sau thời gian dài. Leapfrog và Yoshida là phương pháp **symplectic**: mỗi bước là một phép biến đổi chính tắc, bảo toàn cấu trúc hình học của cơ học Hamilton. Phân tích sai số ngược cho thấy chúng bảo toàn chính xác một **Hamilton bị biến dạng** $\\tilde H = H + \\mathcal O(h^p)$ trong khoảng thời gian rất dài, nên sai số năng lượng **dao động và bị chặn** thay vì tích luỹ (Hairer, Lubich & Wanner 2006).\n\nRK4 không symplectic: sai số năng lượng tuy nhỏ ở mỗi bước nhưng **tăng dần đều** theo thời gian. Ngoài ra, do mỗi bước của leapfrog và Yoshida chỉ gồm các phép “trôi” và “đẩy” bởi lực xuyên tâm từng cặp, mômen động lượng được bảo toàn tới sai số làm tròn.',
        en: 'High order alone does not guarantee good long-term orbits. Leapfrog and Yoshida are **symplectic**: each step is a canonical transformation that preserves the geometric structure of Hamiltonian mechanics. Backward error analysis shows that they exactly conserve a **modified Hamiltonian** $\\tilde H = H + \\mathcal O(h^p)$ for very long times, so the energy error **oscillates and stays bounded** instead of accumulating (Hairer, Lubich & Wanner 2006).\n\nRK4 is not symplectic: its energy error, though small per step, **grows steadily** with time. Moreover, because each leapfrog or Yoshida step consists only of drifts and kicks by pairwise central forces, angular momentum is conserved to round-off.',
      },
    },
    {
      title: { vi: '5. Tiếp cận gần, bước thích nghi và làm mềm', en: '5. Close encounters, adaptive steps and softening' },
      body: {
        vi: 'Khi hai vật tiến rất gần nhau, gia tốc $\\propto 1/r^2$ tăng vọt và thời gian đặc trưng $\\sim \\sqrt{r^3/(Gm)}$ trở nên rất ngắn. Một bước cố định phù hợp lúc đầu có thể lớn hơn thời gian tiếp cận hàng chục lần: khi đó nghiệm số **sai hoàn toàn**, kể cả với phương pháp symplectic. DOPRI5 tự giảm bước trong những đoạn này và tăng bước khi các vật ở xa nhau.\n\nTrong mô phỏng cụm sao, thế hấp dẫn được **làm mềm** theo Plummer:\n\n$$\\Phi_{ij} = -\\frac{G m_i m_j}{\\sqrt{r_{ij}^2 + \\varepsilon^2}},$$\n\nvới $\\varepsilon$ là độ dài làm mềm. Đây là một **sai lệch có chủ ý** so với hấp dẫn Newton, dùng để tránh va chạm gần mà không cần bước rất nhỏ; nó không mô tả vật lý của sao thật.',
        en: 'When two bodies come very close, the acceleration $\\propto 1/r^2$ soars and the characteristic time $\\sim \\sqrt{r^3/(Gm)}$ becomes very short. A fixed step that suited the start can be tens of times longer than the encounter: the numerical solution is then **completely wrong**, even with a symplectic method. DOPRI5 shrinks its step through such episodes and lengthens it when the bodies are far apart.\n\nIn the star-cluster scene the gravitational potential is **softened** à la Plummer:\n\n$$\\Phi_{ij} = -\\frac{G m_i m_j}{\\sqrt{r_{ij}^2 + \\varepsilon^2}},$$\n\nwith $\\varepsilon$ the softening length. This is a **deliberate deviation** from Newtonian gravity that avoids close encounters without tiny steps; it does not describe the physics of real stars.',
      },
    },
    {
      title: { vi: '6. Các cấu hình mẫu', en: '6. The preset configurations' },
      body: {
        vi: '- **Hình số 8**: ba vật khối lượng bằng nhau, $G = 1$; nghiệm tuần hoàn chu kỳ $T \\approx 6{,}3259$.\n- **Bài toán Pythagoras** (Burrau 1913): khối lượng 3, 4, 5 đứng yên tại các đỉnh tam giác vuông cạnh 3–4–5, mỗi vật đặt đối diện cạnh có độ dài bằng khối lượng của nó. Szebehely & Peters (1967) tính được rằng sau nhiều lần tiếp cận gần, hai vật 4 và 5 tạo thành hệ đôi còn vật 3 bị văng ra.\n- **Sao đôi và hành tinh**: hai sao bằng nhau trên quỹ đạo tròn, khoảng cách 1; hành tinh ở bán kính 4, ngoài ngưỡng ổn định khoảng 2,4 lần khoảng cách sao đôi (Holman & Wiegert 1999).\n- **Mặt Trời – Sao Mộc – Sao Thổ**: đơn vị au, năm, khối lượng Mặt Trời ($G = 4\\pi^2$); tỉ số khối lượng IAU, quỹ đạo ban đầu tròn và đồng phẳng - **không phải** lịch thiên văn thật.\n- **Cụm 24 vật**: điều kiện đầu ngẫu nhiên có làm mềm, chỉ mang tính minh hoạ.\n- **Hai vật**: kiểm tra với nghiệm Kepler giải tích.',
        en: '- **Figure eight**: three equal masses, $G = 1$; periodic solution with $T \\approx 6.3259$.\n- **Pythagorean problem** (Burrau 1913): masses 3, 4, 5 at rest at the corners of a 3–4–5 right triangle, each opposite the side whose length equals its mass. Szebehely & Peters (1967) showed that after many close encounters bodies 4 and 5 form a binary and body 3 is ejected.\n- **Binary and planet**: two equal stars on a circular orbit of separation 1; a planet at radius 4, beyond the stability limit of about 2.4 binary separations (Holman & Wiegert 1999).\n- **Sun – Jupiter – Saturn**: units au, yr, solar mass ($G = 4\\pi^2$); IAU mass ratios, circular coplanar initial orbits - **not** a real ephemeris.\n- **24-body cluster**: random softened initial conditions, illustrative only.\n- **Two bodies**: check against the analytic Kepler solution.',
      },
    },
  ],
  activities: [
    { title: { vi: 'Thử nghiệm 1 - Hình số 8', en: 'Experiment 1 - The figure eight' }, text: { vi: 'Chọn hình số 8 với Yoshida bậc 4. Quan sát ba vật đuổi nhau trên cùng một đường cong và đọc độ trôi năng lượng $|\\Delta E/E_0|$. Đổi sang leapfrog với cùng bước $h$: độ trôi thay đổi khoảng bao nhiêu bậc độ lớn? Liên hệ với bậc 2 và bậc 4.', en: 'Choose the figure eight with fourth-order Yoshida. Watch the three bodies chase one another along one curve and read the energy drift $|\\Delta E/E_0|$. Switch to leapfrog with the same $h$: by how many orders of magnitude does the drift change? Relate this to orders 2 and 4.' }, params: { scene: 'figure8', int: 'yoshida4', h: 0.002 } },
    { title: { vi: 'Thử nghiệm 2 - Trôi và không trôi', en: 'Experiment 2 - Drift versus no drift' }, text: { vi: 'Chọn Mặt Trời – Sao Mộc – Sao Thổ với RK4 và $h = 0{,}02$ năm, để chạy một lúc và quan sát đồ thị độ trôi năng lượng. Chuyển sang leapfrog với cùng $h$. Đồ thị nào tăng đều, đồ thị nào dao động quanh một mức không đổi? Vì sao bậc chính xác cao hơn của RK4 không cứu được nó về lâu dài?', en: 'Choose Sun – Jupiter – Saturn with RK4 and $h = 0.02$ yr, let it run and watch the energy-drift plot. Switch to leapfrog with the same $h$. Which curve grows steadily and which oscillates about a constant level? Why does RK4’s higher order not save it in the long run?' }, params: { scene: 'sunJupiterSaturn', int: 'rk4', h: 0.02 } },
    { title: { vi: 'Thử nghiệm 3 - Bài toán Pythagoras', en: 'Experiment 3 - The Pythagorean problem' }, text: { vi: 'Chạy bài toán Pythagoras với DOPRI5 và theo dõi các lần tiếp cận gần cho tới khi một vật bị văng ra. Vật nào thoát? Sau đó chuyển sang Yoshida bậc 4 với bước cố định và quan sát độ trôi năng lượng sau lần tiếp cận gần đầu tiên.', en: 'Run the Pythagorean problem with DOPRI5 and follow the close encounters until one body is ejected. Which body escapes? Then switch to fixed-step fourth-order Yoshida and watch the energy drift after the first close encounter.' }, params: { scene: 'pythagorean', int: 'dopri5', h: 0.005 } },
    { title: { vi: 'Thử nghiệm 4 - Kiểm tra hội tụ', en: 'Experiment 4 - Convergence check' }, text: { vi: 'Với hệ hai vật, chạy RK4 lần lượt với $h$ và $h/2$. Sai số năng lượng giảm khoảng bao nhiêu lần? So sánh với $2^4 = 16$.', en: 'With the two-body system, run RK4 with $h$ and then $h/2$. By what factor does the energy error fall? Compare with $2^4 = 16$.' }, params: { scene: 'twobody', int: 'rk4', h: 0.01 } },
    { title: { vi: 'Thử nghiệm 5 - Hành tinh quanh sao đôi', en: 'Experiment 5 - A circumbinary planet' }, text: { vi: 'Chọn sao đôi và hành tinh. Hành tinh ở bán kính 4 có giữ quỹ đạo ổn định không? Nhấn – kéo để thêm một vật gần sao đôi hơn (khoảng 1,5 lần khoảng cách hai sao) và quan sát số phận của nó.', en: 'Choose the binary and planet. Does the planet at radius 4 keep a stable orbit? Press–drag to add a body closer to the binary (about 1.5 binary separations) and watch its fate.' }, params: { scene: 'binaryPlanet', int: 'yoshida4' } },
  ],
  quiz: [
    { q: { vi: 'Đại lượng nào không được bảo toàn trong một hệ N vật cô lập chịu hấp dẫn Newton?', en: 'Which quantity is not conserved in an isolated Newtonian N-body system?' }, options: [{ vi: 'Động năng của từng vật', en: 'The kinetic energy of each body' }, { vi: 'Cơ năng toàn phần', en: 'The total energy' }, { vi: 'Mômen động lượng toàn phần', en: 'The total angular momentum' }], answer: 0, explain: { vi: 'Các vật trao đổi năng lượng với nhau; chỉ tổng năng lượng của cả hệ là không đổi.', en: 'Bodies exchange energy; only the total energy of the system is constant.' } },
    { q: { vi: 'Giảm bước thời gian đi một nửa, sai số toàn cục của một phương pháp bậc 4 giảm khoảng:', en: 'Halving the time step reduces the global error of a fourth-order method by about:' }, options: [{ vi: '16 lần', en: '16×' }, { vi: '4 lần', en: '4×' }, { vi: '2 lần', en: '2×' }], answer: 0, explain: { vi: 'Sai số ∝ h⁴ nên giảm 2⁴ = 16 lần.', en: 'Error ∝ h⁴, so it falls by 2⁴ = 16.' } },
    { q: { vi: 'Vì sao leapfrog (bậc 2) có thể cho năng lượng dài hạn tốt hơn RK4 (bậc 4)?', en: 'Why can leapfrog (order 2) conserve energy better than RK4 (order 4) in the long run?' }, options: [{ vi: 'Leapfrog là symplectic nên sai số năng lượng bị chặn, còn sai số của RK4 tích luỹ theo thời gian', en: 'Leapfrog is symplectic, so its energy error stays bounded, while RK4’s accumulates' }, { vi: 'Leapfrog không có sai số', en: 'Leapfrog has no error' }, { vi: 'RK4 dùng ít phép tính lực hơn', en: 'RK4 uses fewer force evaluations' }], answer: 0, explain: { vi: 'Leapfrog bảo toàn chính xác một Hamilton bị biến dạng gần với Hamilton thật.', en: 'Leapfrog exactly conserves a modified Hamiltonian close to the true one.' } },
    { q: { vi: 'Độ trôi năng lượng rất nhỏ có chứng minh quỹ đạo số là chính xác không?', en: 'Does a tiny energy drift prove that a numerical orbit is accurate?' }, options: [{ vi: 'Không - đó là điều kiện cần; vẫn cần kiểm tra hội tụ khi giảm bước', en: 'No - it is necessary; a convergence check with smaller steps is still needed' }, { vi: 'Có, luôn luôn', en: 'Yes, always' }], answer: 0, explain: { vi: 'Sai số pha (vị trí dọc quỹ đạo) có thể lớn dù năng lượng gần như không đổi.', en: 'The phase error (position along the orbit) can be large while the energy barely changes.' } },
    { q: { vi: 'Làm mềm Plummer ε trong cụm sao là:', en: 'Plummer softening ε in the cluster is:' }, options: [{ vi: 'Một sai lệch có chủ ý khỏi hấp dẫn Newton để tránh va chạm gần', en: 'A deliberate deviation from Newtonian gravity to avoid close encounters' }, { vi: 'Bán kính thật của các ngôi sao', en: 'The true radius of the stars' }], answer: 0, explain: { vi: 'ε không phải đại lượng vật lý của sao; nó làm thay đổi lực ở khoảng cách nhỏ hơn ε.', en: 'ε is not a physical property of stars; it changes the force at separations below ε.' } },
  ],
  instructor: {
    vi: 'Tài nguyên: Hairer, Lubich & Wanner (2006) Geometric Numerical Integration, ch. I, VI, IX; Yoshida (1990) Phys. Lett. A 150, 262; Aarseth (2003) Gravitational N-Body Simulations; Chenciner & Montgomery (2000) Ann. Math. 152, 881; Szebehely & Peters (1967) AJ 72, 876. Gợi ý thảo luận: vì sao các mô phỏng Hệ Mặt Trời dài hạn (hàng tỉ năm) dùng phương pháp symplectic, còn mô phỏng cụm sao dày đặc cần bước thích nghi riêng cho từng vật và chính quy hoá các cặp gần.',
    en: 'Resources: Hairer, Lubich & Wanner (2006) Geometric Numerical Integration, ch. I, VI, IX; Yoshida (1990) Phys. Lett. A 150, 262; Aarseth (2003) Gravitational N-Body Simulations; Chenciner & Montgomery (2000) Ann. Math. 152, 881; Szebehely & Peters (1967) AJ 72, 876. Discussion: why long-term Solar System integrations (billions of years) use symplectic methods, whereas dense star clusters need individual adaptive steps and regularisation of close pairs.',
  },
};

/** Model Card · B4. Measured figures: `npm run validate:nbody` → docs/validation/B4-nbody.json (2026-10-20). */
export const card: ModelCard = {
  parts: [
    {
      fidelity: 'B',
      label: { vi: 'Mức B - Tích phân số bài toán N vật Newton', en: 'Level B - Numerical integration of the Newtonian N-body problem' },
      body: {
        vi: 'B4 giải phương trình chuyển động của N chất điểm chịu hấp dẫn Newton bằng bốn phương pháp số trên float64. Quỹ đạo là nghiệm số có sai số được đo và hiển thị theo thời gian thực (độ trôi năng lượng, sai lệch mômen động lượng). Kết quả chỉ đáng tin trong phạm vi bước thời gian và cấu hình đã kiểm chứng dưới đây.',
        en: 'B4 integrates the equations of motion of N point masses under Newtonian gravity with four float64 methods. Orbits are numerical solutions whose error is measured and shown live (energy drift, angular-momentum error). Results are reliable only within the step sizes and configurations validated below.',
      },
    },
    {
      fidelity: 'C',
      label: { vi: 'Mức C - Cụm sao có làm mềm và phần hiển thị', en: 'Level C - Softened cluster and display' },
      body: {
        vi: 'Cụm 24 vật dùng điều kiện đầu ngẫu nhiên và thế Plummer (ε = 0,08), nên chỉ minh hoạ định tính động lực học tập thể. Kích thước các chấm tỉ lệ với căn bậc ba khối lượng để dễ phân biệt, không phải bán kính thật; vệt quỹ đạo được cắt sau 1 500 điểm.',
        en: 'The 24-body cluster uses random initial conditions and a Plummer potential (ε = 0.08), so it only illustrates collective dynamics qualitatively. Dot sizes scale with the cube root of mass for legibility, not with true radii; trails are truncated after 1,500 points.',
      },
    },
  ],
  fidelityNote: {
    vi: 'Mức B, C là phân loại nội bộ của USAC SimLab. Kết quả số chỉ được xem là đã kiểm chứng trong phạm vi các bộ tham số, bước thời gian và phép thử được công bố dưới đây.',
    en: 'Levels B, C are USAC SimLab’s internal scale. Numerical results count as validated only within the parameter sets, step sizes and tests published below.',
  },
  equations: [],
  methods: [
    {
      title: { vi: '1. Phương trình chuyển động và đại lượng kiểm tra', en: '1. Equations of motion and monitored quantities' },
      tex: [
        '\\ddot{\\mathbf r}_i=\\sum_{j\\ne i}\\frac{G\\,m_j\\,(\\mathbf r_j-\\mathbf r_i)}{\\left(|\\mathbf r_j-\\mathbf r_i|^2+\\varepsilon^2\\right)^{3/2}}',
        'E=\\sum_i\\tfrac12 m_i|\\mathbf v_i|^2-\\sum_{i<j}\\frac{G\\,m_i m_j}{\\sqrt{r_{ij}^2+\\varepsilon^2}},\\qquad L_z=\\sum_i m_i\\,(x_i v_{y,i}-y_i v_{x,i})',
      ],
      body: {
        vi: 'Trong đó $m_i$, $\\mathbf r_i$, $\\mathbf v_i$ là khối lượng, vị trí và vận tốc của vật $i$; $r_{ij} = |\\mathbf r_i - \\mathbf r_j|$; $\\varepsilon$ là độ dài làm mềm Plummer ($\\varepsilon = 0$ ở mọi cấu hình trừ cụm sao). Lực được cộng theo từng cặp, chi phí $\\mathcal O(N^2)$. Mô phỏng là phẳng ($z = v_z = 0$), nên chỉ thành phần $L_z$ khác không. Hệ đơn vị: $G = 1$ cho các cấu hình không thứ nguyên; au – năm – khối lượng Mặt Trời với $G = 4\\pi^2$ cho Mặt Trời – Sao Mộc – Sao Thổ. Đại lượng hiển thị là $|\\Delta E/E_0| = |E(t) - E(0)|/|E(0)|$ và $|\\Delta L_z| = |L_z(t) - L_z(0)|$.',
        en: '$m_i$, $\\mathbf r_i$, $\\mathbf v_i$ are the mass, position and velocity of body $i$; $r_{ij} = |\\mathbf r_i - \\mathbf r_j|$; $\\varepsilon$ is the Plummer softening length ($\\varepsilon = 0$ in every scene except the cluster). Forces are summed pairwise at $\\mathcal O(N^2)$ cost. The simulation is planar ($z = v_z = 0$), so only $L_z$ is non-zero. Units: $G = 1$ for the dimensionless scenes; au – yr – solar mass with $G = 4\\pi^2$ for Sun – Jupiter – Saturn. Displayed quantities are $|\\Delta E/E_0| = |E(t) - E(0)|/|E(0)|$ and $|\\Delta L_z| = |L_z(t) - L_z(0)|$.',
      },
    },
    {
      title: { vi: '2. Leapfrog và Yoshida bậc 4 (symplectic)', en: '2. Leapfrog and fourth-order Yoshida (symplectic)' },
      tex: [
        '\\mathbf r_{n+1/2}=\\mathbf r_n+\\tfrac h2\\mathbf v_n,\\quad \\mathbf v_{n+1}=\\mathbf v_n+h\\,\\mathbf a(\\mathbf r_{n+1/2}),\\quad \\mathbf r_{n+1}=\\mathbf r_{n+1/2}+\\tfrac h2\\mathbf v_{n+1}',
        'w_1=\\frac{1}{2-2^{1/3}},\\quad w_0=-\\frac{2^{1/3}}{2-2^{1/3}},\\qquad c_{1,4}=\\tfrac{w_1}{2},\\ c_{2,3}=\\tfrac{w_0+w_1}{2},\\ d_{1,3}=w_1,\\ d_2=w_0',
      ],
      body: {
        vi: 'Leapfrog dạng trôi – đẩy – trôi (DKD) là phương pháp bậc 2, đối xứng thời gian và symplectic, một lần tính lực mỗi bước. Yoshida (1990) ghép ba bước leapfrog với hệ số $w_1, w_0$ thành phương pháp bậc 4: lần lượt trôi $c_k h$ và đẩy $d_k h$ ($k = 1, 2, 3$), rồi trôi $c_4 h$; ba lần tính lực mỗi bước. Cả hai bảo toàn chính xác một Hamilton biến dạng $\\tilde H = H + \\mathcal O(h^p)$, nên sai số năng lượng bị chặn; mỗi phép trôi và đẩy giữ nguyên $L_z$ (lực xuyên tâm từng cặp), nên $L_z$ được bảo toàn tới sai số làm tròn.',
        en: 'Drift – kick – drift (DKD) leapfrog is second order, time-reversible and symplectic, with one force evaluation per step. Yoshida (1990) composes three leapfrog substeps with coefficients $w_1, w_0$ into a fourth-order method: drift $c_k h$ and kick $d_k h$ ($k = 1, 2, 3$), then drift $c_4 h$; three force evaluations per step. Both exactly conserve a modified Hamiltonian $\\tilde H = H + \\mathcal O(h^p)$, so the energy error stays bounded; every drift and kick preserves $L_z$ (pairwise central forces), so $L_z$ is conserved to round-off.',
      },
    },
    {
      title: { vi: '3. RK4 và DOPRI5 (không symplectic)', en: '3. RK4 and DOPRI5 (non-symplectic)' },
      tex: [
        'y_{n+1}=y_n+\\tfrac h6\\,(k_1+2k_2+2k_3+k_4)',
        '\\mathrm{err}=\\sqrt{\\frac1n\\sum_i\\left(\\frac{\\hat y_i-y_i}{a_{\\rm tol}+r_{\\rm tol}\\max(|y_i|,|\\hat y_i|)}\\right)^2}\\le 1,\\qquad r_{\\rm tol}=10^{-12},\\ a_{\\rm tol}=10^{-14}',
      ],
      body: {
        vi: 'RK4 cổ điển là bậc 4, bốn lần tính lực mỗi bước, không symplectic nên năng lượng trôi dần theo thời gian; nó được đưa vào để so sánh. DOPRI5 (Dormand & Prince 1980) là cặp Runge–Kutta nhúng bậc 5(4): hiệu $\\hat y - y$ giữa hai nghiệm ước lượng sai số cục bộ, bước được chấp nhận khi $\\mathrm{err} \\le 1$ và được co giãn theo $0{,}9\\,\\mathrm{err}^{-1/5}$ (giới hạn trong [0,2; 5]). Với DOPRI5, $h$ trên thanh trượt chỉ là khoảng xuất kết quả; bước tích phân thật tự giảm trong các lần tiếp cận gần.',
        en: 'Classical RK4 is fourth order with four force evaluations per step; it is not symplectic, so energy drifts over time; it is included for comparison. DOPRI5 (Dormand & Prince 1980) is an embedded 5(4) Runge–Kutta pair: the difference $\\hat y - y$ estimates the local error, a step is accepted when $\\mathrm{err} \\le 1$, and the step is rescaled by $0.9\\,\\mathrm{err}^{-1/5}$ (clamped to [0.2, 5]). With DOPRI5 the slider $h$ is only the output interval; the actual integration step shrinks automatically during close encounters.',
      },
    },
  ],
  assumptions: {
    vi: [
      'Chất điểm, hấp dẫn Newton, không có va chạm vật lý, lực thuỷ triều hay hiệu ứng tương đối tính.',
      'Chuyển động phẳng; mọi vật có $z = v_z = 0$.',
      'Bước thời gian cố định với leapfrog, Yoshida và RK4; bước thích nghi với DOPRI5.',
      'Mặt Trời – Sao Mộc – Sao Thổ: tỉ số khối lượng IAU ($M_\\odot/M_J = 1047{,}348$, $M_\\odot/M_S = 3497{,}9$), quỹ đạo ban đầu tròn, đồng phẳng, hai hành tinh ở hai phía Mặt Trời - không phải lịch thiên văn.',
      'Cụm sao: thế Plummer $\\varepsilon = 0{,}08$ và điều kiện đầu ngẫu nhiên (hạt giống cố định).',
      'Vật thêm bằng chuột có khối lượng 0,3 (đơn vị không thứ nguyên) hoặc $3 \\times 10^{-4}\\,M_\\odot$ trong cảnh Mặt Trời – Sao Mộc – Sao Thổ.',
    ],
    en: [
      'Point masses, Newtonian gravity; no physical collisions, tides or relativistic effects.',
      'Planar motion; every body has $z = v_z = 0$.',
      'Fixed time step for leapfrog, Yoshida and RK4; adaptive step for DOPRI5.',
      'Sun – Jupiter – Saturn: IAU mass ratios ($M_\\odot/M_J = 1047.348$, $M_\\odot/M_S = 3497.9$), circular coplanar initial orbits with the planets on opposite sides - not an ephemeris.',
      'Cluster: Plummer $\\varepsilon = 0.08$ and random initial conditions (fixed seed).',
      'Bodies added with the mouse have mass 0.3 (dimensionless) or $3 \\times 10^{-4}\\,M_\\odot$ in the Sun – Jupiter – Saturn scene.',
    ],
  },
  validity: {
    vi: [
      'Bước cố định đáng tin khi $h$ nhỏ hơn nhiều thời gian tiếp cận gần nhất $\\sqrt{r_{\\min}^3/(G M)}$; khi điều kiện này bị vi phạm phải dùng DOPRI5.',
      'Số vật hợp lý cho tương tác thời gian thực: tới vài chục.',
    ],
    en: [
      'A fixed step is reliable when $h$ is much smaller than the closest-approach time $\\sqrt{r_{\\min}^3/(G M)}$; otherwise DOPRI5 must be used.',
      'A sensible number of bodies for real-time interaction: up to a few tens.',
    ],
  },
  scope: {
    vi: 'Miền áp dụng nêu trên là phạm vi thiết kế. Các kiểm định dưới đây nêu rõ cấu hình và bước thời gian thực sự đã đối chiếu.',
    en: 'The ranges above are the design scope. The validation below states the configurations and step sizes actually checked.',
  },
  validationText: {
    vi: `Báo cáo tái lập: \`npm run validate:nbody\` → \`docs/validation/B4-nbody.json\`. Ngưỡng được khoá trong \`packages/sim-core/test/nbody-b4.test.ts\`.

- **Bậc hội tụ thực nghiệm** (hình số 8, sai số vị trí tại $t = T/2$ so với nghiệm tham chiếu Yoshida với $h = T/64\\,000$; $h = T/500 \\to T/4000$): leapfrog **2,00**; Yoshida **4,00**; RK4 **4,01**. Ở $h = T/4000$ sai số lần lượt $1{,}1\\times10^{-5}$, $1{,}6\\times10^{-10}$, $3{,}5\\times10^{-11}$.
- **Hình số 8 sau một chu kỳ** ($h = T/6400$): Yoshida quay về vị trí đầu với sai lệch $4{,}1\\times10^{-8}$, $|\\Delta E/E| = 1{,}5\\times10^{-14}$; leapfrog sai lệch $4{,}9\\times10^{-6}$, $|\\Delta E/E| = 8{,}0\\times10^{-13}$.
- **Bảo toàn dài hạn** (Mặt Trời – Sao Mộc – Sao Thổ, 1 000 năm, $h = 0{,}02$ năm): sai số năng lượng lớn nhất trong 100 năm đầu và 100 năm cuối - leapfrog $6{,}9\\times10^{-8}$ và $7{,}4\\times10^{-8}$ (bị chặn); Yoshida $2{,}3\\times10^{-11}$ và $2{,}5\\times10^{-11}$ (bị chặn); RK4 $1{,}7\\times10^{-10}$ và $1{,}7\\times10^{-9}$ (tăng 10 lần, trôi thế kỷ).
- **Hai vật so với nghiệm Kepler** ($e = 0{,}5$, sau 10 chu kỳ, 2 000 bước/chu kỳ): sai lệch vị trí Yoshida $3{,}3\\times10^{-7}$, RK4 $5{,}2\\times10^{-8}$, leapfrog $2{,}4\\times10^{-3}$ (sai số pha bậc 2).
- **Bài toán Pythagoras** ($t \\in [0, 70]$): DOPRI5 giữ $|\\Delta E/E| \\le 3{,}9\\times10^{-9}$ và kết thúc với hệ đôi 4 + 5, vật 3 bị văng ra, khớp Szebehely & Peters (1967). Yoshida bước cố định $h = 5\\times10^{-4}$ và $1{,}25\\times10^{-4}$ cho sai số năng lượng vượt 1 000 lần $|E_0|$ - **nghiệm bước cố định không dùng được** cho cấu hình này.
- Mômen động lượng: leapfrog và Yoshida bảo toàn $L_z$ tới $10^{-14}$ (sai số làm tròn).`,
    en: `Reproducible report: \`npm run validate:nbody\` → \`docs/validation/B4-nbody.json\`. Thresholds are locked in \`packages/sim-core/test/nbody-b4.test.ts\`.

- **Empirical convergence order** (figure eight, position error at $t = T/2$ against a Yoshida reference with $h = T/64{,}000$; $h = T/500 \\to T/4000$): leapfrog **2.00**; Yoshida **4.00**; RK4 **4.01**. At $h = T/4000$ the errors are $1.1\\times10^{-5}$, $1.6\\times10^{-10}$, $3.5\\times10^{-11}$.
- **Figure eight after one period** ($h = T/6400$): Yoshida returns to its start within $4.1\\times10^{-8}$, $|\\Delta E/E| = 1.5\\times10^{-14}$; leapfrog within $4.9\\times10^{-6}$, $|\\Delta E/E| = 8.0\\times10^{-13}$.
- **Long-term conservation** (Sun – Jupiter – Saturn, 1,000 yr, $h = 0.02$ yr): maximum energy error in the first and last 100 yr - leapfrog $6.9\\times10^{-8}$ and $7.4\\times10^{-8}$ (bounded); Yoshida $2.3\\times10^{-11}$ and $2.5\\times10^{-11}$ (bounded); RK4 $1.7\\times10^{-10}$ and $1.7\\times10^{-9}$ (10× growth, secular drift).
- **Two bodies vs the Kepler solution** ($e = 0.5$, after 10 periods, 2,000 steps/period): position error Yoshida $3.3\\times10^{-7}$, RK4 $5.2\\times10^{-8}$, leapfrog $2.4\\times10^{-3}$ (second-order phase error).
- **Pythagorean problem** ($t \\in [0, 70]$): DOPRI5 keeps $|\\Delta E/E| \\le 3.9\\times10^{-9}$ and ends with the 4 + 5 binary and body 3 ejected, as found by Szebehely & Peters (1967). Fixed-step Yoshida with $h = 5\\times10^{-4}$ and $1.25\\times10^{-4}$ gives energy errors above 1,000 $|E_0|$ - **fixed-step solutions are unusable** for this configuration.
- Angular momentum: leapfrog and Yoshida conserve $L_z$ to $10^{-14}$ (round-off).`,
  },
  validation: { vi: [], en: [] },
  errors: { vi: [], en: [] },
  limitations: {
    vi: [
      'Chưa có chính quy hoá các cặp gần (Kustaanheimo–Stiefel, chuỗi Mikkola–Aarseth) hay bước riêng cho từng vật; DOPRI5 chậm khi có nhiều tiếp cận gần liên tiếp.',
      'Mô phỏng phẳng; không có va chạm vật lý, sáp nhập hay thoát khối lượng.',
      'Cấu hình Mặt Trời – Sao Mộc – Sao Thổ đơn giản hoá, không tái hiện cộng hưởng gần 5 : 2 hay vị trí thật của hai hành tinh.',
      'Cụm sao có làm mềm không mô tả tiến hoá động lực học thật của cụm sao cầu.',
    ],
    en: [
      'No regularisation of close pairs (Kustaanheimo–Stiefel, Mikkola–Aarseth chains) or individual time steps; DOPRI5 slows down during repeated close encounters.',
      'Planar only; no physical collisions, mergers or mass loss.',
      'The simplified Sun – Jupiter – Saturn set-up does not reproduce the near 5 : 2 resonance or the real planetary positions.',
      'The softened cluster does not describe the true dynamical evolution of globular clusters.',
    ],
  },
  references: [
    'Yoshida, H. (1990). Construction of higher order symplectic integrators. Phys. Lett. A 150, 262–268.',
    'Hairer, E., Lubich, C. & Wanner, G. (2006). Geometric Numerical Integration, 2nd ed. Springer.',
    'Dormand, J. R. & Prince, P. J. (1980). A family of embedded Runge–Kutta formulae. J. Comput. Appl. Math. 6, 19–26.',
    'Chenciner, A. & Montgomery, R. (2000). A remarkable periodic solution of the three-body problem in the case of equal masses. Ann. Math. 152, 881–901.',
    'Burrau, C. (1913). Numerische Berechnung eines Spezialfalles des Dreikörperproblems. Astron. Nachr. 195, 113.',
    'Szebehely, V. & Peters, C. F. (1967). Complete solution of a general problem of three bodies. AJ 72, 876.',
    'Holman, M. J. & Wiegert, P. A. (1999). Long-term stability of planets in binary systems. AJ 117, 621.',
    'Aarseth, S. J. (2003). Gravitational N-Body Simulations. Cambridge University Press.',
    'Bruns, H. (1887). Über die Integrale des Vielkörper-Problems. Acta Math. 11, 25–96.',
  ],
};
