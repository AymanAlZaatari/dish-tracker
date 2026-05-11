import { Pencil, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";

import {
  DELETE_BUTTON_STYLE,
  EDIT_BUTTON_STYLE,
  LOG_EXPERIENCE_BUTTON_STYLE,
  SECTION_CONTAINER,
} from "@/lib/app/constants";
import { ratingPillClass, tagChipStyle } from "@/lib/app/data";

import { Stars } from "../shared";

export function DishesTab({
  dishReportSearch,
  setDishReportSearch,
  dishComparisonSuggestions,
  activeDishComparison,
  activeDishComparisonRows,
  openExistingDish,
  prepareLogExperience,
  search,
  setSearch,
  restaurantFilter,
  setRestaurantFilter,
  dishFilterRestaurantOptions,
  areaFilter,
  setAreaFilter,
  dishFilterAreaOptions,
  cuisineFilter,
  setCuisineFilter,
  dishFilterCuisineOptions,
  statusFilter,
  setStatusFilter,
  dishStatusOptions,
  filteredDishes,
  restaurantsById,
  branchesById,
  dishExperienceMap,
  computedDishRating,
  editDish,
  deleteDish,
  data,
}) {
  return (
    <TabsContent value="dishes" className="space-y-6">
      <Card className="rounded-3xl border border-amber-200 bg-amber-50/60 shadow-sm">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-amber-950">Dish Comparison Across Restaurants</CardTitle>
          <div className="text-sm text-slate-600">
            Compare one dish across every restaurant you have logged so you can decide where you liked it most.
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-5">
          <div className="space-y-3 rounded-2xl border border-amber-200 bg-white/70 p-4">
            <Input
              placeholder="Type a dish name like Tawouk"
              value={dishReportSearch}
              onChange={(e) => setDishReportSearch(e.target.value)}
            />
            {dishComparisonSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dishComparisonSuggestions.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    className="rounded-full border px-3 py-1 text-xs text-slate-600"
                    onClick={() => setDishReportSearch(group.label)}
                  >
                    {group.label} ({group.items.length})
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeDishComparison ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xl font-bold tracking-tight text-slate-900">{activeDishComparison.label}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {activeDishComparison.matchCount > 1
                    ? `${activeDishComparison.matchCount} dish matches across ${activeDishComparisonRows.length} restaurant entr${activeDishComparisonRows.length === 1 ? "y" : "ies"}.`
                    : `${activeDishComparisonRows.length} restaurant${activeDishComparisonRows.length === 1 ? "" : "s"} tracked for this dish.`}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Dish</th>
                      <th className="px-4 py-3 font-medium">Restaurant</th>
                      <th className="px-4 py-3 font-medium">Average</th>
                      <th className="px-4 py-3 font-medium">Latest</th>
                      <th className="px-4 py-3 font-medium">Best</th>
                      <th className="px-4 py-3 font-medium">Experiences</th>
                      <th className="px-4 py-3 font-medium">Latest notes</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDishComparisonRows.map(({ dish, restaurant, branch, experiences, latestExperience, avgRating, bestRating }) => (
                      <tr key={dish.id} className="border-t align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{dish.name}</div>
                          {dish.tags?.length ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {dish.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[0.65rem]" style={tagChipStyle(data.tagColors?.[tag])}>{tag}</Badge>
                              ))}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{restaurant?.name || "Unknown restaurant"}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {restaurant?.area || "No area"}
                            {restaurant?.cuisines?.length ? ` • ${restaurant.cuisines.join(", ")}` : ""}
                            {branch ? ` • ${branch.name}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">{avgRating ? avgRating.toFixed(1) : "—"}</td>
                        <td className="px-4 py-3">
                          {latestExperience?.rating ?? "—"}
                          {latestExperience?.date ? <div className="mt-1 text-xs text-slate-500">{latestExperience.date}</div> : null}
                        </td>
                        <td className="px-4 py-3">{bestRating || "—"}</td>
                        <td className="px-4 py-3">
                          {experiences.length}
                          {latestExperience?.price != null ? <div className="mt-1 text-xs text-slate-500">Latest price: {latestExperience.price}</div> : null}
                        </td>
                        <td className="max-w-xs px-4 py-3 text-slate-600">
                          {latestExperience?.notes || dish.notes || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openExistingDish(dish)}>Open</Button>
                            <Button variant="ghost" size="sm" onClick={() => prepareLogExperience(dish.restaurantId, dish.id)}>Log</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className={SECTION_CONTAINER}>
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dish Library</h2>
          <p className="mt-1 text-sm text-slate-600">
            Browse, filter, and manage all saved dishes across restaurants.
          </p>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search dishes, tags, restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <Select value={restaurantFilter} onValueChange={setRestaurantFilter}><SelectTrigger><SelectValue placeholder="Restaurant" /></SelectTrigger><SelectContent><SelectItem value="all">All restaurants</SelectItem>{dishFilterRestaurantOptions.map((restaurantName) => <SelectItem key={restaurantName} value={restaurantName}>{restaurantName}</SelectItem>)}</SelectContent></Select>
          <Select value={areaFilter} onValueChange={setAreaFilter}><SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger><SelectContent><SelectItem value="all">All areas</SelectItem>{dishFilterAreaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent></Select>
          <Select value={cuisineFilter} onValueChange={setCuisineFilter}><SelectTrigger><SelectValue placeholder="Cuisine" /></SelectTrigger><SelectContent><SelectItem value="all">All cuisines</SelectItem>{dishFilterCuisineOptions.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{dishStatusOptions.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent></Select>
        </div>

        <div className="mb-5 border-t border-slate-200" />

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDishes.map((dish) => {
            const restaurant = restaurantsById[dish.restaurantId];
            const branch = dish.branchId ? branchesById[dish.branchId] : null;
            const experiences = dishExperienceMap[dish.id] || [];
            const avgRating = computedDishRating(dish.id);
            return (
              <Card key={dish.id} className="rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
                <CardHeader className="px-6 pt-6 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight">{dish.name}</CardTitle>
                      <div className="mt-1 text-sm text-slate-500">{restaurant?.name || "Unknown restaurant"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => editDish(dish)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                      <Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteDish(dish.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dish.isWishlist ? <Badge className="!border-amber-200 !bg-amber-100 !text-amber-800">Wishlist</Badge> : <Badge className="!border-emerald-200 !bg-emerald-100 !text-emerald-800">Tried</Badge>}
                    {restaurant?.area && <Badge variant="secondary">{restaurant.area}</Badge>}
                    {(restaurant?.cuisines || []).map((cuisine) => <Badge key={cuisine} variant="secondary">{cuisine}</Badge>)}
                    {branch && <Badge variant="secondary">Branch: {branch.name}</Badge>}
                    {dish.portionSize && dish.portionSize !== "Adult" && <Badge variant="outline">{dish.portionSize}</Badge>}
                    {(dish.tags || []).map((tag) => <Badge key={tag} variant="outline" style={tagChipStyle(data.tagColors?.[tag])}>{tag}</Badge>)}
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4 text-sm text-slate-600">
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(avgRating)}`}>
                      <span>Dish rating:</span>
                      {avgRating ? <><span>({avgRating.toFixed(1)})</span><Stars value={avgRating} /></> : <span>—</span>}
                    </div>
                    {dish.recommendedBy ? <div><span className="font-medium text-slate-900">Recommended by:</span> {dish.recommendedBy}</div> : null}
                  </div>
                  {dish.recommendations?.length ? <div className="rounded-2xl border border-slate-200 bg-white p-4"><div><span className="font-medium text-slate-900">Recommendations:</span><div className="mt-2 flex flex-wrap gap-2">{dish.recommendations.map((item) => <Badge key={item} className="!border-blue-200 !bg-blue-100 !text-blue-700">{item}</Badge>)}</div></div></div> : null}
                  {dish.alerts?.length ? <div className="rounded-2xl border border-slate-200 bg-white p-4"><div><span className="font-medium text-slate-900">Alerts:</span><div className="mt-2 flex flex-wrap gap-2">{dish.alerts.map((item) => <Badge key={item} className="!border-red-200 !bg-red-100 !text-red-700">{item}</Badge>)}</div></div></div> : null}
                  {dish.notes ? <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-1 font-medium text-slate-900">Notes</div>{dish.notes}</div> : null}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-medium text-slate-900">Experience count: {experiences.length}</div>
                    {experiences.length > 0 && <div className="mt-1 text-xs text-slate-500">Latest: {[...experiences].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date}</div>}
                  </div>
                  <Button variant="outline" className={`w-full ${LOG_EXPERIENCE_BUTTON_STYLE}`} onClick={() => prepareLogExperience(dish.restaurantId, dish.id)}>Log another experience</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </TabsContent>
  );
}
