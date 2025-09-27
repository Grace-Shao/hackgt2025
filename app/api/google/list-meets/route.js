import { NextResponse } from "next/server";
import { google } from "googleapis";

const APP_TAG = "eldermeet";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get("days") || "7", 10), 30);
    const maxResults = Math.min(parseInt(searchParams.get("max") || "20", 10), 50);

    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth: oauth2 });

    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + days * 86400000).toISOString();

    const resp = await calendar.events.list({
      calendarId: "primary",            // still personal calendar
      singleEvents: true,
      orderBy: "startTime",
      timeMin,
      timeMax,
      maxResults,
      conferenceDataVersion: 1,
      // 🔎 Only events created by our app:
      privateExtendedProperty: `app=${APP_TAG}`,
    });

    const events = (resp.data.items || [])
      // (Conference check is mostly redundant now, since our create path always adds Meet)
      .filter(ev =>
        ev.hangoutLink ||
        ev?.conferenceData?.conferenceSolution?.key?.type === "hangoutsMeet" ||
        (ev?.conferenceData?.entryPoints || []).some(e => e.entryPointType === "video")
      )
      .map(ev => {
        const start = ev.start?.dateTime || ev.start?.date;
        const end = ev.end?.dateTime || ev.end?.date;
        const meetLink =
          ev.hangoutLink ||
          (ev.conferenceData?.entryPoints || []).find(e => e.entryPointType === "video")?.uri ||
          null;
        const attendees = (ev.attendees || []).map(a => a.email);
        return {
          id: ev.id,
          summary: ev.summary || "Untitled meeting",
          start,
          end,
          meetLink,
          attendees,
          organizer: ev.organizer?.email || null,
        };
      });

    return NextResponse.json({ events, tag: APP_TAG });
  } catch (e) {
    console.error("list-meets error:", e);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
  }
}
