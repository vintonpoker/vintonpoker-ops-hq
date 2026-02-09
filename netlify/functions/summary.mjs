import { requireSession, jsonRes } from "./_lib/session.mjs";
import { startOfDayMs, rangeUnixSeconds } from "./_lib/time.mjs";
import { sumBalanceTransactions } from "./_lib/stripe.mjs";
import { kitListForms, kitListTags } from "./_lib/kit.mjs";

function dollars(cents) {
  return Math.round((cents / 100) * 100) / 100;
}

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  const tzOffsetMinutes = -7 * 60; // America/Mazatlan (no DST handling in v1)

  const now = new Date();
  const todayStart = startOfDayMs(tzOffsetMinutes, now);
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const last7dStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  // MTD
  const localNowMs = now.getTime() + tzOffsetMinutes * 60_000;
  const localNow = new Date(localNowMs);
  localNow.setUTCDate(1);
  localNow.setUTCHours(0, 0, 0, 0);
  const mtdStart = localNow.getTime() - tzOffsetMinutes * 60_000;

  const yRange = rangeUnixSeconds({ startMs: yesterdayStart, endMs: todayStart });
  const wRange = rangeUnixSeconds({ startMs: last7dStart, endMs: todayStart });
  const mRange = rangeUnixSeconds({ startMs: mtdStart, endMs: todayStart });

  let stripe = { status: "stub" };
  let revenue = { yesterday: 0, last7d: 0, mtd: 0 };
  let refunds = { yesterday: 0, last7d: 0, mtd: 0 };

  let kit = { status: "stub" };

  try {
    const [y, w, m] = await Promise.all([
      sumBalanceTransactions(yRange),
      sumBalanceTransactions(wRange),
      sumBalanceTransactions(mRange),
    ]);

    // Stripe balance tx amounts are in cents; net includes fees.
    revenue = {
      yesterday: dollars(y.amount - y.refunds),
      last7d: dollars(w.amount - w.refunds),
      mtd: dollars(m.amount - m.refunds),
    };
    refunds = {
      yesterday: dollars(y.refunds),
      last7d: dollars(w.refunds),
      mtd: dollars(m.refunds),
    };

    stripe = { status: "ok", currency: "usd" };
  } catch (e) {
    stripe = { status: "error", error: e?.message || String(e) };
  }

  try {
    const [forms, tags] = await Promise.all([kitListForms(), kitListTags()]);

    const keyTagNames = [
      "Masterclass Prospect",
      "Masterclass Customer",
      "DKC WOLH Prospect",
      "DKC WOLH Customer",
      "In: AI Operator Bootcamp",
      "In: Customer to Affiliate",
      "Completed: Affiliate Activation",
    ];

    const tagCounts = {};
    for (const name of keyTagNames) {
      const t = (tags || []).find((x) => x?.name === name);
      // Kit v4 tag objects may include `subscriber_count`; if not, we still surface presence.
      tagCounts[name] = t
        ? { id: t.id, subscriber_count: t.subscriber_count ?? null }
        : { id: null, subscriber_count: null };
    }

    kit = {
      status: "ok",
      forms: forms.length,
      tags: tags.length,
      keyTagCounts: tagCounts,
    };
  } catch (e) {
    kit = { status: "error", error: e?.message || String(e) };
  }

  return jsonRes({
    ok: true,
    generatedAt: new Date().toISOString(),
    scoreboard: {
      revenue,
      refunds,
      leads: { yesterday: 0, last7d: 0 },
      conversions: { last7d: 0 },
      youtube: { viewsLast7d: 0 },
      affiliates: { clicksLast7d: 0, conversionsLast7d: 0, commissionLast7d: 0 },
    },
    sources: {
      stripe,
      kit,
      youtube: { status: "stub" },
      netlify: { status: "stub" },
      refersion: { status: "stub" },
      ga: { status: "stub" },
      gsc: { status: "stub" },
    },
  });
};
