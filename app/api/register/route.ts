import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, email } = await req.json();

    if (!fullName || !phone || !email) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Get client headers for Mautic tracking accuracy
    const clientIp = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";

    // Map fields according to Mautic alias standards and user instructions
    // "họ tên là first name, sđt là phone, email là email"
    // We send both 'firstname' and 'first_name' to guarantee compatibility
    const mauticPayload = new URLSearchParams();
    mauticPayload.append("mauticform[formId]", "16");
    mauticPayload.append("mauticform[firstname]", fullName);
    mauticPayload.append("mauticform[first_name]", fullName);
    mauticPayload.append("mauticform[phone]", phone);
    mauticPayload.append("mauticform[email]", email);

    // Mautic forms often look for a 'messenger' field or similar, 
    // adding it doesn't hurt and helps in some webhook contexts.
    mauticPayload.append("mauticform[messenger]", "1");

    const mauticUrl = "https://crm.nambds.vn/form/submit?formId=16";

    console.log(`Sending Mautic subscription for ${email} with IP [${clientIp}]...`);

    const response = await fetch(mauticUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Forwarded-For": clientIp,
        "User-Agent": userAgent,
        "Referer": "https://telesale.nambds.vn",
      },
      body: mauticPayload.toString(),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Mautic submission failed with status ${response.status}:`, responseText);
      // We still return true to client to not block lead reservation UX on crm downtime
      return NextResponse.json({ success: true, synced: false, warning: "CRM sync warning" });
    }

    console.log(`Successfully synced registration for ${email} to Mautic Form 16.`);
    return NextResponse.json({ success: true, synced: true });
  } catch (error: any) {
    console.error("Error submitting to Mautic:", error);
    // Silent fail over to guarantee flawless UX for the registration flow
    return NextResponse.json({ success: true, synced: false, error: error.message });
  }
}
