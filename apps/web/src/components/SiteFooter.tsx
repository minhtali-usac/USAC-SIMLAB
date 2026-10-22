import { useT } from '../i18n';

export const CLUB_EMAIL = 'clb.usac@gmail.com';
export const CLUB_FANPAGE = 'https://www.facebook.com/clbusac';
export const SOURCE_URL = 'https://github.com/minhtali-usac/USAC-SIMLAB';

/** Site-wide footer (home and about pages). */
export function SiteFooter() {
  const { tx } = useT();
  return (
    <footer className="footer site-footer">
      <div className="footer-title">{tx({ vi: 'CLB THIÊN VĂN USAC - LAN TỎA THIÊN VĂN ĐẾN CỘNG ĐỒNG', en: 'USAC ASTRONOMY CLUB - BRINGING ASTRONOMY TO THE COMMUNITY' })}</div>
      <div>
        {tx({ vi: 'Mọi sự góp ý và liên hệ xin gửi về email: ', en: 'For feedback and contact, please email: ' })}
        <a href={`mailto:${CLUB_EMAIL}`}>{CLUB_EMAIL}</a>
      </div>
      <div>
        {tx({ vi: 'Fanpage CLB Thiên văn USAC: ', en: 'USAC Astronomy Club fanpage: ' })}
        <a href={CLUB_FANPAGE} target="_blank" rel="noopener">{CLUB_FANPAGE}</a>
      </div>
    </footer>
  );
}
