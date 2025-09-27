import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: "http://localhost:3000/api/google/oauth/callback",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    access_type: "offline",   // <- needed to get refresh_token
    prompt: "consent",        // <- force consent so refresh_token is returned
  });
  return NextResponse.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
}
