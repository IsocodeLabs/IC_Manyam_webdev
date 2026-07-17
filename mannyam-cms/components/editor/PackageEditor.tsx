"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { BlockTipTapEditor } from "./BlockTipTapEditor";
import { checkSlugUnique, createPackage, updatePackage, savePricing, type PackageInput } from "@/app/packages/actions";
import { SeoPanel, type SeoMeta } from "@/components/seo/SeoPanel";

type ItineraryDay = {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
};

type AvailabilityEntry = {
  id: string;
  date: string;
  spacesLeft: number;
  status: "Available" | "Full" | "Cancelled";
};

type EditorPackage = {
  id: string;
  title: string;
  slug: string;
  type: "Festival" | "Destination" | "Honeymoon" | "Wildlife" | "Wellness";
  description: string;
  featured_image_url: string | null;
  itinerary?: unknown;
  availability?: unknown;
  seo_meta?: unknown;
} | null;

type MediaItem = { id: string; file_url: string; alt_text: string };

function slugify(value: string) {
  return value.toLocaleLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isPastDate(dateStr: string) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// DRAGGABLE DAY ITEM COMPONENT
function SortableDayItem({
  day,
  onUpdateTitle,
  onUpdateDescription,
  onRemove,
}: {
  day: ItineraryDay;
  onUpdateTitle: (val: string) => void;
  onUpdateDescription: (val: string) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-lg border border-olive/15 bg-paper p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between border-b border-olive/10 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-olive/45 hover:bg-olive/5 hover:text-olive focus:outline-none"
            title="Drag to reorder"
          >
            ☰
          </button>
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-olive/60 bg-[#eee7da] px-2.5 py-1 rounded">
            Day {day.dayNumber}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded px-2.5 py-1 text-xs font-sans font-medium text-red-700 hover:bg-red-50"
        >
          Remove Day
        </button>
      </div>

      <div className="grid gap-3 text-sm">
        <label className="block font-medium">Day Title
          <input
            type="text"
            value={day.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder="e.g. Arrival in Jaipur"
            className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 text-sm focus:border-gold outline-none"
          />
        </label>
        <label className="block font-medium">Day Description
          <textarea
            value={day.description}
            onChange={(e) => onUpdateDescription(e.target.value)}
            placeholder="Describe the day's activities"
            rows={3}
            className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 text-sm focus:border-gold outline-none resize-y"
          />
        </label>
      </div>
    </div>
  );
}

export function PackageEditor({
  pkg,
  media,
  userRole,
  initialPricing,
}: {
  pkg: EditorPackage;
  media: MediaItem[];
  userRole?: string;
  initialPricing?: { id: string; currency: string; base_amount: number; deposit_amount: number | null } | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(pkg?.title ?? "");
  const [slug, setSlug] = useState(pkg?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(pkg));
  const [slugUnique, setSlugUnique] = useState(true);
  const [type, setType] = useState<PackageInput["type"]>(pkg?.type ?? "Festival");
  const [description, setDescription] = useState(pkg?.description ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(pkg?.featured_image_url ?? null);

  // Pricing State (Admin only)
  const [pricingCurrency, setPricingCurrency] = useState<"GBP" | "USD" | "EUR" | "INR">(
    (initialPricing?.currency as "GBP" | "USD" | "EUR" | "INR" | undefined) ?? "GBP"
  );
  const [baseAmountMajor, setBaseAmountMajor] = useState<string>(
    initialPricing ? (initialPricing.base_amount / 100).toFixed(2) : ""
  );
  const [hasDeposit, setHasDeposit] = useState<boolean>(
    initialPricing?.deposit_amount !== null && initialPricing?.deposit_amount !== undefined
  );
  const [depositAmountMajor, setDepositAmountMajor] = useState<string>(
    initialPricing && initialPricing.deposit_amount !== null
      ? (initialPricing.deposit_amount / 100).toFixed(2)
      : ""
  );
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState("");
  const [pricingSuccess, setPricingSuccess] = useState("");

  const [seoMeta, setSeoMeta] = useState<SeoMeta>(() => {
    const meta = (pkg?.seo_meta as Record<string, string | null | undefined>) || {};
    return {
      title: meta.title ?? "",
      description: meta.description ?? "",
      canonical_url: meta.canonical_url ?? meta.canonicalUrl ?? "",
      og_title: meta.og_title ?? "",
      og_description: meta.og_description ?? "",
      og_image: meta.og_image ?? meta.featuredImageUrl ?? "",
      when: meta.when ?? "",
      where: meta.where ?? "",
    };
  });

  // Itinerary state
  const [days, setDays] = useState<ItineraryDay[]>(() => {
    const rawItinerary = (Array.isArray(pkg?.itinerary) ? pkg.itinerary : []) as {
      dayNumber?: number;
      title?: string;
      description?: string;
    }[];
    return rawItinerary.map((d, idx) => ({
      id: Math.random().toString(36).substring(2, 11),
      dayNumber: d.dayNumber ?? (idx + 1),
      title: d.title ?? "",
      description: d.description ?? "",
    }));
  });

  // Availability state
  const [availability, setAvailability] = useState<AvailabilityEntry[]>(() => {
    const rawAvailability = (Array.isArray(pkg?.availability) ? pkg.availability : []) as {
      date?: string;
      spacesLeft?: number;
      status?: "Available" | "Full" | "Cancelled";
    }[];
    return rawAvailability.map((a) => ({
      id: Math.random().toString(36).substring(2, 11),
      date: a.date ?? "",
      spacesLeft: a.spacesLeft ?? 10,
      status: a.status ?? "Available",
    }));
  });

  // Availability Dialog states
  const [showAddDateModal, setShowAddDateModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newSpaces, setNewSpaces] = useState(10);
  const [newStatus, setNewStatus] = useState<AvailabilityEntry["status"]>("Available");

  const [saveState, setSaveState] = useState("");
  const [error, setError] = useState("");
  const [showMedia, setShowMedia] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sensors for Day dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-slugify title
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  // Check unique slug (450ms dev-mode debounce)
  useEffect(() => {
    if (!slug) { setSlugUnique(true); return; }
    const timer = window.setTimeout(async () => {
      try {
        setSlugUnique(await checkSlugUnique(slug, pkg?.id));
      } catch {
        setSlugUnique(false);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [slug, pkg?.id]);

  // Sort availability automatically by date ascending
  const sortedAvailability = [...availability].sort((a, b) => a.date.localeCompare(b.date));

  function getInput(): PackageInput {
    return {
      title,
      slug,
      type,
      description,
      featuredImageUrl,
      itinerary: days.map((d) => ({
        dayNumber: d.dayNumber,
        title: d.title.trim(),
        description: d.description.trim(),
      })),
      availability: sortedAvailability.map((a) => ({
        date: a.date,
        spacesLeft: a.spacesLeft,
        status: a.status,
      })),
      seoMeta,
    };
  }

  async function save() {
    if (!title.trim()) { setError("A title is required"); return; }
    if (!slug) { setError("A valid URL slug is required"); return; }
    if (!slugUnique) { setError("This URL is already in use"); return; }
    if (days.length === 0) {
      setError("At least 1 day is required in the itinerary.");
      return;
    }
    if (days.length > 30) {
      setError("An itinerary cannot exceed 30 days.");
      return;
    }
    const emptyTitles = days.some((d) => !d.title.trim());
    if (emptyTitles) {
      setError("All itinerary days must have a title.");
      return;
    }
    
    setSaveState("Saving...");
    setError("");
    try {
      const result = pkg ? await updatePackage(pkg.id, getInput()) : await createPackage(getInput());
      setSaveState(`Saved ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`);
      if (!pkg) {
        router.replace(`/packages/${result.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (caught) {
      setSaveState("");
      setError(caught instanceof Error ? caught.message : "The package could not be saved.");
    }
  }

  async function handleSavePricing() {
    if (!pkg?.id) {
      setPricingError("Please save the package details first before configuring pricing.");
      return;
    }

    setPricingSaving(true);
    setPricingError("");
    setPricingSuccess("");

    try {
      const baseMinor = Math.round(parseFloat(baseAmountMajor) * 100);
      if (isNaN(baseMinor) || baseMinor <= 0) {
        throw new Error("Please enter a valid base amount greater than 0.");
      }

      let depositMinor = null;
      if (hasDeposit) {
        depositMinor = Math.round(parseFloat(depositAmountMajor) * 100);
        if (isNaN(depositMinor) || depositMinor < 0) {
          throw new Error("Please enter a valid deposit amount.");
        }
        if (depositMinor > baseMinor) {
          throw new Error("Deposit amount cannot exceed the base price.");
        }
      }

      await savePricing(pkg.id, {
        currency: pricingCurrency,
        base_amount: baseMinor,
        deposit_amount: depositMinor,
      });

      setPricingSuccess("Pricing settings saved successfully.");
      router.refresh();
    } catch (err) {
      setPricingError(err instanceof Error ? err.message : "Failed to save pricing.");
    } finally {
      setPricingSaving(false);
    }
  }

  // Itinerary helper methods
  function addDay() {
    if (days.length >= 30) {
      setError("An itinerary cannot exceed 30 days.");
      return;
    }
    setError("");
    const newDay: ItineraryDay = {
      id: Math.random().toString(36).substring(2, 11),
      dayNumber: days.length + 1,
      title: "",
      description: "",
    };
    setDays([...days, newDay]);
  }

  function removeDay(id: string, dayNumber: number) {
    if (!window.confirm(`Remove Day ${dayNumber} from the itinerary?`)) return;
    setDays((items) => {
      const remaining = items.filter((item) => item.id !== id);
      return remaining.map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
    });
  }

  function updateDayTitle(id: string, value: string) {
    setDays((items) =>
      items.map((day) => (day.id === id ? { ...day, title: value } : day))
    );
  }

  function updateDayDescription(id: string, value: string) {
    setDays((items) =>
      items.map((day) => (day.id === id ? { ...day, description: value } : day))
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDays((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const moved = arrayMove(items, oldIndex, newIndex);
        return moved.map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
      });
    }
  }

  // Availability helper methods
  function handleAddDeparture() {
    if (!newDate) {
      setError("Please select a date.");
      return;
    }
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      setError("The departure date must be in the future.");
      return;
    }
    if (newSpaces < 1 || newSpaces > 99) {
      setError("Spaces must be between 1 and 99.");
      return;
    }

    const dateExists = availability.some((a) => a.date === newDate);
    if (dateExists) {
      setError("A departure on this date already exists.");
      return;
    }

    setAvailability([
      ...availability,
      {
        id: Math.random().toString(36).substring(2, 11),
        date: newDate,
        spacesLeft: newSpaces,
        status: newStatus,
      },
    ]);

    setNewDate("");
    setNewSpaces(10);
    setNewStatus("Available");
    setShowAddDateModal(false);
    setError("");
  }

  function handleRemoveDeparture(id: string, dateStr: string) {
    if (!window.confirm(`Remove departure date ${formatDate(dateStr)}?`)) return;
    setAvailability((items) => items.filter((item) => item.id !== id));
  }

  function updateDepartureSpaces(id: string, value: number) {
    const spaces = Math.max(1, Math.min(99, value));
    setAvailability((items) =>
      items.map((item) => (item.id === id ? { ...item, spacesLeft: spaces } : item))
    );
  }

  function updateDepartureStatus(id: string, value: AvailabilityEntry["status"]) {
    setAvailability((items) =>
      items.map((item) => (item.id === id ? { ...item, status: value } : item))
    );
  }

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <section className="font-sans text-olive">
      {/* Header bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/packages" className="text-sm text-gold hover:underline">← Back to Packages</Link>
          <h1 className="mt-1 font-display text-4xl font-semibold">{pkg ? "Edit Package" : "New Package"}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-olive/70">
          {saveState && <span aria-live="polite">{saveState}</span>}
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-red-800 text-sm">{error}</p>}

      {/* Editor body */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        
        {/* Left main panel */}
        <div className="min-w-0 space-y-8">
          <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter package title"
              className="w-full border-0 bg-transparent font-display text-4xl font-semibold text-olive outline-none placeholder:text-olive/35"
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">URL slug
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className={`mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm ${
                    slugUnique ? "border-olive/20" : "border-red-500"
                  }`}
                />
                {!slugUnique && <p className="mt-1 text-xs text-red-700">This URL is already in use</p>}
              </label>
              
              <label className="block text-sm font-medium">Package Type
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PackageInput["type"])}
                  className="mt-1 w-full rounded-md border border-olive/20 px-3 py-2 bg-cream/10 text-sm font-sans"
                >
                  <option value="Festival">Festival</option>
                  <option value="Destination">Destination</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </label>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold">Description</h2>
            <BlockTipTapEditor
              content={description}
              onChange={setDescription}
            />
          </div>

          {/* Day-by-Day Itinerary Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-olive/10 pb-2">
              <h2 className="font-display text-2xl font-semibold">Itinerary</h2>
              <button
                type="button"
                onClick={addDay}
                className="rounded border border-gold hover:bg-gold hover:text-olive text-gold px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Add Day
              </button>
            </div>

            {days.length === 0 ? (
              <p className="text-sm text-olive/60 italic py-4">No itinerary days configured. Click &quot;Add Day&quot; above to start your itinerary.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={days.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {days.map((day) => (
                      <SortableDayItem
                        key={day.id}
                        day={day}
                        onUpdateTitle={(val) => updateDayTitle(day.id, val)}
                        onUpdateDescription={(val) => updateDayDescription(day.id, val)}
                        onRemove={() => removeDay(day.id, day.dayNumber)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Availability Calendar Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-olive/10 pb-2">
              <h2 className="font-display text-2xl font-semibold">Availability</h2>
              <button
                type="button"
                onClick={() => setShowAddDateModal(true)}
                className="rounded border border-gold hover:bg-gold hover:text-olive text-gold px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Add Departure Date
              </button>
            </div>

            {sortedAvailability.length === 0 ? (
              <p className="text-sm text-olive/60 italic py-4">No departure dates scheduled. Click &quot;Add Departure Date&quot; to configure availability.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-olive/10 bg-paper shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm font-sans">
                    <thead className="bg-ivory text-xs uppercase tracking-wide text-olive/75 border-b border-olive/10">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Spaces Left</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-olive/10">
                      {sortedAvailability.map((item) => {
                        const expired = isPastDate(item.date);
                        return (
                          <tr key={item.id} className="hover:bg-cream/20 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-olive">
                              {formatDate(item.date)}
                              {expired && (
                                <span className="ml-2.5 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200">
                                  Expired
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {expired ? (
                                <span className="text-olive/60 font-medium">{item.spacesLeft}</span>
                              ) : (
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={item.spacesLeft}
                                  onChange={(e) => updateDepartureSpaces(item.id, parseInt(e.target.value, 10))}
                                  className="w-20 rounded border border-olive/20 bg-cream/10 px-2 py-1 focus:border-gold outline-none"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {expired ? (
                                <span className="rounded-full bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-0.5 text-xs font-semibold">
                                  {item.status}
                                </span>
                              ) : (
                                <select
                                  value={item.status}
                                  onChange={(e) => updateDepartureStatus(item.id, e.target.value as AvailabilityEntry["status"])}
                                  className={`rounded border px-2 py-1 text-xs font-semibold outline-none ${
                                    item.status === "Available"
                                      ? "bg-green-50 text-green-700 border-green-200 focus:border-green-400"
                                      : item.status === "Full"
                                      ? "bg-red-50 text-red-700 border-red-200 focus:border-red-400"
                                      : "bg-orange-50 text-orange-700 border-orange-200 focus:border-orange-400"
                                  }`}
                                >
                                  <option value="Available">Available</option>
                                  <option value="Full">Full</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveDeparture(item.id, item.date)}
                                className="text-xs font-medium text-red-700 hover:underline"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Admin Pricing Settings (Only visible to Admin role) */}
          {userRole === "Admin" && (
            <div className="rounded-lg border border-gold/30 bg-paper p-5 shadow-sm space-y-5 relative overflow-hidden">
              {/* Decorative top gold border bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
              
              <div className="flex items-center gap-2 pb-2 border-b border-olive/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <h2 className="font-display text-2xl font-semibold text-olive">
                  Pricing Settings (Admin Only)
                </h2>
              </div>

              {pricingError && (
                <p role="alert" className="rounded bg-red-50 p-3 text-red-800 text-xs font-medium">
                  {pricingError}
                </p>
              )}

              {pricingSuccess && (
                <p role="alert" className="rounded bg-green-50 p-3 text-green-800 text-xs font-medium">
                  {pricingSuccess}
                </p>
              )}

              {!pkg ? (
                <p className="text-xs text-olive/60 italic font-sans py-2">
                  Please save this package first to enable pricing settings.
                </p>
              ) : (
                <div className="space-y-4 text-sm font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block font-medium">Currency
                      <select
                        value={pricingCurrency}
                        onChange={(e) => setPricingCurrency(e.target.value as "GBP" | "USD" | "EUR" | "INR")}
                        className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 text-sm focus:border-gold outline-none"
                      >
                        <option value="GBP">GBP (£)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </label>

                    <label className="block font-medium">Base Amount (e.g. 1250.00)
                      <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-olive/40 select-none font-medium">
                          {pricingCurrency === "GBP" ? "£" : pricingCurrency === "USD" ? "$" : pricingCurrency === "EUR" ? "€" : "₹"}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={baseAmountMajor}
                          onChange={(e) => setBaseAmountMajor(e.target.value)}
                          className="w-full rounded border border-olive/20 pl-8 pr-3 py-2 bg-cream/10 text-sm focus:border-gold outline-none font-medium"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-olive/5 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasDeposit}
                        onChange={(e) => setHasDeposit(e.target.checked)}
                        className="rounded border-olive/30 text-gold focus:ring-gold h-4 w-4"
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-olive/75">
                        Offer Deposit Payment Option
                      </span>
                    </label>

                    {hasDeposit && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <label className="block font-medium">Deposit Amount (e.g. 250.00)
                          <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-olive/40 select-none font-medium">
                              {pricingCurrency === "GBP" ? "£" : pricingCurrency === "USD" ? "$" : pricingCurrency === "EUR" ? "€" : "₹"}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={depositAmountMajor}
                              onChange={(e) => setDepositAmountMajor(e.target.value)}
                              className="w-full rounded border border-olive/20 pl-8 pr-3 py-2 bg-cream/10 text-sm focus:border-gold outline-none font-medium"
                            />
                          </div>
                          <span className="text-[10px] text-olive/45 font-light mt-1 block leading-normal">
                            If enabled, customers can choose to pay only the deposit at checkout rather than the full base amount.
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={pricingSaving}
                      onClick={handleSavePricing}
                      className="rounded bg-gold hover:bg-[#ba8838] px-4 py-2 text-xs font-semibold text-olive uppercase tracking-wider transition-colors duration-200 disabled:opacity-50"
                    >
                      {pricingSaving ? "Saving Pricing..." : "Save Pricing"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar panel */}
        <aside className="space-y-4 xl:sticky xl:top-20">
          {/* SEO Metadata */}
          <div className="rounded-lg border border-olive/10 bg-paper p-4 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-olive mb-3">SEO Metadata</h3>
            <SeoPanel
              seoMeta={seoMeta}
              onChange={(meta) => setSeoMeta({ ...meta, when: meta.when ?? "", where: meta.where ?? "" })}
              slug={slug}
              defaultTitle={title}
              isPackage={true}
              description={description}
              packageType={type}
              featuredImageUrl={featuredImageUrl}
            />
          </div>

          {/* Featured image selector */}
          <div className="rounded-lg border border-olive/10 bg-paper p-4 shadow-sm space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-olive/80">Featured Image</p>
            {featuredImageUrl && (
              <img src={featuredImageUrl} alt="Featured preview" className="mt-2 h-28 w-full rounded object-cover" />
            )}
            <button
              type="button"
              onClick={() => setShowMedia(true)}
              className="w-full rounded border border-olive/20 px-3 py-2 text-xs font-medium hover:bg-cream/40"
            >
              Choose Image
            </button>
          </div>

          {/* Save trigger */}
          <div className="grid gap-2 text-sm">
            <button
              disabled={isPending}
              type="button"
              onClick={() => startTransition(() => save())}
              className="rounded bg-gold px-4 py-2.5 font-semibold text-olive hover:bg-[#ba8838] disabled:opacity-50 transition-colors"
            >
              Save Package
            </button>
          </div>
        </aside>
      </div>

      {/* Add Departure Date Dialog Modal */}
      {showAddDateModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 font-sans text-olive">
          <div className="w-full max-w-md rounded-lg bg-paper p-5 shadow-xl border border-olive/20 space-y-4">
            <div className="flex justify-between items-center border-b border-olive/10 pb-3">
              <h2 className="font-display text-2xl font-semibold">Add Departure Date</h2>
              <button
                type="button"
                onClick={() => setShowAddDateModal(false)}
                className="rounded border border-olive/20 px-2 py-1 text-xs hover:bg-cream"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <label className="block font-medium">Departure Date
                <input
                  type="date"
                  min={tomorrowStr}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 outline-none focus:border-gold"
                />
              </label>

              <label className="block font-medium">Spaces Left
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newSpaces}
                  onChange={(e) => setNewSpaces(parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 outline-none focus:border-gold"
                />
              </label>

              <label className="block font-medium">Initial Status
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AvailabilityEntry["status"])}
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 outline-none focus:border-gold"
                >
                  <option value="Available">Available</option>
                  <option value="Full">Full</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-sm">
              <button
                type="button"
                onClick={() => setShowAddDateModal(false)}
                className="rounded border border-olive/20 px-4 py-2 hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDeparture}
                className="rounded bg-gold px-4 py-2 font-semibold text-olive hover:bg-gold/90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media picker dialog */}
      {showMedia && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 font-sans">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-lg bg-paper p-5 shadow-xl border border-olive/20">
            <div className="mb-4 flex justify-between items-center border-b border-olive/10 pb-3">
              <h2 className="font-display text-2xl text-olive font-semibold">Choose from Media Library</h2>
              <button onClick={() => setShowMedia(false)} className="rounded border border-olive/20 px-3 py-1 text-xs hover:bg-cream">
                Close
              </button>
            </div>
            {media.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {media.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFeaturedImageUrl(item.file_url);
                      setShowMedia(false);
                    }}
                    className="rounded border border-olive/10 p-2 text-left bg-cream/10 hover:border-gold/60 transition-colors"
                  >
                    <img src={item.file_url} alt={item.alt_text} className="h-24 w-full object-cover rounded" />
                    <span className="mt-1.5 block truncate text-xs text-olive">{item.alt_text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-olive/60">No media items are available yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
