const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // Fallback to token from query for iframe-based viewing
  if (!token && typeof req.query?.token === "string") {
    token = req.query.token;
  }
  if (!token)
    return res.status(401).json({ message: "Not authorized, token missing" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    if (user.isBlocked)
      return res.status(403).json({ message: "User is blocked" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
