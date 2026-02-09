import { clearSessionCookie, jsonRes } from "./_lib/session.mjs";

export default async (req) => {
  const setCookie = clearSessionCookie();
  return jsonRes({ ok: true }, 200, { "set-cookie": setCookie });
};
