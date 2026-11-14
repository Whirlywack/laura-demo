// There is no sign-in, so the page's own buttons are told apart from another site by what the browser says.
// This stops another site open in the same browser from sending the request. curl sends neither header and
// still gets through; for Call now the 60-second limit is the protection there.
export function fromAnotherSite(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const sameHost = (origin: string) => URL.canParse(origin) && new URL(origin).host === host;
  return (site !== null && site !== "same-origin") || (origin !== null && !sameHost(origin));
}

export const refuseAnotherSite = () => Response.json({ ok: false, message: "This only works from the Laura page itself." }, { status: 403 });
