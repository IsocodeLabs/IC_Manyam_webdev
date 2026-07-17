import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Safely formats currency to avoid character encoding issues in standard PDF readers.
 */
function formatPdfCurrency(minorAmount: number, currency: string = "GBP"): string {
  const majorAmount = (minorAmount / 100).toFixed(2);
  const upperCurrency = currency.toUpperCase();
  if (upperCurrency === "USD") return `$${majorAmount}`;
  if (upperCurrency === "GBP") return `£${majorAmount}`;
  if (upperCurrency === "EUR") return `€${majorAmount}`;
  if (upperCurrency === "INR") return `INR ${majorAmount}`;
  return `${upperCurrency} ${majorAmount}`;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // 1. Enforce Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve booking ID parameter
    const { id: bookingId } = await params;

    // 2. Fetch Booking Data via Admin Client (RLS bypass to ensure access)
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking reference not found." }, { status: 404 });
    }

    // 3. Enforce Permissions: Must be either the owner or a staff member
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isStaff = profile && ["Admin", "Marketer", "Content Manager"].includes(profile.role);
    const isOwner = booking.customer_id === user.id || (booking.contact_email && booking.contact_email.toLowerCase() === user.email?.toLowerCase());

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Access denied. You do not have permission to view this invoice." }, { status: 403 });
    }

    // 4. Fetch Booking Items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("booking_items")
      .select("*")
      .eq("booking_id", bookingId);

    if (itemsError || !items) {
      return NextResponse.json({ error: "Failed to retrieve booking items breakdown." }, { status: 500 });
    }

    // 5. Generate Branded PDF Document
    const pdfDoc = await PDFDocument.create();
    
    // Page dimensions (Letter size: 612 x 792 pt)
    const page = pdfDoc.addPage([612, 792]);

    // Standard Font embeddings
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 742; // Top margin anchor

    // Draw Premium Brand Title
    page.drawText("M A N N Y A M", {
      x: 50,
      y: y,
      size: 20,
      font: timesRoman,
      color: rgb(0.11, 0.17, 0.1), // #1c2c1a (MANNYAM deep dark olive)
    });

    // Draw Invoice Type Heading (Gold Accent)
    page.drawText("INVOICE & RECEIPT", {
      x: 390,
      y: y,
      size: 14,
      font: helveticaBold,
      color: rgb(0.77, 0.66, 0.5), // #c5a880 (MANNYAM classic gold)
    });

    y -= 15;

    // Subtitle tagline
    page.drawText("STUDIO CMS COMMERCE", {
      x: 50,
      y: y,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    y -= 40;

    // Elegant separator line
    page.drawLine({
      start: { x: 50, y: y },
      end: { x: 562, y: y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.82),
    });

    y -= 30;

    // Meta-details Section Header
    page.drawText("INVOICE DETAILS", {
      x: 50,
      y: y,
      size: 11,
      font: helveticaBold,
      color: rgb(0.11, 0.17, 0.1),
    });

    page.drawText("CUSTOMER DETAILS", {
      x: 320,
      y: y,
      size: 11,
      font: helveticaBold,
      color: rgb(0.11, 0.17, 0.1),
    });

    y -= 18;

    // Label value renderer helper
    const drawLabelValue = (xCoord: number, label: string, value: string) => {
      page.drawText(`${label}:`, { x: xCoord, y: y, size: 9, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(value, { x: xCoord + 90, y: y, size: 9, font: helveticaFont, color: rgb(0.1, 0.1, 0.1) });
    };

    // Meta Rows rendering
    drawLabelValue(50, "Booking Ref", booking.id.toUpperCase());
    drawLabelValue(320, "Name", booking.contact_name || "N/A");
    y -= 15;

    drawLabelValue(50, "Date", booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-GB") : "N/A");
    drawLabelValue(320, "Email", booking.contact_email || "N/A");
    y -= 15;

    drawLabelValue(50, "Payment Status", booking.status.toUpperCase());
    drawLabelValue(320, "Payment Type", booking.payment_type ? booking.payment_type.toUpperCase() : "FULL");
    y -= 30;

    // Line items table header bar
    page.drawRectangle({
      x: 50,
      y: y - 5,
      width: 512,
      height: 20,
      color: rgb(0.96, 0.96, 0.94),
    });

    page.drawText("PACKAGE TITLE", { x: 55, y: y, size: 8, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText("DEPARTURE", { x: 260, y: y, size: 8, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText("TRAVELLERS", { x: 370, y: y, size: 8, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText("RATE", { x: 450, y: y, size: 8, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText("TOTAL", { x: 510, y: y, size: 8, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });

    y -= 20;

    // Line items rendering
    for (const item of items) {
      page.drawText(item.package_title, { x: 55, y: y, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(item.departure_date || "N/A", { x: 260, y: y, size: 9, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(String(item.travellers), { x: 370, y: y, size: 9, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(formatPdfCurrency(item.unit_amount, booking.currency), { x: 450, y: y, size: 9, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(formatPdfCurrency(item.line_amount, booking.currency), { x: 510, y: y, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });

      y -= 18;
      
      // Light border line between items
      page.drawLine({
        start: { x: 50, y: y + 4 },
        end: { x: 562, y: y + 4 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });
    }

    y -= 15;

    // Totals Section Helper
    const drawTotalLine = (label: string, valStr: string, isBold: boolean = false) => {
      const font = isBold ? helveticaBold : helveticaFont;
      const color = isBold ? rgb(0.11, 0.17, 0.1) : rgb(0.3, 0.3, 0.3);
      page.drawText(label, { x: 350, y, size: 9, font, color });
      page.drawText(valStr, { x: 510, y, size: 9, font: helveticaBold, color });
      y -= 15;
    };

    // Calculate totals
    drawTotalLine("Subtotal Amount", formatPdfCurrency(booking.total_amount, booking.currency));
    drawTotalLine("Total Amount Paid", formatPdfCurrency(booking.amount_paid, booking.currency));

    y -= 5;
    page.drawLine({
      start: { x: 350, y: y + 10 },
      end: { x: 562, y: y + 10 },
      thickness: 1,
      color: rgb(0.11, 0.17, 0.1),
    });

    const remainingBalance = booking.total_amount - booking.amount_paid;
    drawTotalLine("Remaining Balance Due", formatPdfCurrency(remainingBalance, booking.currency), true);

    y -= 40;

    // Elegant Disclaimer/Terms block
    page.drawRectangle({
      x: 50,
      y: y,
      width: 512,
      height: 60,
      color: rgb(0.98, 0.98, 0.96),
      borderColor: rgb(0.9, 0.9, 0.88),
      borderWidth: 1,
    });

    page.drawText("Terms & Instructions", {
      x: 60,
      y: y + 45,
      size: 9,
      font: helveticaBold,
      color: rgb(0.11, 0.17, 0.1),
    });

    page.drawText("1. This is an official computer-generated receipt from MANNYAM. No signature is required.", {
      x: 60,
      y: y + 30,
      size: 8,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText("2. Remaining deposit balances must be settled in full before departure as per travel terms.", {
      x: 60,
      y: y + 15,
      size: 8,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    y -= 40;

    // Footer brand message
    page.drawText("Thank you for booking with MANNYAM. We wish you an extraordinary journey.", {
      x: 50,
      y: y,
      size: 9,
      font: timesRoman,
      color: rgb(0.5, 0.4, 0.3),
    });

    // 6. Output PDF Stream
    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${bookingId.slice(0, 8)}.pdf"`,
      },
    });


  } catch (error: unknown) {
    console.error("Critical error generating PDF invoice:", error);
    return NextResponse.json(
      { error: "A server error occurred while processing the PDF invoice generation." },
      { status: 500 }
    );
  }
}
