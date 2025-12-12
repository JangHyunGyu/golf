(function initializeVenues(root) {
  const sources = [];
  const moduleLoaders = [
  ["./data/seoul", "SEOUL_VENUES"],
  ["./data/daejeon", "DAEJEON_VENUES"],
  ["./data/gyeonggi", "GYEONGGI_VENUES"],
    ["./data/daegu", "DAEGU_VENUES"],
    ["./data/gyeongsangbukdo", "GYEONGSANGBUKDO_VENUES"],
    ["./data/gyeongsangnamdo", "GYEONGSANGNAMDO_VENUES"],
    ["./data/busan", "BUSAN_VENUES"],
    ["./data/ulsan", "ULSAN_VENUES"],
    ["./data/jeonbuk", "JEONBUK_VENUES"],
    ["./data/jeonnam", "JEONNAM_VENUES"],
    ["./data/gwangju", "GWANGJU_VENUES"],
    ["./data/jeju", "JEJU_VENUES"],
    ["./data/incheon", "INCHEON_VENUES"],
    ["./data/gangwon", "GANGWON_VENUES"],
    ["./data/chungbuk", "CHUNGBUK_VENUES"],
    ["./data/chungnam", "CHUNGNAM_VENUES"]
  ];

  if (typeof module !== "undefined" && module.exports) {
    for (let i = 0; i < moduleLoaders.length; i += 1) {
      try {
        const loaded = require(moduleLoaders[i][0]);
        if (loaded && typeof loaded === "object" && Array.isArray(loaded.default)) {
          sources.push(loaded.default);
        } else if (Array.isArray(loaded)) {
          sources.push(loaded);
        } else {
          sources.push([]);
        }
      } catch (error) {
        sources.push([]);
      }
    }
  } else {
    for (let j = 0; j < moduleLoaders.length; j += 1) {
      const globalKey = moduleLoaders[j][1];
      if (root && root[globalKey] && Array.isArray(root[globalKey])) {
        sources.push(root[globalKey]);
      } else {
        sources.push([]);
      }
    }
  }

  const VENUES = sources.reduce(function flatten(accumulator, current) {
    if (Array.isArray(current)) {
      return accumulator.concat(current);
    }
    return accumulator;
  }, []);

  if (root) {
    root.VENUES = VENUES;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = VENUES;
  }
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
