import { NextResponse } from "next/server";
import { google } from "googleapis";

// Use this to tag events created by this app
const APP_TAG = "eldermeet";

export async function POST(req) {
  try {
    const {
      summary = "Friendly chat",
      startISO,
      durationMins = 30,
      attendees = [],
    } = await req.json().catch(() => ({}));

    const start = startISO || new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const end   = new Date(new Date(start).getTime() + durationMins * 60000).toISOString();

    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth: oauth2 });

    const res = await calendar.events.insert({
      calendarId: "primary",               // still using personal calendar
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        start: { dateTime: start },
        end:   { dateTime: end },
        attendees: attendees.map(e => ({ email: e })),
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).slice(2),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        // 🔖 Tag the event so we can filter it later
        extendedProperties: {
          private: { app: APP_TAG },
        },
      },
      // Optional: email attendees when created
      // sendUpdates: "all",
    });

    const ev = res.data;
    const meetLink =
      ev.hangoutLink ||
      ev.conferenceData?.entryPoints?.find(e => e.entryPointType === "video")?.uri ||
      null;

    return NextResponse.json({
      id: ev.id,
      htmlLink: ev.htmlLink,
      meetLink,
      start,
      end,
      tag: APP_TAG,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
