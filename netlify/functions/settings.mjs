import { getStore } from "@netlify/blobs";

const STORE_NAME = "user-settings";

export default async (req) => {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  const authHash = req.headers.get("x-auth-hash");
  if (!authHash || authHash.length !== 64) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const key = `settings-${authHash}`;

  if (req.method === "GET") {
    const data = await store.get(key, { type: "json" });
    if (!data) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "PUT") {
    const body = await req.json();
    await store.setJSON(key, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "DELETE") {
    await store.delete(key);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/settings",
  method: ["GET", "PUT", "DELETE"],
};
