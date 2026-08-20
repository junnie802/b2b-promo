// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.stack || err);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
}

module.exports = errorHandler;
