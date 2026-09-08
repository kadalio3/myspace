/**
 * Simple in-memory rate limiter using a sliding window approach.
 * Suitable for single-instance deployments (Docker standalone).
 * For multi-instance/distributed deployments, consider Redis-based rate limiting.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate limited.
 * @param identifier - Unique identifier (e.g., IP address or "action:ip")
 * @param maxRequests - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns { success: boolean, remaining: number } - Whether the request is allowed
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier) || { timestamps: [] };

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    rateLimitStore.set(identifier, entry);
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: maxRequests - entry.timestamps.length,
  };
}
