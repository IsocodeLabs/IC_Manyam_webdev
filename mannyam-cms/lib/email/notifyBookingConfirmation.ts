import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/commerce/format";

export async function sendBookingConfirmationEmail(bookingId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@mannyam.in";

  // 1. Fetch booking
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    console.error(`[Email Trigger] Booking not found: ${bookingId}`);
    return { success: false, error: bookingError };
  }

  // 2. Fetch booking items
  const { data: items, error: itemsError } = await supabaseAdmin
    .from("booking_items")
    .select("*")
    .eq("booking_id", bookingId);

  if (itemsError || !items) {
    console.error(`[Email Trigger] Booking items not found: ${bookingId}`);
    return { success: false, error: itemsError };
  }

  const subject = `Your Booking Confirmation [Ref: ${booking.id.slice(0, 8).toUpperCase()}]`;

  // Format currency values
  const totalAmountStr = formatCurrency(booking.total_amount, booking.currency);
  const amountPaidStr = formatCurrency(booking.amount_paid, booking.currency);
  const balanceDueStr = formatCurrency(booking.total_amount - booking.amount_paid, booking.currency);

  // Generate Booking Items Rows for HTML
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e0; text-align: left;">
          <strong style="color: #2d4022; font-size: 14px;">${item.package_title}</strong>
          ${
            item.departure_date
              ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Departure: ${item.departure_date}</div>`
              : ""
          }
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e0; text-align: center; color: #4b5563; font-size: 14px;">
          ${item.travellers}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e0; text-align: right; color: #4b5563; font-size: 14px;">
          ${formatCurrency(item.unit_amount, booking.currency)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e0; text-align: right; color: #111827; font-weight: 600; font-size: 14px;">
          ${formatCurrency(item.line_amount, booking.currency)}
        </td>
      </tr>
    `
    )
    .join("");

  // Customer Email HTML
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9f9f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e5e5e0; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #1c2c1a; padding: 30px; text-align: center;">
                  <h1 style="color: #c5a880; font-family: Georgia, serif; font-size: 26px; font-weight: 300; letter-spacing: 4px; margin: 0; text-transform: uppercase;">M A N N Y A M</h1>
                  <p style="color: #ffffff; font-size: 11px; letter-spacing: 2px; margin: 10px 0 0 0; text-transform: uppercase; opacity: 0.8;">Studio CMS Commerce</p>
                </td>
              </tr>
              
              <!-- Greeting / Intro -->
              <tr>
                <td style="padding: 40px 30px 20px 30px;">
                  <h2 style="color: #1c2c1a; font-family: Georgia, serif; font-size: 20px; font-weight: normal; margin-top: 0; margin-bottom: 15px;">Thank you for booking with us!</h2>
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                    Dear ${booking.contact_name || "Valued Traveller"},
                  </p>
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 10px; margin-bottom: 0;">
                    Your booking has been successfully received and processed. Below is a detailed summary of your journey and billing breakdown.
                  </p>
                </td>
              </tr>

              <!-- Info Cards Grid -->
              <tr>
                <td style="padding: 0 30px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcfcf9; border: 1px solid #e5e5e0; border-radius: 4px;">
                    <tr>
                      <td width="50%" style="padding: 15px; border-right: 1px solid #e5e5e0; vertical-align: top;">
                        <span style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Booking Reference</span>
                        <strong style="font-size: 14px; color: #1c2c1a; font-family: monospace;">${booking.id.toUpperCase()}</strong>
                      </td>
                      <td width="50%" style="padding: 15px; vertical-align: top;">
                        <span style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Payment Status</span>
                        <strong style="font-size: 14px; color: #2d4022; text-transform: uppercase;">${booking.status}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" style="padding: 15px; border-top: 1px solid #e5e5e0; border-right: 1px solid #e5e5e0; vertical-align: top;">
                        <span style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Payment Type</span>
                        <strong style="font-size: 14px; color: #1c2c1a; text-transform: capitalize;">${booking.payment_type || "Full"}</strong>
                      </td>
                      <td width="50%" style="padding: 15px; border-top: 1px solid #e5e5e0; vertical-align: top;">
                        <span style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Date Processed</span>
                        <strong style="font-size: 14px; color: #1c2c1a;">${booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Table Header -->
              <tr>
                <td style="padding: 30px 30px 10px 30px;">
                  <h3 style="color: #1c2c1a; font-family: Georgia, serif; font-size: 16px; font-weight: normal; margin: 0; border-bottom: 2px solid #1c2c1a; padding-bottom: 8px;">Your Journey Snapshot</h3>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <thead>
                      <tr>
                        <th style="padding: 12px; background-color: #fcfcf9; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; border-bottom: 1px solid #e5e5e0;">Package</th>
                        <th style="padding: 12px; background-color: #fcfcf9; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; border-bottom: 1px solid #e5e5e0;">Travellers</th>
                        <th style="padding: 12px; background-color: #fcfcf9; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; border-bottom: 1px solid #e5e5e0;">Rate</th>
                        <th style="padding: 12px; background-color: #fcfcf9; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; border-bottom: 1px solid #e5e5e0;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Totals Section -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="55%"></td>
                      <td width="45%">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Subtotal:</td>
                            <td style="padding: 6px 0; font-size: 13px; text-align: right; color: #111827;">${totalAmountStr}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-size: 13px; color: #4b5563; border-bottom: 1px solid #e5e5e0; font-weight: bold;">Amount Paid:</td>
                            <td style="padding: 6px 0; font-size: 13px; text-align: right; color: #111827; border-bottom: 1px solid #e5e5e0; font-weight: bold;">${amountPaidStr}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0 0 0; font-size: 14px; font-weight: bold; color: #2d4022;">Remaining Balance:</td>
                            <td style="padding: 12px 0 0 0; font-size: 14px; font-weight: bold; text-align: right; color: #2d4022;">${balanceDueStr}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Instructions Box -->
              <tr>
                <td style="padding: 0 30px 40px 30px;">
                  <div style="background-color: #fcfcf9; border: 1px solid #e5e5e0; border-radius: 4px; padding: 20px; font-size: 13px; color: #4b5563; line-height: 1.5;">
                    <strong style="color: #1c2c1a; display: block; margin-bottom: 6px;">Important Booking Information</strong>
                    Please retain this confirmation for your records. You can download your official PDF invoice anytime by logging into your account under "My Journeys" section. If you opted for a deposit payment, the remaining balance is due prior to departure as detailed in our travel terms.
                  </div>
                </td>
              </tr>

              <!-- Footer Brand Area -->
              <tr>
                <td style="background-color: #f4f4f0; border-top: 1px solid #e5e5e0; padding: 25px 30px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #888888;">
                    If you have any questions, please contact our support team at <a href="mailto:${adminEmail}" style="color: #c5a880; text-decoration: none; font-weight: bold;">${adminEmail}</a>.
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 11px; color: #aaaaaa;">
                    This is an automated receipt from the MANNYAM Studio platform.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Admin Notification Email HTML with travel snapshot summaries
  const adminSubject = `[Admin Notification] Successful Booking Confirmed - Ref: ${booking.id.slice(0, 8).toUpperCase()}`;
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking Confirmed</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dddddd; padding: 30px;">
        <h2 style="color: #2d4022; border-bottom: 2px solid #2d4022; padding-bottom: 10px; margin-top: 0;">New Booking Confirmed (Successful Payment)</h2>
        <p>A new booking has transitioned to <strong>${booking.status}</strong> state after successful payment/authorization.</p>
        
        <h3 style="color: #333; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Customer Contact Information</h3>
        <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px; font-weight: bold; width: 120px; font-size: 13px;">Name:</td>
            <td style="padding: 6px; font-size: 13px;">${booking.contact_name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; font-size: 13px;">Email:</td>
            <td style="padding: 6px; font-size: 13px;"><a href="mailto:${booking.contact_email}">${booking.contact_email || "N/A"}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; font-size: 13px;">Booking ID:</td>
            <td style="padding: 6px; font-size: 13px; font-family: monospace;">${booking.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; font-size: 13px;">Payment Type:</td>
            <td style="padding: 6px; font-size: 13px; text-transform: uppercase;">${booking.payment_type || "Full"}</td>
          </tr>
        </table>

        <h3 style="color: #333; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Travel Snapshot Summary</h3>
        <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #fcfcf9;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left; font-size: 12px;">Package Title</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 12px;">Departure Date</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 12px;">Travellers</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-size: 12px;">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${item.package_title}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px; text-align: center;">${item.departure_date || "N/A"}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px; text-align: center;">${item.travellers}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px; text-align: right;">${formatCurrency(item.line_amount, booking.currency)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h3 style="color: #333; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Financial Summary</h3>
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 6px; font-size: 13px;">Total Amount:</td>
            <td style="padding: 6px; font-size: 13px; text-align: right; font-weight: bold;">${totalAmountStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-size: 13px;">Amount Paid:</td>
            <td style="padding: 6px; font-size: 13px; text-align: right; font-weight: bold; color: green;">${amountPaidStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-size: 13px; border-top: 1px solid #ddd;">Remaining Balance Due:</td>
            <td style="padding: 6px; font-size: 13px; text-align: right; font-weight: bold; color: red; border-top: 1px solid #ddd;">${balanceDueStr}</td>
          </tr>
        </table>

        ${
          booking.notes
            ? `<div style="background: #fff8e1; border: 1px solid #ffe082; padding: 15px; margin-top: 20px; font-size: 12px; border-radius: 4px;">
            <strong>Booking Notes:</strong><br/>
            ${booking.notes.replace(/\n/g, "<br/>")}
          </div>`
            : ""
        }

        <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px; margin-bottom: 15px;" />
        <p style="font-size: 11px; color: #888888; text-align: center;">Sent by MANNYAM CMS Engine.</p>
      </div>
    </body>
    </html>
  `;

  if (!apiKey || apiKey === "re_placeholder-api-key" || apiKey === "placeholder") {
    console.log("=== LOCAL TESTING: Booking Confirmation Emails (Resend Not Configured) ===");
    console.log(`To Customer: ${booking.contact_email}`);
    console.log(`To Admin: ${adminEmail}`);
    console.log(`Customer Subject: ${subject}`);
    console.log(`Admin Subject: ${adminSubject}`);
    console.log("=========================================================================");
    return { success: true, logged: true };
  }

  try {
    const resend = new Resend(apiKey);

    // Send Customer email
    if (booking.contact_email) {
      const { error: customerError } = await resend.emails.send({
        from: "MANNYAM CMS <onboarding@resend.dev>",
        to: booking.contact_email,
        subject,
        html: customerHtml,
      });

      if (customerError) {
        console.error("Resend Customer Email error:", customerError);
      }
    }

    // Send Admin email
    const { error: adminError } = await resend.emails.send({
      from: "MANNYAM CMS <onboarding@resend.dev>",
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    });

    if (adminError) {
      console.error("Resend Admin Email error:", adminError);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send booking confirmation emails:", error);
    return { success: false, error };
  }
}
