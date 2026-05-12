import { useState } from "react";
import { CalendarDays, Camera, DollarSign, Filter, Heart, MapPin, NotebookText, Pencil, Sparkles, Star, Store, Trash2, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";

import {
  DASHBOARD_CARD_STYLES,
  DELETE_BUTTON_STYLE,
  EDIT_BUTTON_STYLE,
  MUSIC_LEVEL_VALUES,
  ORDER_TYPE_BADGE_STYLES,
  RESTAURANT_SAFETY_FIELDS,
  SECTION_CONTAINER,
  TRI_STATE_VALUES,
} from "@/lib/app/constants";
import { normalizeMusicLevel, normalizeTriState, ratingPillClass, valuePillClass } from "@/lib/app/data";

import { Stars } from "../shared";

const MOBILE_CARD_TITLE_CLASS = "text-[1.12rem] font-bold text-slate-900 sm:text-lg";
const MOBILE_CARD_META_CLASS = "text-[0.8rem] font-medium text-slate-500 sm:text-sm";
const MOBILE_KPI_LABEL_CLASS = "text-[0.9rem] font-semibold leading-tight sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]";
const MOBILE_KPI_VALUE_CLASS = "text-[1.2rem] font-bold sm:text-2xl";

export function DashboardTab({
  dashboardStats,
  recentExperiences,
  dishesById,
  restaurantsById,
  branchesById,
  editExperience,
  deleteExperience,
  restaurantSummaries,
  defaultStatsView,
  openRestaurantFromDashboard,
  restaurantAlertLevels,
  restaurantMusicAlertLevel,
}) {
  const [dishListRestaurant, setDishListRestaurant] = useState(null);

  return (
    <TabsContent value="dashboard" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Restaurants", dashboardStats.restaurants, <Store className="h-5 w-5" key="a" />],
          ["Dishes", dashboardStats.dishes, <UtensilsCrossed className="h-5 w-5" key="b" />],
          ["Experiences", dashboardStats.experiences, <NotebookText className="h-5 w-5" key="c" />],
          ["Tried", dashboardStats.triedDishes, <Star className="h-5 w-5" key="d" />],
          ["Wishlist", dashboardStats.wishlistDishes, <Heart className="h-5 w-5" key="e" />],
          ["Avg Dish Rating", dashboardStats.avgDishRating.toFixed(1), <Filter className="h-5 w-5" key="f" />],
        ].map(([label, value, icon]) => (
          <Card key={label} className={`rounded-3xl border shadow-sm ${DASHBOARD_CARD_STYLES[label] || "border-slate-200 bg-white"}`}>
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center sm:p-5">
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <span>{icon}</span>
                <span className="text-xl font-bold text-slate-900 sm:text-2xl">{value}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold leading-tight text-slate-700 sm:text-[0.95rem]">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={`${SECTION_CONTAINER} grid gap-6 xl:grid-cols-2`}>
        <div className="rounded-2xl border border-rose-200 bg-rose-100 px-4 py-3 text-center xl:hidden">
          <div className="text-base font-black uppercase tracking-[0.08em] text-rose-950">Recent Experiences</div>
        </div>

        <Card className="rounded-3xl border border-rose-200 bg-rose-50/70 shadow-sm xl:border-0 xl:bg-white">
          <CardHeader className="hidden xl:block border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="font-bold">Recent Experiences</CardTitle>
                <div className="mt-1 text-sm text-slate-500">Latest logged dishes with price, rating, and worth at a glance.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Showing</div>
                <div className="text-sm font-semibold text-slate-900">{recentExperiences.length} items</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {recentExperiences.length === 0 ? <div className="text-sm text-slate-500">No experiences yet.</div> : recentExperiences.map((experience) => {
              const dish = dishesById[experience.dishId];
              const restaurant = dish ? restaurantsById[dish.restaurantId] : null;
              const branch = experience.branchId ? branchesById[experience.branchId] : null;
              return (
                <RecentExperienceCard
                  key={experience.id}
                  experience={experience}
                  dish={dish}
                  restaurant={restaurant}
                  branch={branch}
                  statsView={defaultStatsView}
                  editExperience={editExperience}
                  deleteExperience={deleteExperience}
                  onOpenRestaurant={openRestaurantFromDashboard}
                />
              );
            })}
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-100 px-4 py-3 text-center xl:hidden">
          <div className="text-base font-black uppercase tracking-[0.08em] text-emerald-950">Restaurants Overview</div>
        </div>

        <Card className="rounded-3xl border border-emerald-200 bg-emerald-50/70 shadow-sm xl:col-start-auto xl:border-0 xl:bg-white">
          <CardHeader className="hidden xl:block border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="font-bold">Restaurants Overview</CardTitle>
                <div className="mt-1 text-sm text-slate-500">Quick summaries of restaurant activity, ratings, and average dish price.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Showing</div>
                <div className="text-sm font-semibold text-slate-900">{restaurantSummaries.length} items</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {restaurantSummaries.length === 0 ? <div className="text-sm text-slate-500">No restaurants yet.</div> : restaurantSummaries.map((summary) => (
              <RestaurantOverviewCard
                key={summary.restaurant.id}
                statsView={defaultStatsView}
                onOpenRestaurant={openRestaurantFromDashboard}
                onOpenDishes={setDishListRestaurant}
                restaurantAlertLevels={restaurantAlertLevels}
                restaurantMusicAlertLevel={restaurantMusicAlertLevel}
                {...summary}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!dishListRestaurant} onOpenChange={(open) => { if (!open) setDishListRestaurant(null); }}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
          <div className="space-y-4">
            <div className="pr-8">
              <div className="text-xl font-bold text-slate-900">{dishListRestaurant?.restaurant.name || "Restaurant"} dishes</div>
              <div className="mt-1 text-sm text-slate-500">
                {dishListRestaurant?.dishes.length || 0} available dish{dishListRestaurant?.dishes.length === 1 ? "" : "es"}
              </div>
            </div>
            {dishListRestaurant?.dishes.length ? (
              <div className="space-y-3">
                {dishListRestaurant.dishes.map((dish) => (
                  <div key={dish.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-base font-bold text-slate-900">{dish.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          {dish.branchId ? <span>Branch-specific</span> : <span>All branches</span>}
                          {dish.isWishlist ? <Badge>Wishlist</Badge> : null}
                          {(dish.tags || []).slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="border-slate-200 bg-slate-100 text-slate-700">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {dish.price ? <Badge variant="secondary" className="border-slate-200 bg-slate-100 text-slate-700">${Number(dish.price).toFixed(1)}</Badge> : null}
                        {dish.computedRating ? <Badge className={ratingPillClass(dish.computedRating)}>{Number(dish.computedRating).toFixed(1)}</Badge> : null}
                      </div>
                    </div>
                    {dish.notes ? <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{dish.notes}</div> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">No dishes recorded for this restaurant yet.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}

function RestaurantOverviewCard({ restaurant, dishes, dishesCount, experiencesCount, avgDishRating, avgDishPrice, statsView, onOpenRestaurant, onOpenDishes, restaurantAlertLevels, restaurantMusicAlertLevel }) {
  const cuisines = restaurant.cuisines?.length ? restaurant.cuisines : [];
  const hasLocation = restaurant.area || restaurant.city;
  const isInlineView = statsView === "rows";
  const safetyBadges = RESTAURANT_SAFETY_FIELDS.map((field) => {
    const value = normalizeTriState(restaurant[field.key]);
    const alertLevel = restaurantAlertLevels?.[field.key] || "no_or_unknown";
    const isAlert = alertLevel !== "never" && (
      value === TRI_STATE_VALUES.NO || (alertLevel === "no_or_unknown" && value === TRI_STATE_VALUES.UNKNOWN)
    );
    if (!isAlert) return null;
    if (value === TRI_STATE_VALUES.NO) return { key: field.key, label: field.negativeLabel, className: "!border-red-200 !bg-red-100 !text-red-700" };
    return { key: field.key, label: field.unknownLabel, className: "!border-amber-200 !bg-amber-100 !text-amber-800" };
  }).filter(Boolean);
  const musicLevel = normalizeMusicLevel(restaurant.musicLevel);
  const showMusicWarning = restaurantMusicAlertLevel !== "never" && (
    musicLevel === MUSIC_LEVEL_VALUES.HIGH || (restaurantMusicAlertLevel === "high_or_unknown" && musicLevel === MUSIC_LEVEL_VALUES.UNKNOWN)
  );

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100/80 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <button
                type="button"
                className={`${MOBILE_CARD_TITLE_CLASS} text-left underline-offset-4 hover:underline`}
                onClick={() => onOpenRestaurant?.(restaurant)}
              >
                {restaurant.name}
              </button>
            </div>
          </div>

          <div className={`flex flex-wrap items-center gap-2 ${MOBILE_CARD_META_CLASS}`}>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5" />
              {hasLocation ? [restaurant.area, restaurant.city].filter(Boolean).join(", ") : "No location"}
            </span>
            {cuisines.map((cuisine) => (
              <Badge key={cuisine} variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>{cuisine}</span>
              </Badge>
            ))}
            {safetyBadges.map((badge) => <Badge key={badge.key} className={badge.className}>{badge.label}</Badge>)}
            {showMusicWarning ? (
              <Badge className={musicLevel === MUSIC_LEVEL_VALUES.HIGH ? "!border-red-200 !bg-red-100 !text-red-700" : "!border-amber-200 !bg-amber-100 !text-amber-800"}>
                {musicLevel === MUSIC_LEVEL_VALUES.HIGH ? "High music" : "Music unknown"}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:min-w-[10rem]">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Overview</div>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-[0.8rem] font-semibold text-slate-900 sm:text-sm">
            <button
              type="button"
              className="rounded-full px-1 text-emerald-800 underline-offset-4 hover:underline"
              onClick={() => onOpenDishes?.({ restaurant, dishes })}
            >
              {dishesCount} dishes
            </button>
            <span>•</span>
            <span>{experiencesCount} experiences</span>
          </div>
        </div>
      </div>

      {isInlineView ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
          <InlineMetricRow
            label="Restaurant Score"
            value={restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}
            className={ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}
            starsValue={restaurant.rating ? Number(restaurant.rating) : null}
          />
          <div className="border-t border-slate-200" />
          <InlineMetricRow
            label="Avg Dish Rating"
            value={avgDishRating ? avgDishRating.toFixed(1) : "—"}
            className={ratingPillClass(avgDishRating)}
            starsValue={avgDishRating || null}
          />
          <div className="border-t border-slate-200" />
          <InlineMetricRow label="Avg Dish Price" value={avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"} className="text-[#415162]" labelClassName="text-slate-500" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
            <div className={`${MOBILE_KPI_LABEL_CLASS} text-slate-500`}>Restaurant Score</div>
            <div className={`mt-2 text-slate-900 sm:mt-3 ${MOBILE_KPI_VALUE_CLASS}`}>{restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}</div>
            {restaurant.rating ? <div className="mt-2 flex justify-center lg:hidden"><Stars value={restaurant.rating} size="sm" /></div> : null}
            {restaurant.rating ? <div className="mt-2 hidden justify-center lg:flex"><Stars value={restaurant.rating} /></div> : null}
          </div>
          <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(avgDishRating)}`}>
            <div className={`${MOBILE_KPI_LABEL_CLASS} text-slate-500`}>Avg Dish Rating</div>
            <div className={`mt-2 text-slate-900 sm:mt-3 ${MOBILE_KPI_VALUE_CLASS}`}>{avgDishRating ? avgDishRating.toFixed(1) : "—"}</div>
            {avgDishRating ? <div className="mt-2 flex justify-center lg:hidden"><Stars value={avgDishRating} size="sm" /></div> : null}
            {avgDishRating ? <div className="mt-2 hidden justify-center lg:flex"><Stars value={avgDishRating} /></div> : null}
          </div>
          <div className="min-w-0 rounded-xl border border-[#d7dfe9] bg-[#ebeff4] p-3 text-center text-[#415162] sm:rounded-2xl sm:p-4">
            <div className={`${MOBILE_KPI_LABEL_CLASS} text-slate-500`}>Avg Dish Price</div>
            <div className={`mt-2 sm:mt-3 ${MOBILE_KPI_VALUE_CLASS}`}>{avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentExperienceCard({ experience, dish, restaurant, branch, statsView, editExperience, deleteExperience, onOpenRestaurant }) {
  const hasPrice = experience.price != null && experience.price !== "";
  const hasValue = Boolean(experience.valueForMoney);
  const hasRating = experience.rating != null;
  const hasNotes = Boolean(experience.notes);
  const imageCount = experience.images?.length || 0;
  const isInlineView = statsView === "rows";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100/80 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div className={`min-w-0 ${MOBILE_CARD_TITLE_CLASS}`}>{dish?.name || "Unknown dish"}</div>
          </div>
          <div className={`flex flex-wrap items-center gap-2 ${MOBILE_CARD_META_CLASS}`}>
            {restaurant?.name ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-800 underline-offset-4 hover:bg-indigo-100 hover:underline"
                onClick={() => onOpenRestaurant?.(restaurant)}
              >
                <Store className="h-3.5 w-3.5" />
                {restaurant.name}
              </button>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              <CalendarDays className="h-3.5 w-3.5" />
              {experience.date}
            </span>
            <Badge
              variant="secondary"
              className={`gap-1.5 ${ORDER_TYPE_BADGE_STYLES[experience.orderType] || "bg-slate-100 text-slate-700 border-slate-200"}`}
            >
              <NotebookText className="h-3.5 w-3.5" />
              <span>{experience.orderType}</span>
            </Badge>
            {branch ? (
              <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-800 border-amber-200">
                <MapPin className="h-3.5 w-3.5" />
                <span>{branch.name}</span>
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {(hasPrice || hasValue || hasRating || imageCount > 0) ? (
        <div className="mt-4 space-y-3">
          {isInlineView ? (
            <div className="rounded-2xl border border-slate-200 bg-white">
              <InlineMetricRow
                label="Price"
                value={hasPrice ? `$${Number(experience.price).toFixed(1)}` : "—"}
                className="text-[#415162]"
                labelClassName="text-slate-500"
              />
              <div className="border-t border-slate-200" />
              <InlineMetricRow
                label="Rating"
                value={hasRating ? Number(experience.rating).toFixed(1) : "—"}
                className={ratingPillClass(hasRating ? Number(experience.rating) : null)}
                starsValue={hasRating ? Number(experience.rating) : null}
              />
              <div className="border-t border-slate-200" />
              <InlineMetricRow
                label="$ Worth"
                value={hasValue ? experience.valueForMoney : "—"}
                className={valuePillClass(experience.valueForMoney)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <ExperienceMetricCard
                label="Price"
                value={hasPrice ? `$${Number(experience.price).toFixed(1)}` : "—"}
                icon={<DollarSign className="h-4 w-4" />}
                className="border-[#d7dfe9] bg-[#ebeff4] text-[#415162]"
                labelClassName="text-slate-500"
              />
              <ExperienceMetricCard
                label="Rating"
                value={hasRating ? Number(experience.rating).toFixed(1) : "—"}
                icon={<Star className="h-4 w-4" />}
                className={ratingPillClass(hasRating ? Number(experience.rating) : null)}
              >
                {hasRating ? <div className="mt-2 flex justify-center sm:hidden"><Stars value={experience.rating} size="sm" /></div> : null}
                {hasRating ? <div className="mt-2 hidden justify-center sm:flex"><Stars value={experience.rating} /></div> : null}
              </ExperienceMetricCard>
              <ExperienceMetricCard
                label="$ Worth"
                value={hasValue ? experience.valueForMoney : "—"}
                icon={<Sparkles className="h-4 w-4" />}
                className={valuePillClass(experience.valueForMoney)}
                valueClassName="text-[1.08rem] sm:text-lg"
              />
            </div>
          )}

          {imageCount > 0 ? (
            <Badge variant="secondary" className="gap-1.5 bg-rose-50 text-rose-800 border-rose-200">
              <Camera className="h-3.5 w-3.5" />
              <span>{imageCount} image{imageCount === 1 ? "" : "s"}</span>
            </Badge>
          ) : null}
        </div>
      ) : null}

      {hasNotes ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Notes</div>
          {experience.notes}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${EDIT_BUTTON_STYLE}`} onClick={() => editExperience(experience)}>
          <Pencil className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${DELETE_BUTTON_STYLE}`} onClick={() => deleteExperience(experience.id)}>
          <Trash2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  );
}

function InlineMetricRow({ label, value, className = "", labelClassName = "text-slate-500", starsValue = null }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${className}`}>
      <span className={`text-sm font-medium ${labelClassName}`}>{label}</span>
      <div className="flex items-center gap-3">
        {starsValue ? <div className="flex"><Stars value={starsValue} /></div> : null}
        <span className="text-base font-bold text-slate-900">{value}</span>
      </div>
    </div>
  );
}

function ExperienceMetricCard({ label, value, icon, className, labelClassName = "text-slate-500", valueClassName = "", children }) {
  return (
    <div className={`min-w-0 rounded-2xl border px-2 py-3 text-center sm:px-3 sm:p-4 ${className}`}>
      <div className={`flex items-center justify-center gap-1 sm:gap-1.5 ${MOBILE_KPI_LABEL_CLASS} ${labelClassName}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-slate-900 sm:mt-3 sm:text-xl ${MOBILE_KPI_VALUE_CLASS} ${valueClassName}`}>{value}</div>
      {children ? <div className="mt-1 sm:mt-2">{children}</div> : null}
    </div>
  );
}
