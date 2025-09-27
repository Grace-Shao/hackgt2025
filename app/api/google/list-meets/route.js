import { NextResponse } from "next/server";
import { google } from "googleapis";

const APP_TAG = "eldermeet";

export async function POST(req) {
  try {
    const {
      days = 7,
      max = 50,
      userAccessToken, // if present, list THEIR calendar; else list the bot's
    } = await req.json().catch(() => ({}));

    let auth;
    if (userAccessToken) {
      const oauth2 = new google.auth.OAuth2();
      oauth2.setCredentials({ access_token: userAccessToken });
      auth = oauth2;
    } else if (
      process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    ) {
      const oauth2 = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET
      );
      oauth2.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });
      auth = oauth2;
    } else {
      return NextResponse.json(
        { error: "no_auth", message: "Provide userAccessToken or configure bot refresh token." },
        { status: 400 }
      );
    }

    const calendar = google.calendar({ version: "v3", auth });
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + Math.min(days, 30) * 86400000).toISOString();

    const resp = await calendar.events.list({
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin,
      timeMax,
      maxResults: Math.min(max, 50),
      conferenceDataVersion: 1,
      // Only show events this app created (regardless of host)
      privateExtendedProperty: `app=${APP_TAG}`,
    });

    const events = (resp.data.items || []).map(ev => {
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
