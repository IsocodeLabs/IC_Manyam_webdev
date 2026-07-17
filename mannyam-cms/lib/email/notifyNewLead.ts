import { Resend } from "resend";

export interface NewLeadEmailData {
  name: string;
  email: string;
  source: "Contact Form" | "AI Chat";
  source_page: string;
  message?: string;
}

export async function notifyNewLead(data: NewLeadEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@mannyam.in";

  const subject = `[New Lead] Submission from ${data.name} via ${data.source}`;
  const html = `
    <h1>New Lead Enquiry Received</h1>
    <p>A visitor has submitted a new inquiry through the CMS public API endpoint.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold; width: 150px;">Name</td>
        <td style="padding: 8px; border: 1px solid #e0e0e0;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Email</td>
        <td style="padding: 8px; border: 1px solid #e0e0e0;"><a href="mailto:${data.email}">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Source</td>
        <td style="padding: 8px; border: 1px solid #e0e0e0;">${data.source}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Source Page</td>
        <td style="padding: 8px; border: 1px solid #e0e0e0;">${data.source_page}</td>
      </tr>
      ${
        data.message
          ? `<tr>
        <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Message</td>
        <td style="padding: 8px; border: 1px solid #e0e0e0; white-space: pre-wrap;">${data.message}</td>
      </tr>`
          : ""
      }
    </table>
    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-top: 25px; margin-bottom: 10px;" />
    <p style="font-size: 11px; color: #888888;">This notification was automatically sent from the MANNYAM Studio CMS server.</p>
  `;

  if (!apiKey || apiKey === "re_placeholder-api-key" || apiKey === "placeholder") {
    console.log("=== LOCAL TESTING: Lead Email Notification (Resend Not Configured) ===");
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.replace(/<[^>]*>/g, "\n").trim()}`);
    console.log("=======================================================================");
    return { success: true, logged: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { data: response, error } = await resend.emails.send({
      from: "MANNYAM CMS <onboarding@resend.dev>",
      to: adminEmail,
      subject,
      html,
    });

    if (error) {
      console.error("Resend API returned an error:", error);
      return { success: false, error };
    }

    return { success: true, response };
  } catch (error) {
    console.error("Failed to send email notification via Resend:", error);
    return { success: false, error };
  }
}
