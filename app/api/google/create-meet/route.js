import { NextResponse } from "next/server";
import { google } from "googleapis";

const APP_TAG = "eldermeet"; // tag events so you can filter in your list route

export async function POST(req) {
  try {
    const {
      summary = "Friendly chat",
      startISO,
      durationMins = 30,
      attendees = [],
      userAccessToken, // <-- if present, create as THIS user (host = them)
    } = await req.json().catch(() => ({}));

    const start = startISO || new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const end   = new Date(new Date(start).getTime() + durationMins * 60000).toISOString();

    // Choose auth:
    // 1) Prefer the user's access token (they will be the organizer/host)
    // 2) Otherwise fall back to your "bot host" refresh token (optional)
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

    const res = await calendar.events.insert({
      calendarId: "primary", // creates on the host user's calendar
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
        extendedProperties: { private: { app: APP_TAG } },
      },
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
      organizer: ev.organizer?.email || null, // <- will be the user if they provided userAccessToken
      tag: APP_TAG,
    });
  } catch (e) {
    console.error("create-meet error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
