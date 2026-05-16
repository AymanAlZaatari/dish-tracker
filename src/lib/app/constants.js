import packageJson from "../../../package.json";

export const STORAGE_KEY = "dish-tracker-webapp-v2";
export const APP_VERSION = `v${packageJson.version}`;
export const CLOUD_DOC_VERSION = 1;
export const ORDER_TYPES = ["Dine-in", "Delivery", "Takeaway"];
export const ORDER_TYPE_BADGE_STYLES = {
  "Dine-in": "bg-emerald-50 text-emerald-800 border-emerald-200",
  Delivery: "bg-sky-50 text-sky-800 border-sky-200",
  Takeaway: "bg-amber-50 text-amber-800 border-amber-200",
};
export const PORTION_SIZES = [
  "Taster",
  "Kids",
  "Not enough for adult",
  "Adult",
  "Big adult",
  "Shareable",
  "Huge",
];
export const DEFAULT_CUISINES = [
  "Lebanese",
  "Italian",
  "Japanese",
  "American",
  "Mexican",
  "Indian",
  "Chinese",
  "Thai",
  "Turkish",
  "French",
  "Fast Food",
  "Bakery",
  "Dessert",
  "Cafe",
  "Pizza",
  "Burgers",
  "Seafood",
  "Sushi",
  "Middle Eastern",
];
export const DEFAULT_AREAS = [
  "Achrafieh",
  "Aley",
  "Amchit",
  "Antelias",
  "Baabda",
  "Baalbek",
  "Batroun",
  "Beirut",
  "Bhamdoun",
  "Bint Jbeil",
  "Broummana",
  "Byblos",
  "Chekka",
  "Chouf",
  "Dbayeh",
  "Deir El Qamar",
  "Ehden",
  "Halat",
  "Hamra",
  "Hazmieh",
  "Jal El Dib",
  "Jbeil",
  "Jezzine",
  "Jounieh",
  "Kaslik",
  "Kfardebian",
  "Koura",
  "Mansourieh",
  "Mar Mikhael",
  "Matn",
  "Mina",
  "Mkalles",
  "Nabatieh",
  "Saida",
  "Sin El Fil",
  "Sour",
  "Tripoli",
  "Verdun",
  "Zahle",
  "Zalka",
  "Zgharta",
];
export const DEFAULT_CITIES = [
  "Beirut",
  "Metn",
  "Keserwan",
  "Mount Lebanon",
];
export const VALUE_OPTIONS = [
  "Hidden gem",
  "A win",
  "Fairly priced",
  "Overpriced",
  "Rip-off",
];
export const TRI_STATE_VALUES = {
  YES: "yes",
  NO: "no",
  UNKNOWN: "unknown",
};
export const TRI_STATE_OPTIONS = [
  { value: TRI_STATE_VALUES.YES, label: "Yes" },
  { value: TRI_STATE_VALUES.NO, label: "No" },
  { value: TRI_STATE_VALUES.UNKNOWN, label: "N/A" },
];
export const MUSIC_LEVEL_VALUES = {
  LOW: "low",
  HIGH: "high",
  UNKNOWN: "unknown",
};
export const MUSIC_LEVEL_OPTIONS = [
  { value: MUSIC_LEVEL_VALUES.LOW, label: "Low" },
  { value: MUSIC_LEVEL_VALUES.HIGH, label: "High" },
  { value: MUSIC_LEVEL_VALUES.UNKNOWN, label: "N/A" },
];
export const RESTAURANT_SAFETY_FIELDS = [
  {
    key: "kidsFriendly",
    label: "Kids Friendly",
    positiveLabel: "Kids Friendly",
    negativeLabel: "Not Kids Friendly",
    unknownLabel: "Kids Unknown",
  },
  {
    key: "halalChecked",
    label: "Halal Checked",
    positiveLabel: "Halal Checked",
    negativeLabel: "Not Halal Checked",
    unknownLabel: "Halal Unknown",
  },
  {
    key: "noAlcohol",
    label: "No Alcohol",
    positiveLabel: "No Alcohol",
    negativeLabel: "Alcohol",
    unknownLabel: "Alcohol Unknown",
  },
  {
    key: "noPork",
    label: "No Pork",
    positiveLabel: "No Pork",
    negativeLabel: "Pork",
    unknownLabel: "Pork Unknown",
  },
  {
    key: "dedicatedSmokingArea",
    label: "Dedicated Smoking Area",
    positiveLabel: "Dedicated Smoking Area",
    negativeLabel: "No Dedicated Smoking Area",
    unknownLabel: "Smoking Area Unknown",
  },
];
export const RESTAURANT_ALERT_LEVELS = [
  { value: "no_or_unknown", label: "No or Don't Know" },
  { value: "no_only", label: "No only" },
  { value: "never", label: "Never" },
];
export const MUSIC_ALERT_LEVELS = [
  { value: "high_or_unknown", label: "High or N/A" },
  { value: "high_only", label: "High only" },
  { value: "never", label: "Never" },
];
export const TOP_NAV_STYLES = {
  dashboard: "bg-sky-50 text-sky-900 border-sky-200 data-[state=active]:bg-sky-100 data-[state=active]:text-sky-950 data-[state=active]:ring-2 data-[state=active]:ring-sky-300",
  restaurants: "bg-emerald-50 text-emerald-900 border-emerald-200 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-950 data-[state=active]:ring-2 data-[state=active]:ring-emerald-300",
  dishes: "bg-amber-50 text-amber-900 border-amber-200 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-950 data-[state=active]:ring-2 data-[state=active]:ring-amber-300",
  experiences: "bg-rose-50 text-rose-900 border-rose-200 data-[state=active]:bg-rose-100 data-[state=active]:text-rose-950 data-[state=active]:ring-2 data-[state=active]:ring-rose-300",
  settings: "bg-violet-50 text-violet-900 border-violet-200 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-950 data-[state=active]:ring-2 data-[state=active]:ring-violet-300",
};
export const DASHBOARD_CARD_STYLES = {
  Restaurants: "border-emerald-200 bg-emerald-50",
  Dishes: "border-amber-200 bg-amber-50",
  Experiences: "border-rose-200 bg-rose-50",
  Tried: "border-sky-200 bg-sky-50",
  Wishlist: "border-pink-200 bg-pink-50",
  "Avg Dish Rating": "border-violet-200 bg-violet-50",
};
export const SECTION_CONTAINER = "rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4 md:p-5";
export const TOP_ACTION_BUTTON_STYLES = {
  addDish: "!border-blue-600 !bg-blue-600 !text-white hover:!bg-blue-700",
  addRestaurant: "!border-emerald-200 !bg-emerald-50 !text-emerald-900 hover:!bg-emerald-100",
  addExperience: "!border-rose-200 !bg-rose-50 !text-rose-900 hover:!bg-rose-100",
  import: "!border-sky-200 !bg-sky-50 !text-sky-900 hover:!bg-sky-100",
  export: "!border-sky-200 !bg-sky-50 !text-sky-900 hover:!bg-sky-100",
  seed: "!border-amber-300 !bg-amber-100 !text-amber-900 hover:!bg-amber-200",
  auth: "!border-red-300 !bg-red-100 !text-red-800 hover:!bg-red-200",
};
export const SAVE_BUTTON_STYLE = "!border-emerald-600 !bg-emerald-600 !text-white hover:!border-emerald-700 hover:!bg-emerald-700";
export const CANCEL_BUTTON_STYLE = "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200";
export const EDIT_BUTTON_STYLE = "!border-blue-300 !bg-blue-100 !text-blue-800 hover:!bg-blue-200";
export const DELETE_BUTTON_STYLE = "!border-red-300 !bg-red-100 !text-red-800 hover:!bg-red-200";
export const VIEW_BUTTON_STYLE = "!border-sky-300 !bg-sky-100 !text-sky-800 hover:!bg-sky-200";
export const LOG_BUTTON_STYLE = "!border-amber-300 !bg-amber-100 !text-amber-800 hover:!bg-amber-200";
export const LOG_EXPERIENCE_BUTTON_STYLE = "!border-violet-300 !bg-violet-100 !text-violet-800 hover:!bg-violet-200";
