/**
 * Centralized error handling utilities.
 *
 * Goal: never leak internal implementation details (stack traces, DB error
 * codes, file paths) to API clients. Production responses return a safe
 * generic message while the full error is logged server-side.
 */

const isProd = process.env.NODE_ENV === 'production';

/**
 * Sanitize an error into a safe, client-facing message.
 * @param {Error|unknown} err
 * @param {string} [fallback] - Optional default message
 * @returns {{ status: number, message: string }}
 */
export const sanitizeError = (err, fallback = 'Something went wrong. Please try again.') => {
  const error = err || {};
  const rawMessage = error.message || String(error);

  // Classify known error families into safe HTTP statuses + messages.
  let status = 500;
  let message = fallback;

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Authentication failed. Please sign in again.';
  } else if (error.code === '23505' || /duplicate/i.test(rawMessage)) {
    status = 409;
    message = 'A record with this value already exists.';
  } else if (error.code === '22P02' || /invalid input syntax/i.test(rawMessage)) {
    status = 400;
    message = 'Invalid request data.';
  } else if (error.status && Number.isInteger(error.status)) {
    status = error.status;
    message = isProd ? fallback : rawMessage;
  } else if (!isProd) {
    // In development, surface the raw message to aid debugging.
    message = rawMessage || fallback;
  }

  return { status, message };
};

/**
 * Send a sanitized error response. Logs the full error server-side.
 * Usage inside route catch blocks:
 *   } catch (error) { sendError(res, error); }
 */
export const sendError = (res, err, fallback) => {
  const { status, message } = sanitizeError(err, fallback);
  // Always log the real error server-side.
  if (status >= 500) {
    console.error(`[API] ${status} error:`, err);
  } else {
    console.warn(`[API] ${status}:`, err?.message || err);
  }
  res.status(status).json({ error: message });
};

/**
 * Global Express error handler (4-arg signature).
 * Mount with: app.use(globalErrorHandler)
 */
export const globalErrorHandler = (err, _req, res, _next) => {
  sendError(res, err);
};

/**
 * Wrap an async route handler so rejections are forwarded to next().
 * Lets us drop the repetitive try/catch boilerplate.
 * @param {(req: import('express').Request, res: import('express').Response) => Promise<any>} fn
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};
