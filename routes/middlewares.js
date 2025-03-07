
module.exports.useridIsNumber = (req, res, next) => {
  let { userid } = req.params;
  userid = Number(userid);

  if (isNaN(userid)) {
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

  if (isNaN(authorid)) {
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
