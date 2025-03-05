const jwt = require("jsonwebtoken");
const db_users = require("../prisma_queries/users");

module.exports.roleAuthor = (req, res, next) => {
  jwt.verify(req.token, secret_key, async(err, authData) => {
    if (err) {
      res.status(403).json({
        errors: err,
      });
    } else {
      const user = await db_users.getUserFromId(Number(authData.userId));
      const { role } = user;
      if (role === "AUTHOR") {
        next();
      } else {
        res
          .status(403)
          .json({ text: "you are not authorized to view this content" });
      }
    }
  });
};


module.exports.useridIsNumber = (req, res, next) => {
  let { userid } = req.params;
  userid = Number(userid);

  if (Number.isNaN(userid)) {
    // check is a value is equal NaN
    res.status(400).json({
      text: "the user id must be a number",
    });
  } else {
    next();
  }
};

module.exports.authoridIsNumber = (req, res, next) => {
  let { authorid } = req.params;
  authorid = Number(authorid);

  if (Number.isNaN(authorid)) {
    // check is a value is equal NaN
    res.status(400).json({
      text: "the author id must be a number",
    });
  } else {
    next();
  }
};

module.exports.clearMessages = (req, res, next) => {
  req.session.messages = null;
  next();
};

// FORMAT OF TOKEN
// Authorization: bearer <access_token>
module.exports.verifyToken = (req, res, next) => {
  // get auth header value
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    // split at the space
    const bearer = bearerHeader.split(" ");
    // get token from array
    const [, bearerToken] = bearer;
    // set the token
    req.token = bearerToken;
    // next middleware
    next();
  } else {
    // forbidden
    res.sendStatus(403);
  }
};
