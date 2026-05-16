import { useRef, useState } from "react";

import { ChevronDown, ChevronUp, Database, Download, LogOut, Pencil, Plus, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";

import {
  MUSIC_ALERT_LEVELS,
  MUSIC_LEVEL_OPTIONS,
  RESTAURANT_ALERT_LEVELS,
  RESTAURANT_SAFETY_FIELDS,
  SECTION_CONTAINER,
  TOP_ACTION_BUTTON_STYLES,
  TRI_STATE_OPTIONS,
} from "@/lib/app/constants";
import { tagChipStyle } from "@/lib/app/data";

import { ModalActions, ModalHeader } from "../shared";

const SETTINGS_ADD_BUTTON_STYLE = "!border-sky-300 !bg-sky-100 !text-sky-900 hover:!bg-sky-200";
const SETTINGS_ICON_EDIT_STYLE = "inline-flex items-center justify-center rounded-full border border-blue-300 bg-blue-100 p-2 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
const SETTINGS_ICON_DELETE_STYLE = "inline-flex items-center justify-center rounded-full border border-red-300 bg-red-100 p-2 text-red-800 hover:bg-red-200 hover:text-red-900";

export function SettingsTab(props) {
  const importRef = useRef(null);
  const [showEmptyCuisines, setShowEmptyCuisines] = useState(false);
  const [showEmptyCities, setShowEmptyCities] = useState(false);
  const [showEmptyAreas, setShowEmptyAreas] = useState(false);
  const {
    allDishTags,
    data,
    tagOpen,
    setTagOpen,
    newTag,
    setNewTag,
    addTag,
    expandedTag,
    setExpandedTag,
    renameTag,
    setTagColor,
    restaurantsById,
    cuisineOpen,
    setCuisineOpen,
    newCuisine,
    setNewCuisine,
    addCuisine,
    expandedCuisine,
    setExpandedCuisine,
    renameCuisine,
    deleteCuisine,
    cityOpen,
    setCityOpen,
    newCity,
    setNewCity,
    addCity,
    cityOptions,
    expandedCity,
    setExpandedCity,
    renameCity,
    deleteCity,
    areaOpen,
    setAreaOpen,
    newArea,
    setNewArea,
    addArea,
    areaOptions,
    expandedArea,
    setExpandedArea,
    renameArea,
    deleteArea,
    seedSampleData,
    exportJson,
    importJson,
    onLogout,
    defaultRestaurantStatsView,
    setDefaultRestaurantStatsView,
    restaurantSafetyDefaults,
    setRestaurantSafetyDefault,
    restaurantAlertLevels,
    setRestaurantAlertLevel,
    restaurantMusicDefault,
    setRestaurantMusicDefault,
    restaurantMusicAlertLevel,
    setRestaurantMusicAlertLevel,
  } = props;

  const cuisineRows = data.cuisines.map((cuisine) => {
    const cuisineRestaurants = data.restaurants
      .map((restaurant) => restaurantsById[restaurant.id] || restaurant)
      .filter((restaurant) => (restaurant.cuisines || []).includes(cuisine));
    return { cuisine, cuisineRestaurants };
  });
  const visibleCuisineRows = showEmptyCuisines
    ? cuisineRows
    : cuisineRows.filter(({ cuisineRestaurants }) => cuisineRestaurants.length > 0);

  const cityRows = cityOptions.map((city) => {
    const cityRestaurants = data.restaurants
      .map((restaurant) => restaurantsById[restaurant.id] || restaurant)
      .filter((restaurant) => restaurant.city === city);
    return { city, cityRestaurants };
  });
  const visibleCityRows = showEmptyCities
    ? cityRows
    : cityRows.filter(({ cityRestaurants }) => cityRestaurants.length > 0);

  const areaRows = areaOptions.map((area) => {
    const areaRestaurants = data.restaurants
      .map((restaurant) => restaurantsById[restaurant.id] || restaurant)
      .filter((restaurant) => restaurant.area === area);
    return { area, areaRestaurants };
  });
  const visibleAreaRows = showEmptyAreas
    ? areaRows
    : areaRows.filter(({ areaRestaurants }) => areaRestaurants.length > 0);

  return (
    <TabsContent value="settings" className="space-y-6">
      <div className={SECTION_CONTAINER}>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader><CardTitle className="font-bold">View Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div>Choose the default stats view used when you open the Restaurants tab.</div>
            <div className="max-w-xs">
              <Select value={defaultRestaurantStatsView} onValueChange={setDefaultRestaurantStatsView}>
                <SelectTrigger><SelectValue placeholder="Default restaurant stats view" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">KPI</SelectItem>
                  <SelectItem value="rows">Rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>Choose the default restaurant safety values and which values should show warning tags.</div>
            <div className="grid gap-3 md:grid-cols-2">
              {RESTAURANT_SAFETY_FIELDS.map((field) => (
                <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 font-bold text-slate-900">{field.label}</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold uppercase text-slate-700">Default</div>
                      <Select value={restaurantSafetyDefaults[field.key]} onValueChange={(value) => setRestaurantSafetyDefault(field.key, value)}>
                        <SelectTrigger><SelectValue placeholder="Default value" /></SelectTrigger>
                        <SelectContent>
                          {TRI_STATE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label === "?" ? "Don't Know" : option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold uppercase text-slate-700">Warn me on:</div>
                      <Select value={restaurantAlertLevels[field.key]} onValueChange={(value) => setRestaurantAlertLevel(field.key, value)}>
                        <SelectTrigger><SelectValue placeholder="Warning tags" /></SelectTrigger>
                        <SelectContent>
                          {RESTAURANT_ALERT_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 font-bold text-slate-900">Music</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-slate-700">Default</div>
                    <Select value={restaurantMusicDefault} onValueChange={setRestaurantMusicDefault}>
                      <SelectTrigger><SelectValue placeholder="Default value" /></SelectTrigger>
                      <SelectContent>
                        {MUSIC_LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-slate-700">Warn me on:</div>
                    <Select value={restaurantMusicAlertLevel} onValueChange={setRestaurantMusicAlertLevel}>
                      <SelectTrigger><SelectValue placeholder="Warning tags" /></SelectTrigger>
                      <SelectContent>
                        {MUSIC_ALERT_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={SECTION_CONTAINER}>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-bold">Dish Tags</CardTitle>
            <Dialog open={tagOpen} onOpenChange={setTagOpen}>
              <DialogTrigger asChild><Button variant="outline" className={SETTINGS_ADD_BUTTON_STYLE}><Plus className="mr-2 h-4 w-4" /> Add Tag</Button></DialogTrigger>
              <DialogContent>
                <ModalHeader title="Add Tag" onClose={() => setTagOpen(false)} />
                <div className="space-y-4">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Enter tag name" />
                  <ModalActions onCancel={() => setTagOpen(false)} onSave={addTag} saveLabel="Save" />
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {allDishTags.length === 0 ? (
              <div className="text-sm text-slate-500">No dish tags yet.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {allDishTags.map((tag) => {
                  const taggedDishes = data.dishes.filter((dish) => (dish.tags || []).includes(tag));
                  const isExpanded = expandedTag === tag;

                  return (
                    <div key={tag} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left"
                          onClick={() => setExpandedTag(isExpanded ? null : tag)}
                          aria-expanded={isExpanded}
                        >
                          <Badge variant="outline" style={tagChipStyle(data.tagColors?.[tag])}>{tag}</Badge>
                          <span className="text-sm text-slate-500">{taggedDishes.length} dish(es)</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </button>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            className={SETTINGS_ICON_EDIT_STYLE}
                            onClick={() => renameTag(tag)}
                            aria-label={`Rename ${tag}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <Input
                            type="color"
                            value={data.tagColors?.[tag] || "#64748b"}
                            onChange={(e) => setTagColor(tag, e.target.value)}
                            className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                          />
                        </div>
                      </div>
                      {isExpanded ? (
                        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                          {taggedDishes.map((dish) => (
                            <div key={dish.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                              <div className="font-medium text-slate-900">{dish.name}</div>
                              <div>{restaurantsById[dish.restaurantId]?.name || "Unknown restaurant"}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={SECTION_CONTAINER}>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-bold">Cuisines</CardTitle><Dialog open={cuisineOpen} onOpenChange={setCuisineOpen}><DialogTrigger asChild><Button variant="outline" className={SETTINGS_ADD_BUTTON_STYLE}><Plus className="mr-2 h-4 w-4" /> Add Cuisine</Button></DialogTrigger><DialogContent><ModalHeader title="Add Cuisine" onClose={() => setCuisineOpen(false)} /><div className="space-y-4"><Input value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} placeholder="Enter cuisine name" /><ModalActions onCancel={() => setCuisineOpen(false)} onSave={addCuisine} saveLabel="Save" /></div></DialogContent></Dialog></CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3">
              <input id="show-empty-cuisines" type="checkbox" checked={showEmptyCuisines} onChange={(e) => setShowEmptyCuisines(e.target.checked)} />
              <label htmlFor="show-empty-cuisines" className="text-sm text-slate-600">Show 0-restaurant cuisines</label>
            </div>
            {visibleCuisineRows.length === 0 ? (
              <div className="text-sm text-slate-500">No cuisines yet.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCuisineRows.map(({ cuisine, cuisineRestaurants }) => {
                  const isExpanded = expandedCuisine === cuisine;
                  return (
                    <div key={cuisine} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left"
                          onClick={() => setExpandedCuisine(isExpanded ? null : cuisine)}
                          aria-expanded={isExpanded}
                        >
                          <Badge variant="secondary">{cuisine}</Badge>
                          <span className="text-sm text-slate-500">{cuisineRestaurants.length} restaurant(s)</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </button>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            className={SETTINGS_ICON_EDIT_STYLE}
                            onClick={() => renameCuisine(cuisine)}
                            aria-label={`Rename ${cuisine}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className={SETTINGS_ICON_DELETE_STYLE}
                            onClick={() => deleteCuisine(cuisine)}
                            aria-label={`Delete ${cuisine}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {isExpanded ? (
                        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                          {cuisineRestaurants.map((restaurant) => (
                            <div key={restaurant.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                              <div className="font-medium text-slate-900">{restaurant.name}</div>
                              <div>{restaurant.area || restaurant.fullAddress || "No location"}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={SECTION_CONTAINER}>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-bold">Cities</CardTitle><Dialog open={cityOpen} onOpenChange={setCityOpen}><DialogTrigger asChild><Button variant="outline" className={SETTINGS_ADD_BUTTON_STYLE}><Plus className="mr-2 h-4 w-4" /> Add City</Button></DialogTrigger><DialogContent><ModalHeader title="Add City" onClose={() => setCityOpen(false)} /><div className="space-y-4"><Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Enter city name" /><ModalActions onCancel={() => setCityOpen(false)} onSave={addCity} saveLabel="Save" /></div></DialogContent></Dialog></CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3">
              <input id="show-empty-cities" type="checkbox" checked={showEmptyCities} onChange={(e) => setShowEmptyCities(e.target.checked)} />
              <label htmlFor="show-empty-cities" className="text-sm text-slate-600">Show 0-restaurant cities</label>
            </div>
            {visibleCityRows.length === 0 ? (
              <div className="text-sm text-slate-500">No cities yet.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCityRows.map(({ city, cityRestaurants }) => {
                  const isExpanded = expandedCity === city;
                  return (
                    <div key={city} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left"
                          onClick={() => setExpandedCity(isExpanded ? null : city)}
                          aria-expanded={isExpanded}
                        >
                          <Badge variant="secondary">{city}</Badge>
                          <span className="text-sm text-slate-500">{cityRestaurants.length} restaurant(s)</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </button>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            className={SETTINGS_ICON_EDIT_STYLE}
                            onClick={() => renameCity(city)}
                            aria-label={`Rename ${city}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className={SETTINGS_ICON_DELETE_STYLE}
                            onClick={() => deleteCity(city)}
                            aria-label={`Delete ${city}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {isExpanded ? (
                        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                          {cityRestaurants.map((restaurant) => (
                            <div key={restaurant.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                              <div className="font-medium text-slate-900">{restaurant.name}</div>
                              <div>{restaurant.area || restaurant.cuisines?.join(", ") || "No extra details"}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={SECTION_CONTAINER}>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-bold">Areas</CardTitle><Dialog open={areaOpen} onOpenChange={setAreaOpen}><DialogTrigger asChild><Button variant="outline" className={SETTINGS_ADD_BUTTON_STYLE}><Plus className="mr-2 h-4 w-4" /> Add Area</Button></DialogTrigger><DialogContent><ModalHeader title="Add Area" onClose={() => setAreaOpen(false)} /><div className="space-y-4"><Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Enter area / city" /><ModalActions onCancel={() => setAreaOpen(false)} onSave={addArea} saveLabel="Save" /></div></DialogContent></Dialog></CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3">
              <input id="show-empty-areas" type="checkbox" checked={showEmptyAreas} onChange={(e) => setShowEmptyAreas(e.target.checked)} />
              <label htmlFor="show-empty-areas" className="text-sm text-slate-600">Show 0-restaurant areas</label>
            </div>
            {visibleAreaRows.length === 0 ? (
              <div className="text-sm text-slate-500">No areas yet.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleAreaRows.map(({ area, areaRestaurants }) => {
                  const isExpanded = expandedArea === area;
                  return (
                    <div key={area} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left"
                          onClick={() => setExpandedArea(isExpanded ? null : area)}
                          aria-expanded={isExpanded}
                        >
                          <Badge variant="secondary">{area}</Badge>
                          <span className="text-sm text-slate-500">{areaRestaurants.length} restaurant(s)</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </button>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            className={SETTINGS_ICON_EDIT_STYLE}
                            onClick={() => renameArea(area)}
                            aria-label={`Rename ${area}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className={SETTINGS_ICON_DELETE_STYLE}
                            onClick={() => deleteArea(area)}
                            aria-label={`Delete ${area}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {isExpanded ? (
                        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                          {areaRestaurants.map((restaurant) => (
                            <div key={restaurant.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                              <div className="font-medium text-slate-900">{restaurant.name}</div>
                              <div>{restaurant.cuisines?.length ? restaurant.cuisines.join(", ") : restaurant.fullAddress || "No extra details"}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={SECTION_CONTAINER}>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader><CardTitle className="font-bold">Data Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div>Your data is saved to Firebase Cloud Firestore and synced per signed-in user.</div>
            <div>Use <span className="font-medium text-slate-900">Export JSON</span> regularly to keep a portable backup file.</div>
            <div>Images are stored inside your local browser data and JSON export, so large image libraries can make the file bigger.</div>
            <div>The browser local copy is kept only as a migration and backup convenience, not as the primary source of truth.</div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" className={TOP_ACTION_BUTTON_STYLES.export} onClick={exportJson}>
                <Upload className="mr-2 h-4 w-4" /> Export JSON
              </Button>
              <Button type="button" variant="outline" className={TOP_ACTION_BUTTON_STYLES.import} onClick={() => importRef.current?.click()}>
                <Download className="mr-2 h-4 w-4" /> Import JSON
              </Button>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={importJson} />
              <Button type="button" variant="outline" className={TOP_ACTION_BUTTON_STYLES.seed} onClick={seedSampleData}>
                <Database className="mr-2 h-4 w-4" /> Load Seed Data
              </Button>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <Button type="button" variant="outline" className={TOP_ACTION_BUTTON_STYLES.auth} onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
