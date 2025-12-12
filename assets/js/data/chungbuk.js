var CHUNGBUK_VENUES = [
  {
    id: "chungbuk-salsalove",
    name: { ko: "청주살사사랑", en: "Cheongju Salsa Love", es: "Cheongju Salsa Love" },
    region: { ko: "충북", en: "Chungbuk", es: "Chungbuk" },
    city: { ko: "충북 청주시 서원구", en: "Seowon-gu, Cheongju-si", es: "Seowon-gu, Cheongju-si" },
    address: {
      ko: "충북 청주시 서원구 사창동 531 리코빠",
      en: "Rico Bar, 531 Sachang-dong, Seowon-gu, Cheongju-si, Chungbuk",
      es: "Rico Bar, 531 Sachang-dong, Seowon-gu, Cheongju-si, Chungbuk"
    },
    styles: ["salsa", "bachata"],
    summary: {
      ko: "왕초보를 대상으로 무료 강습을 진행하며, 살사와 바차타를 통해 다이어트와 친목 도모를 동시에 추구하는 동호회입니다.",
      en: "A club offering free lessons for absolute beginners, pursuing both diet and socializing through salsa and bachata.",
      es: "Un club que ofrece lecciones gratuitas para principiantes absolutos, buscando tanto la dieta como la socialización a través de la salsa y la bachata."
    },
    image: "assets/images/cj_salsa_love.png",
    imageAlt: {
      ko: "청주살사사랑 로고",
      en: "Cheongju Salsa Love logo",
      es: "Logotipo de Cheongju Salsa Love"
    },
    links: [
      { type: "instagram", url: "https://www.instagram.com/cjsalsalove/" },
      { type: "website", url: "https://www.daangn.com/kr/group/%EC%B2%AD%EC%A3%BC%EC%82%B4%EC%82%AC%EC%82%AC%EB%9E%91-942nd1iy5ece/?in=%EB%8F%99%EC%9D%B8%EB%8F%99-677" },
      {
        type: "phone",
        url: "tel:010-2382-5100",
        label: {
          ko: "버니",
          en: "Bunny",
          es: "Bunny"
        }
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.CHUNGBUK_VENUES = CHUNGBUK_VENUES;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CHUNGBUK_VENUES;
}
