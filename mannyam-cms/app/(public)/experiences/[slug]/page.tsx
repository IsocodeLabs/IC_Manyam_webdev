import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { getPackageBySlug, getPublishedPackages } from "@/lib/data/public";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { generateTourSchema } from "@/lib/seo/generateJsonLd";
import { BookDepartureButton } from "@/components/commerce/BookDepartureButton";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AddToBooking } from "@/components/public/AddToBooking";

export const revalidate = 3600; // Time-based ISR fallback

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    return {
      title: "Journey Not Found | MANNYAM Studio",
    };
  }

  return buildMetadata({
    seoMeta: pkg.seo_meta,
    fallbackTitle: `${pkg.title} | MANNYAM Studio`,
    fallbackDescription: pkg.description,
    fallbackImage: pkg.featured_image_url,
    path: `/experiences/${pkg.slug}`,
  });
}

export async function generateStaticParams() {
  const packages = await getPublishedPackages();
  return packages.map((pkg) => ({
    slug: pkg.slug,
  }));
}

function checkIsPast(dateStr: string) {
  if (!dateStr) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    return d < today;
  } catch {
    return false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    notFound();
  }

  // Fetch pricing row (bypassing RLS with supabaseAdmin)
  const { data: pricing } = await supabaseAdmin
    .from("pricing")
    .select("id, currency, base_amount, deposit_amount")
    .eq("package_id", pkg.id)
    .maybeSingle();

  if (pkg.type === "Festival") {
    redirect(`/festivals/${pkg.slug}`);
  }

  // Parse itinerary
  const rawItinerary = (Array.isArray(pkg.itinerary) ? pkg.itinerary : []) as {
    dayNumber?: number;
    title?: string;
    description?: string;
  }[];

  // Parse and sort availability
  const rawAvailability = (Array.isArray(pkg.availability) ? pkg.availability : []) as {
    date?: string;
    spacesLeft?: number;
    status?: "Available" | "Full" | "Cancelled";
  }[];
  const sortedAvailability = [...rawAvailability].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Sanitise rich description
  const cleanDescription = DOMPurify.sanitize(pkg.description || "");

  // Fetch related packages
  const allRelated = await getPublishedPackages(pkg.type);
  const related = allRelated.filter((item) => item.id !== pkg.id).slice(0, 3);

  const tourSchema = generateTourSchema(pkg);

  return (
    <div className="pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
      />
      
      {/* Hero Header */}
      <section className="relative h-[65vh] min-h-[450px] w-full flex items-end overflow-hidden bg-olive">
        {pkg.featured_image_url ? (
          <img
            src={pkg.featured_image_url}
            alt={pkg.title}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.7]"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-olive via-ink to-ink opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 pb-12 w-full space-y-4">
          <span className="inline-block bg-gold text-ivory text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm">
            {pkg.type}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-ivory tracking-tight leading-tight max-w-4xl">
            {pkg.title}
          </h1>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Column - Details & Itinerary */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Description */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-olive border-b border-olive/10 pb-3">
                About the Journey
              </h2>
              <div 
                dangerouslySetInnerHTML={{ __html: cleanDescription }}
                className="prose prose-olive max-w-none text-olive/80 font-light text-sm sm:text-base leading-relaxed space-y-4 font-sans"
              />
            </div>

            {/* Itinerary */}
            {rawItinerary.length > 0 && (
              <div className="space-y-10">
                <h2 className="font-display text-2xl font-bold text-olive border-b border-olive/10 pb-3">
                  Day-by-Day Itinerary
                </h2>
                <div className="relative border-l border-gold/30 ml-4 pl-6 md:pl-8 space-y-12 py-2">
                  {rawItinerary.map((day, idx) => (
                    <div key={idx} className="relative">
                      {/* Node circle */}
                      <span className="absolute -left-[37px] md:-left-[45px] top-1 bg-gold text-ivory text-[10px] font-bold uppercase tracking-wider w-8 h-8 flex items-center justify-center rounded-full border-4 border-ivory select-none">
                        {day.dayNumber || (idx + 1)}
                      </span>
                      <div className="space-y-2">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-olive leading-tight">
                          {day.title}
                        </h3>
                        <p className="font-sans text-sm text-olive/75 leading-relaxed font-light whitespace-pre-line">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-32">
            
            {/* Availability Widget */}
            <div className="bg-cream/40 border border-olive/10 p-6 rounded-sm space-y-6 shadow-sm">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold border-b border-olive/10 pb-3">
                Upcoming Departures
              </h3>
              
              {sortedAvailability.length === 0 ? (
                <p className="font-sans text-xs text-olive/60 italic">
                  No departure dates scheduled currently. Contact us for private departures.
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedAvailability.map((entry, idx) => {
                    const isPast = entry.date ? checkIsPast(entry.date) : false;
                    const displayStatus = isPast ? "Expired" : entry.status || "Available";

                    let badgeClass = "bg-cream/50 text-olive/40 border border-olive/10";
                    if (displayStatus === "Available") {
                      badgeClass = "bg-green-50 text-green-700 border border-green-200/50";
                    } else if (displayStatus === "Full") {
                      badgeClass = "bg-cream text-olive/45 border border-olive/15";
                    } else if (displayStatus === "Cancelled") {
                      badgeClass = "bg-red-50 text-red-700 border border-red-200/50";
                    }

                    return (
                      <div 
                        key={idx}
                        className="flex items-center justify-between pb-3 border-b border-olive/5 last:border-b-0 last:pb-0 gap-4"
                      >
                        <div className="space-y-0.5">
                          <span className="font-sans text-xs font-semibold text-olive block">
                            {entry.date ? formatDate(entry.date) : "TBD"}
                          </span>
                          {!isPast && displayStatus === "Available" && entry.spacesLeft && (
                            <span className="font-sans text-[10px] text-olive/60 font-light block">
                              {entry.spacesLeft} spaces left
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${badgeClass}`}>
                            {displayStatus}
                          </span>
                          {!isPast && displayStatus === "Available" && entry.date && (
                            <BookDepartureButton
                              packageId={pkg.id}
                              departureDate={entry.date}
                              disabled={false}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <AddToBooking
              packageId={pkg.id}
              slug={pkg.slug}
              title={pkg.title}
              type={pkg.type}
              availability={rawAvailability}
              pricing={pricing}
            />

          </div>

        </div>
      </section>

      {/* Related Experiences Section */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-24 pt-16 border-t border-olive/10">
          <div className="space-y-2 mb-10">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold block">
              Explore More
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-olive">
              Related Experiences
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((item) => (
              <article
                key={item.id}
                className="bg-cream/30 border border-olive/10 hover:border-gold/30 rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-olive/5 transition-all duration-500"
              >
                <div className="aspect-[4/3] bg-olive/5 relative overflow-hidden">
                  {item.featured_image_url ? (
                    <img
                      src={item.featured_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-lg bg-olive/5">
                      No Image Available
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-ink/80 text-ivory text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 backdrop-blur-sm rounded-sm">
                    {item.type}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-olive group-hover:text-gold transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-olive/75 line-clamp-3 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href={`/experiences/${item.slug}`}
                    className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-1.5 pt-2"
                  >
                    Explore Itinerary &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
