import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Target-Url, X-Target-Method, X-Target-Headers"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const targetUrl = req.headers["x-target-url"] as string;
  if (!targetUrl) {
    res.status(400).json({ error: "Missing x-target-url header" });
    return;
  }

  // 1. Verify Static Proxy Secret if configured
  const proxySecret = process.env.PROXY_SECRET;
  if (proxySecret) {
    const incomingSecret = req.headers["x-proxy-secret"] as string;
    if (incomingSecret !== proxySecret) {
      res.status(401).json({ error: "Unauthorized: Invalid x-proxy-secret header" });
      return;
    }
  }

  // 2. Verify JWT if configured
  const jwtSecret = process.env.PROXY_JWT_SECRET;
  if (jwtSecret) {
    const authHeader = req.headers["authorization"] as string;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
      return;
    }
    const token = authHeader.substring(7);
    const parts = token.split(".");
    if (parts.length !== 3) {
      res.status(401).json({ error: "Unauthorized: Invalid JWT format" });
      return;
    }
    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Import crypto dynamically to avoid issues depending on target platform
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", jwtSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");
    if (expectedSignature !== signatureB64) {
      res.status(401).json({ error: "Unauthorized: Invalid JWT signature" });
      return;
    }
  }

  // 3. SSRF Protection (Verify target URL hostname)
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    res.status(400).json({ error: "Invalid target URL format" });
    return;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isLocalOrPrivate =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "169.254.169.254" || // Cloud Metadata Endpoint
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname); // 172.16.0.0 - 172.31.255.255

  if (isLocalOrPrivate) {
    res.status(403).json({ error: "Forbidden: Access to private networks or metadata endpoints is blocked" });
    return;
  }

  // 4. Allowed Domains Whitelist
  const allowedDomainsEnv = process.env.ALLOWED_DOMAINS;
  if (allowedDomainsEnv) {
    const allowedDomains = allowedDomainsEnv.split(",").map(d => d.trim().toLowerCase());
    const isAllowed = allowedDomains.some(domain => {
      return hostname === domain || hostname.endsWith("." + domain);
    });
    if (!isAllowed) {
      res.status(403).json({ error: "Forbidden: Target domain is not whitelisted" });
      return;
    }
  }

  const targetMethod = (req.headers["x-target-method"] as string) || "GET";
  const targetHeadersString = req.headers["x-target-headers"] as string;

  let targetHeaders: Record<string, string> = {};
  if (targetHeadersString) {
    try {
      targetHeaders = JSON.parse(targetHeadersString);
    } catch (e) {
      res.status(400).json({ error: "Invalid x-target-headers JSON format" });
      return;
    }
  }

  // Extract body if request has one
  let body: any = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    // If request has body, read it as arrayBuffer or text from req
    if (req.body) {
      if (typeof req.body === "object") {
        body = JSON.stringify(req.body);
      } else {
        body = req.body;
      }
    }
  }

  try {
    const fetchResponse = await fetch(targetUrl, {
      method: targetMethod,
      headers: targetHeaders,
      body: body,
    });

    const responseHeaders: Record<string, string> = {};
    fetchResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Read response as arrayBuffer to handle binary responses (images, pdfs) correctly
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Forward status and headers
    res.status(fetchResponse.status);
    Object.entries(responseHeaders).forEach(([key, value]) => {
      const k = key.toLowerCase();
      // Skip headers that could cause response errors or transfer encoding chunking issues in Vercel Sls
      if (
        k !== "transfer-encoding" &&
        k !== "content-encoding" &&
        k !== "connection" &&
        k !== "content-length"
      ) {
        res.setHeader(key, value);
      }
    });

    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal proxy error" });
  }
}
