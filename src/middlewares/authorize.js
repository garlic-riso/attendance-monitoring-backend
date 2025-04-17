module.exports = (roles = []) => {
  return (req, res, next) => {
    const userRole = req.user.role?.toLowerCase(); // normalize to lowercase
    const allowedRoles = roles.map(role => role.toLowerCase()); // normalize all roles

    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};