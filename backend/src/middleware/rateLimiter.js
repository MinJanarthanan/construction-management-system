/**
 * In-memory IP based rate limiter for authentication endpoints
 * Protects against brute-force attacks without requiring external Redis
 */

const loginAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const MAX_ATTEMPTS = 20; // 20 requests per window

const rateLimitLogin = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
  const now = Date.now();

  const record = loginAttempts.get(ip) || { count: 0, resetTime: now + WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
  } else {
    record.count += 1;
  }

  loginAttempts.set(ip, record);

  res.setHeader('X-RateLimit-Limit', MAX_ATTEMPTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_ATTEMPTS - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

  if (record.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'Too many login attempts. Please wait 15 minutes before trying again.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }

  next();
};

module.exports = {
  rateLimitLogin
};
