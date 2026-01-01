module.exports = (queryTenantId) => {
  return (req, res, next) => {
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (queryTenantId !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    next();
  };
};
