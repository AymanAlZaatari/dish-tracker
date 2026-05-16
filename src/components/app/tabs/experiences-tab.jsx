import { useState } from "react";
import { Camera, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import {
  DELETE_BUTTON_STYLE,
  EDIT_BUTTON_STYLE,
  ORDER_TYPE_BADGE_STYLES,
  SECTION_CONTAINER,
} from "@/lib/app/constants";
import { ratingPillClass, valuePillClass } from "@/lib/app/data";

import { ImageViewerDialog, Stars } from "../shared";

export function ExperiencesTab({
  data,
  dishesById,
  restaurantsById,
  branchesById,
  editExperience,
  deleteExperience,
}) {
  const sortedExperiences = [...data.experiences].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [imageViewer, setImageViewer] = useState({ open: false, images: [], index: 0 });

  function openImageViewer(images, index = 0) {
    setImageViewer({ open: true, images, index });
  }

  return (
    <TabsContent value="experiences" className="space-y-4">
      <div className={`${SECTION_CONTAINER} space-y-3`}>
        <div className="space-y-3 md:hidden">
          {sortedExperiences.map((experience) => {
            const dish = dishesById[experience.dishId];
            const restaurant = dish ? restaurantsById[dish.restaurantId] : null;
            const branch = experience.branchId ? branchesById[experience.branchId] : null;
            return (
              <Card key={experience.id} className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="break-words text-xl font-bold text-slate-900">{dish?.name || "Unknown dish"}</div>
                      <div className="mt-1 text-sm font-medium text-slate-600">{restaurant?.name || "Unknown restaurant"}</div>
                      <div className="mt-1 text-xs text-slate-500">{experience.date}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="outline" size="sm" className={`px-2 ${EDIT_BUTTON_STYLE}`} onClick={() => editExperience(experience)} aria-label={`Edit ${dish?.name || "experience"}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className={`px-2 ${DELETE_BUTTON_STYLE}`} onClick={() => deleteExperience(experience.id)} aria-label={`Delete ${dish?.name || "experience"}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className={ORDER_TYPE_BADGE_STYLES[experience.orderType] || "bg-slate-100 text-slate-700 border-slate-200"}
                    >
                      {experience.orderType}
                    </Badge>
                    {branch ? <Badge variant="secondary">{branch.name}</Badge> : null}
                    {restaurant?.area ? <Badge variant="outline">{restaurant.area}</Badge> : null}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="text-[0.7rem] font-bold uppercase text-slate-500">Price</div>
                      <div className="mt-1 text-base font-bold text-slate-900">{experience.price != null ? `$${Number(experience.price).toFixed(1)}` : "—"}</div>
                    </div>
                    <div className={`min-w-0 rounded-2xl border p-3 text-center ${valuePillClass(experience.valueForMoney)}`}>
                      <div className="text-[0.7rem] font-bold uppercase text-slate-500">$ Worth</div>
                      <div className="mt-1 text-sm font-bold text-slate-900">{experience.valueForMoney || "—"}</div>
                    </div>
                    <div className={`min-w-0 rounded-2xl border p-3 text-center ${ratingPillClass(experience.rating)}`}>
                      <div className="text-[0.7rem] font-bold uppercase text-slate-500">Rating</div>
                      <div className="mt-1 text-base font-bold text-slate-900">{experience.rating != null ? Number(experience.rating).toFixed(1) : "—"}</div>
                    </div>
                  </div>

                  {(experience.notes || experience.images?.length > 0) ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      {experience.notes ? <div className="text-sm text-slate-700">{experience.notes}</div> : null}
                      {experience.images?.length > 0 ? (
                        <ImageCountButton
                          className={experience.notes ? "mt-3" : ""}
                          imageCount={experience.images.length}
                          onClick={() => openImageViewer(experience.images, 0)}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto rounded-3xl border border-slate-200 bg-white md:block">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-center text-sm font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3">Dish</th>
                <th className="px-5 py-3">Restaurant</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">$ Worth</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedExperiences.map((experience) => {
                const dish = dishesById[experience.dishId];
                const restaurant = dish ? restaurantsById[dish.restaurantId] : null;
                const branch = experience.branchId ? branchesById[experience.branchId] : null;
                return (
                  <tr key={experience.id} className="align-top odd:bg-white even:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="min-w-0 space-y-2">
                        <div>
                          <div className="text-lg font-semibold text-slate-900">{dish?.name || "Unknown dish"}</div>
                          <div className="text-sm text-slate-500">{experience.date}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className={ORDER_TYPE_BADGE_STYLES[experience.orderType] || "bg-slate-100 text-slate-700 border-slate-200"}
                          >
                            {experience.orderType}
                          </Badge>
                          {branch && <Badge variant="secondary">{branch.name}</Badge>}
                        </div>
                        {(experience.notes || experience.images?.length > 0) && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            {experience.notes ? <div className="text-sm text-slate-700">{experience.notes}</div> : null}
                            {experience.images?.length > 0 && (
                              <ImageCountButton
                                className={experience.notes ? "mt-3" : ""}
                                imageCount={experience.images.length}
                                onClick={() => openImageViewer(experience.images, 0)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="font-medium text-slate-900">{restaurant?.name || "Unknown restaurant"}</div>
                      {restaurant?.area || restaurant?.cuisines?.length ? (
                        <div className="mt-1 text-sm text-slate-500">
                          {restaurant?.area || "No area"}
                          {restaurant?.cuisines?.length ? ` • ${restaurant.cuisines.join(", ")}` : ""}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-center text-slate-700">
                      {experience.price != null ? <span className="font-semibold text-slate-900">{`$${Number(experience.price).toFixed(1)}`}</span> : "—"}
                    </td>
                    <td className="px-5 py-4 text-center text-slate-700">
                      <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${valuePillClass(experience.valueForMoney)}`}>
                        {experience.valueForMoney || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(experience.rating)}`}>
                        {experience.rating != null ? <span>({Number(experience.rating).toFixed(1)})</span> : <span>—</span>}
                        <Stars value={experience.rating} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => editExperience(experience)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                        <Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteExperience(experience.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.experiences.length === 0 && <Card className="rounded-3xl border-0 shadow-sm"><CardContent className="p-6 text-sm text-slate-500">No experiences logged yet.</CardContent></Card>}
      </div>
      <ImageViewerDialog
        open={imageViewer.open}
        images={imageViewer.images}
        index={imageViewer.index}
        onIndexChange={(index) => setImageViewer((prev) => ({ ...prev, index }))}
        onOpenChange={(open) => setImageViewer((prev) => ({ ...prev, open }))}
      />
    </TabsContent>
  );
}

function ImageCountButton({ imageCount, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 transition hover:bg-sky-100 ${className}`}
      onClick={onClick}
    >
      <Camera className="h-3.5 w-3.5" />
      <span>{imageCount} image{imageCount === 1 ? "" : "s"}</span>
    </button>
  );
}
