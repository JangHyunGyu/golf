const fs = require('fs');
const path = require('path');

const SITE = 'https://golf.archerlab.dev';
const OUT = __dirname;
const LASTMOD = '2026-07-30';

const LANGUAGE = {
  ko: {
    htmlLang: 'ko',
    hreflang: 'ko',
    locale: 'ko_KR',
    siteName: '골프 스윙 마스터',
    appName: 'AI 골프 스윙 분석',
    analysisPath: '/analysis',
    analysisLabel: '내 스윙 무료로 분석하기',
    homeLabel: '골프 스윙 마스터',
    relatedLabel: '함께 읽기',
    languageLabel: '다른 언어',
    privacyPath: '/privacy',
    privacyLabel: '개인정보 처리 안내',
    termsPath: '/terms',
    termsLabel: '이용약관',
    footer: '골프 스윙을 촬영하고, 한 가지씩 점검해 보세요.',
    freeLabel: '무료',
  },
  en: {
    htmlLang: 'en',
    hreflang: 'en',
    locale: 'en_US',
    siteName: 'Golf Swing Master',
    appName: 'AI Golf Swing Analyzer',
    analysisPath: '/analysis-en',
    analysisLabel: 'Analyze My Swing Free',
    homeLabel: 'Golf Swing Master',
    relatedLabel: 'Related guide',
    languageLabel: 'Other languages',
    privacyPath: '/privacy-en',
    privacyLabel: 'Privacy',
    termsPath: '/terms-en',
    termsLabel: 'Terms',
    footer: 'Record a repeatable swing, then work on one variable at a time.',
    freeLabel: 'Free',
  },
  ja: {
    htmlLang: 'ja',
    hreflang: 'ja',
    locale: 'ja_JP',
    siteName: 'ゴルフスイングマスター',
    appName: 'AIゴルフスイング診断',
    analysisPath: '/analysis-jp',
    analysisLabel: 'スイングを無料で分析する',
    homeLabel: 'ゴルフスイングマスター',
    relatedLabel: 'あわせて読みたい',
    languageLabel: '他の言語',
    privacyPath: '/privacy-jp',
    privacyLabel: 'プライバシー',
    termsPath: '/terms-jp',
    termsLabel: '利用規約',
    footer: '同じ条件で撮影し、一度に一つの項目を確認しましょう。',
    freeLabel: '無料',
  },
};

const PAGES = [
  {
    lang: 'ko',
    group: 'self-study',
    slug: 'golf-dokak',
    title: '골프 독학 루틴: 영상으로 스윙을 점검하는 법 | 2026',
    h1: '골프 독학, 영상으로 한 가지씩 고치는 연습법',
    meta: '혼자 연습할 때 필요한 촬영 기준, 20분 루틴, 체크 항목과 재촬영 방법을 정리했습니다. AI 분석은 보이는 프레임을 바탕으로 한 참고용 추정치입니다.',
    intro: '골프 독학에서 가장 어려운 일은 많이 연습하는 것이 아니라, 무엇이 달라졌는지 같은 기준으로 확인하는 일입니다. 아래 순서는 기준 영상을 만들고 한 번에 한 변수만 바꾸도록 설계했습니다.',
    sections: [
      {
        title: '1. 첫날에는 기준 영상을 만드세요',
        paragraphs: [
          '연습을 시작하기 전에 같은 클럽으로 평소처럼 세 번 스윙하세요. 가장 잘 맞은 샷만 고르지 말고, 평소 구질과 타점이 드러나는 영상을 기준으로 삼는 편이 좋습니다.',
        ],
        steps: [
          '7번 아이언처럼 익숙한 클럽 하나를 정합니다.',
          '목표선과 공 위치를 표시하고 같은 자리에서 세 번 촬영합니다.',
          '각 샷의 출발 방향, 휘어지는 방향, 타점 느낌을 짧게 기록합니다.',
          '세 영상에서 반복해서 보이는 항목 하나만 이번 주 과제로 선택합니다.',
        ],
      },
      {
        title: '2. 화면에서 확인할 항목을 좁히세요',
        paragraphs: [
          '한 대의 휴대폰 영상만으로 클럽 페이스 각도나 정확한 스윙 궤도를 측정할 수는 없습니다. 대신 매번 같은 각도에서 촬영하면 눈에 보이는 변화는 비교할 수 있습니다.',
        ],
        bullets: [
          '어드레스: 발·무릎·어깨선이 목표와 어떻게 정렬되는지 확인합니다.',
          '백스윙: 머리와 골반이 화면 밖으로 크게 이동하는지 확인합니다.',
          '다운스윙: 손과 클럽이 이전 영상과 비슷한 통로를 지나는지 봅니다.',
          '피니시: 균형을 2초 유지할 수 있는지 확인합니다.',
        ],
        note: '점수나 선 하나보다 반복되는 패턴을 우선하세요. 카메라 위치가 달라지면 같은 스윙도 다른 궤도로 보일 수 있습니다.',
      },
      {
        title: '3. 20분 연습은 이렇게 나눕니다',
        steps: [
          '기준 확인 4분: 평소 속도로 세 번 치고 구질과 타점을 기록합니다.',
          '동작 연습 6분: 공 없이 선택한 동작을 천천히 반복합니다.',
          '반 스윙 6분: 50~70% 속도로 치며 출발 방향과 균형만 확인합니다.',
          '전환 4분: 평소 루틴과 속도로 세 번 치고 다시 촬영합니다.',
        ],
        paragraphs: [
          '연습 중 새 문제를 발견해도 과제를 추가하지 마세요. 한 세션에서 바꾸는 조건이 많아지면 무엇이 결과에 영향을 줬는지 판단하기 어렵습니다.',
        ],
      },
      {
        title: '4. 비교 가능한 촬영 체크리스트',
        bullets: [
          '후방 영상은 손 높이에서 목표선과 평행하게, 정면 영상은 가슴 또는 손 높이에서 목표선과 직각으로 둡니다.',
          '머리부터 발, 백스윙 톱의 클럽까지 화면 안에 들어오게 합니다.',
          '가능하면 밝은 곳에서 60fps로 촬영하고 디지털 줌은 피합니다.',
          '매번 카메라 높이·거리·방향을 바닥 표시로 고정합니다.',
          '주변 사람과 충분한 거리를 확보한 뒤 촬영합니다.',
        ],
      },
      {
        title: '5. 주 1회 평가 루프',
        steps: [
          '같은 클럽과 카메라 위치로 기준 영상을 다시 찍습니다.',
          '이번 주 과제 하나만 이전 영상과 나란히 비교합니다.',
          '동작 변화와 함께 출발 방향·타점·균형도 나아졌는지 확인합니다.',
          '두 번의 연습에서 비슷한 개선이 반복될 때만 다음 과제로 넘어갑니다.',
        ],
        note: 'AI 분석은 영상에 보이는 프레임을 기준으로 설명과 추정 점수를 제공합니다. 런치 모니터 측정이나 프로 코치의 진단을 대신하지 않으며, 통증이 있다면 연습을 멈추고 자격을 갖춘 전문가와 상담하세요.',
      },
    ],
    faqs: [
      ['독학할 때 어떤 클럽부터 촬영하면 좋나요?', '가장 익숙하고 반복하기 쉬운 미들 아이언부터 시작하세요. 클럽을 자주 바꾸면 영상 차이가 동작 때문인지 클럽 때문인지 구분하기 어렵습니다.'],
      ['영상은 몇 개를 올려야 하나요?', '한 번에는 대표 영상 한 개로 시작하되, 결론을 내릴 때는 같은 조건에서 촬영한 여러 스윙에 패턴이 반복되는지 확인하세요.'],
      ['AI 점수가 오르면 스윙이 좋아진 건가요?', '점수는 보이는 프레임을 바탕으로 한 상대적 추정치입니다. 실제 구질, 타점, 균형이 함께 개선되는지 확인해야 합니다.'],
    ],
    related: ['driver-slice-gyojung'],
  },
  {
    lang: 'ko',
    group: 'slice',
    slug: 'driver-slice-gyojung',
    title: '드라이버 슬라이스 교정: 원인 구분과 연습 드릴 | 2026',
    h1: '드라이버 슬라이스 교정, 구질부터 나눠 보세요',
    meta: '오른손 골퍼 기준 출발 방향과 휘어짐으로 슬라이스 원인을 좁히고, 셋업·페이스·스윙 방향을 한 가지씩 확인하는 드릴과 촬영법을 안내합니다.',
    intro: '오른쪽으로 휘었다는 결과만 보고 같은 드릴을 반복하면 원인을 놓치기 쉽습니다. 먼저 공이 어디로 출발해 얼마나 휘었는지 기록한 뒤, 셋업·페이스·스윙 방향을 한 항목씩 확인하세요. 아래 방향 설명은 오른손 골퍼 기준이며 왼손 골퍼는 좌우를 바꾸면 됩니다.',
    sections: [
      {
        title: '1. 출발 방향과 휘어짐을 따로 기록하세요',
        bullets: [
          '왼쪽 출발 후 오른쪽으로 휨: 임팩트 때 페이스와 진행 방향의 차이가 큰 패턴일 수 있습니다.',
          '정면 출발 후 오른쪽으로 휨: 페이스가 스윙 진행 방향보다 열려 있을 가능성을 먼저 확인합니다.',
          '오른쪽 출발 후 더 오른쪽으로 휨: 페이스와 스윙 방향을 모두 점검해야 합니다.',
          '오른쪽으로 곧게 감: 슬라이스가 아니라 전체 출발 방향 문제일 수 있어 정렬부터 확인합니다.',
        ],
        note: '구질은 페이스와 클럽 진행 방향의 관계로 만들어지지만, 휴대폰 영상 한 개만으로 두 값을 정확히 측정할 수는 없습니다. 이 분류는 점검 순서를 정하기 위한 출발점입니다.',
      },
      {
        title: '2. 셋업을 먼저 고정합니다',
        steps: [
          '클럽 없이 목표선에 막대나 클럽 하나를 놓습니다.',
          '발끝선과 어깨선이 목표와 지나치게 왼쪽을 향하지 않는지 정면·후방에서 확인합니다.',
          '공은 왼발 뒤꿈치 안쪽 부근에서 시작하되, 개인의 스탠스 폭에 맞춰 한 칸씩 조정합니다.',
          '그립은 손에 과도한 긴장 없이 잡고, 임의로 크게 돌려 닫힌 페이스를 만들지 않습니다.',
        ],
        paragraphs: [
          '셋업을 바꾼 뒤에는 다른 동작을 건드리지 말고 다섯 번의 구질만 기록하세요. 정렬이 달라지면 카메라에서 보이는 궤도도 달라집니다.',
        ],
      },
      {
        title: '3. 원인별로 한 가지 드릴만 선택합니다',
        bullets: [
          '페이스 감각: 허리 높이의 작은 스윙으로 공을 시작선 게이트 사이에 보내며, 출발 방향이 일정해지는지 봅니다.',
          '스윙 방향: 공 바깥쪽 뒤에 헤드커버를 안전하게 놓고 건드리지 않는 작은 스윙부터 시작합니다. 헤드커버가 비행하거나 사람을 향하지 않게 두세요.',
          '중심 타점: 페이스 스프레이나 임팩트 테이프로 다섯 번의 타점을 확인하고, 힐 쪽 타점이 반복되면 공과의 거리를 조금씩 조정합니다.',
          '실전 전환: 드릴 세 번 뒤 평소 루틴의 스윙 한 번을 번갈아 하며 속도를 단계적으로 올립니다.',
        ],
      },
      {
        title: '4. 슬라이스 확인용 촬영 위치',
        bullets: [
          '후방은 손 높이에서 목표선과 평행하게 촬영합니다. 카메라를 공 바로 뒤에 두면 궤도가 왜곡되어 보일 수 있습니다.',
          '정면은 손 또는 가슴 높이에서 목표선과 직각으로 둡니다.',
          '클럽 헤드와 공이 흐려지지 않도록 밝은 곳에서 가능하면 60fps를 사용합니다.',
          '영상과 함께 출발 방향·휘어짐·타점 위치를 기록합니다.',
        ],
      },
      {
        title: '5. 교정 여부는 두 번의 세션으로 판단하세요',
        steps: [
          '바꾸기 전 다섯 번, 바꾼 뒤 다섯 번의 구질을 기록합니다.',
          '출발선, 휘어짐, 중심 타점 중 목표 하나를 정합니다.',
          '한 번 좋아진 샷보다 평균 패턴이 달라졌는지 봅니다.',
          '다음 연습에서도 변화가 유지될 때만 새 항목을 추가합니다.',
        ],
        note: 'AI 영상 분석은 화면에 보이는 자세와 타이밍을 바탕으로 가능한 원인과 연습 순서를 제안합니다. 정확한 페이스·패스 수치는 런치 모니터가 필요하며, 대면 레슨이나 의학적 조언을 대신하지 않습니다.',
      },
    ],
    faqs: [
      ['슬라이스는 그립만 바꾸면 고칠 수 있나요?', '그립이 페이스 방향에 영향을 줄 수 있지만 정렬, 타점, 스윙 방향도 같은 구질을 만들 수 있습니다. 먼저 현재 그립을 기록하고 한 요소씩 시험하세요.'],
      ['연습장에서 몇 번 쳐 보고 판단해야 하나요?', '최소 다섯 번씩 같은 조건에서 기록하고, 다음 세션에도 같은 변화가 반복되는지 확인하는 편이 좋습니다.'],
      ['영상만으로 정확한 원인을 알 수 있나요?', '영상은 눈에 보이는 움직임과 반복 패턴을 확인하는 데 유용하지만 클럽과 공의 충돌 수치를 직접 측정하지는 못합니다. 구질 기록이나 런치 모니터 데이터와 함께 보면 더 좋습니다.'],
    ],
    related: ['golf-dokak'],
  },
  {
    lang: 'en',
    group: 'slice',
    slug: 'fix-driver-slice',
    title: 'How to Fix a Driver Slice: Diagnosis and Practice Drills',
    h1: 'How to Fix a Driver Slice Without Guessing',
    meta: 'Use ball start direction and curve to narrow down a driver slice, then test setup, face control, strike location, and swing direction with one-variable drills.',
    intro: 'A ball that curves right does not identify the cause by itself. Start by recording where the ball begins, where it curves, and where it strikes the face. Then test one variable at a time. Directions below are for a right-handed golfer; reverse them if you play left-handed.',
    sections: [
      {
        title: '1. Separate start direction from curve',
        bullets: [
          'Starts left, curves right: the face may be open relative to the club’s travel direction.',
          'Starts near the target, curves right: check whether the face stays open relative to the path.',
          'Starts right, curves farther right: both face direction and swing direction deserve attention.',
          'Starts right and flies straight: begin with alignment, because this may be a push rather than a slice.',
        ],
        note: 'Ball flight reflects the relationship between clubface and club path, but a single phone camera cannot measure either value precisely. Use these patterns to choose what to test, not as launch-monitor data.',
      },
      {
        title: '2. Lock down setup before changing the swing',
        steps: [
          'Place an alignment stick on the target line and record your feet and shoulders from behind.',
          'Check that your shoulders are not aimed far left while your feet appear square.',
          'Start with the ball near the inside of the lead heel, then adjust in small increments for your stance.',
          'Use a comfortable grip pressure; avoid making a large grip change and a path change at the same time.',
        ],
        paragraphs: [
          'Hit five balls after the setup check without adding a swing thought. A consistent camera and target line make the comparison more useful.',
        ],
      },
      {
        title: '3. Pick one drill for the pattern you see',
        bullets: [
          'Start-line gate: place two tees safely in front of the ball to create a wide visual gate. Use waist-high swings and track the starting line.',
          'Path gate: place a soft headcover outside and behind the ball, clear of people. Begin with slow half-swings that miss the obstacle.',
          'Strike check: use face spray or impact tape for five shots. Repeated heel strikes can add fade spin, so test standing a small step farther away.',
          'Transfer: alternate three rehearsal swings with one normal pre-shot routine, increasing speed only while contact stays predictable.',
        ],
      },
      {
        title: '4. Film a view you can repeat',
        bullets: [
          'For down-the-line video, set the camera around hand height and aim it parallel to the target line.',
          'For face-on video, set the camera around hand or chest height and perpendicular to the target line.',
          'Keep your feet, hands, ball, and the club at the top inside the frame.',
          'Use bright light and 60 fps when available; avoid digital zoom.',
          'Save the clip with start direction, curve, and strike location notes.',
        ],
      },
      {
        title: '5. Decide by pattern, not by one good ball',
        steps: [
          'Record five baseline shots and five shots after one change.',
          'Choose one outcome: start line, amount of curve, or strike location.',
          'Compare the average pattern rather than the best shot.',
          'Keep the change only if it holds up in a second practice session.',
        ],
        note: 'AI video feedback can estimate visible positions and timing and suggest a practice order. It cannot provide exact clubface or path measurements, replace an in-person coach, or diagnose pain. Stop if a drill hurts and consult an appropriate qualified professional.',
      },
    ],
    faqs: [
      ['Can an outside-to-in path be the only cause of a slice?', 'No. Curve depends on the face relative to the path, and strike location can also affect driver flight. Record start direction and impact location before choosing a drill.'],
      ['Should I strengthen my grip immediately?', 'A grip change may alter face control, but changing it abruptly can create a new compensation. Test a small change on half-swings while leaving other variables alone.'],
      ['Can AI measure my club path from a phone video?', 'It can describe visible motion and estimate patterns, but it is not a launch monitor. Camera angle, frame rate, and motion blur limit numerical accuracy.'],
    ],
    related: [],
  },
  {
    lang: 'ja',
    group: 'self-study',
    slug: 'golf-dokugaku',
    title: 'ゴルフ独学の練習法：動画でスイングを確認する手順',
    h1: 'ゴルフを独学するときの動画チェックと練習ループ',
    meta: 'ゴルフを独学する人向けに、基準動画の撮り方、20分の練習メニュー、確認項目と再撮影の手順を解説します。AI診断は映像からの参考推定です。',
    intro: '独学で大切なのは練習量だけではなく、同じ条件で変化を確かめることです。基準となる動画を残し、一度に直す項目を一つに絞ると、結果と動作を結び付けやすくなります。',
    sections: [
      {
        title: '1. 最初に基準動画を作る',
        paragraphs: [
          '慣れているクラブを一本選び、普段どおりのスイングを三回撮影します。最も良いショットだけではなく、いつもの弾道や打点が分かる映像を基準にしましょう。',
        ],
        steps: [
          '同じクラブ、同じボール位置、同じ目標を使います。',
          '各ショットの出球、曲がり、打点の感触を短く記録します。',
          '三つの映像で繰り返し見える動きを探します。',
          '今週確認する項目を一つだけ選びます。',
        ],
      },
      {
        title: '2. 画面で確認できる範囲を知る',
        bullets: [
          'アドレス：足、ひざ、肩のラインと目標の関係を見ます。',
          'バックスイング：頭や骨盤が画面内で大きく移動していないか見ます。',
          'ダウンスイング：手とクラブが前回と似た通り道を通るか比べます。',
          'フィニッシュ：バランスを2秒保てるか確認します。',
        ],
        note: '一台のスマートフォン映像だけでは、フェース角やクラブパスを正確に測れません。カメラ位置を固定し、数値よりも繰り返す傾向を見てください。',
      },
      {
        title: '3. 20分の練習メニュー',
        steps: [
          '4分：通常の速さで三球打ち、基準の弾道と打点を確認します。',
          '6分：ボールを打たず、選んだ動きをゆっくり反復します。',
          '6分：50〜70%のハーフスイングで出球とバランスを確認します。',
          '4分：通常のルーティンで三球打ち、もう一度撮影します。',
        ],
        paragraphs: [
          '途中で別の問題が見つかっても、同じ日に課題を増やさないことが大切です。変更点が多いと、何が弾道に影響したのか判断しにくくなります。',
        ],
      },
      {
        title: '4. 比較しやすい撮影チェック',
        bullets: [
          '後方は手の高さから目標線と平行に、正面は手または胸の高さから目標線と直角に撮ります。',
          '頭から足、トップのクラブまで画面に収めます。',
          '明るい場所で、可能なら60fpsを使い、デジタルズームは避けます。',
          '床の目印を使い、カメラの高さ、距離、向きを毎回そろえます。',
          '周囲に人がいないことを確認してから撮影します。',
        ],
      },
      {
        title: '5. 週に一度の評価ループ',
        steps: [
          '同じクラブとカメラ位置で基準動画を撮り直します。',
          '今週の課題だけを前回の映像と並べて比べます。',
          '動きだけでなく、出球、打点、バランスも改善したか見ます。',
          '二回の練習で同じ変化が続いたら、次の課題へ進みます。',
        ],
        note: 'AI診断は映像に見える姿勢やタイミングから説明と推定スコアを返します。弾道計測器や対面コーチの診断ではなく、医療上の助言も行いません。痛みがある場合は練習を中止し、適切な専門家に相談してください。',
      },
    ],
    faqs: [
      ['独学ではどのクラブから撮ればよいですか？', 'まずは振り慣れたミドルアイアンがおすすめです。同じクラブを使うと、映像の差がクラブではなく動作によるものか判断しやすくなります。'],
      ['毎回何スイング撮影すればよいですか？', '最低三回は同じ条件で撮り、一回だけの動きではなく繰り返す傾向を確認してください。'],
      ['AIの点数が上がれば上達したと言えますか？', '点数は映像からの相対的な推定です。実際の出球、打点、バランスも一緒に改善しているか確認しましょう。'],
    ],
    related: ['driver-slice-naoshikata'],
  },
  {
    lang: 'ja',
    group: 'slice',
    slug: 'driver-slice-naoshikata',
    title: 'ドライバースライスの直し方：原因別ドリルと撮影法',
    h1: 'ドライバーのスライスは出球と曲がりから確認する',
    meta: '右打ちを基準に、出球と曲がりでドライバーのスライス原因を絞り、構え、フェース、打点、スイング方向を一つずつ試す方法を紹介します。',
    intro: '右へ曲がるという結果だけでは、直す項目を決められません。出球の方向、曲がり方、フェースの打点を記録してから、構えと動きを一つずつ試します。以下は右打ちを基準にしているため、左打ちは左右を入れ替えてください。',
    sections: [
      {
        title: '1. 出球と曲がりを分けて見る',
        bullets: [
          '左へ出て右へ曲がる：フェースがクラブの進行方向に対して開いている可能性があります。',
          '目標付近へ出て右へ曲がる：フェースとクラブパスの関係を先に確認します。',
          '右へ出てさらに右へ曲がる：フェース方向とスイング方向の両方を点検します。',
          '右へ出てまっすぐ飛ぶ：スライスではなくプッシュの可能性があるため、アライメントから見直します。',
        ],
        note: '弾道はフェースとクラブパスの関係で変わりますが、スマートフォン映像一つでは両方を正確に計測できません。この分類は確認する順番を決めるために使います。',
      },
      {
        title: '2. スイングより先に構えを固定する',
        steps: [
          '目標線にアライメントスティックやクラブを置きます。',
          '後方から撮影し、足と肩が大きく左を向いていないか確認します。',
          'ボール位置は左かかとの内側付近から始め、スタンスに合わせて少しずつ調整します。',
          'グリップとスイング方向を同時に大きく変えず、一つずつ試します。',
        ],
        paragraphs: [
          '構えを変えた後は、別のスイング意識を足さずに五球記録してください。目標線とカメラ位置が変わると、同じ動きでも違って見えます。',
        ],
      },
      {
        title: '3. 見えた傾向に合うドリルを一つ選ぶ',
        bullets: [
          '出球ゲート：ボールの前方に安全な幅でティーを二本置き、腰の高さのスイングで出球をそろえます。',
          'パスのゲート：ボールの外側後方に柔らかいヘッドカバーを置き、当てない小さなスイングから始めます。人に飛ばない位置に置いてください。',
          '打点チェック：フェース用スプレーやインパクトテープで五球確認し、ヒール寄りが続く場合はボールとの距離を少しずつ試します。',
          '通常スイングへの移行：ドリル三回と通常ルーティン一回を交互に行い、ミート率が保てる範囲で速度を上げます。',
        ],
      },
      {
        title: '4. スライス確認用の撮影位置',
        bullets: [
          '後方は手の高さから目標線と平行に撮ります。ボールの真後ろに置くとクラブの通り道が違って見えることがあります。',
          '正面は手または胸の高さから目標線と直角に撮ります。',
          '明るい場所で可能なら60fpsを使い、クラブヘッドとボールのぶれを減らします。',
          '動画と一緒に出球、曲がり、打点を記録します。',
        ],
      },
      {
        title: '5. 一球ではなく二回の練習で判断する',
        steps: [
          '変更前に五球、変更後に五球の弾道を記録します。',
          '出球、曲がり、打点のうち評価する項目を一つ選びます。',
          '最も良い一球ではなく、全体の傾向を比べます。',
          '次の練習でも変化が続いたら、新しい項目を追加します。',
        ],
        note: 'AI動画診断は画面に見える姿勢やタイミングから原因候補と練習順を提案します。正確なフェース角やクラブパスには弾道計測器が必要で、対面レッスンや医療上の助言を代替するものではありません。',
      },
    ],
    faqs: [
      ['アウトサイドインだけがスライスの原因ですか？', 'いいえ。曲がりはフェースとクラブパスの関係で決まり、ドライバーでは打点も影響します。出球と打点を記録してからドリルを選びましょう。'],
      ['最初にグリップを強くすればよいですか？', 'グリップはフェース管理に関係しますが、急に大きく変えると別の補正動作が出ることがあります。小さなスイングで少しずつ試してください。'],
      ['動画だけでクラブパスを測れますか？', '見える動きの傾向は確認できますが、数値を正確に測る弾道計測器ではありません。撮影角度、フレームレート、手ぶれによって見え方も変わります。'],
    ],
    related: ['golf-dokugaku'],
  },
];

const CSS = `*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,"Noto Sans KR","Noto Sans JP",sans-serif;line-height:1.68;color:#1a2a1a;background:linear-gradient(180deg,#f1f8e9 0%,#fff 40%);min-height:100vh}.wrap{max-width:760px;margin:0 auto;padding:24px 20px 72px}.brand{display:inline-block;color:#2e7d32;text-decoration:none;font-size:14px;margin:8px 0 22px}header{text-align:center;padding:8px 0}h1{font-size:28px;line-height:1.32;margin-bottom:16px;color:#2e7d32}h2{font-size:20px;margin:36px 0 12px;color:#1b5e20;border-bottom:2px solid #c8e6c9;padding-bottom:6px}p{margin-bottom:14px}ul,ol{margin:12px 0 18px 24px}li{margin-bottom:9px}.intro{font-size:17px;color:#444;background:#fff;border-left:4px solid #43a047;padding:14px 18px;border-radius:6px;margin:18px 0 8px}.note{font-size:14px;color:#435443;background:#f4faf4;border:1px solid #c8e6c9;border-radius:8px;padding:12px 14px;margin:16px 0}.cta-box{text-align:center;margin:32px 0;padding:26px 20px;background:linear-gradient(135deg,#43a047,#1b5e20);border-radius:14px;box-shadow:0 8px 24px rgba(67,160,71,.2)}.cta{display:inline-block;background:#fff;color:#1b5e20;font-weight:700;font-size:18px;padding:13px 30px;border-radius:50px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,.12)}.cta:hover{transform:translateY(-2px)}.pick{display:block;color:inherit;text-decoration:none;background:#fff;border:1px solid #c8e6c9;border-radius:10px;padding:16px 18px;margin-bottom:14px}.pick h3{font-size:17px;color:#1b5e20;margin-bottom:5px}.pick p{font-size:14px;color:#555;margin:0}.badge{display:inline-block;background:#c8e6c9;color:#1b5e20;font-size:12px;padding:2px 8px;border-radius:10px;margin-left:6px;vertical-align:middle}.faq{margin-bottom:12px;border-bottom:1px solid #edf3ed}.faq summary{cursor:pointer;font-weight:600;padding:10px 0;color:#344534}.faq p{padding:4px 0 12px;color:#555;font-size:15px}footer{margin-top:46px;padding-top:20px;border-top:1px solid #c8e6c9;text-align:center;font-size:13px;color:#718071}.footer-links,.langs{margin-top:10px}.footer-links a,.langs a{color:#2e7d32;margin:0 6px;text-decoration:none}@media(max-width:520px){h1{font-size:23px}h2{font-size:18px}.intro{font-size:15px}.cta{font-size:16px;padding:12px 25px}.wrap{padding-left:17px;padding-right:17px}}`;

const esc = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const pageUrl = slug => `${SITE}/seo/${slug}`;
const pagePath = slug => `/seo/${slug}`;
const groupPages = group => PAGES.filter(page => page.group === group);

function renderSection(section) {
  const paragraphs = (section.paragraphs || []).map(text => `<p>${esc(text)}</p>`).join('');
  const bullets = section.bullets
    ? `<ul>${section.bullets.map(text => `<li>${esc(text)}</li>`).join('')}</ul>`
    : '';
  const steps = section.steps
    ? `<ol>${section.steps.map(text => `<li>${esc(text)}</li>`).join('')}</ol>`
    : '';
  const note = section.note ? `<p class="note">${esc(section.note)}</p>` : '';
  return `<section><h2>${esc(section.title)}</h2>${paragraphs}${bullets}${steps}${note}</section>`;
}

function renderPage(page) {
  const language = LANGUAGE[page.lang];
  const url = pageUrl(page.slug);
  const alternates = groupPages(page.group);
  const defaultAlternate = alternates.find(candidate => candidate.lang === 'en')
    || alternates.find(candidate => candidate.lang === 'ko')
    || alternates[0];
  const alternateLinks = [
    ...alternates.map(candidate => `<link rel="alternate" hreflang="${LANGUAGE[candidate.lang].hreflang}" href="${pageUrl(candidate.slug)}">`),
    `<link rel="alternate" hreflang="x-default" href="${pageUrl(defaultAlternate.slug)}">`,
  ].join('\n  ');
  const languageLinks = alternates
    .filter(candidate => candidate.slug !== page.slug)
    .map(candidate => `<a href="${pagePath(candidate.slug)}" hreflang="${LANGUAGE[candidate.lang].hreflang}">${LANGUAGE[candidate.lang].hreflang.toUpperCase()}</a>`)
    .join(' · ');
  const relatedPages = (page.related || [])
    .map(slug => PAGES.find(candidate => candidate.slug === slug))
    .filter(Boolean);
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: language.siteName,
        inLanguage: language.htmlLang,
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.meta,
        inLanguage: language.htmlLang,
        dateModified: LASTMOD,
        isPartOf: { '@id': `${SITE}/#website` },
        mainEntity: { '@id': `${url}#article` },
      },
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: page.h1,
        description: page.meta,
        url,
        dateModified: LASTMOD,
        inLanguage: language.htmlLang,
        author: {
          '@type': 'Organization',
          name: 'ArcherLab',
          url: 'https://archerlab.dev',
        },
        publisher: {
          '@type': 'Organization',
          name: 'ArcherLab',
          url: 'https://archerlab.dev',
        },
        isPartOf: { '@id': `${url}#webpage` },
        about: { '@id': `${SITE}/#app-${language.htmlLang}` },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE}/#app-${language.htmlLang}`,
        name: language.appName,
        url: `${SITE}${language.analysisPath}`,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Web Browser',
        browserRequirements: 'Requires JavaScript and HTML5 video upload support.',
        inLanguage: language.htmlLang,
        isAccessibleForFree: true,
        description: page.meta,
        image: `${SITE}/assets/images/kakao_golf.png`,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: page.lang === 'ko' ? 'KRW' : page.lang === 'ja' ? 'JPY' : 'USD',
        },
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="${language.htmlLang}">
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
  ${alternateLinks}
  <meta property="og:locale" content="${language.locale}">
  <meta property="og:site_name" content="${esc(language.siteName)}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.meta)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="${SITE}/assets/images/kakao_golf.png">
  <meta property="og:image:alt" content="${esc(language.siteName)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.meta)}">
  <meta name="twitter:image" content="${SITE}/assets/images/kakao_golf.png">
  <link rel="icon" href="/favicon.png">
  <style>${CSS}</style>
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body>
  <main class="wrap">
    <a class="brand" href="/">${esc(language.homeLabel)}</a>
    <header><h1>${esc(page.h1)}</h1></header>
    <p class="intro">${esc(page.intro)}</p>
    <div class="cta-box"><a class="cta" href="${language.analysisPath}">${esc(language.analysisLabel)}</a></div>
    ${page.sections.map(renderSection).join('\n    ')}
${relatedPages.length ? `    <section><h2>${esc(language.relatedLabel)}</h2>${relatedPages.map(related => `<a class="pick" href="${pagePath(related.slug)}"><h3>${esc(related.h1)} <span class="badge">${esc(language.freeLabel)}</span></h3><p>${esc(related.meta)}</p></a>`).join('')}</section>` : ''}
    <section>
      <h2>${page.lang === 'ko' ? '자주 묻는 질문' : page.lang === 'ja' ? 'よくある質問' : 'Frequently asked questions'}</h2>
      ${page.faqs.map(([question, answer]) => `<details class="faq"><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}
    </section>
    <div class="cta-box"><a class="cta" href="${language.analysisPath}">${esc(language.analysisLabel)}</a></div>
    <footer>
      <div>${esc(language.footer)}</div>
      <div class="footer-links"><a href="${language.privacyPath}">${esc(language.privacyLabel)}</a> · <a href="${language.termsPath}">${esc(language.termsLabel)}</a></div>
      ${languageLinks ? `<div class="langs"><span>${esc(language.languageLabel)}:</span> ${languageLinks}</div>` : ''}
    </footer>
  </main>
</body>
</html>`;
}

for (const page of PAGES) {
  fs.writeFileSync(path.join(OUT, `${page.slug}.html`), renderPage(page), 'utf8');
}

const fragment = PAGES.map(page => {
  const alternates = groupPages(page.group);
  const defaultAlternate = alternates.find(candidate => candidate.lang === 'en')
    || alternates.find(candidate => candidate.lang === 'ko')
    || alternates[0];
  const alternateXml = [
    ...alternates.map(candidate => `    <xhtml:link rel="alternate" hreflang="${LANGUAGE[candidate.lang].hreflang}" href="${pageUrl(candidate.slug)}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(defaultAlternate.slug)}"/>`,
  ].join('\n');
  return `  <url><loc>${pageUrl(page.slug)}</loc>
    <lastmod>${LASTMOD}</lastmod>
${alternateXml}
    <changefreq>monthly</changefreq><priority>0.7</priority></url>`;
}).join('\n');

fs.writeFileSync(path.join(OUT, '_sitemap_fragment.xml'), `${fragment}\n`, 'utf8');
console.log(`${PAGES.length} SEO guides generated`);
