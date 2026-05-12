import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import {
  Plus,
  Trash2,
  X,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { auth, db, hasFirebaseConfig } from "./lib/firebase";
import {
  APP_VERSION,
  CANCEL_BUTTON_STYLE,
  CLOUD_DOC_VERSION,
  DASHBOARD_CARD_STYLES,
  DELETE_BUTTON_STYLE,
  EDIT_BUTTON_STYLE,
  LOG_BUTTON_STYLE,
  LOG_EXPERIENCE_BUTTON_STYLE,
  ORDER_TYPES,
  PORTION_SIZES,
  RESTAURANT_ALERT_LEVELS,
  RESTAURANT_SAFETY_FIELDS,
  SAVE_BUTTON_STYLE,
  SECTION_CONTAINER,
  STORAGE_KEY,
  TOP_ACTION_BUTTON_STYLES,
  TOP_NAV_STYLES,
  TRI_STATE_OPTIONS,
  TRI_STATE_VALUES,
  VALUE_OPTIONS,
  VIEW_BUTTON_STYLE,
} from "./lib/app/constants";
import {
  emptyBranchForm,
  emptyDishForm,
  emptyExperienceForm,
  emptyRestaurantForm,
  inlineRestaurantFormDefault,
} from "./lib/app/forms";
import {
  average,
  cloudDataDoc,
  createSampleData,
  exportData,
  hasValidRating,
  loadData,
  migrateData,
  normalizeDishName,
  normalizeNumericInput,
  normalizeTriState,
  ratingPillClass,
  safeParse,
  serializeData,
  summarizeTags,
  tagChipStyle,
  uid,
  valuePillClass,
} from "./lib/app/data";
import { Field, ModalActions, ModalHeader, Stars, TagInput } from "./components/app/shared";
import { AuthScreen, LoadingScreen, SetupRequiredScreen } from "./components/app/screens";
import { DashboardTab } from "./components/app/tabs/dashboard-tab";
import { DishesTab } from "./components/app/tabs/dishes-tab";
import { ExperiencesTab } from "./components/app/tabs/experiences-tab";
import { RestaurantsTab } from "./components/app/tabs/restaurants-tab";
import { SettingsTab } from "./components/app/tabs/settings-tab";

function rankSuggestions(items, query, getLabel) {
  const normalizedQuery = query.trim().toLowerCase();
  const options = items.map((item) => ({ item, label: getLabel(item) }));

  return options
    .filter(({ label }) => !normalizedQuery || label.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      const aStarts = normalizedQuery ? aLabel.startsWith(normalizedQuery) : false;
      const bStarts = normalizedQuery ? bLabel.startsWith(normalizedQuery) : false;
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.label.localeCompare(b.label);
    })
    .map(({ item }) => item);
}

function TriStateSegmented({ label, value, onChange, compact = false }) {
  const currentValue = normalizeTriState(value);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <Label className="min-w-0 flex-1 text-sm font-medium leading-tight text-slate-700">{label}</Label>
      <div className="inline-grid shrink-0 grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs">
        {TRI_STATE_OPTIONS.map((option) => {
          const isActive = currentValue === option.value;
          const selectedClass = option.value === TRI_STATE_VALUES.YES
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 focus-visible:bg-emerald-200"
            : option.value === TRI_STATE_VALUES.NO
              ? "bg-red-100 text-red-800 hover:bg-red-200 focus-visible:bg-red-200"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus-visible:bg-yellow-200";
          return (
            <button
              key={option.value}
              type="button"
              className={[
                "h-8 min-w-9 px-2 font-medium text-slate-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
                option.value !== TRI_STATE_VALUES.YES ? "border-l border-slate-200" : "",
                isActive ? selectedClass : "hover:bg-slate-50",
              ].filter(Boolean).join(" ")}
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RestaurantSafetyControls({ values, onChange, compact = false }) {
  return (
    <div className={compact ? "grid gap-2 sm:grid-cols-2" : "grid gap-2 sm:grid-cols-2"}>
      {RESTAURANT_SAFETY_FIELDS.map((field) => (
        <TriStateSegmented
          key={field.key}
          label={field.label}
          value={values[field.key]}
          compact={compact}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </div>
  );
}

function DishTrackerAppContent({ data, setData, userEmail, cloudStatus, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [dishReportSearch, setDishReportSearch] = useState("");
  const [showDishNameSuggestions, setShowDishNameSuggestions] = useState(false);
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [restaurantAreaFilter, setRestaurantAreaFilter] = useState("all");
  const [restaurantCityFilter, setRestaurantCityFilter] = useState("all");
  const [restaurantCuisineFilter, setRestaurantCuisineFilter] = useState("all");
  const [restaurantKidsFilter, setRestaurantKidsFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [dishOpen, setDishOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurantForm);
  const [restaurantNameError, setRestaurantNameError] = useState("");
  const [showRestaurantNameSuggestions, setShowRestaurantNameSuggestions] = useState(false);
  const [branchForm, setBranchForm] = useState(emptyBranchForm);
  const [branchFormError, setBranchFormError] = useState("");
  const [dishForm, setDishForm] = useState(emptyDishForm);
  const [dishNameError, setDishNameError] = useState("");
  const [dishRestaurantError, setDishRestaurantError] = useState("");
  const [dishRestaurantSearch, setDishRestaurantSearch] = useState("");
  const [showDishRestaurantSuggestions, setShowDishRestaurantSuggestions] = useState(false);
  const [experienceForm, setExperienceForm] = useState(emptyExperienceForm);
  const [experienceFormError, setExperienceFormError] = useState("");
  const [experienceRatingError, setExperienceRatingError] = useState("");
  const [experienceRestaurantSearch, setExperienceRestaurantSearch] = useState("");
  const [showExperienceRestaurantSuggestions, setShowExperienceRestaurantSuggestions] = useState(false);
  const [experienceDishSearch, setExperienceDishSearch] = useState("");
  const [showExperienceDishSuggestions, setShowExperienceDishSuggestions] = useState(false);
  const [newCuisine, setNewCuisine] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newTag, setNewTag] = useState("");
  const [duplicateDishSuggestion, setDuplicateDishSuggestion] = useState(null);
  const [showInlineRestaurantForDish, setShowInlineRestaurantForDish] = useState(false);
  const [showInlineRestaurantForExperience, setShowInlineRestaurantForExperience] = useState(false);
  const [showInlineDishForExperience, setShowInlineDishForExperience] = useState(false);
  const [inlineRestaurantForDish, setInlineRestaurantForDish] = useState(inlineRestaurantFormDefault);
  const [inlineRestaurantForExperience, setInlineRestaurantForExperience] = useState(inlineRestaurantFormDefault);
  const [inlineDishForExperienceName, setInlineDishForExperienceName] = useState("");
  const [inlineDishForExperienceError, setInlineDishForExperienceError] = useState("");
  const [logExperienceWithDish, setLogExperienceWithDish] = useState(true);
  const [expandedTag, setExpandedTag] = useState(null);
  const [expandedCuisine, setExpandedCuisine] = useState(null);
  const [expandedArea, setExpandedArea] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);

  const previousExperienceDishIdRef = useRef("");
  const restaurantNameInputRef = useRef(null);
  const dishRestaurantInputRef = useRef(null);
  const dishNameInputRef = useRef(null);

  const defaultBranchByRestaurantId = useMemo(() => {
    const entries = data.restaurants.map((restaurant) => {
      const restaurantBranches = data.branches.filter((branch) => branch.restaurantId === restaurant.id);
      const defaultBranch = restaurantBranches.find((branch) => branch.isDefault) || restaurantBranches[0] || null;
      return [restaurant.id, defaultBranch];
    });
    return Object.fromEntries(entries);
  }, [data.branches, data.restaurants]);

  const restaurantsById = useMemo(() => Object.fromEntries(data.restaurants.map((restaurant) => {
    const defaultBranch = defaultBranchByRestaurantId[restaurant.id];
    return [restaurant.id, {
      ...restaurant,
      area: defaultBranch?.area || restaurant.area || "",
      city: defaultBranch?.city || restaurant.city || "",
      fullAddress: defaultBranch?.fullAddress || defaultBranch?.locationText || restaurant.fullAddress || "",
      mapsLink: defaultBranch?.mapsLink || restaurant.mapsLink || "",
      defaultBranchId: defaultBranch?.id || null,
    }];
  })), [data.restaurants, defaultBranchByRestaurantId]);
  const branchCountByRestaurantId = useMemo(() => Object.fromEntries(data.restaurants.map((restaurant) => [
    restaurant.id,
    data.branches.filter((branch) => branch.restaurantId === restaurant.id).length,
  ])), [data.branches, data.restaurants]);
  const branchesById = useMemo(() => Object.fromEntries(data.branches.map((b) => [b.id, b])), [data.branches]);
  const dishesById = useMemo(() => Object.fromEntries(data.dishes.map((d) => [d.id, d])), [data.dishes]);
  const defaultRestaurantStatsView = data.settings?.defaultRestaurantStatsView === "rows" ? "rows" : "cards";
  const restaurantFormBranchCount = restaurantForm.id ? (branchCountByRestaurantId[restaurantForm.id] || 0) : 0;
  const canEditRestaurantAddressFields = !restaurantForm.id || restaurantFormBranchCount <= 1;

  const allDishTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.tags || []))].sort(), [data.dishes]);
  const allRecommendationTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.recommendations || []))].sort(), [data.dishes]);
  const allAlertTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.alerts || []))].sort(), [data.dishes]);

  const areaOptions = useMemo(() => [...new Set([...(data.areas || []), ...Object.values(restaurantsById).map((r) => r.area).filter(Boolean), ...data.branches.map((b) => b.area).filter(Boolean)])].sort(), [data.areas, data.branches, restaurantsById]);
  const cityOptions = useMemo(() => [...new Set([...(data.cities || []), ...Object.values(restaurantsById).map((r) => r.city).filter(Boolean), ...data.branches.map((b) => b.city).filter(Boolean)])].sort(), [data.cities, data.branches, restaurantsById]);
  const restaurantFilterAreaOptions = useMemo(() => [...new Set(Object.values(restaurantsById).map((r) => r.area).filter(Boolean))].sort(), [restaurantsById]);
  const restaurantFilterCityOptions = useMemo(() => [...new Set(Object.values(restaurantsById).map((r) => r.city).filter(Boolean))].sort(), [restaurantsById]);
  const restaurantFilterCuisineOptions = useMemo(() => [...new Set(data.restaurants.flatMap((r) => r.cuisines || []))].sort(), [data.restaurants]);
  const dishFilterRestaurantOptions = useMemo(
    () => [...new Set(data.dishes.map((dish) => restaurantsById[dish.restaurantId]?.name).filter(Boolean))].sort(),
    [data.dishes, restaurantsById]
  );
  const dishFilterAreaOptions = useMemo(
    () => [...new Set(data.dishes.map((dish) => restaurantsById[dish.restaurantId]?.area).filter(Boolean))].sort(),
    [data.dishes, restaurantsById]
  );
  const dishFilterCuisineOptions = useMemo(
    () => [...new Set(data.dishes.flatMap((dish) => restaurantsById[dish.restaurantId]?.cuisines || []))].sort(),
    [data.dishes, restaurantsById]
  );
  const dishStatusOptions = useMemo(() => {
    const options = [];
    if (data.dishes.some((dish) => !dish.isWishlist)) options.push({ value: "tried", label: "Tried" });
    if (data.dishes.some((dish) => dish.isWishlist)) options.push({ value: "wishlist", label: "Wishlist" });
    return options;
  }, [data.dishes]);

  const dishExperienceMap = useMemo(() => {
    return Object.fromEntries(
      data.dishes.map((dish) => [dish.id, data.experiences.filter((e) => e.dishId === dish.id)])
    );
  }, [data.dishes, data.experiences]);

  const dishCatalogMatches = useMemo(() => {
    const query = normalizeDishName(dishForm.name || "");
    if (!query) return [];

    return data.dishes
      .filter((dish) => dish.id !== dishForm.id)
      .filter((dish) => normalizeDishName(dish.name).includes(query))
      .sort((a, b) => {
        const aCurrent = a.restaurantId === dishForm.restaurantId ? 1 : 0;
        const bCurrent = b.restaurantId === dishForm.restaurantId ? 1 : 0;
        if (aCurrent !== bCurrent) return bCurrent - aCurrent;

        const aExact = normalizeDishName(a.name) === query ? 1 : 0;
        const bExact = normalizeDishName(b.name) === query ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [data.dishes, dishForm.id, dishForm.name, dishForm.restaurantId]);

  const dishComparisonGroups = useMemo(() => {
    const groups = new Map();

    data.dishes.forEach((dish) => {
      const key = normalizeDishName(dish.name);
      if (!key) return;

      const existing = groups.get(key);
      if (existing) {
        existing.items.push(dish);
      } else {
        groups.set(key, { key, label: dish.name.trim(), items: [dish] });
      }
    });

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [data.dishes]);

  const dishComparisonSuggestions = useMemo(() => {
    const query = normalizeDishName(dishReportSearch || "");
    if (!query) return dishComparisonGroups.slice(0, 8);

    return dishComparisonGroups
      .filter((group) => normalizeDishName(group.label).includes(query))
      .slice(0, 8);
  }, [dishComparisonGroups, dishReportSearch]);

  const activeDishComparison = useMemo(() => {
    const query = normalizeDishName(dishReportSearch || "");
    if (!query) return null;

    const exactMatch = dishComparisonGroups.find((group) => group.key === query);
    if (exactMatch) return exactMatch;

    const partialMatches = dishComparisonGroups.filter((group) => group.key.includes(query));
    if (partialMatches.length === 0) return null;
    if (partialMatches.length === 1) return partialMatches[0];

    return {
      key: `search:${query}`,
      label: `Matches for "${dishReportSearch.trim()}"`,
      items: partialMatches.flatMap((group) => group.items),
      matchCount: partialMatches.length,
    };
  }, [dishComparisonGroups, dishReportSearch]);

  const activeDishComparisonRows = useMemo(() => {
    if (!activeDishComparison) return [];

    return activeDishComparison.items
      .map((dish) => {
        const restaurant = restaurantsById[dish.restaurantId];
        const branch = dish.branchId ? branchesById[dish.branchId] : null;
        const experiences = [...(dishExperienceMap[dish.id] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestExperience = experiences[0] || null;
        const avgRating = average(experiences.map((experience) => experience.rating));
        const bestRating = experiences.length ? Math.max(...experiences.map((experience) => Number(experience.rating || 0))) : null;

        return {
          dish,
          restaurant,
          branch,
          experiences,
          latestExperience,
          avgRating,
          bestRating,
        };
      })
      .sort((a, b) => {
        const avgDiff = (b.avgRating ?? -1) - (a.avgRating ?? -1);
        if (avgDiff !== 0) return avgDiff;

        const latestDiff = (b.latestExperience?.rating ?? -1) - (a.latestExperience?.rating ?? -1);
        if (latestDiff !== 0) return latestDiff;

        return b.experiences.length - a.experiences.length;
      });
  }, [activeDishComparison, branchesById, dishExperienceMap, restaurantsById]);

  const computedDishRating = (dishId) => average((dishExperienceMap[dishId] || []).map((e) => e.rating));

  const filteredDishes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.dishes.filter((dish) => {
      const restaurant = restaurantsById[dish.restaurantId];
      const haystack = [
        dish.name,
        dish.notes,
        dish.recommendations?.join(" "),
        dish.alerts?.join(" "),
        dish.tags?.join(" "),
        dish.recommendedBy,
        restaurant?.name,
        restaurant?.area,
        ...(restaurant?.cuisines || []),
      ].join(" ").toLowerCase();

      if (q && !haystack.includes(q)) return false;
      if (restaurantFilter !== "all" && restaurant?.name !== restaurantFilter) return false;
      if (areaFilter !== "all" && restaurant?.area !== areaFilter) return false;
      if (cuisineFilter !== "all" && !(restaurant?.cuisines || []).includes(cuisineFilter)) return false;
      if (statusFilter === "wishlist" && !dish.isWishlist) return false;
      if (statusFilter === "tried" && dish.isWishlist) return false;
      return true;
    });
  }, [data.dishes, restaurantsById, search, restaurantFilter, areaFilter, cuisineFilter, statusFilter]);

  const filteredRestaurants = useMemo(() => {
    const q = restaurantSearch.trim().toLowerCase();

    return data.restaurants.map((restaurant) => restaurantsById[restaurant.id] || restaurant).filter((restaurant) => {
      const restaurantBranches = data.branches.filter((branch) => branch.restaurantId === restaurant.id);
      const restaurantDishes = data.dishes.filter((dish) => dish.restaurantId === restaurant.id);

      const haystack = [
        restaurant.name,
        restaurant.area,
        restaurant.city,
        ...(restaurant.cuisines || []),
        restaurant.fullAddress,
        restaurant.notes,
        restaurant.recommendedBy,
        ...restaurantBranches.flatMap((branch) => [branch.name, branch.area, branch.city, branch.fullAddress, branch.locationText, branch.notes]),
        ...restaurantDishes.flatMap((dish) => [dish.name, dish.notes, dish.recommendedBy, ...(dish.tags || [])]),
      ].join(" ").toLowerCase();

      if (q && !haystack.includes(q)) return false;
      if (restaurantAreaFilter !== "all" && restaurant.area !== restaurantAreaFilter) return false;
      if (restaurantCityFilter !== "all" && restaurant.city !== restaurantCityFilter) return false;
      if (restaurantCuisineFilter !== "all" && !(restaurant.cuisines || []).includes(restaurantCuisineFilter)) return false;
      if (restaurantKidsFilter === "kids" && normalizeTriState(restaurant.kidsFriendly) !== TRI_STATE_VALUES.YES) return false;
      return true;
    });
  }, [data.branches, data.dishes, data.restaurants, restaurantAreaFilter, restaurantCityFilter, restaurantCuisineFilter, restaurantKidsFilter, restaurantSearch, restaurantsById]);

  const dashboardStats = useMemo(() => {
    const triedDishes = data.dishes.filter((d) => !d.isWishlist).length;
    const wishlistDishes = data.dishes.filter((d) => d.isWishlist).length;
    const avgDishRating = average(data.dishes.map((d) => computedDishRating(d.id)));
    return {
      restaurants: data.restaurants.length,
      dishes: data.dishes.length,
      experiences: data.experiences.length,
      triedDishes,
      wishlistDishes,
      avgDishRating: avgDishRating || 0,
    };
  }, [data, dishExperienceMap]);

  const recentExperiences = useMemo(() => [...data.experiences].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8), [data.experiences]);

  const restaurantSummaries = useMemo(() => {
    return data.restaurants.map((restaurant) => {
      const displayRestaurant = restaurantsById[restaurant.id] || restaurant;
      const dishes = data.dishes.filter((d) => d.restaurantId === restaurant.id);
      const dishIds = new Set(dishes.map((dish) => dish.id));
      const experiences = data.experiences.filter((e) => dishIds.has(e.dishId));
      const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
      const avgDishPrice = average(dishes.map((dish) => dish.price));
      return { restaurant: displayRestaurant, dishesCount: dishes.length, experiencesCount: experiences.length, avgDishRating, avgDishPrice };
    });
  }, [data, dishExperienceMap, restaurantsById]);

  function resetRestaurantForm() { setRestaurantForm(buildEmptyRestaurantForm()); setRestaurantNameError(""); setShowRestaurantNameSuggestions(false); }
  function resetBranchForm() { setBranchForm(emptyBranchForm); setBranchFormError(""); }
  function resetDishForm() {
    setDishForm(emptyDishForm);
    setDishNameError("");
    setDishRestaurantError("");
    setDishRestaurantSearch("");
    setShowDishRestaurantSuggestions(false);
    setDuplicateDishSuggestion(null);
    setShowDishNameSuggestions(false);
    setExperienceFormError("");
    setExperienceRatingError("");
    setShowInlineRestaurantForDish(false);
    setInlineRestaurantForDish(buildInlineRestaurantFormDefault());
    setLogExperienceWithDish(true);
  }
  function resetExperienceForm() {
    setExperienceForm(emptyExperienceForm);
    setExperienceFormError("");
    setExperienceRatingError("");
    setExperienceRestaurantSearch("");
    setShowExperienceRestaurantSuggestions(false);
    setExperienceDishSearch("");
    setShowExperienceDishSuggestions(false);
    setShowInlineRestaurantForExperience(false);
    setShowInlineDishForExperience(false);
    setInlineRestaurantForExperience(buildInlineRestaurantFormDefault());
    setInlineDishForExperienceName("");
    setInlineDishForExperienceError("");
  }

  function seedSampleData() {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Load seed data? This will replace the data currently shown in the app.");
      if (!confirmed) return;
    }

    setData(createSampleData());
    resetRestaurantForm();
    resetBranchForm();
    resetDishForm();
    resetExperienceForm();
    setRestaurantOpen(false);
    setBranchOpen(false);
    setDishOpen(false);
    setExperienceOpen(false);
    setSearch("");
    setRestaurantSearch("");
    setDishReportSearch("");
  }

  function createRestaurantRecord(form) {
    return {
      id: uid(),
      name: form.name.trim(),
      area: "",
      city: "",
      fullAddress: "",
      mapsLink: "",
      cuisines: form.cuisines,
      rating: form.rating ? Number(form.rating) : null,
      notes: form.notes.trim(),
      recommendedBy: form.recommendedBy.trim(),
      halalChecked: normalizeTriState(form.halalChecked),
      kidsFriendly: normalizeTriState(form.kidsFriendly),
      noAlcohol: normalizeTriState(form.noAlcohol),
      noPork: normalizeTriState(form.noPork),
    };
  }

  function createDefaultBranchRecord(form, restaurantId, existingBranchId = null) {
    const area = form.area.trim();
    const city = form.city.trim();
    const fullAddress = form.fullAddress.trim();
    const mapsLink = form.mapsLink.trim();
    const hasAddressData = area || city || fullAddress || mapsLink;
    if (!hasAddressData) return null;

    return {
      id: existingBranchId || uid(),
      restaurantId,
      isDefault: true,
      name: "Default Branch",
      area,
      city,
      fullAddress,
      locationText: fullAddress,
      mapsLink,
      notes: "",
    };
  }

  function saveRestaurant() {
    if (!restaurantForm.name.trim()) {
      setRestaurantNameError("Restaurant name is required.");
      restaurantNameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      restaurantNameInputRef.current?.focus();
      return;
    }
    setRestaurantNameError("");
    const payload = {
      id: restaurantForm.id || uid(),
      name: restaurantForm.name.trim(),
      area: "",
      city: "",
      fullAddress: "",
      mapsLink: "",
      cuisines: restaurantForm.cuisines,
      rating: restaurantForm.rating ? Number(restaurantForm.rating) : null,
      notes: restaurantForm.notes.trim(),
      recommendedBy: restaurantForm.recommendedBy.trim(),
      halalChecked: normalizeTriState(restaurantForm.halalChecked),
      kidsFriendly: normalizeTriState(restaurantForm.kidsFriendly),
      noAlcohol: normalizeTriState(restaurantForm.noAlcohol),
      noPork: normalizeTriState(restaurantForm.noPork),
    };

    setData((prev) => {
      const existingBranches = prev.branches.filter((branch) => branch.restaurantId === payload.id);
      const existingDefaultBranch = existingBranches.find((branch) => branch.isDefault) || existingBranches[0] || null;
      const shouldPersistAddressFromRestaurantForm = !restaurantForm.id || existingBranches.length <= 1;
      const defaultBranch = shouldPersistAddressFromRestaurantForm
        ? createDefaultBranchRecord(restaurantForm, payload.id, existingDefaultBranch?.id || null)
        : null;
      const nextBranches = shouldPersistAddressFromRestaurantForm
        ? defaultBranch
          ? existingDefaultBranch
            ? prev.branches.map((branch) => branch.id === existingDefaultBranch.id ? defaultBranch : branch)
            : [defaultBranch, ...prev.branches]
          : existingDefaultBranch
            ? prev.branches.map((branch) => branch.id === existingDefaultBranch.id ? { ...branch, isDefault: true, area: "", city: "", fullAddress: "", locationText: "", mapsLink: "" } : branch)
            : prev.branches
        : prev.branches;

      return {
        ...prev,
        restaurants: restaurantForm.id
          ? prev.restaurants.map((r) => (r.id === restaurantForm.id ? payload : r))
          : [payload, ...prev.restaurants],
        branches: nextBranches,
        areas: shouldPersistAddressFromRestaurantForm && restaurantForm.area.trim() && !prev.areas.includes(restaurantForm.area.trim()) ? [...prev.areas, restaurantForm.area.trim()].sort() : prev.areas,
        cities: shouldPersistAddressFromRestaurantForm && restaurantForm.city.trim() && !prev.cities?.includes(restaurantForm.city.trim()) ? [...(prev.cities || []), restaurantForm.city.trim()].sort() : (prev.cities || []),
      };
    });
    resetRestaurantForm();
    setRestaurantOpen(false);
  }

  function saveBranch() {
    if (!branchForm.restaurantId) {
      setBranchFormError("Select a restaurant before saving the branch.");
      return;
    }
    if (!branchForm.name.trim()) {
      setBranchFormError("Enter a branch name before saving.");
      return;
    }
    const payload = {
      id: branchForm.id || uid(),
      restaurantId: branchForm.restaurantId,
      isDefault: !!branchForm.isDefault,
      name: branchForm.name.trim(),
      area: branchForm.area.trim(),
      city: branchForm.city.trim(),
      fullAddress: branchForm.fullAddress.trim(),
      locationText: branchForm.locationText.trim(),
      mapsLink: branchForm.mapsLink.trim(),
      notes: branchForm.notes.trim(),
    };
    setData((prev) => ({
      ...prev,
      branches: branchForm.id
        ? prev.branches.map((b) => (b.id === branchForm.id ? payload : b))
        : [payload, ...prev.branches],
      areas: payload.area && !prev.areas.includes(payload.area) ? [...prev.areas, payload.area].sort() : prev.areas,
      cities: payload.city && !prev.cities?.includes(payload.city) ? [...(prev.cities || []), payload.city].sort() : (prev.cities || []),
    }));
    resetBranchForm();
    setBranchOpen(false);
  }

  function saveDish() {
    let restaurantId = dishForm.restaurantId;

    if (showInlineRestaurantForDish) {
      if (!inlineRestaurantForDish.name.trim()) return;
      const newRestaurant = createRestaurantRecord(inlineRestaurantForDish);
      const defaultBranch = createDefaultBranchRecord(inlineRestaurantForDish, newRestaurant.id);
      restaurantId = newRestaurant.id;

      setData((prev) => ({
        ...prev,
        restaurants: [newRestaurant, ...prev.restaurants],
        branches: defaultBranch ? [defaultBranch, ...prev.branches] : prev.branches,
        areas: newRestaurant.area && !prev.areas.includes(newRestaurant.area) ? [...prev.areas, newRestaurant.area].sort() : prev.areas,
        cities: inlineRestaurantForDish.city.trim() && !prev.cities?.includes(inlineRestaurantForDish.city.trim()) ? [...(prev.cities || []), inlineRestaurantForDish.city.trim()].sort() : (prev.cities || []),
      }));
    }

    if (!showInlineRestaurantForDish && !restaurantId) {
      setDishRestaurantError("Select an existing restaurant or add a new one.");
      dishRestaurantInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      dishRestaurantInputRef.current?.focus();
      return;
    }
    setDishRestaurantError("");

    if (!dishForm.name.trim()) {
      setDishNameError("Dish name is required.");
      dishNameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      dishNameInputRef.current?.focus();
      return;
    }
    setDishNameError("");

    if (!restaurantId) return;
    const duplicate = data.dishes.find(
      (d) => d.restaurantId === restaurantId && d.name.trim().toLowerCase() === dishForm.name.trim().toLowerCase() && d.id !== dishForm.id
    );
    if (duplicate) {
      setDuplicateDishSuggestion(duplicate);
      return;
    }

    const dishId = dishForm.id || uid();
    const payload = {
      id: dishId,
      restaurantId,
      name: dishForm.name.trim(),
      branchId: null,
      price: normalizeNumericInput(dishForm.price),
      isWishlist: dishForm.isWishlist,
      recommendations: dishForm.recommendations,
      alerts: dishForm.alerts,
      tags: dishForm.tags,
      notes: dishForm.notes.trim(),
      recommendedBy: dishForm.recommendedBy.trim(),
      portionSize: dishForm.portionSize,
    };

    if (!dishForm.isWishlist && logExperienceWithDish && !hasValidRating(experienceForm.rating)) {
      setExperienceRatingError("Rating is required. Enter a value from 1 to 5.");
      return;
    }

    const shouldLogExperience = !dishForm.isWishlist && logExperienceWithDish;
    const defaultExperiencePrice = normalizeNumericInput(experienceForm.price) ?? payload.price;
    const experiencePayload = shouldLogExperience
      ? {
          id: uid(),
          dishId,
          branchId: experienceForm.branchId === "none" ? null : experienceForm.branchId,
          date: experienceForm.date,
          orderType: experienceForm.orderType,
          rating: experienceForm.rating ? Number(experienceForm.rating) : null,
          price: defaultExperiencePrice,
          valueForMoney: experienceForm.valueForMoney,
          notes: experienceForm.notes.trim(),
          images: experienceForm.images || [],
        }
      : null;

    const finalDishPayload = experiencePayload?.price != null
      ? { ...payload, price: experiencePayload.price }
      : payload;

    setData((prev) => ({
      ...prev,
      dishes: dishForm.id ? prev.dishes.map((d) => (d.id === dishForm.id ? finalDishPayload : d)) : [finalDishPayload, ...prev.dishes],
      experiences: experiencePayload ? [experiencePayload, ...prev.experiences] : prev.experiences,
    }));

    resetDishForm();
    setExperienceForm(emptyExperienceForm);
    setDishOpen(false);
  }

  function saveExperience() {
    setExperienceFormError("");
    setInlineDishForExperienceError("");

    let restaurantId = experienceForm.restaurantId;
    let newRestaurant = null;
    let defaultBranch = null;

    if (showInlineRestaurantForExperience) {
      if (!inlineRestaurantForExperience.name.trim()) return;
      newRestaurant = createRestaurantRecord(inlineRestaurantForExperience);
      defaultBranch = createDefaultBranchRecord(inlineRestaurantForExperience, newRestaurant.id);
      restaurantId = newRestaurant.id;
    }

    let dishId = experienceForm.dishId;
    let newDish = null;

    if (showInlineDishForExperience) {
      if (!inlineDishForExperienceName.trim()) {
        setInlineDishForExperienceError("Dish name is required.");
        return;
      }
      if (!restaurantId) {
        setExperienceFormError("Select or add a restaurant before adding a dish.");
        return;
      }

      const duplicateDish = data.dishes.find(
        (dish) => dish.restaurantId === restaurantId && dish.name.trim().toLowerCase() === inlineDishForExperienceName.trim().toLowerCase()
      );
      if (duplicateDish) {
        setInlineDishForExperienceError("This dish already exists for this restaurant. Select it from the list instead.");
        return;
      }

      dishId = uid();
      newDish = {
        id: dishId,
        restaurantId,
        name: inlineDishForExperienceName.trim(),
        branchId: null,
        price: normalizeNumericInput(experienceForm.price),
        isWishlist: false,
        recommendations: [],
        alerts: [],
        tags: [],
        notes: "",
        recommendedBy: "",
        portionSize: "",
      };
    }

    if (!dishId) {
      setExperienceFormError("Select a dish before saving the experience.");
      return;
    }

    if (!hasValidRating(experienceForm.rating)) {
      setExperienceRatingError("Rating is required. Enter a value from 1 to 5.");
      return;
    }

    const payload = {
      id: experienceForm.id || uid(),
      dishId,
      branchId: experienceForm.branchId === "none" ? null : experienceForm.branchId,
      date: experienceForm.date,
      orderType: experienceForm.orderType,
      rating: experienceForm.rating ? Number(experienceForm.rating) : null,
      price: normalizeNumericInput(experienceForm.price),
      valueForMoney: experienceForm.valueForMoney,
      notes: experienceForm.notes.trim(),
      images: experienceForm.images || [],
    };
    setData((prev) => ({
      ...prev,
      restaurants: newRestaurant ? [newRestaurant, ...prev.restaurants] : prev.restaurants,
      branches: defaultBranch ? [defaultBranch, ...prev.branches] : prev.branches,
      areas: newRestaurant && inlineRestaurantForExperience.area.trim() && !prev.areas.includes(inlineRestaurantForExperience.area.trim()) ? [...prev.areas, inlineRestaurantForExperience.area.trim()].sort() : prev.areas,
      cities: newRestaurant && inlineRestaurantForExperience.city.trim() && !prev.cities?.includes(inlineRestaurantForExperience.city.trim()) ? [...(prev.cities || []), inlineRestaurantForExperience.city.trim()].sort() : (prev.cities || []),
      dishes: newDish
        ? [newDish.price != null ? { ...newDish, price: payload.price != null ? payload.price : newDish.price } : newDish, ...prev.dishes]
        : prev.dishes.map((dish) => dish.id === dishId ? {
          ...dish,
          isWishlist: false,
          price: payload.price != null ? payload.price : dish.price ?? null,
        } : dish),
      experiences: experienceForm.id
        ? prev.experiences.map((e) => (e.id === experienceForm.id ? payload : e))
        : [payload, ...prev.experiences],
    }));
    resetExperienceForm();
    setExperienceOpen(false);
  }

  function addCuisine() {
    const value = newCuisine.trim();
    if (!value || data.cuisines.includes(value)) return;
    setData((prev) => ({ ...prev, cuisines: [...prev.cuisines, value].sort() }));
    setNewCuisine("");
  }

  function addTag() {
    const value = newTag.trim();
    if (!value || allDishTags.some((tag) => tag.toLowerCase() === value.toLowerCase())) return;
    setData((prev) => ({
      ...prev,
      tagColors: {
        ...(prev.tagColors || {}),
        [value]: prev.tagColors?.[value] || "#64748b",
      },
    }));
    setNewTag("");
    setTagOpen(false);
  }

  function renameCuisine(cuisine) {
    const nextCuisine = window.prompt("Rename cuisine", cuisine)?.trim();
    if (!nextCuisine || nextCuisine === cuisine) return;

    const hasDuplicate = data.cuisines.some((existingCuisine) => existingCuisine.toLowerCase() === nextCuisine.toLowerCase() && existingCuisine !== cuisine);
    if (hasDuplicate) {
      window.alert("A cuisine with that name already exists.");
      return;
    }

    setData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.map((existingCuisine) => (existingCuisine === cuisine ? nextCuisine : existingCuisine)).sort(),
      restaurants: prev.restaurants.map((restaurant) => ({
        ...restaurant,
        cuisines: (restaurant.cuisines || []).map((existingCuisine) => (existingCuisine === cuisine ? nextCuisine : existingCuisine)),
      })),
    }));
  }

  function deleteCuisine(cuisine) {
    const linkedRestaurants = data.restaurants.filter((restaurant) => (restaurant.cuisines || []).includes(cuisine));
    const linkedRestaurantNames = linkedRestaurants.map((restaurant) => restaurant.name).join(", ");
    const confirmed = window.confirm(
      linkedRestaurants.length > 0
        ? `Delete cuisine "${cuisine}"? It will also be removed from these restaurants: ${linkedRestaurantNames}.`
        : `Delete cuisine "${cuisine}"?`,
    );
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.filter((existingCuisine) => existingCuisine !== cuisine),
      restaurants: prev.restaurants.map((restaurant) => ({
        ...restaurant,
        cuisines: (restaurant.cuisines || []).filter((existingCuisine) => existingCuisine !== cuisine),
      })),
    }));
  }

  function addArea() {
    const value = newArea.trim();
    if (!value || data.areas.includes(value)) return;
    setData((prev) => ({ ...prev, areas: [...prev.areas, value].sort() }));
    setNewArea("");
  }

  function addCity() {
    const value = newCity.trim();
    if (!value || cityOptions.some((city) => city.toLowerCase() === value.toLowerCase())) return;
    setData((prev) => ({ ...prev, cities: [...(prev.cities || []), value].sort() }));
    setNewCity("");
  }

  function renameArea(area) {
    const nextArea = window.prompt("Rename area", area)?.trim();
    if (!nextArea || nextArea === area) return;

    const hasDuplicate = areaOptions.some((existingArea) => existingArea.toLowerCase() === nextArea.toLowerCase() && existingArea !== area);
    if (hasDuplicate) {
      window.alert("An area with that name already exists.");
      return;
    }

    setData((prev) => ({
      ...prev,
      areas: [...new Set(prev.areas.map((existingArea) => (existingArea === area ? nextArea : existingArea)).concat(nextArea))].sort(),
      branches: prev.branches.map((branch) => (
        branch.area === area ? { ...branch, area: nextArea } : branch
      )),
    }));
  }

  function deleteArea(area) {
    const linkedRestaurants = data.restaurants.filter((restaurant) => restaurant.area === area);
    const linkedBranches = data.branches.filter((branch) => branch.area === area);
    const confirmed = window.confirm(
      linkedRestaurants.length > 0 || linkedBranches.length > 0
        ? `Delete area "${area}"? It will be removed from ${linkedRestaurants.length} restaurant(s) and ${linkedBranches.length} branch(es).`
        : `Delete area "${area}"?`,
    );
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      areas: prev.areas.filter((existingArea) => existingArea !== area),
      branches: prev.branches.map((branch) => (
        branch.area === area ? { ...branch, area: "" } : branch
      )),
    }));
  }

  function renameCity(city) {
    const nextCity = window.prompt("Rename city", city)?.trim();
    if (!nextCity || nextCity === city) return;

    const hasDuplicate = cityOptions.some((existingCity) => existingCity.toLowerCase() === nextCity.toLowerCase() && existingCity !== city);
    if (hasDuplicate) {
      window.alert("A city with that name already exists.");
      return;
    }

    setData((prev) => ({
      ...prev,
      cities: [...new Set((prev.cities || []).map((existingCity) => (existingCity === city ? nextCity : existingCity)).concat(nextCity))].sort(),
      branches: prev.branches.map((branch) => (
        branch.city === city ? { ...branch, city: nextCity } : branch
      )),
    }));
  }

  function deleteCity(city) {
    const linkedRestaurants = data.restaurants.filter((restaurant) => restaurant.city === city);
    const confirmed = window.confirm(
      linkedRestaurants.length > 0
        ? `Delete city "${city}"? It will be removed from ${linkedRestaurants.length} restaurant(s).`
        : `Delete city "${city}"?`,
    );
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      cities: (prev.cities || []).filter((existingCity) => existingCity !== city),
      branches: prev.branches.map((branch) => (
        branch.city === city ? { ...branch, city: "" } : branch
      )),
    }));
  }

  function setTagColor(tag, colorValue) {
    setData((prev) => ({
      ...prev,
      tagColors: {
        ...(prev.tagColors || {}),
        [tag]: colorValue,
      },
    }));
  }

  function renameTag(tag) {
    const nextTag = window.prompt("Rename tag", tag)?.trim();
    if (!nextTag || nextTag === tag) return;

    const hasDuplicate = allDishTags.some((existingTag) => existingTag.toLowerCase() === nextTag.toLowerCase() && existingTag !== tag);
    if (hasDuplicate) {
      window.alert("A tag with that name already exists.");
      return;
    }

    setData((prev) => {
      const nextTagColors = { ...(prev.tagColors || {}) };
      if (Object.prototype.hasOwnProperty.call(nextTagColors, tag)) {
        nextTagColors[nextTag] = nextTagColors[tag];
        delete nextTagColors[tag];
      }

      return {
        ...prev,
        dishes: prev.dishes.map((dish) => ({
          ...dish,
          tags: (dish.tags || []).map((existingTag) => (existingTag === tag ? nextTag : existingTag)),
        })),
        tagColors: nextTagColors,
      };
    });
  }

  function confirmDelete(message) {
    return window.confirm(message);
  }

  function deleteRestaurant(id) {
    const restaurant = data.restaurants.find((r) => r.id === id);
    if (!confirmDelete(`Delete restaurant "${restaurant?.name || "this restaurant"}"? This will also remove its branches, dishes, and experiences.`)) return;
    const dishIds = data.dishes.filter((d) => d.restaurantId === id).map((d) => d.id);
    setData((prev) => ({
      ...prev,
      restaurants: prev.restaurants.filter((r) => r.id !== id),
      branches: prev.branches.filter((b) => b.restaurantId !== id),
      dishes: prev.dishes.filter((d) => d.restaurantId !== id),
      experiences: prev.experiences.filter((e) => !dishIds.includes(e.dishId)),
    }));
  }

  function deleteDish(id) {
    const dish = data.dishes.find((d) => d.id === id);
    if (!confirmDelete(`Delete dish "${dish?.name || "this dish"}"? This will also remove its experiences.`)) return;
    setData((prev) => ({ ...prev, dishes: prev.dishes.filter((d) => d.id !== id), experiences: prev.experiences.filter((e) => e.dishId !== id) }));
  }

  function deleteBranch(id) {
    const branch = data.branches.find((b) => b.id === id);
    if (!confirmDelete(`Delete branch "${branch?.name || "this branch"}"? Dishes and experiences will keep their records but lose this branch link.`)) return;
    setData((prev) => {
      const remainingBranches = prev.branches.filter((b) => b.id !== id);
      const nextBranches = branch?.isDefault
        ? remainingBranches.map((candidate) => {
          if (candidate.restaurantId !== branch.restaurantId) return candidate;
          const firstRemainingId = remainingBranches.find((b) => b.restaurantId === branch.restaurantId)?.id;
          return { ...candidate, isDefault: candidate.id === firstRemainingId };
        })
        : remainingBranches;

      return {
        ...prev,
        branches: nextBranches,
        dishes: prev.dishes.map((d) => (d.branchId === id ? { ...d, branchId: null } : d)),
        experiences: prev.experiences.map((e) => (e.branchId === id ? { ...e, branchId: null } : e)),
      };
    });
  }

  function deleteExperience(id) {
    if (!confirmDelete("Delete this experience?")) return;
    setData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  }

  function setDefaultBranch(restaurantId, branchId) {
    setData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) => (
        branch.restaurantId === restaurantId
          ? { ...branch, isDefault: branch.id === branchId }
          : branch
      )),
    }));
  }

  function editRestaurant(r) {
    setRestaurantNameError("");
    setShowRestaurantNameSuggestions(false);
    const defaultBranch = defaultBranchByRestaurantId[r.id];
    setRestaurantForm({
      ...buildEmptyRestaurantForm(),
      ...r,
      area: defaultBranch?.area || "",
      city: defaultBranch?.city || "",
      fullAddress: defaultBranch?.fullAddress || "",
      mapsLink: defaultBranch?.mapsLink || "",
      cuisineInput: "",
      rating: r.rating ?? "",
      halalChecked: normalizeTriState(r.halalChecked),
      kidsFriendly: normalizeTriState(r.kidsFriendly),
      noAlcohol: normalizeTriState(r.noAlcohol),
      noPork: normalizeTriState(r.noPork),
    });
    setRestaurantOpen(true);
  }
  function editBranch(b) { setBranchFormError(""); setBranchForm({ ...emptyBranchForm, ...b }); setBranchOpen(true); }
  function editDish(d) {
    setDishForm({ ...emptyDishForm, ...d, branchId: d.branchId || "none", price: d.price ?? "", recommendationInput: "", alertInput: "", tagInput: "" });
    setDishNameError("");
    setDishRestaurantError("");
    setDishRestaurantSearch(restaurantsById[d.restaurantId]?.name || "");
    setShowDishRestaurantSuggestions(false);
    setDuplicateDishSuggestion(null);
    setShowDishNameSuggestions(false);
    setExperienceFormError("");
    setExperienceRatingError("");
    setLogExperienceWithDish(false);
    setExperienceForm(emptyExperienceForm);
    setDishOpen(true);
  }
  function editExperience(e) {
    setExperienceFormError("");
    setExperienceRatingError("");
    setShowInlineDishForExperience(false);
    setInlineDishForExperienceName("");
    setInlineDishForExperienceError("");
    setExperienceRestaurantSearch(dishesById[e.dishId]?.restaurantId ? restaurantsById[dishesById[e.dishId]?.restaurantId]?.name || "" : "");
    setShowExperienceRestaurantSuggestions(false);
    setExperienceDishSearch(dishesById[e.dishId]?.name || "");
    setShowExperienceDishSuggestions(false);
    setExperienceForm({
      ...emptyExperienceForm,
      ...e,
      restaurantId: dishesById[e.dishId]?.restaurantId || "",
      branchId: e.branchId || "none",
      rating: e.rating ?? "",
      price: e.price ?? "",
      valueForMoney: e.valueForMoney || "",
    });
    setExperienceOpen(true);
  }

  function prepareLogExperience(_restaurantId, dishId) {
    const dish = dishesById[dishId];
    setExperienceFormError("");
    setExperienceRatingError("");
    setExperienceRestaurantSearch(dish?.restaurantId ? restaurantsById[dish.restaurantId]?.name || "" : "");
    setShowExperienceRestaurantSuggestions(false);
    setExperienceDishSearch(dish?.name || "");
    setShowExperienceDishSuggestions(false);
    setExperienceForm({ ...emptyExperienceForm, restaurantId: dish?.restaurantId || "", dishId, branchId: "none", price: dish?.price ?? "" });
    setExperienceOpen(true);
    setTab("dishes");
  }

  function openNewExperienceDialog() {
    resetExperienceForm();
    setExperienceOpen(true);
  }

  function setDefaultRestaurantStatsView(value) {
    const nextValue = value === "rows" ? "rows" : "cards";
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        defaultRestaurantStatsView: nextValue,
      },
    }));
  }

  function setRestaurantSafetyDefault(fieldKey, value) {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        restaurantSafetyDefaults: {
          ...(prev.settings?.restaurantSafetyDefaults || {}),
          [fieldKey]: normalizeTriState(value),
        },
      },
    }));
  }

  function setRestaurantAlertLevel(fieldKey, value) {
    const nextValue = RESTAURANT_ALERT_LEVELS.some((level) => level.value === value) ? value : "no_or_unknown";
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        restaurantAlertLevels: {
          ...(prev.settings?.restaurantAlertLevels || {}),
          [fieldKey]: nextValue,
        },
      },
    }));
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Import JSON data? This will replace the data currently shown in the app.");
      if (!confirmed) {
        event.target.value = "";
        return;
      }
    }
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = safeParse(reader.result, null);
      if (!parsed) return;
      setData(migrateData(parsed));
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleExperienceImageUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: uid(), name: file.name, dataUrl: reader.result });
      reader.readAsDataURL(file);
    }))).then((images) => setExperienceForm((prev) => ({ ...prev, images: [...prev.images, ...images] })));
    event.target.value = "";
  }

  const selectedExperienceDish = dishesById[experienceForm.dishId];
  const effectiveExperienceRestaurantId = showInlineRestaurantForExperience
    ? ""
    : selectedExperienceDish?.restaurantId || experienceForm.restaurantId;
  const dishOptionsForExperience = data.dishes.filter((d) => !effectiveExperienceRestaurantId || d.restaurantId === effectiveExperienceRestaurantId);
  const effectiveDishRestaurantId = showInlineRestaurantForDish ? "" : dishForm.restaurantId;
  const branchOptionsForDish = data.branches.filter((b) => b.restaurantId === effectiveDishRestaurantId);
  const branchOptionsForDishExperience = data.branches.filter((b) => b.restaurantId === effectiveDishRestaurantId);
  const branchOptionsForExperience = data.branches.filter((b) => b.restaurantId === effectiveExperienceRestaurantId);
  const restaurantSafetyDefaults = Object.fromEntries(
    RESTAURANT_SAFETY_FIELDS.map((field) => [
      field.key,
      normalizeTriState(data.settings?.restaurantSafetyDefaults?.[field.key], TRI_STATE_VALUES.UNKNOWN),
    ])
  );
  const restaurantAlertLevels = Object.fromEntries(
    RESTAURANT_SAFETY_FIELDS.map((field) => [
      field.key,
      ["no_only", "never"].includes(data.settings?.restaurantAlertLevels?.[field.key])
        ? data.settings.restaurantAlertLevels[field.key]
        : "no_or_unknown",
    ])
  );
  const experienceDishCatalogMatches = useMemo(() => {
    const query = normalizeDishName(experienceDishSearch || "");
    if (!query) return [];

    return data.dishes
      .filter((dish) => dish.id !== experienceForm.dishId)
      .filter((dish) => normalizeDishName(dish.name).includes(query))
      .sort((a, b) => {
        const aCurrent = a.restaurantId === effectiveExperienceRestaurantId ? 1 : 0;
        const bCurrent = b.restaurantId === effectiveExperienceRestaurantId ? 1 : 0;
        if (aCurrent !== bCurrent) return bCurrent - aCurrent;

        const aExact = normalizeDishName(a.name) === query ? 1 : 0;
        const bExact = normalizeDishName(b.name) === query ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [data.dishes, effectiveExperienceRestaurantId, experienceDishSearch, experienceForm.dishId]);
  const restaurantNameSuggestions = rankSuggestions(
    data.restaurants.filter((restaurant) => restaurant.id !== restaurantForm.id),
    restaurantForm.name,
    (restaurant) => restaurant.name
  ).slice(0, 8);
  const dishRestaurantSuggestions = rankSuggestions(data.restaurants, dishRestaurantSearch, (restaurant) => restaurant.name).slice(0, 8);
  const experienceRestaurantSuggestions = rankSuggestions(data.restaurants, experienceRestaurantSearch, (restaurant) => restaurant.name).slice(0, 8);
  const hasExactExperienceRestaurantMatch = data.restaurants.some(
    (restaurant) => restaurant.name.trim().toLowerCase() === experienceRestaurantSearch.trim().toLowerCase()
  );

  function buildEmptyRestaurantForm() {
    return {
      ...emptyRestaurantForm,
      ...restaurantSafetyDefaults,
    };
  }

  function buildInlineRestaurantFormDefault() {
    return {
      ...inlineRestaurantFormDefault,
      ...restaurantSafetyDefaults,
    };
  }

  function openExistingDish(dish) {
    editDish(dish);
  }

  function selectDishNameSuggestion(dish) {
    if (dish.restaurantId === dishForm.restaurantId) {
      setShowDishNameSuggestions(false);
      const shouldLogExperience = window.confirm(
        `"${dish.name}" already exists in this restaurant. Do you want to log a new experience for it?`
      );
      if (shouldLogExperience) {
        setDishOpen(false);
        resetDishForm();
        prepareLogExperience(dish.restaurantId, dish.id);
      }
      return;
    }

    setShowDishNameSuggestions(false);
    setDishForm((prev) => ({
      ...prev,
      name: dish.name,
    }));
  }

  function selectExperienceDishSuggestion(dish) {
    if (dish.restaurantId === effectiveExperienceRestaurantId) {
      setExperienceForm((prev) => ({ ...prev, dishId: dish.id, restaurantId: prev.restaurantId || dish.restaurantId || "" }));
      setExperienceDishSearch(dish.name);
      setShowExperienceDishSuggestions(false);
      setExperienceFormError("");
      return;
    }

    setShowInlineDishForExperience(true);
    setInlineDishForExperienceName(dish.name);
    setInlineDishForExperienceError("");
    setExperienceDishSearch("");
    setShowExperienceDishSuggestions(false);
    setExperienceForm((prev) => ({ ...prev, dishId: "" }));
    setExperienceFormError("");
  }

  useEffect(() => {
    if (!dishForm.restaurantId || !dishForm.name.trim()) {
      setDuplicateDishSuggestion(null);
      return;
    }
    const duplicate = data.dishes.find((d) => d.restaurantId === dishForm.restaurantId && d.name.trim().toLowerCase() === dishForm.name.trim().toLowerCase() && d.id !== dishForm.id);
    setDuplicateDishSuggestion(duplicate || null);
  }, [dishForm.restaurantId, dishForm.name, dishForm.id, data.dishes]);

  useEffect(() => {
    if (showInlineRestaurantForExperience || showInlineDishForExperience) return;
    if (!experienceForm.restaurantId || !experienceForm.dishId) return;

    const selectedDish = dishesById[experienceForm.dishId];
    if (!selectedDish) return;

    if (selectedDish.restaurantId !== experienceForm.restaurantId) {
      setExperienceForm((prev) => ({ ...prev, dishId: "", branchId: "none" }));
      setExperienceFormError("The selected dish does not belong to this restaurant. Please select a matching dish.");
    }
  }, [dishesById, experienceForm.dishId, experienceForm.restaurantId, showInlineDishForExperience, showInlineRestaurantForExperience]);

  useEffect(() => {
    if (showInlineRestaurantForExperience || showInlineDishForExperience) return;
    if (experienceDishSearch.trim()) return;
    if (!experienceForm.restaurantId || experienceForm.dishId) return;

    const restaurantDishes = data.dishes.filter((dish) => dish.restaurantId === experienceForm.restaurantId);
    if (restaurantDishes.length === 1) {
      setExperienceForm((prev) => ({ ...prev, dishId: restaurantDishes[0].id }));
      setExperienceFormError("");
    }
  }, [data.dishes, experienceDishSearch, experienceForm.dishId, experienceForm.restaurantId, showInlineDishForExperience, showInlineRestaurantForExperience]);

  useEffect(() => {
    const selectedDish = dishesById[experienceForm.dishId];
    const previousDish = dishesById[previousExperienceDishIdRef.current];
    const previousDishPrice = previousDish?.price ?? "";

    if (selectedDish && (experienceForm.price === "" || experienceForm.price === previousDishPrice)) {
      setExperienceForm((prev) => ({ ...prev, price: selectedDish.price ?? "" }));
    }

    previousExperienceDishIdRef.current = experienceForm.dishId;
  }, [dishesById, experienceForm.dishId, experienceForm.price]);

  useEffect(() => {
    if (dishForm.restaurantId && !showInlineRestaurantForDish) {
      setDishRestaurantSearch(restaurantsById[dishForm.restaurantId]?.name || "");
    }
  }, [dishForm.restaurantId, restaurantsById, showInlineRestaurantForDish]);

  useEffect(() => {
    if (experienceForm.restaurantId && !showInlineRestaurantForExperience) {
      setExperienceRestaurantSearch(restaurantsById[experienceForm.restaurantId]?.name || "");
    }
  }, [experienceForm.restaurantId, restaurantsById, showInlineRestaurantForExperience]);

  useEffect(() => {
    if (experienceForm.dishId && !showInlineDishForExperience) {
      setExperienceDishSearch(dishesById[experienceForm.dishId]?.name || "");
    }
  }, [dishesById, experienceForm.dishId, showInlineDishForExperience]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {APP_VERSION}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Dish Tracker</h1>
              <p className="mt-1 text-sm text-slate-600">Track restaurants, dishes, branches, and every tasting experience.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {userEmail}
                </span>
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-semibold text-sky-800">
                  {cloudStatus}
                </span>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:justify-end">
              <Dialog open={restaurantOpen} onOpenChange={(open) => { setRestaurantOpen(open); if (!open) resetRestaurantForm(); }}>
                <DialogTrigger asChild><Button variant="outline" className={`order-2 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addRestaurant}`}><Plus className="mr-2 h-4 w-4" /> Add Restaurant</Button></DialogTrigger>
                <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-auto sm:max-w-2xl">
                  <ModalHeader title={restaurantForm.id ? "Edit Restaurant" : "Add Restaurant"} onClose={() => { setRestaurantOpen(false); resetRestaurantForm(); }} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative md:col-span-2">
                      <Field label={<><span>Name</span><span className="ml-1 text-red-600">*</span></>}>
                        <Input
                          ref={restaurantNameInputRef}
                          value={restaurantForm.name}
                          onChange={(e) => {
                            setRestaurantForm({ ...restaurantForm, name: e.target.value });
                            if (e.target.value.trim()) setRestaurantNameError("");
                            setShowRestaurantNameSuggestions(true);
                          }}
                          onFocus={() => setShowRestaurantNameSuggestions(true)}
                          onBlur={() => window.setTimeout(() => setShowRestaurantNameSuggestions(false), 150)}
                          className={restaurantNameError ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                      </Field>
                      {restaurantNameError ? <div className="mt-2 text-sm text-red-600">{restaurantNameError}</div> : null}
                      {showRestaurantNameSuggestions && restaurantForm.name.trim() && restaurantNameSuggestions.length > 0 ? (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border bg-white shadow-lg">
                          {restaurantNameSuggestions.map((restaurant) => (
                            <button
                              key={restaurant.id}
                              type="button"
                              className="flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                              onClick={() => {
                                setRestaurantForm((prev) => ({ ...prev, name: restaurant.name }));
                                setShowRestaurantNameSuggestions(false);
                              }}
                            >
                              <span className="font-medium text-slate-900">{restaurant.name}</span>
                              <span className="text-xs text-slate-500">Existing restaurant</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <Field label="Default branch city">
                      <Input
                        list="restaurant-city-options"
                        value={restaurantForm.city}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
                        placeholder="Select or type a city"
                        readOnly={!canEditRestaurantAddressFields}
                        className={!canEditRestaurantAddressFields ? "bg-slate-50 text-slate-500" : ""}
                      />
                    </Field>
                    <Field label="Default branch area">
                      <Input
                        list="restaurant-area-options"
                        value={restaurantForm.area}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, area: e.target.value })}
                        placeholder="Select or type an area"
                        readOnly={!canEditRestaurantAddressFields}
                        className={!canEditRestaurantAddressFields ? "bg-slate-50 text-slate-500" : ""}
                      />
                    </Field>
                    <Field label="Default branch full address">
                      <Input
                        value={restaurantForm.fullAddress}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, fullAddress: e.target.value })}
                        readOnly={!canEditRestaurantAddressFields}
                        className={!canEditRestaurantAddressFields ? "bg-slate-50 text-slate-500" : ""}
                      />
                    </Field>
                    <Field label="Default branch Google Maps link">
                      <Input
                        value={restaurantForm.mapsLink}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, mapsLink: e.target.value })}
                        readOnly={!canEditRestaurantAddressFields}
                        className={!canEditRestaurantAddressFields ? "bg-slate-50 text-slate-500" : ""}
                      />
                    </Field>
                    {!canEditRestaurantAddressFields && (
                      <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        This restaurant has multiple branches. Edit address details from Manage Branches.
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <TagInput
                        label="Cuisines"
                        color="blue"
                        values={restaurantForm.cuisines}
                        setValues={(vals) => setRestaurantForm((prev) => ({ ...prev, cuisines: vals }))}
                        inputValue={restaurantForm.cuisineInput}
                        setInputValue={(v) => setRestaurantForm((prev) => ({ ...prev, cuisineInput: v }))}
                        suggestions={data.cuisines}
                      />
                    </div>
                    <Field label="Restaurant rating (1-5)"><Input type="number" min="1" max="5" value={restaurantForm.rating} onChange={(e) => setRestaurantForm({ ...restaurantForm, rating: e.target.value })} /></Field>
                    <Field label="Recommended by"><Input value={restaurantForm.recommendedBy} onChange={(e) => setRestaurantForm({ ...restaurantForm, recommendedBy: e.target.value })} /></Field>
                    <div className="md:col-span-2">
                      <RestaurantSafetyControls
                        values={restaurantForm}
                        onChange={(fieldKey, value) => setRestaurantForm((prev) => ({ ...prev, [fieldKey]: value }))}
                      />
                    </div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={restaurantForm.notes} onChange={(e) => setRestaurantForm({ ...restaurantForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <ModalActions
                    onCancel={() => { setRestaurantOpen(false); resetRestaurantForm(); }}
                    onSave={saveRestaurant}
                    saveLabel={restaurantForm.id ? "Save Changes" : "Save Restaurant"}
                    cancelLabel={restaurantForm.id ? "Discard" : "Cancel"}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={dishOpen} onOpenChange={(open) => { setDishOpen(open); if (!open) resetDishForm(); }}>
                <DialogTrigger asChild><Button className={`order-1 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addDish}`}><Plus className="mr-2 h-4 w-4" /> Add Dish</Button></DialogTrigger>
                <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-auto sm:max-w-3xl">
                  <ModalHeader title={dishForm.id ? "Edit Dish" : "Add Dish"} onClose={() => { setDishOpen(false); resetDishForm(); }} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={<><span>Restaurant</span><span className="ml-1 text-red-600">*</span></>}>
                      {!showInlineRestaurantForDish ? (
                        <>
                          <div className="relative">
                            <Input
                              ref={dishRestaurantInputRef}
                              value={dishRestaurantSearch}
                              onChange={(e) => {
                                setDishRestaurantSearch(e.target.value);
                                setDishForm((prev) => ({ ...prev, restaurantId: "", branchId: "none" }));
                                setDishRestaurantError("");
                                setShowDishRestaurantSuggestions(true);
                              }}
                              onFocus={() => setShowDishRestaurantSuggestions(true)}
                              onBlur={() => window.setTimeout(() => setShowDishRestaurantSuggestions(false), 150)}
                              placeholder="Select or search restaurant"
                            />
                            {showDishRestaurantSuggestions && dishRestaurantSuggestions.length > 0 ? (
                              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border bg-white shadow-lg">
                                {dishRestaurantSuggestions.map((restaurant) => (
                                  <button
                                    key={restaurant.id}
                                    type="button"
                                    className="flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                                    onPointerDown={(event) => {
                                      event.preventDefault();
                                      setDishForm((prev) => ({ ...prev, restaurantId: restaurant.id, branchId: "none" }));
                                      setDishRestaurantSearch(restaurant.name);
                                      setDishRestaurantError("");
                                      setShowDishRestaurantSuggestions(false);
                                    }}
                                  >
                                    <span className="font-medium text-slate-900">{restaurant.name}</span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          {dishRestaurantError ? <div className="mt-2 text-sm text-red-600">{dishRestaurantError}</div> : null}
                          <button type="button" className="mt-2 text-sm text-blue-600 underline" onClick={() => { setShowInlineRestaurantForDish(true); setDishRestaurantSearch(""); setShowDishRestaurantSuggestions(false); setDishForm({ ...dishForm, restaurantId: "", branchId: "none" }); }}>
                            Add a new restaurant now
                          </button>
                        </>
                      ) : (
                        <div className="space-y-3 rounded-2xl border p-3">
                          <Input placeholder="Restaurant name" value={inlineRestaurantForDish.name} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, name: e.target.value })} />
                          <Select value={inlineRestaurantForDish.area || "__none"} onValueChange={(value) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, area: value === "__none" ? "" : value })}>
                            <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                            <SelectContent><SelectItem value="__none">No area</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input list="restaurant-city-options" placeholder="Select or type a city" value={inlineRestaurantForDish.city} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, city: e.target.value })} />
                          <Input placeholder="Full address" value={inlineRestaurantForDish.fullAddress} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, fullAddress: e.target.value })} />
                          <Input placeholder="Google Maps link" value={inlineRestaurantForDish.mapsLink} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, mapsLink: e.target.value })} />
                          <TagInput
                            label="Cuisines"
                            color="blue"
                            values={inlineRestaurantForDish.cuisines}
                            setValues={(vals) => setInlineRestaurantForDish((prev) => ({ ...prev, cuisines: vals }))}
                            inputValue={inlineRestaurantForDish.cuisineInput}
                            setInputValue={(v) => setInlineRestaurantForDish((prev) => ({ ...prev, cuisineInput: v }))}
                            suggestions={data.cuisines}
                          />
                          <RestaurantSafetyControls
                            values={inlineRestaurantForDish}
                            compact
                            onChange={(fieldKey, value) => setInlineRestaurantForDish((prev) => ({ ...prev, [fieldKey]: value }))}
                          />
                          <button type="button" className="text-sm text-slate-600 underline" onClick={() => { setShowInlineRestaurantForDish(false); setInlineRestaurantForDish(inlineRestaurantFormDefault); }}>
                            Back to existing restaurants
                          </button>
                        </div>
                      )}
                    </Field>
                    <div className="relative md:col-span-2">
                      <Field label={<><span>Dish name</span><span className="ml-1 text-red-600">*</span></>}>
                        <Input
                          ref={dishNameInputRef}
                          value={dishForm.name}
                          onChange={(e) => {
                            setDishForm({ ...dishForm, name: e.target.value });
                            if (e.target.value.trim()) setDishNameError("");
                            setShowDishNameSuggestions(true);
                          }}
                          onFocus={() => setShowDishNameSuggestions(true)}
                          onBlur={() => window.setTimeout(() => setShowDishNameSuggestions(false), 150)}
                          placeholder="Start typing a dish name"
                          className={dishNameError ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                      </Field>
                      {dishNameError ? <div className="mt-2 text-sm text-red-600">{dishNameError}</div> : null}
                      {showDishNameSuggestions && dishCatalogMatches.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border bg-white shadow-lg">
                          {dishCatalogMatches.map((dish) => {
                            const restaurant = restaurantsById[dish.restaurantId];
                            const branch = dish.branchId ? branchesById[dish.branchId] : null;
                            const avgRating = computedDishRating(dish.id);
                            const isCurrentRestaurant = dish.restaurantId === dishForm.restaurantId;

                            return (
                              <button
                                key={dish.id}
                                type="button"
                                className="flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                                onPointerDown={(event) => {
                                  event.preventDefault();
                                  selectDishNameSuggestion(dish);
                                }}
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-slate-900">{dish.name}</span>
                                    {isCurrentRestaurant && <Badge className="!border-emerald-200 !bg-emerald-50 !text-emerald-700">Dish exists here</Badge>}
                                    {!isCurrentRestaurant && <Badge className="!border-amber-200 !bg-amber-50 !text-amber-800">Add dish here</Badge>}
                                    {dish.isWishlist && <Badge>Wishlist</Badge>}
                                  </div>
                                  <div className="mt-1 text-sm text-slate-600">
                                    {restaurant?.name || "Unknown restaurant"}
                                    {branch ? ` • ${branch.name}` : ""}
                                    {avgRating ? ` • Avg ${avgRating.toFixed(1)}/5` : ""}
                                  </div>
                                </div>
                                <div className="shrink-0 text-xs text-slate-500">
                                  {isCurrentRestaurant ? "Log experience" : "Copy name"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {duplicateDishSuggestion && (
                      <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        This dish already exists in this restaurant. You probably want to log a new experience instead.
                        <div className="mt-2"><Button size="sm" variant="outline" onClick={() => prepareLogExperience(duplicateDishSuggestion.restaurantId, duplicateDishSuggestion.id)}>Log Experience for Existing Dish</Button></div>
                      </div>
                    )}
                    <Field label="Portion size">
                      <Select value={dishForm.portionSize || "__none"} onValueChange={(value) => setDishForm({ ...dishForm, portionSize: value === "__none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select portion size" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No portion size</SelectItem>
                          {PORTION_SIZES.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Dish price ($)"><Input type="number" value={dishForm.price} onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })} /></Field>
                    <Field label="Recommended by"><Input value={dishForm.recommendedBy} onChange={(e) => setDishForm({ ...dishForm, recommendedBy: e.target.value })} /></Field>
                    <div className="md:col-span-2 rounded-2xl border bg-slate-50 p-4 space-y-4">
                      <div className="flex items-center gap-3"><Checkbox checked={dishForm.isWishlist} onCheckedChange={(checked) => setDishForm({ ...dishForm, isWishlist: !!checked })} /><Label>Wishlist item (not tried yet)</Label></div>
                      <div className="flex items-center gap-3"><Checkbox checked={!dishForm.isWishlist && logExperienceWithDish} onCheckedChange={(checked) => setLogExperienceWithDish(!!checked)} disabled={dishForm.isWishlist} /><Label>Add first experience now</Label></div>
                      {!dishForm.isWishlist && logExperienceWithDish && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Branch (optional)">
                            <Select value={experienceForm.branchId} onValueChange={(value) => setExperienceForm({ ...experienceForm, branchId: value })}>
                              <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No branch</SelectItem>
                                {branchOptionsForDishExperience.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Date"><Input type="date" value={experienceForm.date} onChange={(e) => setExperienceForm({ ...experienceForm, date: e.target.value })} /></Field>
                          <Field label="Order type">
                            <Select value={experienceForm.orderType} onValueChange={(value) => setExperienceForm({ ...experienceForm, orderType: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{ORDER_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                            </Select>
                          </Field>
                          <div>
                            <Field label={<><span>Rating (1-5)</span><span className="ml-1 text-red-600">*</span></>}><Input type="number" min="1" max="5" required value={experienceForm.rating} onChange={(e) => { setExperienceForm({ ...experienceForm, rating: e.target.value }); if (hasValidRating(e.target.value)) setExperienceRatingError(""); }} className={experienceRatingError ? "border-red-400 focus-visible:ring-red-400" : ""} /></Field>
                            {experienceRatingError ? <div className="mt-2 text-sm text-red-600">{experienceRatingError}</div> : null}
                          </div>
                          <Field label="Price ($)"><Input type="number" value={experienceForm.price} onChange={(e) => setExperienceForm({ ...experienceForm, price: e.target.value })} /></Field>
                          <Field label="Value for money">
                            <Select value={experienceForm.valueForMoney || "__none"} onValueChange={(value) => setExperienceForm({ ...experienceForm, valueForMoney: value === "__none" ? "" : value })}>
                              <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">No answer</SelectItem>
                                {VALUE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="Images"><Input type="file" accept="image/*" multiple onChange={handleExperienceImageUpload} /></Field>
                          </div>
                          <div className="md:col-span-2"><Field label="Experience notes"><Textarea value={experienceForm.notes} onChange={(e) => setExperienceForm({ ...experienceForm, notes: e.target.value })} rows={3} /></Field></div>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Dish tags" color="slate" values={dishForm.tags} setValues={(vals) => setDishForm((prev) => ({ ...prev, tags: vals }))} inputValue={dishForm.tagInput} setInputValue={(v) => setDishForm((prev) => ({ ...prev, tagInput: v }))} suggestions={allDishTags} />
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Recommendations" color="blue" values={dishForm.recommendations} setValues={(vals) => setDishForm((prev) => ({ ...prev, recommendations: vals }))} inputValue={dishForm.recommendationInput} setInputValue={(v) => setDishForm((prev) => ({ ...prev, recommendationInput: v }))} suggestions={allRecommendationTags} />
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Alerts / warnings" color="red" values={dishForm.alerts} setValues={(vals) => setDishForm((prev) => ({ ...prev, alerts: vals }))} inputValue={dishForm.alertInput} setInputValue={(v) => setDishForm((prev) => ({ ...prev, alertInput: v }))} suggestions={allAlertTags} />
                    </div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={dishForm.notes} onChange={(e) => setDishForm({ ...dishForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      {dishForm.id ? (
                        <Button type="button" variant="outline" className={DELETE_BUTTON_STYLE} onClick={() => { deleteDish(dishForm.id); setDishOpen(false); resetDishForm(); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className={CANCEL_BUTTON_STYLE} onClick={() => { setDishOpen(false); resetDishForm(); }}>
                        {dishForm.id ? "Discard" : "Cancel"}
                      </Button>
                      <Button type="button" className={SAVE_BUTTON_STYLE} onClick={saveDish}>
                        {dishForm.id ? "Save Changes" : "Save Dish"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={experienceOpen} onOpenChange={(open) => { setExperienceOpen(open); if (!open) resetExperienceForm(); }}>
                <Button type="button" variant="outline" className={`order-3 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addExperience}`} onClick={openNewExperienceDialog}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
                <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-auto sm:max-w-3xl">
                  <ModalHeader title={experienceForm.id ? "Edit Experience" : "Log Dish Experience"} onClose={() => { setExperienceOpen(false); resetExperienceForm(); }} />
                  {experienceFormError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{experienceFormError}</div> : null}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={<><span>Restaurant</span><span className="ml-1 text-red-600">*</span></>}>
                      {!showInlineRestaurantForExperience ? (
                        <>
                          <div className="relative">
                            <Input
                              value={experienceRestaurantSearch}
                              onChange={(e) => {
                                setExperienceRestaurantSearch(e.target.value);
                                setExperienceForm((prev) => ({ ...prev, restaurantId: "", dishId: "", branchId: "none" }));
                                setShowInlineDishForExperience(false);
                                setInlineDishForExperienceName("");
                                setInlineDishForExperienceError("");
                                setShowExperienceRestaurantSuggestions(true);
                                setExperienceFormError("");
                              }}
                              onFocus={() => setShowExperienceRestaurantSuggestions(true)}
                              onBlur={() => window.setTimeout(() => setShowExperienceRestaurantSuggestions(false), 150)}
                              placeholder="Select or search restaurant"
                            />
                            {showExperienceRestaurantSuggestions && experienceRestaurantSuggestions.length > 0 ? (
                              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border bg-white shadow-lg">
                                {experienceRestaurantSuggestions.map((restaurant) => (
                                  <button
                                    key={restaurant.id}
                                    type="button"
                                    className="flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                                    onPointerDown={(event) => {
                                      event.preventDefault();
                                      setExperienceForm((prev) => ({ ...prev, restaurantId: restaurant.id, dishId: "", branchId: "none" }));
                                      setExperienceRestaurantSearch(restaurant.name);
                                      setExperienceDishSearch("");
                                      setShowExperienceRestaurantSuggestions(false);
                                      setExperienceFormError("");
                                    }}
                                  >
                                    <span className="font-medium text-slate-900">{restaurant.name}</span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          {experienceRestaurantSearch.trim() && !experienceForm.restaurantId && !hasExactExperienceRestaurantMatch ? (
                            <div className="mt-2 text-sm text-amber-700">
                              This restaurant does not exist yet. Use <span className="font-semibold">Add a new restaurant now</span> to create it.
                            </div>
                          ) : null}
                          <button
                            type="button"
                            className="mt-2 text-sm text-blue-600 underline"
                            onClick={() => {
                              setShowInlineRestaurantForExperience(true);
                              setInlineRestaurantForExperience((prev) => ({ ...prev, name: experienceRestaurantSearch.trim() }));
                              setExperienceRestaurantSearch("");
                              setShowExperienceRestaurantSuggestions(false);
                              setShowInlineDishForExperience(false);
                              setInlineDishForExperienceName("");
                              setInlineDishForExperienceError("");
                              setExperienceForm({ ...experienceForm, restaurantId: "", dishId: "", branchId: "none" });
                            }}
                          >
                            Add a new restaurant now
                          </button>
                        </>
                      ) : (
                        <div className="space-y-3 rounded-2xl border p-3">
                          <Input placeholder="Restaurant name" value={inlineRestaurantForExperience.name} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, name: e.target.value })} />
                          <Select value={inlineRestaurantForExperience.area || "__none"} onValueChange={(value) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, area: value === "__none" ? "" : value })}>
                            <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                            <SelectContent><SelectItem value="__none">No area</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input list="restaurant-city-options" placeholder="Select or type a city" value={inlineRestaurantForExperience.city} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, city: e.target.value })} />
                          <Input placeholder="Full address" value={inlineRestaurantForExperience.fullAddress} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, fullAddress: e.target.value })} />
                          <Input placeholder="Google Maps link" value={inlineRestaurantForExperience.mapsLink} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, mapsLink: e.target.value })} />
                          <TagInput
                            label="Cuisines"
                            color="blue"
                            values={inlineRestaurantForExperience.cuisines}
                            setValues={(vals) => setInlineRestaurantForExperience((prev) => ({ ...prev, cuisines: vals }))}
                            inputValue={inlineRestaurantForExperience.cuisineInput}
                            setInputValue={(v) => setInlineRestaurantForExperience((prev) => ({ ...prev, cuisineInput: v }))}
                            suggestions={data.cuisines}
                          />
                          <RestaurantSafetyControls
                            values={inlineRestaurantForExperience}
                            compact
                            onChange={(fieldKey, value) => setInlineRestaurantForExperience((prev) => ({ ...prev, [fieldKey]: value }))}
                          />
                          <button type="button" className="text-sm text-slate-600 underline" onClick={() => { setShowInlineRestaurantForExperience(false); setInlineRestaurantForExperience(inlineRestaurantFormDefault); }}>
                            Back to existing restaurants
                          </button>
                        </div>
                      )}
                    </Field>
                    <Field label={<><span>Dish</span><span className="ml-1 text-red-600">*</span></>}>
                      {!showInlineDishForExperience ? (
                        <>
                          <div className="relative">
                            <Input
                              value={experienceDishSearch}
                              onChange={(e) => {
                                setExperienceDishSearch(e.target.value);
                                setExperienceForm((prev) => ({ ...prev, dishId: "" }));
                                setShowExperienceDishSuggestions(true);
                                setExperienceFormError("");
                              }}
                              onFocus={() => setShowExperienceDishSuggestions(true)}
                              onBlur={() => window.setTimeout(() => setShowExperienceDishSuggestions(false), 150)}
                              placeholder="Select or search dish"
                              disabled={!effectiveExperienceRestaurantId}
                            />
                            {showExperienceDishSuggestions && effectiveExperienceRestaurantId && experienceDishCatalogMatches.length > 0 ? (
                              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border bg-white shadow-lg">
                                {experienceDishCatalogMatches.map((dish) => {
                                  const restaurant = restaurantsById[dish.restaurantId];
                                  const branch = dish.branchId ? branchesById[dish.branchId] : null;
                                  const avgRating = computedDishRating(dish.id);
                                  const isCurrentRestaurant = dish.restaurantId === effectiveExperienceRestaurantId;

                                  return (
                                    <button
                                      key={dish.id}
                                      type="button"
                                      className="flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                                      onClick={() => selectExperienceDishSuggestion(dish)}
                                    >
                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-medium text-slate-900">{dish.name}</span>
                                          {isCurrentRestaurant && <Badge className="!border-emerald-200 !bg-emerald-50 !text-emerald-700">Dish exists here</Badge>}
                                          {!isCurrentRestaurant && <Badge className="!border-amber-200 !bg-amber-50 !text-amber-800">Add dish here</Badge>}
                                          {dish.isWishlist && <Badge>Wishlist</Badge>}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600">
                                          {restaurant?.name || "Unknown restaurant"}
                                          {branch ? ` • ${branch.name}` : ""}
                                          {avgRating ? ` • Avg ${avgRating.toFixed(1)}/5` : ""}
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-xs text-slate-500">
                                        {isCurrentRestaurant ? "Use dish" : "Copy name"}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="mt-2 text-sm text-blue-600 underline"
                            onClick={() => { setShowInlineDishForExperience(true); setShowExperienceDishSuggestions(false); setInlineDishForExperienceError(""); setExperienceDishSearch(""); setExperienceForm((prev) => ({ ...prev, dishId: "" })); }}
                          >
                            Add a new dish now
                          </button>
                          {!showInlineRestaurantForExperience && !!experienceForm.restaurantId && dishOptionsForExperience.length === 0 ? (
                            <div className="mt-2 text-sm text-amber-700">No dishes exist for this restaurant yet.</div>
                          ) : null}
                        </>
                      ) : (
                        <div className="space-y-3 rounded-2xl border p-3">
                          <Input
                            placeholder="Dish name"
                            value={inlineDishForExperienceName}
                            onChange={(e) => {
                              setInlineDishForExperienceName(e.target.value);
                              if (e.target.value.trim()) setInlineDishForExperienceError("");
                            }}
                          />
                          {inlineDishForExperienceError ? <div className="text-sm text-red-600">{inlineDishForExperienceError}</div> : null}
                          <button
                            type="button"
                            className="text-sm text-slate-600 underline"
                            onClick={() => { setShowInlineDishForExperience(false); setInlineDishForExperienceName(""); setInlineDishForExperienceError(""); }}
                          >
                            Back to existing dishes
                          </button>
                        </div>
                      )}
                    </Field>
                    <div>
                      <Field label={<><span>Rating (1-5)</span><span className="ml-1 text-red-600">*</span></>}><Input type="number" min="1" max="5" required value={experienceForm.rating} onChange={(e) => { setExperienceForm({ ...experienceForm, rating: e.target.value }); if (hasValidRating(e.target.value)) setExperienceRatingError(""); }} className={experienceRatingError ? "border-red-400 focus-visible:ring-red-400" : ""} /></Field>
                      {experienceRatingError ? <div className="mt-2 text-sm text-red-600">{experienceRatingError}</div> : null}
                    </div>
                    <Field label="Price ($)"><Input type="number" value={experienceForm.price} onChange={(e) => setExperienceForm({ ...experienceForm, price: e.target.value })} /></Field>
                    <Field label="Value for money">
                      <Select value={experienceForm.valueForMoney || "__none"} onValueChange={(value) => setExperienceForm({ ...experienceForm, valueForMoney: value === "__none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No answer</SelectItem>
                          {VALUE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Branch (optional)">
                      <Select value={experienceForm.branchId} onValueChange={(value) => setExperienceForm({ ...experienceForm, branchId: value })}>
                        <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No branch</SelectItem>
                          {branchOptionsForExperience.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Date"><Input type="date" value={experienceForm.date} onChange={(e) => setExperienceForm({ ...experienceForm, date: e.target.value })} /></Field>
                    <Field label="Order type">
                      <Select value={experienceForm.orderType} onValueChange={(value) => setExperienceForm({ ...experienceForm, orderType: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ORDER_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Images"><Input type="file" accept="image/*" multiple onChange={handleExperienceImageUpload} /></Field>
                      {experienceForm.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {experienceForm.images.map((image) => (
                            <div key={image.id} className="relative overflow-hidden rounded-2xl border bg-white">
                              <img src={image.dataUrl} alt={image.name} className="h-28 w-full object-cover" />
                              <button type="button" className="absolute right-2 top-2 rounded-full bg-white/90 p-1" onClick={() => setExperienceForm((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== image.id) }))}>
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={experienceForm.notes} onChange={(e) => setExperienceForm({ ...experienceForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <ModalActions
                    onCancel={() => { setExperienceOpen(false); resetExperienceForm(); }}
                    onSave={saveExperience}
                    saveLabel={experienceForm.id ? "Save Changes" : "Save Experience"}
                    cancelLabel={experienceForm.id ? "Discard" : "Cancel"}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        <datalist id="restaurant-area-options">
          {areaOptions.map((area) => <option key={area} value={area} />)}
        </datalist>
        <datalist id="restaurant-city-options">
          {cityOptions.map((city) => <option key={city} value={city} />)}
        </datalist>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 gap-2 rounded-2xl bg-transparent p-0 md:grid-cols-5">
            <TabsTrigger value="dashboard" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.dashboard}`}>Dashboard</TabsTrigger>
            <TabsTrigger value="restaurants" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.restaurants}`}>Restaurants</TabsTrigger>
            <TabsTrigger value="dishes" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.dishes}`}>Dishes</TabsTrigger>
            <TabsTrigger value="experiences" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.experiences}`}>Experiences</TabsTrigger>
            <TabsTrigger value="settings" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.settings}`}>Settings</TabsTrigger>
          </TabsList>

          <DashboardTab
            dashboardStats={dashboardStats}
            recentExperiences={recentExperiences}
            dishesById={dishesById}
            restaurantsById={restaurantsById}
            branchesById={branchesById}
            editExperience={editExperience}
            deleteExperience={deleteExperience}
            restaurantSummaries={restaurantSummaries}
            defaultStatsView={defaultRestaurantStatsView}
          />

          <RestaurantsTab
            branchOpen={branchOpen}
            setBranchOpen={setBranchOpen}
            resetBranchForm={resetBranchForm}
            branchForm={branchForm}
            setBranchForm={setBranchForm}
            branchFormError={branchFormError}
            setBranchFormError={setBranchFormError}
            saveBranch={saveBranch}
            data={data}
            areaOptions={areaOptions}
            restaurantSearch={restaurantSearch}
            setRestaurantSearch={setRestaurantSearch}
            restaurantCityFilter={restaurantCityFilter}
            setRestaurantCityFilter={setRestaurantCityFilter}
            restaurantFilterCityOptions={restaurantFilterCityOptions}
            restaurantAreaFilter={restaurantAreaFilter}
            setRestaurantAreaFilter={setRestaurantAreaFilter}
            restaurantFilterAreaOptions={restaurantFilterAreaOptions}
            restaurantCuisineFilter={restaurantCuisineFilter}
            setRestaurantCuisineFilter={setRestaurantCuisineFilter}
            restaurantFilterCuisineOptions={restaurantFilterCuisineOptions}
            restaurantKidsFilter={restaurantKidsFilter}
            setRestaurantKidsFilter={setRestaurantKidsFilter}
            filteredRestaurants={filteredRestaurants}
            computedDishRating={computedDishRating}
            editRestaurant={editRestaurant}
            deleteRestaurant={deleteRestaurant}
            editDish={editDish}
            prepareLogExperience={prepareLogExperience}
            editBranch={editBranch}
            deleteBranch={deleteBranch}
            setDefaultBranch={setDefaultBranch}
            defaultStatsView={defaultRestaurantStatsView}
            restaurantAlertLevels={restaurantAlertLevels}
          />

          <DishesTab
            dishReportSearch={dishReportSearch}
            setDishReportSearch={setDishReportSearch}
            dishComparisonSuggestions={dishComparisonSuggestions}
            activeDishComparison={activeDishComparison}
            activeDishComparisonRows={activeDishComparisonRows}
            openExistingDish={openExistingDish}
            prepareLogExperience={prepareLogExperience}
            search={search}
            setSearch={setSearch}
            restaurantFilter={restaurantFilter}
            setRestaurantFilter={setRestaurantFilter}
            dishFilterRestaurantOptions={dishFilterRestaurantOptions}
            areaFilter={areaFilter}
            setAreaFilter={setAreaFilter}
            dishFilterAreaOptions={dishFilterAreaOptions}
            cuisineFilter={cuisineFilter}
            setCuisineFilter={setCuisineFilter}
            dishFilterCuisineOptions={dishFilterCuisineOptions}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dishStatusOptions={dishStatusOptions}
            filteredDishes={filteredDishes}
            restaurantsById={restaurantsById}
            branchesById={branchesById}
            dishExperienceMap={dishExperienceMap}
            computedDishRating={computedDishRating}
            editDish={editDish}
            deleteDish={deleteDish}
            data={data}
          />

          <ExperiencesTab
            data={data}
            dishesById={dishesById}
            restaurantsById={restaurantsById}
            branchesById={branchesById}
            editExperience={editExperience}
            deleteExperience={deleteExperience}
          />

          <SettingsTab
            allDishTags={allDishTags}
            data={data}
            tagOpen={tagOpen}
            setTagOpen={setTagOpen}
            newTag={newTag}
            setNewTag={setNewTag}
            addTag={addTag}
            expandedTag={expandedTag}
            setExpandedTag={setExpandedTag}
            renameTag={renameTag}
            setTagColor={setTagColor}
            restaurantsById={restaurantsById}
            cuisineOpen={cuisineOpen}
            setCuisineOpen={setCuisineOpen}
            newCuisine={newCuisine}
            setNewCuisine={setNewCuisine}
            addCuisine={addCuisine}
            expandedCuisine={expandedCuisine}
            setExpandedCuisine={setExpandedCuisine}
            renameCuisine={renameCuisine}
            deleteCuisine={deleteCuisine}
            cityOpen={cityOpen}
            setCityOpen={setCityOpen}
            newCity={newCity}
            setNewCity={setNewCity}
            addCity={addCity}
            cityOptions={cityOptions}
            expandedCity={expandedCity}
            setExpandedCity={setExpandedCity}
            renameCity={renameCity}
            deleteCity={deleteCity}
            areaOpen={areaOpen}
            setAreaOpen={setAreaOpen}
            newArea={newArea}
            setNewArea={setNewArea}
            addArea={addArea}
            areaOptions={areaOptions}
            expandedArea={expandedArea}
            setExpandedArea={setExpandedArea}
            renameArea={renameArea}
            deleteArea={deleteArea}
            seedSampleData={seedSampleData}
            exportJson={() => exportData(data)}
            importJson={importJson}
            onLogout={onLogout}
            defaultRestaurantStatsView={defaultRestaurantStatsView}
            setDefaultRestaurantStatsView={setDefaultRestaurantStatsView}
            restaurantSafetyDefaults={restaurantSafetyDefaults}
            setRestaurantSafetyDefault={setRestaurantSafetyDefault}
            restaurantAlertLevels={restaurantAlertLevels}
            setRestaurantAlertLevel={setRestaurantAlertLevel}
          />
        </Tabs>
      </div>
    </div>
  );
}

export default function DishTrackerWebApp() {
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(() => createSampleData());
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("Waiting for sign-in");

  const lastRemoteDataRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) return undefined;

    return onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      setAuthError("");
      setCloudReady(false);
      setCloudStatus(user ? "Loading cloud data..." : "Waiting for sign-in");
    });
  }, []);

  useEffect(() => {
    if (!authUser || !db) return undefined;

    const unsubscribe = onSnapshot(cloudDataDoc(authUser.uid), async (snapshot) => {
      if (snapshot.exists() && snapshot.data()?.data) {
        const remoteData = migrateData(snapshot.data().data);
        lastRemoteDataRef.current = serializeData(remoteData);
        setData(remoteData);
        setCloudReady(true);
        setCloudStatus("Cloud sync active");
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
        }
        return;
      }

      const localData = loadData();
      const serialized = serializeData(localData);
      lastRemoteDataRef.current = serialized;
      setData(localData);
      setCloudReady(true);
      setCloudStatus("Migrating local data...");

      try {
        await setDoc(cloudDataDoc(authUser.uid), {
          data: localData,
          version: CLOUD_DOC_VERSION,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setCloudStatus("Cloud sync active");
      } catch (error) {
        console.error(error);
        setCloudStatus("Migration failed");
      }
    }, (error) => {
      console.error(error);
      setCloudReady(true);
      setCloudStatus("Cloud load failed");
    });

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !cloudReady || !db) return undefined;

    const serialized = serializeData(data);
    if (serialized === lastRemoteDataRef.current) return undefined;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        setCloudStatus("Saving...");
        await setDoc(cloudDataDoc(authUser.uid), {
          data,
          version: CLOUD_DOC_VERSION,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        lastRemoteDataRef.current = serialized;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        setCloudStatus("Cloud sync active");
      } catch (error) {
        console.error(error);
        setCloudStatus("Save failed");
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [authUser, cloudReady, data]);

  async function handleEmailPasswordSignIn() {
    if (!auth || !email.trim() || !password) return;

    setIsSigningIn(true);
    setAuthError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      console.error(error);
      setAuthError("Sign-in failed. Check the email/password and try again.");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    if (!auth) return;
    await signOut(auth);
    setData(createSampleData());
    lastRemoteDataRef.current = null;
    setCloudStatus("Signed out");
  }

  if (!hasFirebaseConfig) {
    return <SetupRequiredScreen />;
  }

  if (!authReady) {
    return <LoadingScreen title="Starting App" body="Checking your Firebase session..." />;
  }

  if (!authUser) {
    return (
      <AuthScreen
        email={email}
        password={password}
        authError={authError}
        isSigningIn={isSigningIn}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleEmailPasswordSignIn}
      />
    );
  }

  if (!cloudReady) {
    return <LoadingScreen title="Loading Data" body="Syncing your dishes, restaurants, and experiences from Firebase..." />;
  }

  return (
    <DishTrackerAppContent
      data={data}
      setData={setData}
      userEmail={authUser.email || "Signed-in user"}
      cloudStatus={cloudStatus}
      onLogout={handleLogout}
    />
  );
}
