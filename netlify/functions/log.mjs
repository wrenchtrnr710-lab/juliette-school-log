import { getStore } from "@netlify/blobs";

// Stores the whole log as one JSON array in Netlify Blobs (your own Netlify account).
// Optional passcode: set an environment variable LOG_PASSCODE in Netlify.
export default async (req) => {
  const pass = process.env.LOG_PASSCODE;
  if (pass && req.headers.get("x-passcode") !== pass) {
    return new Response("unauthorized", { status: 401 });
  }
  const store = getStore("school-log");
  if (req.method === "GET") {
    const data = await store.get("entries", { type: "json" });
    return Response.json(data || []);
  }
  if (req.method === "PUT") {
    let body;
    try { body = await req.json(); } catch (e) { return new Response("bad json", { status: 400 }); }
    if (!Array.isArray(body)) return new Response("expected array", { status: 400 });
    await store.setJSON("entries", body);
    return Response.json({ ok: true, count: body.length });
  }
  return new Response("method not allowed", { status: 405 });
};

export const config = { path: "/api/log" };
