const jwt = require("jsonwebtoken");

const jwtMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, "SECRET_KEY");

    req.user = decoded;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }
};

module.exports = jwtMiddleware;