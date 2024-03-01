const jwt = require("jsonwebtoken");
const jwt_Secret = require("./config");
const authMiddleware = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken || !authToken.startsWith("Bearer")) {
    return res.status(403).json({});
  }
  const token = authToken.split(" ")[1];
  try {
    const decode = jwt.verify(token, jwt_Secret);
    // if (decode) {
    // console.log(decode.userId);
    // console.log(decode.user);
    req.userId = decode.userId;
    next();
    // }
  } catch (error) {
    return res.status(403).json({
      msg: "Errpr in the middleware",
    });
  }
};

module.exports = authMiddleware;
