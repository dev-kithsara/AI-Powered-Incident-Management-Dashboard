const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }

  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists' });
  }

  // Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Prisma foreign key
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = { errorHandler };
