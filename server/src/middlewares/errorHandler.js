function errorHandler(err, req, res, next) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message || "Internal Server Error";

  if (status >= 500) {
    console.error(err);
  }

  const payload = { message };
  if (err?.details && typeof err.details === "object") {
    payload.details = err.details;
  }

  return res.status(status).json(payload);
}

module.exports = { errorHandler };
