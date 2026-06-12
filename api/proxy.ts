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
