const jwt = require("jsonwebtoken");

const myObject = {};
require("dotenv").config({ processEnv: myObject });
const secret_key = process.env.SECRET_KEY || myObject.SECRET_KEY;

const db_posts = require("../prisma_queries/posts");
const db_users = require("../prisma_queries/users");

// GET /
async function get(req, res) {
  const allPosts = await db_posts.getAllPosts();

  return res.status(200).json({
    title: "BLOG | HOMEPAGE",
    message: "Welcome to the API ",
    allPosts,
  });
}

// Following routes require authentication
async function getMyWork(req, res) {
  jwt.verify(req.token, secret_key, (err, authData) => {
    if (err) {
      return res.status(403).json({
        err: err,
      });
    } else {
      return authData;
    }
  });
  if (authData.statusCode !== 403) {
    const user = await db_users.getUserFromId(Number(authData.userId));
    return res.status(200).json({
        title: "BLOG | MY WORKSPACE",
        user: user,
        authData,
      });
  }
}

module.exports = {
  get,
  getMyWork,
};
