export async function vphqFetch(path: string) {
  const base = ""; // same-origin on Netlify
  const res = await fetch(`${base}/.netlify/functions/${path}`, {
    headers: {
      // In v1 we do not ship VP_HQ_API_KEY to browser.
      // For local dev, we will add a dev proxy or local-only key later.
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
