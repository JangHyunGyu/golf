// golf SEO 생성기 — KO/EN/JA SEO landing pages
const fs = require('fs'); const path = require('path');
const SITE = 'https://golf.archerlab.dev'; const OUT = __dirname; const LASTMOD = '2026-07-24';
const HOME = { ko: '/', en: '/index-en', jp: '/index-jp' };
const ANALYZE = { ko: '/analysis', en: '/analysis-en', jp: '/analysis-jp' };
const OG_LOCALE = { ko: 'ko_KR', en: 'en_US', jp: 'ja_JP' };
const SITE_NAME = { ko: '골프 스윙 마스터', en: 'Golf Swing Master', jp: 'ゴルフスイングマスター' };
const PRICE_CURRENCY = { ko: 'KRW', en: 'USD', jp: 'JPY' };
const pageUrl = slug => `${SITE}/seo/${slug}`;
const pagePath = slug => `/seo/${slug}`;

const C = {
  ko: {
    htmlLang:'ko',
    why_title:'왜 골프 스윙 마스터인가',
    why:['앱 설치·회원가입 0 — 영상만 올리면 끝','AI가 자세·템포·임팩트를 프레임 단위로 분석','드라이버 슬라이스·뒤땅 등 흔한 미스 자동 진단','100% 무료 — 결제 없이 모든 기능 이용'],
    how_title:'30초 사용법',
    how:['[지금 분석하기] 클릭','스마트폰으로 찍은 스윙 영상 업로드(측면 권장)','AI 피드백 + 개선 드릴 확인'],
    faq_title:'자주 묻는 질문',
    faqs:[
      ['정말 무료인가요?','네. 회원가입·결제·앱 설치 없이 모든 분석 기능을 무제한으로 사용할 수 있습니다.'],
      ['어떤 영상을 올려야 하나요?','드라이버나 아이언 풀스윙을 측면(P-side)에서 5초 이상 찍은 영상이면 충분합니다. 해상도는 720p 이상 권장.'],
      ['프로 레슨과 비교하면 어느 정도인가요?','템포·자세 같은 정량 분석은 거의 동일 수준입니다. 다만 코스 매니지먼트나 멘탈 코칭 같은 영역은 사람 코치가 필요합니다.'],
      ['영상이 외부로 공유되나요?','업로드 영상은 분석 직후 자동 폐기되며 서버에 저장되지 않습니다.']
    ],
    picks_title:'추천 시작 코스',
    main_name:'AI 스윙 분석',
    main_desc:'영상 업로드 → 자세·템포·임팩트 자동 분석 → 즉시 피드백. 드라이버·아이언 모두 지원.',
    sec_name:'슬라이스 교정 가이드',
    sec_label:'무료',
    sec_desc:'AI가 진단한 슬라이스 원인에 맞춰 셋업·스윙 패스·페이스 컨트롤 드릴을 안내합니다.',
    cta:'지금 무료로 분석 →',
    other_langs_label:'다른 언어',
    footer:'© golf.archerlab.dev — 무료 AI 골프 스윙 분석'
  },
  en: {
    htmlLang:'en',
    why_title:'Why Golf Swing Master',
    why:['No app, no signup — just upload a video','AI analyzes posture, tempo, and impact frame-by-frame','Auto-detects common faults (slice, fat, thin)','100% free — every feature unlocked, no paywall'],
    how_title:'How to use in 30 seconds',
    how:['Click [Analyze Now]','Upload a side-view swing clip from your phone','Get AI feedback + improvement drills'],
    faq_title:'Frequently asked questions',
    faqs:[
      ['Is it really free?','Yes. No signup, no payment, no app install — every analysis feature is unlimited.'],
      ['What kind of video should I upload?','A 5+ second side-view (P-side) clip of a full driver or iron swing works best. 720p or higher recommended.'],
      ['How does this compare to a pro lesson?','Quantitative analysis (tempo, posture, plane) is roughly on par with a pro. Course management and mental coaching still need a human coach.'],
      ['Is my video shared anywhere?','Uploaded clips are discarded right after analysis and not stored on the server.']
    ],
    picks_title:'Where to start',
    main_name:'AI Swing Analyzer',
    main_desc:'Upload a clip → instant analysis of posture, tempo, and impact. Works for both driver and iron.',
    sec_name:'Slice Correction Guide',
    sec_label:'Free',
    sec_desc:'Setup, swing-path, and face-control drills tailored to the cause the AI diagnosed.',
    cta:'Analyze Free Now →',
    other_langs_label:'Other languages',
    footer:'© golf.archerlab.dev — free AI golf swing analyzer'
  },
  jp: {
    htmlLang:'ja',
    why_title:'なぜGolf Swing Masterか',
    why:['アプリ不要・会員登録不要 — 動画をアップするだけ','AIが姿勢・テンポ・インパクトをフレーム単位で解析','スライス・ダフリなどの典型ミスを自動診断','完全無料 — 課金なしで全機能を使い放題'],
    how_title:'30秒で使う方法',
    how:['[今すぐ解析]をクリック','スマホで撮ったスイング動画(横アングル推奨)をアップロード','AIフィードバックと改善ドリルを確認'],
    faq_title:'よくある質問',
    faqs:[
      ['本当に無料ですか?','はい。会員登録・課金・アプリインストールすべて不要で、全機能を無制限に使えます。'],
      ['どんな動画をアップすればいいですか?','ドライバーまたはアイアンのフルスイングを横(P-side)から5秒以上撮影した動画が最適です。720p以上推奨。'],
      ['プロレッスンと比べてどうですか?','テンポ・姿勢などの定量解析はプロとほぼ同等です。コースマネジメントやメンタル面は人のコーチが必要です。'],
      ['アップロードした動画はどこかに共有されますか?','解析直後に自動破棄され、サーバーには保存されません。']
    ],
    picks_title:'おすすめスタート',
    main_name:'AIスイング解析',
    main_desc:'動画をアップロード → 姿勢・テンポ・インパクトを即座に解析。ドライバーもアイアンも対応。',
    sec_name:'スライス矯正ガイド',
    sec_label:'無料',
    sec_desc:'AIが診断したスライスの原因に合わせて、セットアップ・スイングパス・フェース制御のドリルを案内します。',
    cta:'今すぐ無料で解析 →',
    other_langs_label:'他の言語',
    footer:'© golf.archerlab.dev — 無料AIゴルフスイング解析'
  }
};

const PAGES = {
  ko: [
    { group:'analysis', slug:'golf-swing-bunseok-muryo', h1:'골프 스윙 분석 무료 — 영상만 올리면 AI가 진단', title:'골프 스윙 분석 무료 | 앱 설치 없이 AI 코칭 2026', meta:'결제·앱 없이 영상만 올리면 AI가 자세·템포·임팩트를 분석. 드라이버·아이언 모두 지원하는 100% 무료 골프 스윙 분석.', intro:'"골프 스윙 분석 무료"를 검색하면 대부분 앱 설치·회원가입·유료 결제로 이어집니다. 여기는 다릅니다 — 브라우저에서 영상만 올리면 AI가 즉시 진단합니다.' },
    { group:'self-study', slug:'golf-dokak', h1:'골프 독학 — AI 코칭으로 혼자 시작하기', title:'골프 독학 가이드 | AI 스윙 분석으로 혼자 배우기 2026', meta:'레슨비 없이 시작하는 골프 독학 루트. 영상 촬영 → AI 분석 → 드릴 반복으로 입문 1개월 만에 자세 잡기.', intro:'골프 독학의 가장 큰 함정은 "내가 잘하고 있는지 알 수 없다"는 점입니다. AI 스윙 분석은 그 피드백 루프를 1분으로 줄여줍니다.' },
    { group:'slice', slug:'driver-slice-gyojung', h1:'드라이버 슬라이스 교정 — 원인부터 드릴까지', title:'드라이버 슬라이스 교정 | AI가 진단해주는 원인과 드릴', meta:'드라이버 슬라이스의 진짜 원인은 셋업·스윙 패스·페이스 컨트롤 셋 중 하나. AI가 영상에서 어느 쪽인지 짚어주고 드릴까지 안내합니다.', intro:'"드라이버 슬라이스 교정"으로 영상 100개를 봐도 잘 안 고쳐지는 이유는, 내 스윙의 진짜 원인이 어디인지 모르기 때문입니다. AI가 그걸 1분 만에 짚어줍니다.' }
  ],
  en: [
    {
      group:'analysis',
      slug:'free-golf-swing-analysis',
      h1:'Free Golf Swing Analysis — AI Video Feedback Online',
      title:'Free Golf Swing Analysis Online | AI Video Feedback',
      meta:'Get free online golf swing analysis from a driver or iron video. AI reviews posture, tempo, and impact in your browser — no app, signup, or payment.',
      intro:'Looking for free golf swing analysis software or an app? Golf Swing Master works directly in your browser: upload a driver or iron clip and get AI feedback on posture, tempo, and impact.',
      aliases:['Free Golf Swing Analyser','Free Golf Swing Analysis Software','AI Golf Swing Analysis'],
      faqs:[
        ['Is this golf swing analysis software free?','Yes. Golf Swing Master is browser-based and costs nothing to use. You do not need to install software, create an account, or enter payment details.'],
        ['Do I need a golf swing analyzer app?','No. The analyzer runs online in a modern browser on your phone or computer, so you can upload a recorded swing without installing an app.']
      ]
    },
    {
      group:'online-analyzer',
      slug:'golf-swing-analyzer-online',
      h1:'Free Golf Swing Analyzer Online — No App Required',
      title:'Free Golf Swing Analyzer Online | No App Required',
      meta:'Use a free golf swing analyzer online without installing software. Upload a swing video for AI analysis of posture, tempo, impact, and common faults.',
      intro:'This online golf swing analyzer — also called a swing analyser — runs in your browser. Upload a common video format and get an AI breakdown without installing software or creating an account.',
      aliases:['Free Golf Swing Analyzer','Online Swing Analyser','Golf Swing Analysis Software'],
      faqs:[
        ['What should I look for in a free golf swing analyzer?','A useful analyzer should accept ordinary phone video, explain the feedback clearly, and cover measurable areas such as posture, tempo, and impact without hiding the result behind a paywall.'],
        ['Can I use this as an online swing analyser?','Yes. Analyzer and analyser are US and UK spellings for the same tool. Golf Swing Master works online in either case and supports driver and iron swing videos.']
      ]
    },
    { group:'slice', slug:'fix-driver-slice', h1:'Fix Your Driver Slice — From Root Cause to Drills', title:'Fix Driver Slice | AI Diagnosis + Drills 2026', meta:'A slice almost always comes from setup, swing path, or face control. The AI tells you which one from your video and gives you targeted drills.', intro:'You can watch 100 "fix your slice" videos and still slice. The reason: you don\'t know which root cause is yours. AI swing analysis pinpoints it in under a minute.' }
  ],
  jp: [
    {
      group:'analysis',
      slug:'golf-swing-shindan-muryo',
      h1:'ゴルフスイング診断 無料 — 動画でAI分析',
      title:'ゴルフスイング診断 無料 | 動画でAIスイング分析',
      meta:'ゴルフスイング診断を無料で。動画をアップロードするとAIが姿勢・テンポ・インパクトを分析し、スライスなどの改善ポイントを案内します。',
      intro:'「ゴルフ スイング 診断」「ゴルフスイング診断」「スイング 診断」を探している方向けの無料AI診断です。アプリを入れず、ブラウザで動画をアップロードするだけでスイングの傾向を確認できます。',
      aliases:['ゴルフ スイング 診断','スイング 診断','ゴルフ 無料診断'],
      faqs:[
        ['ゴルフ診断・スイング診断では何が分かりますか？','動画から姿勢、テンポ、インパクト、スイングプレーンなどを確認し、改善が必要なポイントと練習ドリルを案内します。'],
        ['ゴルフスイング診断にアプリは必要ですか？','いいえ。スマートフォンやパソコンのブラウザから利用できるため、アプリのインストールは不要です。']
      ]
    },
    {
      group:'online-analyzer',
      slug:'golf-swing-app-muryo',
      h1:'ゴルフスイング分析 無料 — アプリ不要のAI診断',
      title:'ゴルフスイング分析 無料 | AI診断・アプリ不要',
      meta:'ゴルフスイング分析を無料で。アプリや会員登録なしで動画をアップロードし、AIによる姿勢・テンポ・インパクトの分析結果を確認できます。',
      intro:'「ゴルフスイング分析」「スイング分析」を無料で試したい方向けのブラウザツールです。動画をアップロードするだけで、AIが姿勢・テンポ・インパクトを分析します。',
      aliases:['ゴルフ スイング 分析','スイング分析','無料ゴルフスイング解析'],
      faqs:[
        ['無料のゴルフスイング分析では何を確認できますか？','姿勢、テンポ、インパクト、スイングプレーンなどを動画から分析し、改善ポイントを確認できます。ドライバーとアイアンに対応しています。'],
        ['スイング分析に会員登録やアプリは必要ですか？','いいえ。ブラウザで動画を選ぶだけで利用でき、会員登録、アプリのインストール、支払いは不要です。']
      ]
    },
    { group:'self-study', slug:'golf-dokugaku', h1:'ゴルフ 独学 — AI解析で一人でも上達できる', title:'ゴルフ 独学 ガイド | AIスイング解析で一人で上達 2026', meta:'レッスン費なしで始めるゴルフ独学ルート。動画撮影→AI解析→ドリル反復で1ヶ月でフォームを整える。', intro:'ゴルフ独学の最大の落とし穴は「自分が正しく出来ているかわからない」こと。AIスイング解析はそのフィードバックループを1分に短縮します。' },
    { group:'slice', slug:'driver-slice-naoshikata', h1:'ドライバー スライス 直し方 — 原因からドリルまで', title:'ドライバー スライス 直し方 | AIが原因を診断 2026', meta:'ドライバースライスの本当の原因はセットアップ・スイングパス・フェース制御の3つのいずれか。AIが動画から特定し、ドリルも提案。', intro:'「ドライバー スライス 直し方」の動画を100本見ても直らない理由は、自分のスイングの本当の原因がどれか分からないから。AIなら1分で特定できます。' }
  ]
};

const CSS = `*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,"Noto Sans KR","Noto Sans JP",sans-serif;line-height:1.65;color:#1a2a1a;background:linear-gradient(180deg,#f1f8e9 0%,#fff 40%);min-height:100vh}.wrap{max-width:760px;margin:0 auto;padding:32px 20px 80px}header{text-align:center;padding:24px 0 8px}h1{font-size:28px;line-height:1.3;margin-bottom:16px;color:#2e7d32}h2{font-size:20px;margin:36px 0 12px;color:#1b5e20;border-bottom:2px solid #c8e6c9;padding-bottom:6px}p{margin-bottom:14px}ul{margin:12px 0 18px 22px}li{margin-bottom:8px}.intro{font-size:17px;color:#444;background:#fff;border-left:4px solid #43a047;padding:14px 18px;border-radius:6px;margin:18px 0 8px}.cta-box{text-align:center;margin:36px 0;padding:28px 20px;background:linear-gradient(135deg,#43a047,#1b5e20);border-radius:14px;box-shadow:0 8px 24px rgba(67,160,71,.25)}.cta{display:inline-block;background:#fff;color:#1b5e20;font-weight:700;font-size:18px;padding:14px 32px;border-radius:50px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,.12)}.cta:hover{transform:translateY(-2px)}.pick{display:block;color:inherit;text-decoration:none;background:#fff;border:1px solid #c8e6c9;border-radius:10px;padding:16px 18px;margin-bottom:14px}.pick h3{font-size:17px;color:#1b5e20;margin-bottom:6px}.pick .badge{display:inline-block;background:#c8e6c9;color:#1b5e20;font-size:12px;padding:2px 8px;border-radius:10px;margin-left:6px;vertical-align:middle}.pick p{font-size:14px;color:#555;margin:0}.faq{margin-bottom:14px}.faq summary{cursor:pointer;font-weight:600;padding:10px 0;color:#444}.faq p{padding:6px 0 4px;color:#555;font-size:15px}footer{margin-top:48px;padding-top:20px;border-top:1px solid #c8e6c9;text-align:center;font-size:13px;color:#888}.langs{margin-top:14px;font-size:13px}.langs a{color:#2e7d32;margin:0 6px;text-decoration:none}@media(max-width:520px){h1{font-size:23px}h2{font-size:18px}.intro{font-size:15px}.cta{font-size:16px;padding:12px 26px}}`;

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const hreflangFor = lang => lang === 'jp' ? 'ja' : lang;
const alternatesFor = page => Object.keys(PAGES)
  .map(lang => ({ lang, page: PAGES[lang].find(candidate => candidate.group === page.group) }))
  .filter(item => item.page);

function render(lang, page) {
  const c = C[lang]; const url = pageUrl(page.slug); const analyze = ANALYZE[lang];
  const alternates = alternatesFor(page);
  const pageFaqs = [...(page.faqs || []), ...c.faqs];
  const analysisPage = PAGES[lang].find(candidate => candidate.group === 'analysis');
  const slicePage = PAGES[lang].find(candidate => candidate.group === 'slice');
  const mainHref = analysisPage && analysisPage.slug !== page.slug ? pagePath(analysisPage.slug) : analyze;
  const sliceHref = slicePage ? pagePath(slicePage.slug) : analyze;
  const defaultAlternate = alternates.find(item => item.lang === 'en') || alternates[0];
  const altLinks = alternates.map(item => `<link rel="alternate" hreflang="${hreflangFor(item.lang)}" href="${pageUrl(item.page.slug)}">`).join('\n  ') + `\n  <link rel="alternate" hreflang="x-default" href="${pageUrl(defaultAlternate.page.slug)}">`;
  const otherLangs = Object.keys(PAGES).filter(otherLang => otherLang !== lang).map(otherLang => {
    const counterpart = PAGES[otherLang].find(candidate => candidate.group === page.group);
    const href = counterpart ? pagePath(counterpart.slug) : HOME[otherLang];
    const languageHint = counterpart ? ` hreflang="${hreflangFor(otherLang)}"` : '';
    return `<a href="${href}"${languageHint}>${hreflangFor(otherLang).toUpperCase()}</a>`;
  }).join(' · ');
  const structuredData = {
    "@context":"https://schema.org",
    "@graph":[
      {
        "@type":"WebSite",
        "@id":`${SITE}/#website`,
        "url":`${SITE}/`,
        "name":SITE_NAME[lang],
        "inLanguage":c.htmlLang
      },
      {
        "@type":"WebPage",
        "@id":`${url}#webpage`,
        "url":url,
        "name":page.title,
        "description":page.meta,
        "inLanguage":c.htmlLang,
        "dateModified":LASTMOD,
        "isPartOf":{"@id":`${SITE}/#website`},
        "mainEntity":{"@id":`${SITE}/#app-${c.htmlLang}`}
      },
      {
        "@type":"WebApplication",
        "@id":`${SITE}/#app-${c.htmlLang}`,
        "name":c.main_name,
        "alternateName":page.aliases || [SITE_NAME[lang]],
        "url":`${SITE}${analyze}`,
        "description":page.meta,
        "image":`${SITE}/assets/images/kakao_golf.png`,
        "applicationCategory":"SportsApplication",
        "operatingSystem":"Web Browser",
        "browserRequirements":"Requires JavaScript and HTML5 video upload support.",
        "inLanguage":c.htmlLang,
        "isAccessibleForFree":true,
        "featureList":c.why,
        "offers":{"@type":"Offer","price":"0","priceCurrency":PRICE_CURRENCY[lang]}
      },
      {
        "@type":"FAQPage",
        "@id":`${url}#faq`,
        "url":url,
        "name":page.title,
        "description":page.meta,
        "inLanguage":c.htmlLang,
        "mainEntity":pageFaqs.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))
      }
    ]
  };
  return `<!DOCTYPE html>
<html lang="${c.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="/assets/js/ga.js?v=1.0.2" defer></script>
  <script src="/assets/js/ga-engagement.js?v=20260618-engagement" defer></script>
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.meta)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${url}">
  <link rel="sitemap" type="application/xml" href="${SITE}/sitemap.xml">
  ${altLinks}
  <meta property="og:locale" content="${OG_LOCALE[lang]}">
  <meta property="og:site_name" content="${esc(SITE_NAME[lang])}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.meta)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE}/assets/images/kakao_golf.png">
  <meta property="og:image:alt" content="${esc(SITE_NAME[lang])}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.meta)}">
  <meta name="twitter:image" content="${SITE}/assets/images/kakao_golf.png">
  <link rel="icon" href="/favicon.png">
  <style>${CSS}</style>
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body><div class="wrap">
  <header><h1>${esc(page.h1)}</h1></header>
  <p class="intro">${esc(page.intro)}</p>
  <div class="cta-box"><a class="cta" href="${analyze}">${esc(c.cta)}</a></div>
  <h2>${esc(c.why_title)}</h2>
  <ul>${c.why.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>
  <h2>${esc(c.picks_title)}</h2>
  <a class="pick" href="${mainHref}"><h3>${esc(c.main_name)}</h3><p>${esc(c.main_desc)}</p></a>
  <a class="pick" href="${sliceHref}"><h3>${esc(c.sec_name)} <span class="badge">${esc(c.sec_label)}</span></h3><p>${esc(c.sec_desc)}</p></a>
  <h2>${esc(c.how_title)}</h2>
  <ul>${c.how.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>
  <div class="cta-box"><a class="cta" href="${analyze}">${esc(c.cta)}</a></div>
  <h2>${esc(c.faq_title)}</h2>
  ${pageFaqs.map(([q,a])=>`<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
  <footer><div>${esc(c.footer)}</div><div class="langs"><span>${esc(c.other_langs_label)}:</span> ${otherLangs}</div></footer>
</div></body></html>`;
}

let n = 0; const all = [];
for (const lang of Object.keys(PAGES)) for (const p of PAGES[lang]) {
  fs.writeFileSync(path.join(OUT, `${p.slug}.html`), render(lang, p), 'utf8');
  all.push({ lang, slug: p.slug, group: p.group }); n++;
}
console.log(`✓ ${n} pages generated`);

const frag = all.map(u => {
  const page = PAGES[u.lang].find(candidate => candidate.slug === u.slug);
  const alternates = alternatesFor(page);
  const defaultAlternate = alternates.find(item => item.lang === 'en') || alternates[0];
  const alts = '\n' + alternates.map(item => `    <xhtml:link rel="alternate" hreflang="${hreflangFor(item.lang)}" href="${pageUrl(item.page.slug)}"/>`).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(defaultAlternate.page.slug)}"/>`;
  const priority = ['free-golf-swing-analysis','golf-swing-analyzer-online','golf-swing-shindan-muryo','golf-swing-app-muryo'].includes(u.slug) ? '0.8' : '0.7';
  return `  <url><loc>${pageUrl(u.slug)}</loc>\n    <lastmod>${LASTMOD}</lastmod>${alts}\n    <changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
}).join('\n');
fs.writeFileSync(path.join(OUT, '_sitemap_fragment.xml'), frag, 'utf8');
console.log(`✓ sitemap fragment written`);

const sitemapPath = path.join(OUT, '..', 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/golf\.archerlab\.dev\/seo\/[\s\S]*?<\/url>/g, '');
  sitemap = sitemap.replace(/\s*<\/urlset>\s*$/m, `\n${frag}\n</urlset>\n`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log('✓ root sitemap updated');
}
