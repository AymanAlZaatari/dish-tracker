import { doc } from "firebase/firestore";

import { db } from "../firebase";
import {
  DEFAULT_AREAS,
  DEFAULT_CITIES,
  DEFAULT_CUISINES,
  STORAGE_KEY,
  VALUE_OPTIONS,
} from "./constants";

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function createSampleData() {
  const cedarBiteId = uid();
  const cedarBiteHamraBranchId = uid();
  const cedarBiteAchrafiehBranchId = uid();
  const falafelHubId = uid();
  const falafelHubVerdunBranchId = uid();
  const falafelHubHamraBranchId = uid();
  const falafelHubMarMikhaelBranchId = uid();
  const nonaSliceId = uid();
  const nonaSliceDbayehBranchId = uid();
  const sushiLoopId = uid();
  const sushiLoopJalElDibBranchId = uid();
  const sushiLoopHamraBranchId = uid();
  const burgerYardId = uid();
  const burgerYardJouniehBranchId = uid();
  const burgerYardHamraBranchId = uid();
  const burgerYardDbayehBranchId = uid();
  const sweetLeafId = uid();
  const sweetLeafBadaroBranchId = uid();

  const cheeseManousheId = uid();
  const tawoukWrapId = uid();
  const falafelSandwichId = uid();
  const spicyPotatoesId = uid();
  const trufflePizzaId = uid();
  const tiramisuId = uid();
  const acaiBowlId = uid();
  const salmonMakiId = uid();
  const dragonRollId = uid();
  const wagyuBurgerId = uid();
  const loadedFriesId = uid();
  const moltenCookieId = uid();
  const avocadoToastId = uid();
  const pistachioCheesecakeId = uid();

  return {
    settings: {
      defaultRestaurantStatsView: "cards",
      defaultRestaurantHalalChecked: true,
    },
    cuisines: DEFAULT_CUISINES,
    areas: DEFAULT_AREAS,
    cities: DEFAULT_CITIES,
    tagColors: {
      cheesy: "#2563eb",
      breakfast: "#f59e0b",
      crispy: "#f97316",
      spicy: "#ef4444",
      comfort: "#8b5cf6",
      fresh: "#10b981",
      dessert: "#ec4899",
    },
    restaurants: [
      {
        id: cedarBiteId,
        name: "Cedar Bite",
        cuisines: ["Lebanese"],
        rating: 4,
        notes: "Reliable for breakfast and quick late-night orders.",
        recommendedBy: "Rami",
        halalChecked: true,
        kidsFriendly: true,
        noAlcohol: true,
        noPork: true,
      },
      {
        id: falafelHubId,
        name: "Falafel Hub",
        cuisines: ["Middle Eastern"],
        rating: 5,
        notes: "Fast service and very consistent wraps.",
        recommendedBy: "Nadine",
        halalChecked: true,
        kidsFriendly: false,
        noAlcohol: true,
        noPork: true,
      },
      {
        id: nonaSliceId,
        name: "Nona Slice",
        cuisines: ["Italian", "Pizza"],
        rating: 4,
        notes: "Good spot for pizza nights and dessert.",
        recommendedBy: "Karim",
        halalChecked: false,
        kidsFriendly: true,
        noAlcohol: false,
        noPork: false,
      },
      {
        id: sushiLoopId,
        name: "Sushi Loop",
        cuisines: ["Japanese", "Sushi"],
        rating: 4,
        notes: "Clean flavors and good rice texture.",
        recommendedBy: "Lea",
        halalChecked: false,
        kidsFriendly: true,
        noAlcohol: false,
        noPork: true,
      },
      {
        id: burgerYardId,
        name: "Burger Yard",
        cuisines: ["American", "Burgers"],
        rating: 4,
        notes: "Strong smash burgers and late-night fries.",
        recommendedBy: "Ziad",
        halalChecked: true,
        kidsFriendly: true,
        noAlcohol: true,
        noPork: false,
      },
      {
        id: sweetLeafId,
        name: "Sweet Leaf",
        cuisines: ["Cafe", "Dessert"],
        rating: 5,
        notes: "Excellent breakfast and dessert stop.",
        recommendedBy: "Tala",
        halalChecked: true,
        kidsFriendly: true,
        noAlcohol: true,
        noPork: true,
      },
    ],
    branches: [
      {
        id: cedarBiteHamraBranchId,
        restaurantId: cedarBiteId,
        isDefault: true,
        name: "Default Branch",
        area: "Hamra",
        city: "Beirut",
        fullAddress: "Hamra, Beirut",
        locationText: "Main street near AUB",
        mapsLink: "",
        notes: "Best dine-in experience.",
      },
      {
        id: cedarBiteAchrafiehBranchId,
        restaurantId: cedarBiteId,
        isDefault: false,
        name: "Achrafieh Branch",
        area: "Achrafieh",
        city: "Beirut",
        fullAddress: "Near Sassine Square, Achrafieh",
        locationText: "Near Sassine Square",
        mapsLink: "",
        notes: "Usually faster for takeaway.",
      },
      {
        id: falafelHubVerdunBranchId,
        restaurantId: falafelHubId,
        isDefault: true,
        name: "Default Branch",
        area: "Verdun",
        city: "Beirut",
        fullAddress: "Verdun, Beirut",
        locationText: "Facing the mall entrance",
        mapsLink: "",
        notes: "",
      },
      {
        id: falafelHubHamraBranchId,
        restaurantId: falafelHubId,
        isDefault: false,
        name: "Hamra Branch",
        area: "Hamra",
        city: "Beirut",
        fullAddress: "Makdessi Street, Hamra",
        locationText: "Next to the old cinema",
        mapsLink: "",
        notes: "Good late-night stop.",
      },
      {
        id: falafelHubMarMikhaelBranchId,
        restaurantId: falafelHubId,
        isDefault: false,
        name: "Mar Mikhael Branch",
        area: "Mar Mikhael",
        city: "Beirut",
        fullAddress: "Armenia Street, Mar Mikhael",
        locationText: "Near the main bar strip",
        mapsLink: "",
        notes: "Usually busiest on weekends.",
      },
      {
        id: nonaSliceDbayehBranchId,
        restaurantId: nonaSliceId,
        isDefault: true,
        name: "Default Branch",
        area: "Dbayeh",
        city: "Metn",
        fullAddress: "Waterfront, Dbayeh",
        locationText: "Near the marina",
        mapsLink: "",
        notes: "Parking is easier on weekdays.",
      },
      {
        id: sushiLoopJalElDibBranchId,
        restaurantId: sushiLoopId,
        isDefault: true,
        name: "Default Branch",
        area: "Jal El Dib",
        city: "Metn",
        fullAddress: "Jal El Dib, Metn",
        locationText: "Near the highway exit",
        mapsLink: "",
        notes: "Quieter on weekday lunches.",
      },
      {
        id: sushiLoopHamraBranchId,
        restaurantId: sushiLoopId,
        isDefault: false,
        name: "Hamra Branch",
        area: "Hamra",
        city: "Beirut",
        fullAddress: "Bliss Street, Hamra",
        locationText: "Across from the university gate",
        mapsLink: "",
        notes: "Best for delivery coverage.",
      },
      {
        id: burgerYardJouniehBranchId,
        restaurantId: burgerYardId,
        isDefault: true,
        name: "Default Branch",
        area: "Jounieh",
        city: "Keserwan",
        fullAddress: "Jounieh, Keserwan",
        locationText: "Next to the coastal road",
        mapsLink: "",
        notes: "Best for dine-in burgers.",
      },
      {
        id: burgerYardHamraBranchId,
        restaurantId: burgerYardId,
        isDefault: false,
        name: "Hamra Branch",
        area: "Hamra",
        city: "Beirut",
        fullAddress: "Hamra Main Street",
        locationText: "Across from the pharmacy",
        mapsLink: "",
        notes: "Smaller branch but fast service.",
      },
      {
        id: burgerYardDbayehBranchId,
        restaurantId: burgerYardId,
        isDefault: false,
        name: "Dbayeh Branch",
        area: "Dbayeh",
        city: "Metn",
        fullAddress: "Dbayeh Highway Frontage",
        locationText: "Near the shopping complex",
        mapsLink: "",
        notes: "Convenient parking.",
      },
      {
        id: sweetLeafBadaroBranchId,
        restaurantId: sweetLeafId,
        isDefault: true,
        name: "Default Branch",
        area: "Badaro",
        city: "Beirut",
        fullAddress: "Badaro, Beirut",
        locationText: "Behind the main strip",
        mapsLink: "",
        notes: "Nice outdoor seating in the morning.",
      },
    ],
    dishes: [
      {
        id: cheeseManousheId,
        restaurantId: cedarBiteId,
        name: "Cheese Manoushe",
        branchId: cedarBiteHamraBranchId,
        price: 8,
        isWishlist: false,
        recommendations: ["Best fresh in the morning", "Ask for extra akkawi"],
        alerts: ["Can get oily late at night"],
        tags: ["cheesy", "breakfast", "comfort"],
        notes: "Very consistent.",
        recommendedBy: "Maya",
        portionSize: "Adult",
      },
      {
        id: tawoukWrapId,
        restaurantId: cedarBiteId,
        name: "Tawouk Wrap",
        branchId: cedarBiteAchrafiehBranchId,
        price: 11,
        isWishlist: false,
        recommendations: ["Extra garlic sauce works well"],
        alerts: ["Fries inside can go soggy on delivery"],
        tags: ["fresh", "comfort"],
        notes: "Strong lunch option.",
        recommendedBy: "Rami",
        portionSize: "Big adult",
      },
      {
        id: falafelSandwichId,
        restaurantId: falafelHubId,
        name: "Falafel Sandwich",
        branchId: falafelHubVerdunBranchId,
        price: 4,
        isWishlist: false,
        recommendations: ["Add extra pickles and parsley"],
        alerts: [],
        tags: ["crispy", "fresh"],
        notes: "Crunchy and balanced.",
        recommendedBy: "Nadine",
        portionSize: "Adult",
      },
      {
        id: spicyPotatoesId,
        restaurantId: falafelHubId,
        name: "Spicy Potatoes",
        branchId: falafelHubVerdunBranchId,
        price: 3.5,
        isWishlist: false,
        recommendations: ["Works well as a side for sharing"],
        alerts: ["Heat level varies a lot"],
        tags: ["spicy", "crispy"],
        notes: "",
        recommendedBy: "",
        portionSize: "Shareable",
      },
      {
        id: trufflePizzaId,
        restaurantId: nonaSliceId,
        name: "Truffle Mushroom Pizza",
        branchId: nonaSliceDbayehBranchId,
        price: 18,
        isWishlist: false,
        recommendations: ["Best eaten in-house"],
        alerts: ["Rich, not for every mood"],
        tags: ["cheesy", "comfort"],
        notes: "Good crust and strong mushroom flavor.",
        recommendedBy: "Karim",
        portionSize: "Shareable",
      },
      {
        id: tiramisuId,
        restaurantId: nonaSliceId,
        name: "Tiramisu",
        branchId: nonaSliceDbayehBranchId,
        price: 6.5,
        isWishlist: false,
        recommendations: ["Good to split after pizza"],
        alerts: [],
        tags: ["dessert"],
        notes: "",
        recommendedBy: "Lynn",
        portionSize: "Taster",
      },
      {
        id: acaiBowlId,
        restaurantId: nonaSliceId,
        name: "Acai Bowl",
        branchId: null,
        price: 9,
        isWishlist: true,
        recommendations: [],
        alerts: [],
        tags: ["fresh", "breakfast"],
        notes: "Looks promising for a lighter option.",
        recommendedBy: "Sara",
        portionSize: "Adult",
      },
      {
        id: salmonMakiId,
        restaurantId: sushiLoopId,
        name: "Salmon Maki",
        branchId: sushiLoopJalElDibBranchId,
        price: 7,
        isWishlist: false,
        recommendations: ["Good starter if you want something safe"],
        alerts: [],
        tags: ["fresh"],
        notes: "Simple and well executed.",
        recommendedBy: "Lea",
        portionSize: "Taster",
      },
      {
        id: dragonRollId,
        restaurantId: sushiLoopId,
        name: "Dragon Roll",
        branchId: sushiLoopJalElDibBranchId,
        price: 13,
        isWishlist: false,
        recommendations: ["Best shared with another roll"],
        alerts: ["Sauce can overpower the eel"],
        tags: ["fresh", "comfort"],
        notes: "",
        recommendedBy: "Lea",
        portionSize: "Adult",
      },
      {
        id: wagyuBurgerId,
        restaurantId: burgerYardId,
        name: "Wagyu Smash Burger",
        branchId: burgerYardJouniehBranchId,
        price: 14,
        isWishlist: false,
        recommendations: ["Medium sauce is the right balance"],
        alerts: ["Messy to eat in the car"],
        tags: ["comfort", "crispy"],
        notes: "Very good crust on the patties.",
        recommendedBy: "Ziad",
        portionSize: "Big adult",
      },
      {
        id: loadedFriesId,
        restaurantId: burgerYardId,
        name: "Loaded Fries",
        branchId: burgerYardJouniehBranchId,
        price: 6,
        isWishlist: false,
        recommendations: ["Share between two"],
        alerts: ["Gets soggy fast on delivery"],
        tags: ["cheesy", "comfort"],
        notes: "",
        recommendedBy: "",
        portionSize: "Shareable",
      },
      {
        id: moltenCookieId,
        restaurantId: burgerYardId,
        name: "Molten Cookie Skillet",
        branchId: null,
        price: 8,
        isWishlist: true,
        recommendations: [],
        alerts: [],
        tags: ["dessert"],
        notes: "Looks heavy but worth trying once.",
        recommendedBy: "Dana",
        portionSize: "Shareable",
      },
      {
        id: avocadoToastId,
        restaurantId: sweetLeafId,
        name: "Avocado Toast",
        branchId: sweetLeafBadaroBranchId,
        price: 9.5,
        isWishlist: false,
        recommendations: ["Add poached egg if hungry"],
        alerts: [],
        tags: ["breakfast", "fresh"],
        notes: "Clean and balanced breakfast option.",
        recommendedBy: "Tala",
        portionSize: "Adult",
      },
      {
        id: pistachioCheesecakeId,
        restaurantId: sweetLeafId,
        name: "Pistachio Cheesecake",
        branchId: sweetLeafBadaroBranchId,
        price: 7,
        isWishlist: false,
        recommendations: ["Best with coffee"],
        alerts: [],
        tags: ["dessert", "comfort"],
        notes: "Creamy with a strong pistachio finish.",
        recommendedBy: "Tala",
        portionSize: "Taster",
      },
    ],
    experiences: [
      {
        id: uid(),
        dishId: cheeseManousheId,
        restaurantId: cedarBiteId,
        branchId: cedarBiteHamraBranchId,
        date: daysAgo(2),
        orderType: "Dine-in",
        rating: 4,
        price: 8,
        valueForMoney: "A win",
        notes: "Crispy edges and generous cheese.",
        images: [],
      },
      {
        id: uid(),
        dishId: cheeseManousheId,
        restaurantId: cedarBiteId,
        branchId: cedarBiteAchrafiehBranchId,
        date: daysAgo(18),
        orderType: "Takeaway",
        rating: 3,
        price: 7.5,
        valueForMoney: "Fairly priced",
        notes: "Still solid, but less crisp.",
        images: [],
      },
      {
        id: uid(),
        dishId: tawoukWrapId,
        restaurantId: cedarBiteId,
        branchId: cedarBiteAchrafiehBranchId,
        date: daysAgo(5),
        orderType: "Delivery",
        rating: 4,
        price: 11,
        valueForMoney: "A win",
        notes: "Juicy chicken, bread held up well.",
        images: [],
      },
      {
        id: uid(),
        dishId: falafelSandwichId,
        restaurantId: falafelHubId,
        branchId: falafelHubVerdunBranchId,
        date: daysAgo(1),
        orderType: "Takeaway",
        rating: 5,
        price: 4,
        valueForMoney: "Hidden gem",
        notes: "Still the benchmark.",
        images: [],
      },
      {
        id: uid(),
        dishId: spicyPotatoesId,
        restaurantId: falafelHubId,
        branchId: falafelHubVerdunBranchId,
        date: daysAgo(1),
        orderType: "Takeaway",
        rating: 4,
        price: 3.5,
        valueForMoney: "Hidden gem",
        notes: "Extra coriander and chili.",
        images: [],
      },
      {
        id: uid(),
        dishId: trufflePizzaId,
        restaurantId: nonaSliceId,
        branchId: nonaSliceDbayehBranchId,
        date: daysAgo(9),
        orderType: "Dine-in",
        rating: 4,
        price: 18,
        valueForMoney: "Fairly priced",
        notes: "Rich but satisfying for two people.",
        images: [],
      },
      {
        id: uid(),
        dishId: tiramisuId,
        restaurantId: nonaSliceId,
        branchId: nonaSliceDbayehBranchId,
        date: daysAgo(9),
        orderType: "Dine-in",
        rating: 5,
        price: 6.5,
        valueForMoney: "A win",
        notes: "Light texture, not too sweet.",
        images: [],
      },
      {
        id: uid(),
        dishId: salmonMakiId,
        restaurantId: sushiLoopId,
        branchId: sushiLoopJalElDibBranchId,
        date: daysAgo(4),
        orderType: "Dine-in",
        rating: 4,
        price: 7,
        valueForMoney: "Fairly priced",
        notes: "Fresh fish and neat cuts.",
        images: [],
      },
      {
        id: uid(),
        dishId: dragonRollId,
        restaurantId: sushiLoopId,
        branchId: sushiLoopJalElDibBranchId,
        date: daysAgo(14),
        orderType: "Dine-in",
        rating: 4,
        price: 13,
        valueForMoney: "Fairly priced",
        notes: "Good texture contrast, slightly sweet sauce.",
        images: [],
      },
      {
        id: uid(),
        dishId: wagyuBurgerId,
        restaurantId: burgerYardId,
        branchId: burgerYardJouniehBranchId,
        date: daysAgo(3),
        orderType: "Dine-in",
        rating: 5,
        price: 14,
        valueForMoney: "A win",
        notes: "Excellent crust and still juicy.",
        images: [],
      },
      {
        id: uid(),
        dishId: wagyuBurgerId,
        restaurantId: burgerYardId,
        branchId: burgerYardJouniehBranchId,
        date: daysAgo(21),
        orderType: "Delivery",
        rating: 4,
        price: 14,
        valueForMoney: "Fairly priced",
        notes: "Still good, but fries were softer.",
        images: [],
      },
      {
        id: uid(),
        dishId: loadedFriesId,
        restaurantId: burgerYardId,
        branchId: burgerYardJouniehBranchId,
        date: daysAgo(3),
        orderType: "Dine-in",
        rating: 4,
        price: 6,
        valueForMoney: "Hidden gem",
        notes: "Good to share with burgers.",
        images: [],
      },
      {
        id: uid(),
        dishId: avocadoToastId,
        restaurantId: sweetLeafId,
        branchId: sweetLeafBadaroBranchId,
        date: daysAgo(6),
        orderType: "Dine-in",
        rating: 4,
        price: 9.5,
        valueForMoney: "Fairly priced",
        notes: "Fresh ingredients and good bread.",
        images: [],
      },
      {
        id: uid(),
        dishId: pistachioCheesecakeId,
        restaurantId: sweetLeafId,
        branchId: sweetLeafBadaroBranchId,
        date: daysAgo(6),
        orderType: "Dine-in",
        rating: 5,
        price: 7,
        valueForMoney: "A win",
        notes: "One of the best desserts in the seed set.",
        images: [],
      },
    ],
  };
}

export function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function migrateData(parsed) {
  const defaultRestaurantStatsView = parsed.settings?.defaultRestaurantStatsView === "rows" ? "rows" : "cards";
  const defaultRestaurantHalalChecked = parsed.settings?.defaultRestaurantHalalChecked ?? true;

  const experiences = (parsed.experiences || []).map(({ restaurantId: _restaurantId, ...e }) => ({
    valueForMoney: typeof e.valueForMoney === "number" ? VALUE_OPTIONS[Math.max(0, Math.min(VALUE_OPTIONS.length - 1, e.valueForMoney - 1))] : e.valueForMoney || "",
    images: e.images || [],
    ...e,
  }));

  const restaurants = (parsed.restaurants || []).map((r) => ({
    id: r.id,
    name: r.name || "",
    cuisines: Array.isArray(r.cuisines)
      ? r.cuisines
      : typeof r.cuisine === "string"
        ? [r.cuisine].filter(Boolean)
        : [],
    rating: r.rating ?? null,
    notes: r.notes || "",
    recommendedBy: r.recommendedBy || "",
    halalChecked: r.halalChecked ?? true,
    kidsFriendly: r.kidsFriendly ?? false,
    noAlcohol: r.noAlcohol ?? false,
    noPork: r.noPork ?? false,
  }));

  const branches = (parsed.branches || []).map((branch) => ({
    ...branch,
    isDefault: !!branch.isDefault,
    city: branch.city || "",
    fullAddress: branch.fullAddress || "",
    locationText: branch.locationText || "",
    mapsLink: branch.mapsLink || "",
    notes: branch.notes || "",
  })).map((branch, _index, allBranches) => {
    const restaurantBranches = allBranches.filter((candidate) => candidate.restaurantId === branch.restaurantId);
    const hasExplicitDefault = restaurantBranches.some((candidate) => candidate.isDefault);
    if (hasExplicitDefault) return branch;
    return {
      ...branch,
      isDefault: restaurantBranches[0]?.id === branch.id,
    };
  });

  const dishes = (parsed.dishes || []).map((d) => ({
    price: d.price ?? [...experiences]
      .filter((e) => e.dishId === d.id && e.price != null)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.price ?? null,
    recommendations: Array.isArray(d.recommendations)
      ? d.recommendations
      : typeof d.recommendations === "string"
        ? d.recommendations.split("\n").map((x) => x.trim()).filter(Boolean)
        : [],
    alerts: Array.isArray(d.alerts)
      ? d.alerts
      : typeof d.alerts === "string"
        ? d.alerts.split("\n").map((x) => x.trim()).filter(Boolean)
        : [],
    tags: Array.isArray(d.tags)
      ? d.tags
      : typeof d.tags === "string"
        ? d.tags.split(",").map((x) => x.trim()).filter(Boolean)
        : [],
    recommendedBy: d.recommendedBy || "",
    portionSize: d.portionSize || "",
    ...d,
  }));

  return {
    settings: {
      defaultRestaurantStatsView,
      defaultRestaurantHalalChecked,
    },
    cuisines: parsed.cuisines?.length ? parsed.cuisines : DEFAULT_CUISINES,
    areas: parsed.areas?.length ? parsed.areas : DEFAULT_AREAS,
    cities: parsed.cities?.length
      ? parsed.cities
      : [...new Set(branches.map((branch) => branch.city).filter(Boolean).concat(DEFAULT_CITIES))].sort(),
    tagColors: parsed.tagColors || {},
    restaurants,
    branches,
    dishes,
    experiences,
  };
}

export function loadData() {
  if (typeof window === "undefined") return createSampleData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSampleData();
  return migrateData(safeParse(raw, createSampleData()));
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dish-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function average(list) {
  const nums = list.filter((n) => n != null && !Number.isNaN(Number(n))).map(Number);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function normalizeNumericInput(value) {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export function summarizeTags(tags = [], maxChars = 24, maxItems = 3) {
  const visible = [];
  let usedChars = 0;
  for (const tag of tags) {
    if (visible.length >= maxItems) break;
    const nextChars = usedChars + tag.length;
    if (visible.length > 0 && nextChars > maxChars) break;
    visible.push(tag);
    usedChars = nextChars;
  }
  const hiddenCount = tags.length - visible.length;
  return { visible, hiddenCount };
}

export function ratingPillClass(value) {
  if (value == null) return "border-slate-200 bg-slate-50 text-slate-700";
  if (value >= 4.5) return "border-emerald-300 bg-emerald-100 text-emerald-900";
  if (value >= 3.75) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (value >= 2.75) return "border-amber-200 bg-amber-50 text-amber-800";
  if (value >= 1.75) return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-red-300 bg-red-100 text-red-900";
}

export function valuePillClass(value) {
  if (!value) return "border-slate-200 bg-slate-50 text-slate-700";
  if (value === "Hidden gem") return "border-emerald-300 bg-emerald-100 text-emerald-900";
  if (value === "A win") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (value === "Fairly priced") return "border-sky-200 bg-sky-50 text-sky-800";
  if (value === "Overpriced") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-red-300 bg-red-100 text-red-900";
}

export function normalizeDishName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function hasValidRating(value) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 1 && num <= 5;
}

export function tagChipStyle(colorValue) {
  if (!colorValue) return undefined;

  return {
    backgroundColor: `${colorValue}22`,
    borderColor: `${colorValue}55`,
    color: colorValue,
  };
}

export function serializeData(data) {
  return JSON.stringify(data);
}

export function cloudDataDoc(userId) {
  return doc(db, "userData", userId);
}
