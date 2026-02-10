import { startOfDayMs, rangeUnixSeconds } from "./time.mjs";
import { sumBalanceTransactions } from "./stripe.mjs";
import { kitListForms, kitListTags } from "./kit.mjs";

function dollars(cents) {
  return Math.round((cents / 100) * 100) / 100;
}

export async function buildSnapshot({ tzOffsetMinutes = -7 * 60 } = {}) {
  const now = new Date();

  const todayStart = startOfDayMs(tzOffsetMinutes, now);
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const last7dStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  // month-to-date start
  const localNowMs = now.getTime() + tzOffsetMinutes * 60_000;
  const localNow = new Date(localNowMs);
  localNow.setUTCDate(1);
  localNow.setUTCHours(0, 0, 0, 0);
  const mtdStart = localNow.getTime() - tzOffsetMinutes * 60_000;

  const yRange = rangeUnixSeconds({ startMs: yesterdayStart, endMs: todayStart });
  const wRange = rangeUnixSeconds({ startMs: last7dStart, endMs: todayStart });
  const mRange = rangeUnixSeconds({ startMs: mtdStart, endMs: todayStart });

  const snapshot = {
    generatedAt: new Date().toISOString(),
    tzOffsetMinutes,
    scoreboard: {
      revenue: { yesterday: 0, last7d: 0, mtd: 0 },
      refunds: { yesterday: 0, last7d: 0, mtd: 0 },
      leads: { yesterday: null, last7d: null },
    },
    sources: {
      stripe: { status: "stub" },
      kit: { status: "stub" },
    },
  };

  // Stripe
  try {
    const [y, w, m] = await Promise.all([
      sumBalanceTransactions(yRange),
      sumBalanceTransactions(wRange),
      sumBalanceTransactions(mRange),
    ]);

    snapshot.scoreboard.revenue = {
      yesterday: dollars(y.amount - y.refunds),
      last7d: dollars(w.amount - w.refunds),
      mtd: dollars(m.amount - m.refunds),
    };
    snapshot.scoreboard.refunds = {
      yesterday: dollars(y.refunds),
      last7d: dollars(w.refunds),
      mtd: dollars(m.refunds),
    };
    snapshot.sources.stripe = { status: "ok", currency: "usd" };
  } catch (e) {
    snapshot.sources.stripe = { status: "error", error: e?.message || String(e) };
  }

  // Kit
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

    const keyTagCounts = {};
    for (const name of keyTagNames) {
      const t = (tags || []).find((x) => x?.name === name);
      keyTagCounts[name] = t
        ? { id: t.id, subscriber_count: t.subscriber_count ?? null }
        : { id: null, subscriber_count: null };
    }

    snapshot.sources.kit = {
      status: "ok",
      forms: forms.length,
      tags: tags.length,
      keyTagCounts,
    };
  } catch (e) {
    const status = e?.status;
    const base = e?.message || String(e);
    const hint =
      status === 401
        ? " (401 unauthorized — check Netlify env var KIT_API_KEY is a valid Kit v4 token)"
        : "";
    snapshot.sources.kit = { status: "error", error: base + hint };
  }

  return snapshot;
}
