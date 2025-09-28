import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "no_code" }, { status: 400 });

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/api/google/oauth/callback"
  );

  try {
    const { tokens } = await oauth2.getToken(code);
    // tokens = { access_token, refresh_token, expiry_date, ... }
    const refresh = tokens.refresh_token;

    return new NextResponse(
      `
      <html>
        <body style="font-family:system-ui;padding:24px">
          <h2>Copy this refresh token into your .env.local</h2>
          <pre style="white-space:pre-wrap;border:1px solid #ccc;padding:12px">${refresh || "(no refresh_token returned)"}</pre>
          <p>If it's empty, re-run with prompt=consent (it already is), or remove previous grants at <a href="https://myaccount.google.com/permissions" target="_blank">Google Account → Security → Third-party access</a> and try again.</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "token_exchange_failed" }, { status: 500 });
  }
}
