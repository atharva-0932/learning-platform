#!/usr/bin/env node
/**
 * Verifies Razorpay API credentials (Basic auth against /v1/payments).
 * Usage: npm run test:razorpay  (loads .env.local via Node --env-file)
 */
const id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const secret = process.env.RAZORPAY_KEY_SECRET;

if (!id || !secret) {
  console.error("Missing RAZORPAY_KEY_ID (or NEXT_PUBLIC_RAZORPAY_KEY_ID) and RAZORPAY_KEY_SECRET in .env.local");
  process.exit(1);
}

const auth = Buffer.from(`${id}:${secret}`, "utf8").toString("base64");
const res = await fetch("https://api.razorpay.com/v1/payments?count=1", {
  headers: { Authorization: `Basic ${auth}` },
});

const body = await res.text();
let json;
try {
  json = JSON.parse(body);
} catch {
  json = { raw: body };
}

if (!res.ok) {
  console.error("Razorpay API error:", res.status, json);
  process.exit(1);
}

if (json.error) {
  console.error("Razorpay returned error:", json.error);
  process.exit(1);
}

console.log("OK — Razorpay API connection successful (HTTP", res.status + ").");
console.log("  entity:", json.entity ?? "(n/a)", "| count:", json.count ?? "(n/a)");
