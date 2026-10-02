const authorizeSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Sellers only" });
  }
};

module.exports = authorizeSeller;