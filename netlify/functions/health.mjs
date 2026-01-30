export default async (req) => {
  return new Response(JSON.stringify({ ok: true, service: "vintonpoker-ops-hq" }, null, 2), {
    headers: { "content-type": "application/json" },
  });
};
