const LANGUAGE_STORAGE_KEY = "latindance:language";

// 저장소 관련 함수 제거 (사용하지 않음)

const detectBrowserLanguage = () => {
  const candidate = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language || navigator.userLanguage || "";

  if (!candidate) return null;

  const lowered = candidate.toLowerCase();
  if (lowered.startsWith("ko")) return "ko";
  if (lowered.startsWith("es")) return "es";
  return "en";
};

const docLang = (document.documentElement.lang || "en").toLowerCase();
const browserLang = detectBrowserLanguage();
const preferredLang = browserLang; // 저장된 언어 무시

// 검색 봇 감지 (SEO 문제 방지)
const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);

// 내부 이동 감지 (사이트 내에서 링크 클릭으로 이동한 경우 리다이렉트 방지)
const referrer = document.referrer;
const isInternal = referrer && referrer.indexOf(window.location.hostname) !== -1;

// 봇이 아니고, 내부 이동이 아닐 때만(외부 유입/첫 진입) 브라우저 언어에 따라 리다이렉션합니다.
if (browserLang && !isBot && !isInternal) {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || "index.html";
  
  // 현재 파일명에서 기본 이름 추출 (예: clubs-en.html -> clubs)
  let baseName = currentFile.replace(/-en\.html$|-es\.html$|\.html$/, "");
  if (!baseName) baseName = "index";

  let targetFile = null;
  
  // 브라우저 언어와 현재 페이지 언어가 다를 경우 타겟 파일 설정
  if (browserLang === "ko" && !docLang.startsWith("ko")) {
    targetFile = baseName + ".html";
  } else if (browserLang === "es" && !docLang.startsWith("es")) {
    targetFile = baseName + "-es.html";
  } else if (browserLang === "en" && !docLang.startsWith("en")) {
    targetFile = baseName + "-en.html";
  }

  // 타겟 파일이 존재하고 현재 파일과 다를 경우 이동
  if (targetFile && targetFile !== currentFile) {
    window.location.replace(targetFile);
  }
}

const LOCALE = docLang.startsWith("ko") ? "ko" : (docLang.startsWith("es") ? "es" : "en");

const STRINGS = {
  ko: {
    regionsAll: "전국",
    count: (n) => `총 ${n}곳이 검색되었습니다.`,
    countEmpty: "조건에 맞는 장소를 찾지 못했습니다.",
    emptyMessage: "검색어 또는 필터를 바꿔 다시 시도해 주세요.",
    styles: {
      salsa: "살사",
      bachata: "바차타",
      kizomba: "키좀바",
      zouk: "주크",
      linedance: "라인댄스",
      brazilianjuke: "브라질리언 주크",
      bachatajuke: "바차주크"
    },
    linkLabels: {
      homepage: "공식 홈페이지",
      website: "당근모임",
      cafe: "네이버 카페",
      instagram: "인스타그램",
      instagramBachazouk: "인스타그램(바차주크)",
      map: "카카오맵",
      band: "네이버 밴드",
      facebook: "페이스북",
      youtube: "유튜브",
      store: "네이버 스토어",
      blog: "네이버 블로그",
      kakaotalk: "카카오톡",
      threads: "Threads",
      linktree: "Linktree",
      phone: "전화문의"
    },
    contactFallback: "전화문의",
    mapInlineLink: "지도 보기",
    copyAddress: "주소 복사",
    copyAddressCopied: "복사됨!",
    scrollTopLabel: "맨 위로",
    scrollTopTitle: "맨 위로 이동",
    disabledLinkBadge: "텍스트 안내",
    disabledLinkTitle: "이 항목은 정보만 제공되며 클릭할 수 없습니다.",
    loadMore: "더 보기"
  },
  en: {
    regionsAll: "All regions",
    count: (n) => `${n} communities listed.`,
    countEmpty: "No communities matched your filters.",
    emptyMessage: "Try adjusting the filters or search keywords.",
    styles: {
      salsa: "Salsa",
      bachata: "Bachata",
      kizomba: "Kizomba",
      zouk: "Zouk",
      linedance: "Line Dance",
      brazilianjuke: "Brazilian Zouk",
      bachatajuke: "Bachata Zouk"
    },
    linkLabels: {
      homepage: "Official Website",
      website: "Karrot Group",
      cafe: "Naver Cafe",
      instagram: "Instagram",
      instagramBachazouk: "Instagram (Bachazouk)",
      map: "Map",
      band: "Naver Band",
      facebook: "Facebook",
      youtube: "YouTube",
      store: "Naver Store",
      blog: "Naver Blog",
      kakaotalk: "KakaoTalk",
      threads: "Threads",
      linktree: "Linktree",
      phone: "Phone"
    },
    contactFallback: "Call",
    mapInlineLink: "View map",
    copyAddress: "Copy Address",
    copyAddressCopied: "Copied!",
    scrollTopLabel: "Back to top",
    scrollTopTitle: "Scroll back to top",
    disabledLinkBadge: "Text only",
    disabledLinkTitle: "This chip is informational and cannot be clicked.",
    loadMore: "Load More"
  },
  es: {
    regionsAll: "Todas las regiones",
    count: (n) => `${n} comunidades listadas.`,
    countEmpty: "No se encontraron comunidades que coincidan con sus filtros.",
    emptyMessage: "Intente ajustar los filtros o las palabras clave de búsqueda.",
    styles: {
      salsa: "Salsa",
      bachata: "Bachata",
      kizomba: "Kizomba",
      zouk: "Zouk",
      linedance: "Line Dance",
      brazilianjuke: "Zouk Brasileño",
      bachatajuke: "Bachata Zouk"
    },
    linkLabels: {
      homepage: "Sitio web oficial",
      website: "Grupo Karrot",
      cafe: "Naver Cafe",
      instagram: "Instagram",
      instagramBachazouk: "Instagram (Bachazouk)",
      map: "Mapa",
      band: "Naver Band",
      facebook: "Facebook",
      youtube: "YouTube",
      store: "Tienda Naver",
      blog: "Blog de Naver",
      kakaotalk: "KakaoTalk",
      threads: "Threads",
      linktree: "Linktree",
      phone: "Teléfono"
    },
    contactFallback: "Llamar",
    mapInlineLink: "Ver mapa",
    copyAddress: "Copiar dirección",
    copyAddressCopied: "¡Copiado!",
    scrollTopLabel: "Volver arriba",
    scrollTopTitle: "Desplazarse hacia arriba",
    disabledLinkBadge: "Solo texto",
    disabledLinkTitle: "Este chip es informativo y no se puede hacer clic.",
    loadMore: "Cargar más"
  }
}[LOCALE];

const SVG_NS = "http://www.w3.org/2000/svg";

const LINK_DISPLAY_ORDER = [
  "homepage",
  "website",
  "map",
  "phone",
  "youtube",
  "navertv",
  "instagram",
  "instagramBachazouk",
  "facebook",
  "threads",
  "blog",
  "cafe",
  "band",
  "kakaotalk",
  "linktree",
  "store"
];

const appendSvgChild = (svg, tag, attrs) => {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  svg.appendChild(node);
  return node;
};

const LINK_ICON_ALIASES = {
  instagramBachazouk: "instagram",
  homepage: "globe",
  website: "carrot",
  cafe: "cafe",
  band: "band",
  kakaotalk: "chat",
  threads: "threads",
  youtube: "play",
  navertv: "navertv",
  blog: "blog",
  map: "map",
  phone: "phone",
  store: "bag",
  linktree: "tree"
};

const LINK_ICON_FACTORIES = {
  instagram: (svg) => {
    appendSvgChild(svg, "rect", {
      x: "4",
      y: "4",
      width: "16",
      height: "16",
      rx: "4",
      fill: "none"
    });
    appendSvgChild(svg, "circle", {
      cx: "12",
      cy: "12",
      r: "4.2",
      fill: "none"
    });
    const dot = appendSvgChild(svg, "circle", {
      cx: "17",
      cy: "7",
      r: "1.2"
    });
    dot.setAttribute("stroke", "none");
    dot.setAttribute("fill", "currentColor");
  },
  play: (svg) => {
    appendSvgChild(svg, "rect", {
      x: "3",
      y: "7",
      width: "18",
      height: "10",
      rx: "3",
      fill: "none"
    });
    const triangle = appendSvgChild(svg, "polygon", {
      points: "11,9 16,12 11,15"
    });
    triangle.setAttribute("fill", "currentColor");
    triangle.setAttribute("stroke", "none");
  },
  navertv: (svg) => {
    appendSvgChild(svg, "rect", {
      x: "2",
      y: "7",
      width: "20",
      height: "15",
      rx: "2",
      ry: "2",
      fill: "none"
    });
    appendSvgChild(svg, "polyline", {
      points: "17 2 12 7 7 2",
      fill: "none"
    });
  },
  facebook: (svg) => {
    svg.setAttribute("stroke", "none");
    svg.setAttribute("fill", "currentColor");
    appendSvgChild(svg, "path", {
      d: "M14 3h-4a4 4 0 00-4 4v3H4v4h2v7h4v-7h3l1-4h-4V7a1 1 0 011-1h3z"
    });
  },
  chat: (svg) => {
    appendSvgChild(svg, "path", {
      d: "M5 6h14a2 2 0 012 2v7a2 2 0 01-2 2h-5l-4 3v-3H5a2 2 0 01-2-2V8a2 2 0 012-2z",
      fill: "none"
    });
  },
  cafe: (svg) => {
    appendSvgChild(svg, "path", {
      d: "M6 9h10v4a3 3 0 01-3 3H9a3 3 0 01-3-3V9z",
      fill: "none"
    });
    appendSvgChild(svg, "path", {
      d: "M16 11h1.2a2 2 0 010 4H16",
      fill: "none"
    });
    appendSvgChild(svg, "line", {
      x1: "6",
      y1: "17",
      x2: "17",
      y2: "17"
    });
  },
  band: (svg) => {
    appendSvgChild(svg, "path", {
      d: "M15 5v7.8a2.4 2.4 0 11-1.5-2.2V7h4V5z",
      fill: "none"
    });
    const noteHead = appendSvgChild(svg, "circle", {
      cx: "10",
      cy: "16",
      r: "2.1"
    });
    noteHead.setAttribute("stroke", "none");
    noteHead.setAttribute("fill", "currentColor");
  },
  threads: (svg) => {
    appendSvgChild(svg, "path", {
      d: "M12 4c5 0 8 3 8 8s-3 8-8 8-8-3-8-8a8 8 0 016.6-7.86",
      fill: "none"
    });
    appendSvgChild(svg, "path", {
      d: "M13.2 9.1c1.8.3 2.7 1.6 2.7 2.9 0 2-1.4 3.6-3.9 3.6-2.2 0-3.4-1.1-3.4-2.4 0-1.4 1.1-2.3 2.7-2.3 1.7 0 2.8.9 2.8 2.6",
      fill: "none"
    });
  },
  globe: (svg) => {
    appendSvgChild(svg, "circle", {
      cx: "12",
      cy: "12",
      r: "8",
      fill: "none"
    });
    appendSvgChild(svg, "line", {
      x1: "12",
      y1: "4.5",
      x2: "12",
      y2: "19.5"
    });
    appendSvgChild(svg, "line", {
      x1: "4.5",
      y1: "12",
      x2: "19.5",
      y2: "12"
    });
    appendSvgChild(svg, "path", {
      d: "M8 6a6 6 0 000 12",
      fill: "none"
    });
    appendSvgChild(svg, "path", {
      d: "M16 6a6 6 0 010 12",
      fill: "none"
    });
  },
  blog: (svg) => {
    appendSvgChild(svg, "rect", {
      x: "5",
      y: "4",
      width: "14",
      height: "16",
      rx: "2",
      fill: "none"
    });
    appendSvgChild(svg, "line", {
      x1: "8",
      y1: "8",
      x2: "16",
      y2: "8"
    });
    appendSvgChild(svg, "line", {
      x1: "8",
      y1: "12",
      x2: "16",
      y2: "12"
    });
    appendSvgChild(svg, "line", {
      x1: "8",
      y1: "16",
      x2: "16",
      y2: "16"
    });
  },
  map: (svg) => {
    appendSvgChild(svg, "path", {
      d: "M12 4a5 5 0 00-5 5c0 3.8 5 10 5 10s5-6.2 5-10a5 5 0 00-5-5z",
      fill: "none"
    });
    const pin = appendSvgChild(svg, "circle", {
      cx: "12",
      cy: "9",
      r: "1.7"
    });
    pin.setAttribute("stroke", "none");
    pin.setAttribute("fill", "currentColor");
  },
  phone: (svg) => {
    appendSvgChild(svg, "path", {
      d: "M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z",
      fill: "none"
    });
    appendSvgChild(svg, "line", {
      x1: "10",
      y1: "6",
      x2: "14",
      y2: "6"
    });
    appendSvgChild(svg, "line", {
      x1: "12",
      y1: "18",
      x2: "12",
      y2: "18"
    });
  },
  bag: (svg) => {
    appendSvgChild(svg, "rect", {
      x: "6",
      y: "8",
      width: "12",
      height: "10",
      rx: "2",
      fill: "none"
    });
    appendSvgChild(svg, "path", {
      d: "M9 8V6a3 3 0 016 0v2",
      fill: "none"
    });
  },
  tree: (svg) => {
    appendSvgChild(svg, "circle", {
      cx: "12",
      cy: "10",
      r: "5",
      fill: "none"
    });
    const trunk = appendSvgChild(svg, "rect", {
      x: "11",
      y: "14.5",
      width: "2",
      height: "5"
    });
    trunk.setAttribute("stroke", "none");
    trunk.setAttribute("fill", "currentColor");
    appendSvgChild(svg, "line", {
      x1: "9.5",
      y1: "19.5",
      x2: "14.5",
      y2: "19.5"
    });
  },
  carrot: (svg) => {
    appendSvgChild(svg, "path", {
      d: "M9 6l2-2 2 2",
      fill: "none"
    });
    appendSvgChild(svg, "path", {
      d: "M12 4v3.5",
      fill: "none"
    });
    const body = appendSvgChild(svg, "path", {
      d: "M12 7.5c3.2 0 5 2.4 5 5.1 0 2.6-1.8 4.6-5 6.9-3.2-2.3-5-4.3-5-6.9 0-2.7 1.8-5.1 5-5.1z",
      fill: "none"
    });
    body.setAttribute("stroke-linejoin", "round");
    appendSvgChild(svg, "path", {
      d: "M12 10.2c1.4 0 2.4 1 2.4 2.2 0 1.2-.9 2.1-2.4 3.1-1.5-1-2.4-1.9-2.4-3.1 0-1.2 1-2.2 2.4-2.2z",
      fill: "none"
    });
    appendSvgChild(svg, "line", {
      x1: "12",
      y1: "13",
      x2: "12",
      y2: "17"
    });
  },
  default: (svg) => {
    appendSvgChild(svg, "circle", {
      cx: "12",
      cy: "12",
      r: "8",
      fill: "none"
    });
    appendSvgChild(svg, "line", {
      x1: "8",
      y1: "8",
      x2: "8",
      y2: "16"
    });
    appendSvgChild(svg, "path", {
      d: "M12 9l4 3-4 3",
      fill: "none"
    });
  }
};

const createLinkIcon = (type) => {
  const key = LINK_ICON_ALIASES[type] || type;
  const factory = LINK_ICON_FACTORIES[key] || LINK_ICON_FACTORIES.default;
  if (!factory) {
    return null;
  }
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("venue-card__link-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.6");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  factory(svg);
  return svg;
};

const getGlobalObject = () => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }

  if (typeof window !== "undefined") {
    return window;
  }

  return this;
};

const globalObject = getGlobalObject();

let REGION_ORDER = globalObject?.REGION_ORDER;
if (typeof module !== "undefined" && module.exports && !REGION_ORDER) {
  try {
    REGION_ORDER = require("./constants").REGION_ORDER;
  } catch (error) {
    REGION_ORDER = undefined;
  }
}
if (!REGION_ORDER) {
  REGION_ORDER = { ko: [], en: [] };
}

let FilterUtils = globalObject?.FilterUtils;
if (typeof module !== "undefined" && module.exports && !FilterUtils) {
  try {
    FilterUtils = require("./utils/filter-utils");
  } catch (error) {
    FilterUtils = undefined;
  }
}

if (!FilterUtils) {
  throw new Error("Filter utilities module is required for main.js.");
}

const {
  normalizeRegionValue,
  matchesFilters,
  formatCount,
  isCityRepeatedInAddress,
  shuffleArray,
  resolveRegionLabel,
  normalizeRegionKey
} = FilterUtils;

// VENUES data is defined in assets/js/venues.js

const regionSelect = document.querySelector("[data-filter-region]");
const searchInput = document.querySelector("[data-filter-search]");
const filterForm = document.querySelector(".filter-form");
const resultsContainer = document.getElementById("venue-results");
const countNode = document.querySelector("[data-result-count]");

let currentFilteredVenues = [];

const supportsImagePreload = typeof window !== "undefined" && typeof window.Image === "function";
const preloadedImageSources = supportsImagePreload ? new Set() : null;
const queuedImageSources = supportsImagePreload ? new Set() : null;
const imagePreloadQueue = supportsImagePreload ? [] : null;

const enqueueImagePreload = (src) => {
  if (!supportsImagePreload || !src) {
    return;
  }
  if (preloadedImageSources.has(src) || queuedImageSources.has(src)) {
    return;
  }
  imagePreloadQueue.push(src);
  queuedImageSources.add(src);
};

const processImagePreloadQueue = () => {
  if (!supportsImagePreload || !imagePreloadQueue.length) {
    return;
  }

  const src = imagePreloadQueue.shift();
  if (!src) {
    return;
  }

  queuedImageSources.delete(src);

  preloadedImageSources.add(src);

  try {
    const preloadImage = new window.Image();
    preloadImage.decoding = "async";
    preloadImage.loading = "eager";
    preloadImage.src = src;
    const finalize = () => {
      preloadImage.onload = null;
      preloadImage.onerror = null;
      scheduleImagePreload();
    };
    preloadImage.onload = finalize;
    preloadImage.onerror = finalize;
  } catch (error) {
    scheduleImagePreload();
  }
};

const scheduleImagePreload = () => {
  if (!supportsImagePreload || !imagePreloadQueue.length) {
    return;
  }

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => {
      processImagePreloadQueue();
    }, { timeout: 1500 });
    return;
  }

  window.setTimeout(() => {
    processImagePreloadQueue();
  }, 200);
};

if (supportsImagePreload && Array.isArray(VENUES)) {
  VENUES.forEach((venue) => {
    if (venue && typeof venue.image === "string") {
      enqueueImagePreload(venue.image);
    }
  });
}

const startImagePreloading = () => {
  if (!supportsImagePreload || !imagePreloadQueue.length) {
    return;
  }
  scheduleImagePreload();
};

const initCustomSelect = () => {
  if (!regionSelect) return;

  // Check if already initialized
  if (regionSelect.nextElementSibling && regionSelect.nextElementSibling.classList.contains("custom-select")) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";

  const trigger = document.createElement("div");
  trigger.className = "custom-select-trigger";

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "custom-select-options";

  wrapper.appendChild(trigger);
  wrapper.appendChild(optionsContainer);

  regionSelect.parentNode.insertBefore(wrapper, regionSelect.nextSibling);
  regionSelect.classList.add("is-hidden");

  const updateOptions = () => {
    optionsContainer.innerHTML = "";
    Array.from(regionSelect.options).forEach((option) => {
      const customOption = document.createElement("div");
      customOption.className = "custom-option";
      customOption.textContent = option.text;
      customOption.dataset.value = option.value;

      if (option.selected) {
        customOption.classList.add("is-selected");
        trigger.textContent = option.text;
      }

      customOption.addEventListener("click", (e) => {
        e.stopPropagation();
        regionSelect.value = customOption.dataset.value;

        trigger.textContent = customOption.textContent;
        wrapper.classList.remove("is-open");

        const siblings = optionsContainer.querySelectorAll(".custom-option");
        siblings.forEach((opt) => opt.classList.remove("is-selected"));
        customOption.classList.add("is-selected");

        regionSelect.dispatchEvent(new Event("change"));
      });

      optionsContainer.appendChild(customOption);
    });

    if (!trigger.textContent && regionSelect.options.length > 0) {
      const selected = regionSelect.options[regionSelect.selectedIndex];
      if (selected) {
        trigger.textContent = selected.text;
      }
    }
  };

  updateOptions();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.toggle("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove("is-open");
    }
  });
};

const populateRegions = () => {
  if (!regionSelect || !Array.isArray(VENUES)) {
    return;
  }

  const seenRegions = new Map();
  for (let i = 0; i < VENUES.length; i += 1) {
    const venue = VENUES[i];
    const rawLabel = resolveRegionLabel(venue.region, LOCALE);
    const label = rawLabel ? rawLabel.trim() : "";
    if (!label) {
      continue;
    }

    const key = normalizeRegionKey(label);
    if (!key || seenRegions.has(key)) {
      continue;
    }

    seenRegions.set(key, label);
  }

  const order = (REGION_ORDER[LOCALE] || []).map((label) => normalizeRegionKey(label));
  const localeForSort = LOCALE === "ko" ? "ko-KR" : "en-US";

  const uniqueRegions = Array.from(seenRegions.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => {
      const indexA = order.indexOf(a.key);
      const indexB = order.indexOf(b.key);

      if (indexA === -1 && indexB === -1) {
        return a.label.localeCompare(b.label, localeForSort);
      }

      if (indexA === -1) {
        return 1;
      }

      if (indexB === -1) {
        return -1;
      }

      return indexA - indexB;
    });

  const fragment = document.createDocumentFragment();
  uniqueRegions.forEach(({ key, label }) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    option.setAttribute("data-region-label", label);
    fragment.appendChild(option);
  });

  regionSelect.appendChild(fragment);

  // 브라우저가 뒤로가기로 값을 복원했는지 확인
  // 복원되지 않았을 때만 기본값 설정
  if (!regionSelect.value || regionSelect.value === "") {
    regionSelect.value = "all";
  }

  initCustomSelect();
};

const createTag = (style) => {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = STRINGS.styles[style] || style;
  return tag;
};

const resolveLinkLabel = (descriptor) => {
  if (descriptor.label) {
    if (typeof descriptor.label === "string") {
      return descriptor.label;
    }
    if (typeof descriptor.label === "object") {
      return descriptor.label[LOCALE] || descriptor.label.en || descriptor.label.ko;
    }
  }
  if (descriptor.type === "phone" && STRINGS.contactFallback) {
    return STRINGS.contactFallback;
  }
  return STRINGS.linkLabels[descriptor.type] || descriptor.type;
};

const createLink = (descriptor, options = {}) => {
  const variant = options.variant === "default" ? "default" : "chip";
  const labelText = resolveLinkLabel(descriptor);
  const isDisabled = Boolean(descriptor.disableLink || !descriptor.url);
  const link = document.createElement(isDisabled ? "div" : "a");
  link.className = "venue-card__link";
  if (variant === "chip") {
    link.classList.add("venue-card__link--chip");
  }
  if (isDisabled) {
    link.classList.add("venue-card__link--disabled");
    link.setAttribute("aria-disabled", "true");
    link.tabIndex = -1;
    if (STRINGS.disabledLinkTitle) {
      link.setAttribute("title", STRINGS.disabledLinkTitle);
    }
    if (labelText && STRINGS.disabledLinkBadge) {
      link.setAttribute("aria-label", `${labelText} (${STRINGS.disabledLinkBadge})`);
    }
  } else {
    link.href = descriptor.url;
    link.target = "_blank";
    link.rel = "noopener";
  }
  const iconNode = createLinkIcon(descriptor.type);
  if (iconNode) {
    link.appendChild(iconNode);
  }
  const labelNode = document.createElement("span");
  labelNode.className = "venue-card__link-label";
  const suffixMatch = labelText.match(/^(.*?)(\s*\(.*\))$/);
  if (suffixMatch && suffixMatch[2]) {
    const prefix = suffixMatch[1]?.trimEnd() || "";
    const suffix = suffixMatch[2].trim();
    const suffixSpan = document.createElement("span");
    suffixSpan.className = "venue-card__link-label-suffix";
    suffixSpan.textContent = suffix;
    if (prefix) {
      labelNode.appendChild(document.createTextNode(prefix));
      suffixSpan.classList.add("venue-card__link-label-suffix--spaced");
    }
    labelNode.appendChild(suffixSpan);
  } else {
    labelNode.textContent = labelText;
  }
  link.appendChild(labelNode);
  if (isDisabled && STRINGS.disabledLinkBadge) {
    const badge = document.createElement("span");
    badge.className = "venue-card__link-badge";
    badge.textContent = STRINGS.disabledLinkBadge;
    link.appendChild(badge);
  }
  return link;
};

const renderVenues = (venues, append = false) => {
  if (!resultsContainer) {
    return;
  }

  if (!append) {
    resultsContainer.innerHTML = "";
  }

  if (!venues.length) {
    const empty = document.createElement("p");
    empty.className = "venue-empty";
    empty.textContent = STRINGS.emptyMessage;
    resultsContainer.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  venues.forEach((venue, index) => {
    const card = document.createElement("article");
    card.className = "venue-card";
    card.id = venue.id;
    card.setAttribute("role", "listitem");

    const name = document.createElement("h3");
    name.className = "venue-card__name";
    name.textContent = venue.name[LOCALE] || venue.name.en || venue.name.ko;

    const meta = document.createElement("p");
    meta.className = "venue-card__meta";
    const cityLabel = venue.city?.[LOCALE] || venue.city?.en || venue.city?.ko || "";
    const addressLabel = venue.address?.[LOCALE] || venue.address?.en || venue.address?.ko;
    if (addressLabel && isCityRepeatedInAddress(cityLabel, addressLabel)) {
      meta.textContent = addressLabel;
    } else if (addressLabel && cityLabel) {
      meta.textContent = `${cityLabel}\n${addressLabel}`;
    } else {
      meta.textContent = cityLabel || addressLabel || "";
    }
    const hasFullAddress = typeof addressLabel === "string" && /\d/.test(addressLabel);
    if (hasFullAddress) {
      const actionRow = document.createElement("div");
      actionRow.className = "venue-card__action-row";

      const mapLink = document.createElement("a");
      mapLink.className = "venue-card__map-link";
      mapLink.href = `https://map.kakao.com/?q=${encodeURIComponent(addressLabel)}`;
      mapLink.target = "_blank";
      mapLink.rel = "noopener";
      mapLink.textContent = STRINGS.mapInlineLink;
      actionRow.appendChild(mapLink);

      const copyBtn = document.createElement("button");
      copyBtn.className = "venue-card__copy-btn";
      copyBtn.type = "button";
      copyBtn.textContent = STRINGS.copyAddress;

      let resetTimeout;

      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(addressLabel);
          
          copyBtn.textContent = STRINGS.copyAddressCopied;
          copyBtn.classList.add("venue-card__copy-btn--copied");
          copyBtn.disabled = true;

          if (resetTimeout) {
            clearTimeout(resetTimeout);
          }

          resetTimeout = setTimeout(() => {
            copyBtn.textContent = STRINGS.copyAddress;
            copyBtn.classList.remove("venue-card__copy-btn--copied");
            copyBtn.disabled = false;
            resetTimeout = null;
          }, 2000);
        } catch (err) {
          console.error("Failed to copy address: ", err);
        }
      });
      actionRow.appendChild(copyBtn);
      meta.appendChild(actionRow);
    }

    const summary = document.createElement("p");
    summary.className = "venue-card__summary";
    summary.textContent = venue.summary[LOCALE] || venue.summary.en || venue.summary.ko;

    let scheduleNode = null;
    const scheduleText = venue.schedule?.[LOCALE] || venue.schedule?.en || venue.schedule?.ko;
    if (scheduleText) {
      scheduleNode = document.createElement("p");
      scheduleNode.className = "venue-card__schedule";
      scheduleNode.textContent = scheduleText;
    }

    const tags = document.createElement("div");
    tags.className = "venue-card__tags";
    venue.styles.forEach((style) => {
      tags.appendChild(createTag(style));
    });

    const contentFragment = document.createDocumentFragment();

    if (venue.image) {
      enqueueImagePreload(venue.image);
      const media = document.createElement("figure");
      media.className = "venue-card__media";

      const img = document.createElement("img");
      img.className = "venue-card__image";
      img.src = venue.image;
      img.alt = venue.imageAlt?.[LOCALE] || venue.imageAlt?.en || venue.imageAlt?.ko || venue.name[LOCALE] || venue.name.en || venue.name.ko;
      const shouldEagerLoad = index < 4;
      img.loading = shouldEagerLoad ? "eager" : "lazy";
      img.decoding = "async";
      if (shouldEagerLoad && typeof img.fetchPriority === "string") {
        img.fetchPriority = "high";
      }
      if (venue.imageFit === "contain") {
        img.classList.add("venue-card__image--contain");
      }

      media.appendChild(img);
      contentFragment.appendChild(media);
    }

    contentFragment.append(name, meta, summary);
    if (scheduleNode) {
      contentFragment.appendChild(scheduleNode);
    }
    contentFragment.appendChild(tags);

    const linkDescriptors = Array.isArray(venue.links)
      ? venue.links.map((descriptor, originalIndex) => ({
        ...descriptor,
        __originalIndex: originalIndex
      }))
      : [];
    if (linkDescriptors.length) {
      const sortedLinks = linkDescriptors.sort((a, b) => {
        const indexA = LINK_DISPLAY_ORDER.indexOf(a.type);
        const indexB = LINK_DISPLAY_ORDER.indexOf(b.type);
        if (indexA !== indexB) {
          const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
          const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
          if (safeIndexA !== safeIndexB) {
            return safeIndexA - safeIndexB;
          }
        }
        const resolveOrder = (descriptor) => {
          if (typeof descriptor.displayOrder === "number") {
            return descriptor.displayOrder;
          }
          if (typeof descriptor.__originalIndex === "number") {
            return descriptor.__originalIndex;
          }
          return Number.MAX_SAFE_INTEGER;
        };
        const orderA = resolveOrder(a);
        const orderB = resolveOrder(b);
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        const labelA = resolveLinkLabel(a).toLowerCase();
        const labelB = resolveLinkLabel(b).toLowerCase();
        return labelA.localeCompare(labelB, LOCALE === "ko" ? "ko-KR" : "en-US");
      });

      const contactLinks = sortedLinks.filter((descriptor) => descriptor.type === "phone");
      const kakaoLinks = sortedLinks.filter((descriptor) => descriptor.type === "kakaotalk");
      const socialLinks = sortedLinks.filter(
        (descriptor) => descriptor.type !== "phone" && descriptor.type !== "kakaotalk"
      );

      const appendContactSection = (links, titleText) => {
        if (!links.length) {
          return;
        }

        const contactBlock = document.createElement("div");
        contactBlock.className = "venue-card__contacts";

        const contactTitle = document.createElement("p");
        contactTitle.className = "venue-card__contacts-title";
        contactTitle.textContent = titleText;
        contactBlock.appendChild(contactTitle);

        const contactGrid = document.createElement("div");
        contactGrid.className = "venue-card__contacts-grid";
        if (links.length === 1) {
          contactGrid.classList.add("venue-card__contacts-grid--single");
        }

        links.forEach((descriptor) => {
          const resolvedDescriptor = descriptor.label
            ? descriptor
            : {
              ...descriptor,
              label:
                venue.name?.[LOCALE] ||
                venue.name?.en ||
                venue.name?.ko ||
                STRINGS.contactFallback
            };
          const contactLink = createLink(resolvedDescriptor, { variant: "default" });
          contactLink.classList.add("venue-card__link--contact");
          contactGrid.appendChild(contactLink);
        });

        contactBlock.appendChild(contactGrid);
        contentFragment.appendChild(contactBlock);
      };

      appendContactSection(contactLinks, STRINGS.linkLabels.phone || STRINGS.contactFallback);
      appendContactSection(kakaoLinks, STRINGS.linkLabels.kakaotalk || "KakaoTalk");

      if (socialLinks.length) {
        const links = document.createElement("div");
        links.className = "venue-card__links";
        const linkVariant = venue.linkDisplay === "buttons" ? "default" : "chip";
        if (linkVariant === "chip") {
          links.classList.add("venue-card__links--chips");
        }
        socialLinks.forEach((descriptor) => {
          links.appendChild(createLink(descriptor, { variant: linkVariant }));
        });
        contentFragment.appendChild(links);
      }
    }
    card.appendChild(contentFragment);
    fragment.appendChild(card);
  });

  resultsContainer.appendChild(fragment);
};

const applyFilters = () => {
  const regionValue = normalizeRegionValue(regionSelect?.value || "all", STRINGS.regionsAll);
  const searchValue = (searchInput?.value || "").trim().toLowerCase();

  const filtered = VENUES.filter((venue) =>
    matchesFilters(
      venue,
      {
        region: regionValue,
        search: searchValue
      },
      LOCALE
    )
  );

  shuffleArray(filtered);

  currentFilteredVenues = filtered;

  if (countNode) {
    countNode.textContent = formatCount(filtered.length, STRINGS);
  }

  if (!resultsContainer) return;
  renderVenues(currentFilteredVenues);
};

const registerEvents = () => {
  regionSelect?.addEventListener("change", applyFilters);

  if (searchInput) {
    let debounceId = null;
    searchInput.addEventListener("input", () => {
      if (debounceId) {
        window.clearTimeout(debounceId);
      }
      debounceId = window.setTimeout(applyFilters, 180);
    });
  }

  filterForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (searchInput) {
      searchInput.blur();
    }
    applyFilters();
  });
};

populateRegions();
registerEvents();

// 초기 필터 적용 - 브라우저가 폼 값을 복원할 시간을 줌
setTimeout(applyFilters, 0);

// 뒤로가기로 페이지 복원 시 필터 재적용
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // 페이지가 bfcache에서 복원된 경우
    setTimeout(applyFilters, 0);
  }
});

if (supportsImagePreload && typeof document !== "undefined") {
  const handleReadyState = () => {
    startImagePreloading();
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    handleReadyState();
  } else {
    document.addEventListener("DOMContentLoaded", handleReadyState, { once: true });
  }
}

// 맨위로 가기 버튼
const initScrollTop = () => {
  const button = document.querySelector('.scroll-top');
  if (!button) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const threshold = 200;
  let ticking = false;

  const resetInlineStyles = () => {
    button.style.background = "";
    button.style.borderColor = "";
    button.style.boxShadow = "";
    button.style.color = "";
  };

  const updateVisibility = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (scrollY > threshold) {
      button.classList.add("is-visible");
      button.style.display = "flex"; // Ensure it's visible
    } else {
      button.classList.remove("is-visible");
      button.style.display = "none"; // Force hide
      resetInlineStyles();
    }
    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateVisibility);
      ticking = true;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  updateVisibility();

  // 터치 디바이스용 hover 효과
  const applyTouchStyles = () => {
    button.style.background = 'rgba(255, 124, 79, 0.25)';
    button.style.borderColor = 'rgba(255, 124, 79, 0.4)';
    button.style.boxShadow = '0 6px 20px rgba(255, 124, 79, 0.3)';
    button.style.color = '#ff7c4f';
  };

  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      applyTouchStyles();
    }
  }, { passive: true });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    button.addEventListener(eventName, resetInlineStyles, { passive: true });
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth"
    });

    resetInlineStyles();
  });
};

initScrollTop();

const initFooterDates = () => {
  const yearNodes = document.querySelectorAll('[data-current-year]');
  if (!yearNodes.length) {
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  yearNodes.forEach((node) => {
    node.textContent = String(year);
  });

  const noteNodes = document.querySelectorAll('[data-updated-note]');
  if (!noteNodes.length) {
    return;
  }

  const monthIndex = now.getMonth() + 1;

  if (LOCALE === "ko") {
    const noteText = `링크는 ${year}년 ${monthIndex}월 기준 공용 공개 채널을 참고했으며 변동될 수 있습니다.`;
    noteNodes.forEach((node) => {
      node.textContent = noteText;
    });
    return;
  }

  if (LOCALE === "es") {
    const monthName = new Intl.DateTimeFormat("es", { month: "long" }).format(now);
    const noteText = `Todos los listados fueron verificados in ${monthName} de ${year} y pueden cambiar sin previo aviso.`;
    noteNodes.forEach((node) => {
      node.textContent = noteText;
    });
    return;
  }

  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(now);
  const noteText = `All listings were verified in ${monthName} ${year} and may change without notice.`;
  noteNodes.forEach((node) => {
    node.textContent = noteText;
  });
};

initFooterDates();

const cleanupServiceWorkers = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (window.location.protocol === "file:") {
    return;
  }

  const unregisterAll = () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      })
      .catch(() => {
        /* noop */
      });
  };

  if (document.readyState === "complete") {
    unregisterAll();
  } else {
    window.addEventListener("load", unregisterAll);
  }
};

cleanupServiceWorkers();
