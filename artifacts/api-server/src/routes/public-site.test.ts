import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app";

let server: Server;
let origin: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Test server did not open a TCP port");
      origin = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

describe("public site endpoints", () => {
  it("redirects known providers with the original privacy and robots headers", async () => {
    const response = await fetch(`${origin}/go/regus?city=miami&track=address-mail`, {
      redirect: "manual",
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://www.regus.com/en/virtual-offices");
    expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("rejects unknown providers and unapproved query parameters", async () => {
    expect((await fetch(`${origin}/go/not-a-provider`)).status).toBe(404);
    expect((await fetch(`${origin}/go/regus?redirect=https://attacker.test`)).status).toBe(400);
  });

  it("publishes robots rules that exclude outbound redirects", async () => {
    const response = await fetch(`${origin}/robots.txt`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^text\/plain/);
    expect(body).toContain("Disallow: /go/");
    expect(body).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  it("publishes the reviewed public route inventory", async () => {
    const response = await fetch(`${origin}/sitemap.xml`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^application\/xml/);
    expect(body).toContain(`${origin}/cities/miami`);
    expect(body).toContain(`${origin}/providers/regus`);
    expect(body).toContain(`${origin}/guides/what-is-a-virtual-office`);
    expect(body).not.toContain("business-address-vs-registered-agent");
  });
});