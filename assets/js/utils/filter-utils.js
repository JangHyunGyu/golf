(function initializeFilterUtils(root) {
  const toStringSafe = (value) => (value == null ? "" : String(value));

  const normalizeRegionKey = (value) => toStringSafe(value).trim().toLowerCase();

  const REGION_TRANSLATIONS = {
    es: {
      "Seoul": "Seúl",
      "Busan": "Busán",
      "Chungnam": "Chungcheongnam-do",
      "Jeolla": "Jeolla-do"
    }
  };

  const resolveRegionLabel = (regionData, locale) => {
    if (!regionData) {
      return "";
    }

    if (typeof regionData === "string") {
      return regionData;
    }

    const directLocaleValue = regionData[locale];
    if (directLocaleValue) {
      return directLocaleValue;
    }

    const baseLocale = locale && locale.split("-")[0];
    if (baseLocale && regionData[baseLocale]) {
      return regionData[baseLocale];
    }

    const fallback = regionData.en || regionData.ko || "";
    if (baseLocale === "es" && REGION_TRANSLATIONS.es[fallback]) {
      return REGION_TRANSLATIONS.es[fallback];
    }

    return fallback;
  };

  const normalizeRegionValue = (value, regionsAllLabel) => {
    const normalizedLabel = normalizeRegionKey(regionsAllLabel);
    const normalizedValue = normalizeRegionKey(value);

    if (!normalizedValue) {
      return "all";
    }

    if (normalizedValue === "all" || (normalizedLabel && normalizedValue === normalizedLabel)) {
      return "all";
    }

    return normalizedValue;
  };

  const matchesFilters = (venue, filters, locale) => {
    const normalizedRegionFilter = normalizeRegionKey(filters.region);
    const searchValue = toStringSafe(filters.search).trim().toLowerCase();

    if (normalizedRegionFilter && normalizedRegionFilter !== "all") {
      const venueRegion = resolveRegionLabel(venue.region, locale);
      const normalizedVenueRegion = normalizeRegionKey(venueRegion);

      if (!normalizedVenueRegion || normalizedVenueRegion !== normalizedRegionFilter) {
        return false;
      }
    }

    if (searchValue) {
      const searchTarget = [
        venue.name?.[locale],
        venue.region?.[locale],
        venue.city?.[locale],
        venue.summary?.[locale]
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchTarget.includes(searchValue)) {
        return false;
      }
    }

    return true;
  };

  const formatCount = (count, strings) =>
    count === 0 ? strings.countEmpty : strings.count(count);

  const isCityRepeatedInAddress = (cityLabel = "", addressLabel = "") => {
    if (!cityLabel || !addressLabel) {
      return false;
    }

    const tokens = cityLabel.split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      return false;
    }

    const lowerAddress = addressLabel.toLowerCase();
    return tokens.every((token) => lowerAddress.includes(token.toLowerCase()));
  };

  const shuffleArray = (items) => {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }
    return items;
  };

  const filterUtils = {
    normalizeRegionValue,
    matchesFilters,
    formatCount,
    isCityRepeatedInAddress,
    shuffleArray,
    resolveRegionLabel,
    normalizeRegionKey
  };

  if (root) {
    root.FilterUtils = filterUtils;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = filterUtils;
  }
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
