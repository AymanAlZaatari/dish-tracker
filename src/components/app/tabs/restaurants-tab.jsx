import { useEffect, useState } from "react";

import { ChevronDown, ChevronUp, Eye, MapPin, NotebookText, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
  DELETE_BUTTON_STYLE,
  EDIT_BUTTON_STYLE,
  LOG_BUTTON_STYLE,
  MUSIC_LEVEL_VALUES,
  RESTAURANT_SAFETY_FIELDS,
  SECTION_CONTAINER,
  TRI_STATE_VALUES,
  VIEW_BUTTON_STYLE,
} from "@/lib/app/constants";
import { average, normalizeMusicLevel, normalizeTriState, ratingPillClass, summarizeTags } from "@/lib/app/data";

import { Field, ModalActions, ModalHeader, Stars } from "../shared";

export function RestaurantsTab({
  branchOpen,
  setBranchOpen,
  resetBranchForm,
  branchForm,
  setBranchForm,
  branchFormError,
  setBranchFormError,
  saveBranch,
  data,
  areaOptions,
  restaurantSearch,
  setRestaurantSearch,
  restaurantCityFilter,
  setRestaurantCityFilter,
  restaurantFilterCityOptions,
  restaurantAreaFilter,
  setRestaurantAreaFilter,
  restaurantFilterAreaOptions,
  restaurantCuisineFilter,
  setRestaurantCuisineFilter,
  restaurantFilterCuisineOptions,
  restaurantSafetyFilters,
  setRestaurantSafetyFilters,
  filteredRestaurants,
  computedDishRating,
  editRestaurant,
  deleteRestaurant,
  editDish,
  prepareLogExperience,
  editBranch,
  deleteBranch,
  setDefaultBranch,
  defaultStatsView,
  restaurantAlertLevels,
  restaurantMusicAlertLevel,
}) {
  const [expandAllDishes, setExpandAllDishes] = useState(false);
  const [expandedDishRestaurantIds, setExpandedDishRestaurantIds] = useState([]);
  const [branchManagerRestaurantId, setBranchManagerRestaurantId] = useState(null);
  const statsView = defaultStatsView || "cards";
  const selectedSafetyFilters = restaurantSafetyFilters || [];

  useEffect(() => {
    const visibleRestaurantIds = new Set(filteredRestaurants.map((restaurant) => restaurant.id));
    setExpandedDishRestaurantIds((currentIds) => currentIds.filter((id) => visibleRestaurantIds.has(id)));
    setBranchManagerRestaurantId((currentId) => (currentId && visibleRestaurantIds.has(currentId) ? currentId : null));
  }, [filteredRestaurants]);

  useEffect(() => {
    const closePopup = (event) => {
      if (!branchManagerRestaurantId) return;
      setBranchManagerRestaurantId(null);
      event.detail.handled = true;
    };
    window.addEventListener("dish-tracker-close-popup", closePopup);
    return () => window.removeEventListener("dish-tracker-close-popup", closePopup);
  }, [branchManagerRestaurantId]);

  const toggleRestaurantDishes = (restaurantId) => {
    if (expandAllDishes) {
      setExpandAllDishes(false);
      setExpandedDishRestaurantIds(
        filteredRestaurants
          .map((restaurant) => restaurant.id)
          .filter((id) => id !== restaurantId)
      );
      return;
    }

    setExpandedDishRestaurantIds((currentIds) =>
      currentIds.includes(restaurantId)
        ? currentIds.filter((id) => id !== restaurantId)
        : [...currentIds, restaurantId]
    );
  };

  const branchManagerRestaurant = branchManagerRestaurantId
    ? data.restaurants.find((restaurant) => restaurant.id === branchManagerRestaurantId) || null
    : null;
  const branchManagerBranches = branchManagerRestaurantId
    ? data.branches.filter((branch) => branch.restaurantId === branchManagerRestaurantId)
    : [];

  const toggleSafetyFilter = (fieldKey) => {
    setRestaurantSafetyFilters((currentFilters) => {
      const filters = currentFilters || [];
      return filters.includes(fieldKey)
        ? filters.filter((key) => key !== fieldKey)
        : [...filters, fieldKey];
    });
  };

  return (
    <TabsContent value="restaurants" className="space-y-6">
      <Dialog open={branchOpen} onOpenChange={(open) => { setBranchOpen(open); if (!open) resetBranchForm(); }}>
        <DialogContent className="sm:max-w-2xl">
          <ModalHeader title={branchForm.id ? "Edit Branch" : "Add Branch"} onClose={() => { setBranchOpen(false); resetBranchForm(); }} />
          {branchFormError ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{branchFormError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Restaurant">
              <Select value={branchForm.restaurantId || "__none"} onValueChange={(value) => { setBranchForm({ ...branchForm, restaurantId: value === "__none" ? "" : value }); setBranchFormError(""); }}>
                <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Select restaurant</SelectItem>
                  {data.restaurants.map((restaurant) => <SelectItem key={restaurant.id} value={restaurant.id}>{restaurant.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Branch name"><Input value={branchForm.name} onChange={(e) => { setBranchForm({ ...branchForm, name: e.target.value }); setBranchFormError(""); }} /></Field>
            <Field label="Area">
              <Select value={branchForm.area || "__none"} onValueChange={(value) => { setBranchForm({ ...branchForm, area: value === "__none" ? "" : value }); setBranchFormError(""); }}>
                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                <SelectContent><SelectItem value="__none">No area</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="City"><Input list="restaurant-city-options" value={branchForm.city} onChange={(e) => { setBranchForm({ ...branchForm, city: e.target.value }); setBranchFormError(""); }} placeholder="Select or type a city" /></Field>
            <div className="md:col-span-2"><Field label="Full address"><Input value={branchForm.fullAddress} onChange={(e) => { setBranchForm({ ...branchForm, fullAddress: e.target.value }); setBranchFormError(""); }} /></Field></div>
            <Field label="Location text"><Input value={branchForm.locationText} onChange={(e) => { setBranchForm({ ...branchForm, locationText: e.target.value }); setBranchFormError(""); }} /></Field>
            <Field label="Google Maps link"><Input value={branchForm.mapsLink} onChange={(e) => { setBranchForm({ ...branchForm, mapsLink: e.target.value }); setBranchFormError(""); }} /></Field>
            <div className="md:col-span-2"><Field label="Notes"><Textarea value={branchForm.notes} onChange={(e) => { setBranchForm({ ...branchForm, notes: e.target.value }); setBranchFormError(""); }} rows={4} /></Field></div>
          </div>
          <ModalActions
            onCancel={() => { setBranchOpen(false); resetBranchForm(); }}
            onSave={saveBranch}
            saveLabel={branchForm.id ? "Save Changes" : "Save Branch"}
            cancelLabel={branchForm.id ? "Discard" : "Cancel"}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!branchManagerRestaurant} onOpenChange={(open) => { if (!open) setBranchManagerRestaurantId(null); }}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
          <ModalHeader title={branchManagerRestaurant ? `${branchManagerRestaurant.name} Branches` : "Branches"} onClose={() => setBranchManagerRestaurantId(null)} />
          {branchManagerRestaurant ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Manage branch-specific address and location details here.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBranchForm({ id: null, restaurantId: branchManagerRestaurant.id, isDefault: false, name: "", area: "", city: "", fullAddress: "", locationText: "", mapsLink: "", notes: "" });
                    setBranchFormError("");
                    setBranchManagerRestaurantId(null);
                    setBranchOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
              </div>
              {branchManagerBranches.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">No branches added yet.</div>
              ) : (
                <div className="space-y-3">
                  {branchManagerBranches.map((branch) => (
                    <div key={branch.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-semibold text-slate-900">{branch.name}</div>
                            {branch.isDefault ? <Badge variant="secondary" className="!border-emerald-300 !bg-emerald-100 !text-emerald-800">Default</Badge> : null}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">{[branch.area, branch.city].filter(Boolean).join(", ") || branch.locationText || "No location"}</div>
                          {branch.fullAddress ? <div className="mt-1 text-sm text-slate-500">{branch.fullAddress}</div> : branch.locationText && branch.area ? <div className="mt-1 text-sm text-slate-500">{branch.locationText}</div> : null}
                          {branch.mapsLink ? <a href={branch.mapsLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-slate-900 underline"><MapPin className="h-4 w-4 text-red-500" /> Open Maps Link</a> : null}
                          {branch.notes ? <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">{branch.notes}</div> : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {!branch.isDefault ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultBranch(branch.restaurantId, branch.id)}
                            >
                              Set Default
                            </Button>
                          ) : null}
                          <Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => { setBranchManagerRestaurantId(null); editBranch(branch); }} aria-label={`Edit ${branch.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteBranch(branch.id)} aria-label={`Delete ${branch.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className={SECTION_CONTAINER}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Restaurant Library</h2>
            <p className="mt-1 text-sm text-slate-600">
              Search and filter restaurants by name, branch, dish, area, city, or cuisine.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                setExpandAllDishes((current) => !current);
                setExpandedDishRestaurantIds([]);
              }}
              aria-pressed={expandAllDishes}
            >
              {expandAllDishes ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              {expandAllDishes ? "Collapse All Dishes" : "Expand All Dishes"}
            </Button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search restaurants, branches, dishes..." value={restaurantSearch} onChange={(e) => setRestaurantSearch(e.target.value)} /></div>
          <Select value={restaurantCityFilter} onValueChange={setRestaurantCityFilter}><SelectTrigger><SelectValue placeholder="City" /></SelectTrigger><SelectContent><SelectItem value="all">All cities</SelectItem>{restaurantFilterCityOptions.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
          <Select value={restaurantAreaFilter} onValueChange={setRestaurantAreaFilter}><SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger><SelectContent><SelectItem value="all">All areas</SelectItem>{restaurantFilterAreaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent></Select>
          <Select value={restaurantCuisineFilter} onValueChange={setRestaurantCuisineFilter}><SelectTrigger><SelectValue placeholder="Cuisine" /></SelectTrigger><SelectContent><SelectItem value="all">All cuisines</SelectItem>{restaurantFilterCuisineOptions.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent></Select>
          <div className="md:col-span-6">
            <div className="flex flex-wrap gap-2">
              {RESTAURANT_SAFETY_FIELDS.map((field) => {
                const isSelected = selectedSafetyFilters.includes(field.key);
                return (
                  <Button
                    key={field.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`rounded-full border px-3 py-2 text-xs font-bold sm:text-sm ${
                      isSelected
                        ? "!border-emerald-400 !bg-emerald-100 !text-emerald-950 hover:!bg-emerald-200"
                        : "!border-slate-200 !bg-white !text-slate-700 hover:!bg-emerald-50 hover:!text-emerald-900"
                    }`}
                    onClick={() => toggleSafetyFilter(field.key)}
                    aria-pressed={isSelected}
                  >
                    {field.positiveLabel}
                  </Button>
                );
              })}
              {selectedSafetyFilters.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3 text-xs font-semibold text-slate-600"
                  onClick={() => setRestaurantSafetyFilters([])}
                >
                  Clear safety filters
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-5 border-t border-slate-200" />

        <div className="grid gap-5 lg:grid-cols-2">
          {filteredRestaurants.map((restaurant) => {
            const branches = data.branches.filter((b) => b.restaurantId === restaurant.id);
            const dishes = data.dishes
              .filter((d) => d.restaurantId === restaurant.id)
              .sort((a, b) => {
                const aRating = computedDishRating(a.id);
                const bRating = computedDishRating(b.id);
                if (a.isWishlist !== b.isWishlist) return a.isWishlist ? -1 : 1;
                if (aRating == null && bRating == null) return a.name.localeCompare(b.name);
                if (aRating == null) return -1;
                if (bRating == null) return 1;
                if (bRating !== aRating) return bRating - aRating;
                return a.name.localeCompare(b.name);
              });
            const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
            const avgDishPrice = average(dishes.map((dish) => dish.price));
            const areDishesExpanded = expandAllDishes || expandedDishRestaurantIds.includes(restaurant.id);
            const safetyBadges = RESTAURANT_SAFETY_FIELDS.map((field) => {
              const value = normalizeTriState(restaurant[field.key]);
              const alertLevel = restaurantAlertLevels?.[field.key] || "no_or_unknown";
              const isAlert = alertLevel !== "never" && (
                value === TRI_STATE_VALUES.NO || (alertLevel === "no_or_unknown" && value === TRI_STATE_VALUES.UNKNOWN)
              );
              if (value === TRI_STATE_VALUES.YES) return { key: field.key, label: field.positiveLabel, className: "!border-emerald-200 !bg-emerald-50 !text-emerald-700" };
              if (!isAlert) return null;
              if (value === TRI_STATE_VALUES.NO) return { key: field.key, label: field.negativeLabel, className: "!border-red-200 !bg-red-100 !text-red-700" };
              return { key: field.key, label: field.unknownLabel, className: "!border-amber-200 !bg-amber-100 !text-amber-800" };
            }).filter(Boolean);
            const musicLevel = normalizeMusicLevel(restaurant.musicLevel);
            const showMusicWarning = restaurantMusicAlertLevel !== "never" && (
              musicLevel === MUSIC_LEVEL_VALUES.HIGH || (restaurantMusicAlertLevel === "high_or_unknown" && musicLevel === MUSIC_LEVEL_VALUES.UNKNOWN)
            );
            return (
              <Card key={restaurant.id} className="rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
                  <div className="min-w-0">
                    <CardTitle className="break-words text-2xl font-bold tracking-tight">{restaurant.name}</CardTitle>
                    <div className="mt-3 flex flex-wrap gap-2.5 text-xs text-slate-600">
                      {restaurant.area && <Badge variant="secondary">{restaurant.area}</Badge>}
                      {restaurant.city && <Badge variant="secondary">{restaurant.city}</Badge>}
                      {(restaurant.cuisines || []).map((cuisine) => <Badge key={cuisine} variant="secondary">{cuisine}</Badge>)}
                      {safetyBadges.map((badge) => <Badge key={badge.key} className={badge.className}>{badge.label}</Badge>)}
                      {showMusicWarning ? (
                        <Badge className={musicLevel === MUSIC_LEVEL_VALUES.HIGH ? "!border-red-200 !bg-red-100 !text-red-700" : "!border-amber-200 !bg-amber-100 !text-amber-800"}>
                          {musicLevel === MUSIC_LEVEL_VALUES.HIGH ? "High music" : "Music unknown"}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${EDIT_BUTTON_STYLE}`} onClick={() => editRestaurant(restaurant)} aria-label={`Edit ${restaurant.name}`}>
                      <Pencil className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${DELETE_BUTTON_STYLE}`} onClick={() => deleteRestaurant(restaurant.id)} aria-label={`Delete ${restaurant.name}`}>
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-5 text-sm text-slate-600 sm:px-6 sm:pb-6">
                  <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:gap-3 sm:p-4">
                    {statsView === "cards" ? (
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
                          <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Restaurant Score</div>
                          {restaurant.rating ? (
                            <>
                              <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{Number(restaurant.rating).toFixed(1)}</div>
                              <div className="mt-2 flex justify-center lg:hidden"><Stars value={restaurant.rating} size="sm" /></div>
                              <div className="mt-2 hidden lg:flex lg:justify-center"><Stars value={restaurant.rating} /></div>
                            </>
                          ) : (
                            <div className="mt-2 text-lg font-bold text-slate-400 sm:mt-3 sm:text-2xl">—</div>
                          )}
                        </div>
                        <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(avgDishRating)}`}>
                          <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Avg Dish Rating</div>
                          {avgDishRating ? (
                            <>
                              <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{avgDishRating.toFixed(1)}</div>
                              <div className="mt-2 flex justify-center lg:hidden"><Stars value={avgDishRating} size="sm" /></div>
                              <div className="mt-2 hidden lg:flex lg:justify-center"><Stars value={avgDishRating} /></div>
                            </>
                          ) : (
                            <div className="mt-2 text-lg font-bold text-slate-400 sm:mt-3 sm:text-2xl">—</div>
                          )}
                        </div>
                        <div className="min-w-0 rounded-xl border border-emerald-200 bg-white p-3 text-center text-emerald-900 sm:rounded-2xl sm:p-4">
                          <div className="text-[0.68rem] font-semibold leading-tight text-emerald-700 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Avg Dish Price</div>
                          <div className="mt-2 text-lg font-bold sm:mt-3 sm:text-2xl">{avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white">
                        <div className={`flex items-center justify-between gap-4 px-4 py-3 ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
                          <span className="text-sm font-medium text-slate-500">Restaurant Score</span>
                          <div className="flex items-center gap-3">
                            {restaurant.rating ? <div className="flex"><Stars value={restaurant.rating} /></div> : null}
                            <span className="text-base font-bold text-slate-900">{restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-200" />
                        <div className={`flex items-center justify-between gap-4 px-4 py-3 ${ratingPillClass(avgDishRating)}`}>
                          <span className="text-sm font-medium text-slate-500">Avg Dish Rating</span>
                          <div className="flex items-center gap-3">
                            {avgDishRating ? <div className="flex"><Stars value={avgDishRating} /></div> : null}
                            <span className="text-base font-bold text-slate-900">{avgDishRating ? avgDishRating.toFixed(1) : "—"}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-200" />
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <span className="text-sm font-medium text-emerald-700">Avg Dish Price</span>
                          <span className="text-base font-bold text-emerald-900">{avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</span>
                        </div>
                      </div>
                    )}
                    {(restaurant.fullAddress || restaurant.recommendedBy) && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {restaurant.fullAddress && <div><span className="font-medium text-slate-900">Full Address:</span> {restaurant.fullAddress}</div>}
                        {restaurant.recommendedBy && <div><span className="font-medium text-slate-900">Recommended By:</span> {restaurant.recommendedBy}</div>}
                      </div>
                    )}
                    {restaurant.mapsLink && <a href={restaurant.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-900 underline"><MapPin className="h-5 w-5 text-red-500" /> Open Maps Link</a>}
                  </div>
                  {restaurant.notes && <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-1 font-medium text-slate-900">Notes</div>{restaurant.notes}</div>}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-left font-medium text-slate-900"
                        onClick={() => toggleRestaurantDishes(restaurant.id)}
                        aria-expanded={areDishesExpanded}
                      >
                        <span>Dishes</span>
                        <Badge variant="outline">{dishes.length}</Badge>
                        {areDishesExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </button>
                    </div>
                    {!areDishesExpanded ? null : dishes.length === 0 ? (
                      <div className="text-sm text-slate-500">No dishes added yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {dishes.map((dish) => {
                          const dishAvgRating = computedDishRating(dish.id);
                          const tagSummary = summarizeTags(dish.tags);
                          return (
                            <div key={dish.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                <div className="font-medium text-slate-900">{dish.name}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                  {dish.isWishlist ? <Badge className="!border-amber-200 !bg-amber-100 !text-amber-800">Wishlist</Badge> : <Badge className="!border-emerald-200 !bg-emerald-100 !text-emerald-800">Tried</Badge>}
                                  {dish.portionSize && dish.portionSize !== "Adult" ? <Badge variant="outline">{dish.portionSize}</Badge> : null}
                                  {tagSummary.visible.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                  {tagSummary.hiddenCount > 0 ? <Badge variant="outline">+{tagSummary.hiddenCount} more</Badge> : null}
                                  {dish.alerts?.map((item) => (
                                    <Badge key={item} className="!border-red-200 !bg-red-100 !text-red-700">{item}</Badge>
                                  ))}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(dishAvgRating)}`}>
                                    <span>Rating:</span>
                                    {dishAvgRating ? <><span>({dishAvgRating.toFixed(1)})</span><Stars value={dishAvgRating} /></> : <span>—</span>}
                                  </div>
                                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.8rem] font-semibold text-slate-700">
                                    <span>Price:</span>
                                    <span>{dish.price != null ? `$${Number(dish.price).toFixed(1)}` : "—"}</span>
                                  </div>
                                </div>
                                </div>
                                <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
                                  <Button variant="outline" size="sm" className={VIEW_BUTTON_STYLE} onClick={() => editDish(dish)} aria-label={`View ${dish.name}`}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className={LOG_BUTTON_STYLE} onClick={() => prepareLogExperience(dish.restaurantId, dish.id)} aria-label={`Log experience for ${dish.name}`}>
                                    <NotebookText className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">Branches</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {branches.length === 0 ? "No branches added yet." : `${branches.length} branch${branches.length === 1 ? "" : "es"} available`}
                        </div>
                      </div>
                      <Button type="button" variant="outline" onClick={() => setBranchManagerRestaurantId(restaurant.id)}>
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredRestaurants.length === 0 && (
            <Card className="rounded-3xl border-2 border-dashed border-slate-300 bg-white shadow-sm lg:col-span-2">
              <CardContent className="p-6 text-sm text-slate-500">No restaurants match the current filters.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
