import type { Lesson } from '../types';

export const lesson: Lesson = {
  objectives: {
    vi: ['Giải thích vì sao sao "lắc" quanh khối tâm và tạo dịch chuyển Doppler.', 'Tính biên độ vận tốc xuyên tâm K và độ sâu quá cảnh (R_p/R★)².', 'Đánh giá khả năng phát hiện khi có nhiễu: vì sao hành tinh giống Trái Đất khó tìm.'],
    en: ['Explain why a star wobbles about the barycentre and produces a Doppler shift.', 'Compute the RV semi-amplitude K and the transit depth (R_p/R★)².', 'Judge detectability with noise: why Earth analogues are hard to find.'],
  },
  durationMin: 40,
  prerequisites: { vi: 'B1 (Kepler); hiệu ứng Doppler.', en: 'B1 (Kepler); the Doppler effect.' },
  background: [
    { title: { vi: 'Phương pháp vận tốc xuyên tâm', en: 'The radial-velocity method' }, body: {
      vi: `Sao và hành tinh cùng quay quanh khối tâm. Vận tốc của sao dọc theo hướng nhìn làm phổ của nó dịch xanh/đỏ:
$$K = \\left(\\frac{2\\pi G}{P}\\right)^{1/3}\\frac{m_p\\sin i}{(M_\\star + m_p)^{2/3}}\\frac{1}{\\sqrt{1-e^2}}.$$
Sao Mộc làm Mặt Trời dao động với K ≈ 12,5 m/s; Trái Đất chỉ ≈ 0,09 m/s - nhỏ hơn tốc độ đi bộ chậm! Phương pháp chỉ đo được $m_p\\sin i$.`,
      en: `Star and planet both orbit the barycentre. The star’s line-of-sight velocity shifts its spectrum blue/red:
$$K = \\left(\\frac{2\\pi G}{P}\\right)^{1/3}\\frac{m_p\\sin i}{(M_\\star + m_p)^{2/3}}\\frac{1}{\\sqrt{1-e^2}}.$$
Jupiter makes the Sun wobble with K ≈ 12.5 m/s; Earth only ≈ 0.09 m/s - slower than a slow walk! The method measures only $m_p\\sin i$.` } },
    { title: { vi: 'Phương pháp quá cảnh', en: 'The transit method' }, body: {
      vi: `Nếu quỹ đạo gần như nằm ngang tầm nhìn (tham số va chạm $b = a\\cos i/R_\\star < 1$), hành tinh che một phần sao, làm độ sáng giảm khoảng
$$\\delta \\approx (R_p/R_\\star)^2.$$
Sao Mộc: ~1%; Trái Đất: ~84 ppm. Đáy đường cong bị **cong** do **tối rìa**: tâm đĩa sao sáng hơn mép. Kết hợp hai phương pháp cho cả khối lượng và bán kính ⇒ **mật độ** hành tinh.`,
      en: `If the orbit is nearly edge-on (impact parameter $b = a\\cos i/R_\\star < 1$), the planet blocks part of the star, dimming it by about
$$\\delta \\approx (R_p/R_\\star)^2.$$
Jupiter: ~1%; Earth: ~84 ppm. The bottom of the curve is **rounded** by **limb darkening**: the disk centre is brighter than the edge. Combining both methods gives mass and radius ⇒ the planet’s **density**.` } },
  ],
  activities: [
    { title: { vi: 'Sao Mộc nóng', en: 'A hot Jupiter' }, text: { vi: 'Chọn 51 Pegasi b: K ≈ 56 m/s, dễ phát hiện. Nó có quá cảnh không? Đọc tham số va chạm b.', en: 'Pick 51 Pegasi b: K ≈ 56 m/s, easy to detect. Does it transit? Read the impact parameter b.' }, params: { preset: 'peg51' } },
    { title: { vi: 'Tìm Trái Đất thứ hai', en: 'Finding Earth 2.0' }, text: { vi: 'Chọn Trái Đất quanh Mặt Trời và đặt nhiễu RV = 1 m/s (máy quang phổ tốt). Tín hiệu có nổi lên khỏi nhiễu không? Còn quá cảnh với nhiễu 20 ppm?', en: 'Pick Earth around the Sun with RV noise 1 m/s (a good spectrograph). Does the signal rise above the noise? And the transit at 20 ppm?' }, params: { preset: 'earth', srv: 1, sph: 20 } },
    { title: { vi: 'Sao lùn đỏ giúp ích', en: 'Red dwarfs help' }, text: { vi: 'Chọn TRAPPIST-1 e: hành tinh cỡ Trái Đất nhưng độ sâu quá cảnh ~0,5%. Vì sao?', en: 'Pick TRAPPIST-1 e: Earth-sized, yet the transit is ~0.5% deep. Why?' }, params: { preset: 'trappist1e' } },
    { title: { vi: 'Quỹ đạo lệch tâm', en: 'An eccentric orbit' }, text: { vi: 'Đặt e = 0,5. So sánh ω = 90° (quá cảnh ở cận điểm) với ω = 270° (quá cảnh ở viễn điểm): T₁₄ và tham số va chạm thay đổi thế nào? Đường RV còn là hình sin không? Lưu ý trục thời gian tuyến tính theo dị thường trung bình.', en: 'Set e = 0.5. Compare ω = 90° (transit at periastron) with ω = 270° (transit at apastron): how do T₁₄ and the impact parameter change? Is the RV curve still a sine? Note the time axis is linear in the mean anomaly.' }, params: { preset: 'hd209458', e: 0.5, w: 270 } },
  ],
  quiz: [
    { q: { vi: 'Hành tinh bán kính gấp đôi sẽ cho độ sâu quá cảnh:', en: 'Doubling the planet radius makes the transit depth:' }, options: [{ vi: '×2', en: '×2' }, { vi: '×4', en: '×4' }, { vi: '×8', en: '×8' }], answer: 1, explain: { vi: 'δ ∝ R_p².', en: 'δ ∝ R_p².' } },
    { q: { vi: 'Phương pháp vận tốc xuyên tâm đo trực tiếp:', en: 'The radial-velocity method directly measures:' }, options: [{ vi: 'Bán kính hành tinh', en: 'Planet radius' }, { vi: 'm_p sin i', en: 'm_p sin i' }, { vi: 'Nhiệt độ hành tinh', en: 'Planet temperature' }], answer: 1, explain: { vi: 'Chỉ thành phần vận tốc dọc hướng nhìn đo được, nên khối lượng nhân sin i.', en: 'Only the line-of-sight component is measured, so mass times sin i.' } },
  ],
};
