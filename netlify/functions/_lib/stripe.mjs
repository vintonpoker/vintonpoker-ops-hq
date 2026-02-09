const STRIPE_API = "https://api.stripe.com/v1";

export async function stripeGet(path, params = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "object") {
      // supports created[gte] style
      for (const [kk, vv] of Object.entries(v)) qs.set(`${k}[${kk}]`, String(vv));
    } else {
      qs.set(k, String(v));
    }
  }

  const url = `${STRIPE_API}${path}?${qs.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    const msg = json?.error?.message || `Stripe error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

export async function sumBalanceTransactions({ start, end }) {
  // Sum net, amount, fee over balance transactions in range.
  let startingAfter = null;
  let total = { count: 0, amount: 0, fee: 0, net: 0, refunds: 0 };

  while (true) {
    const page = await stripeGet("/balance_transactions", {
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
      created: { gte: start, lt: end },
    });

    for (const bt of page.data || []) {
      total.count += 1;
      total.amount += bt.amount || 0;
      total.fee += bt.fee || 0;
      total.net += bt.net || 0;
      if (bt.type === "refund") total.refunds += Math.abs(bt.amount || 0);
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
    if (!startingAfter) break;
  }

  return total;
}
