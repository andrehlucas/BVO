import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();

const allowedContextParameters = new Set(["city", "track", "plan", "position", "context"]);

const providers: Record<string, string> = {
  regus: "https://www.regus.com/en/virtual-offices",
  "opus-virtual-offices": "https://www.opusvirtualoffices.com/virtualoffices/florida/",
  "alliance-virtual-offices": "https://www.alliancevirtualoffices.com/virtual-office/us/fl/boca-raton/n-federal-hwy-5717",
  "davinci-virtual": "https://www.davincivirtual.com/loc/us/florida/orlando-virtual-offices/facility-7353",
};

const sitemapPaths = [
  "/",
  "/florida",
  "/providers",
  "/guides",
  ...["orlando", "tampa", "fort-lauderdale", "miami", "boca-raton"].map((slug) => `/cities/${slug}`),
  ...Object.keys(providers).map((slug) => `/providers/${slug}`),
  ...[
    "what-is-a-virtual-office",
    "business-address-vs-virtual-office",
    "mail-handling-vs-live-receptionist",
    "hidden-fees-in-virtual-office-plans",
    "how-to-choose-a-virtual-office-in-florida",
    "virtual-office-checklist-for-freelancers-and-small-businesses",
  ].map((slug) => `/guides/${slug}`),
  "/methodology",
  "/affiliate-disclosure",
  "/privacy",
  "/corrections",
];

function requestOrigin(req: Request) {
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

router.get("/go/:providerId", (req, res): void => {
  if (Object.keys(req.query).some((key) => !allowedContextParameters.has(key))) {
    res.sendStatus(400);
    return;
  }

  const providerId = Array.isArray(req.params.providerId) ? req.params.providerId[0] : req.params.providerId;
  const destination = providers[providerId];
  if (!destination) {
    res.sendStatus(404);
    return;
  }

  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("X-Robots-Tag", "noindex, nofollow");
  res.redirect(302, destination);
});

router.get("/robots.txt", (req, res): void => {
  res.type("text/plain").send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /go/",
    `Sitemap: ${requestOrigin(req)}/sitemap.xml`,
    "",
  ].join("\n"));
});

router.get("/sitemap.xml", (req, res): void => {
  const origin = requestOrigin(req);
  const urls = sitemapPaths.map((pathname) => `  <url><loc>${origin}${pathname}</loc></url>`).join("\n");
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

export default router;