(function initializeConstants(root) {
  const REGION_ORDER = {
    ko: [
      "서울",
      "부산",
      "대구",
      "인천",
      "광주",
      "대전",
      "울산",
      "세종",
      "경기",
      "강원",
      "충북",
      "충남",
      "전북",
      "전남",
      "경북",
      "경남",
      "제주"
    ],
    en: [
      "Seoul",
      "Busan",
      "Daegu",
      "Incheon",
      "Gwangju",
      "Daejeon",
      "Ulsan",
      "Sejong",
      "Gyeonggi-do",
      "Gangwon-do",
      "Chungcheongbuk-do",
      "Chungcheongnam-do",
      "Jeollabuk-do",
      "Jeollanam-do",
      "Gyeongsangbuk-do",
      "Gyeongsangnam-do",
      "Jeju-do"
    ],
    es: [
      "Seúl",
      "Busán",
      "Daegu",
      "Incheon",
      "Gwangju",
      "Daejeon",
      "Ulsan",
      "Sejong",
      "Gyeonggi-do",
      "Gangwon-do",
      "Chungcheongbuk-do",
      "Chungcheongnam-do",
      "Jeolla-do",
      "Gyeongsangbuk-do",
      "Gyeongsangnam-do",
      "Jeju-do"
    ]
  };

  if (root) {
    root.REGION_ORDER = REGION_ORDER;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { REGION_ORDER };
  }
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
