const KIT_API = "https://api.kit.com/v4";

export async function kitGet(path, params = {}) {
  const key = process.env.KIT_API_KEY;
  if (!key) throw new Error("KIT_API_KEY not set");

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    qs.set(k, String(v));
  }

  const query = qs.toString();
  const url = KIT_API + path + (query ? "?" + query : "");

  const res = await fetch(url, {
    headers: {
      Authorization: "Bearer " + key,
      Accept: "application/json",
    },
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json?.error || json?.message || "Kit error (" + res.status + ")";
    const err = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return json;
}

export async function kitListForms() {
  const j = await kitGet("/forms");
  return j?.forms || [];
}

export async function kitListTags() {
  const j = await kitGet("/tags");
  return j?.tags || [];
}
