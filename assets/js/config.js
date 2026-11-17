/* =========================================================
   config.js — 사이트 설정값 (코드 수정 없이 여기만 바꾸면 됩니다)
   =========================================================

   [견적 문의 메일 받기 설정]
   1) https://web3forms.com 접속
   2) "Create your Access Key" 에 문의를 받을 네이버 메일 주소 입력 (예: yourid@naver.com)
   3) 네이버 메일함으로 온 Access Key 를 복사
   4) 아래 WEB3FORMS_ACCESS_KEY 값에 붙여넣기 → 저장 → 푸시

   * Access Key 는 공개되어도 메일 주소가 노출되지 않는 공개용 키입니다.
   * 메일 주소를 바꾸고 싶으면 새 이메일로 키를 다시 발급받아 교체하세요.
*/
window.SITE_CONFIG = {
  WEB3FORMS_ACCESS_KEY: 'YOUR_ACCESS_KEY_HERE',

  // 받는 메일의 제목 / 보낸 사람 이름
  MAIL_SUBJECT: '[거성스폰지 홈페이지] 새로운 견적 문의가 도착했습니다',
  FROM_NAME: '거성스폰지 홈페이지',

  // 메인 슬라이드 자동 전환 시간 (ms)
  HERO_INTERVAL: 6000
};
