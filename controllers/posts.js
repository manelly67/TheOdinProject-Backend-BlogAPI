const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const myObject = {};
require("dotenv").config({ processEnv: myObject });
const secret_key = process.env.SECRET_KEY || myObject.SECRET_KEY;

const db_posts = require("../prisma_queries/posts");
const db_users = require("../prisma_queries/users");

async function get(req, res) {
  const allPosts = await db_posts.getAllPosts();
  return res.status(200).json({
    allPosts,
  });
}

async function getByAuthor(req, res) {
  let { authorid } = req.params;
  const authorExists = await db_users.authorExists(authorid);
  switch (authorExists) {
    case true: {
      const postsByAuthor = await db_posts.getByAuthor(authorid);
      res.status(200).json({
        postsByAuthor,
      });
      break;
    }
    case false:
      res.status(400).json({
        text: "this author does not exist",
      });
      break;
  }
}

async function getPostById(req, res) {
  const { postid } = req.params;
  const [post] = await db_posts.getPostFromId(postid);
  if (post === undefined || post === null) {
    return res.status(400).json({
      text: "this post does not exist",
    });
  } else {
    return res.status(200).json({
      post,
    });
  }
}

// Following routes require authentication

async function getNew(req, res) {
  jwt.verify(req.token, secret_key, (err, authData) => {
    if (err) {
      res.status(403).json({
        err: err,
      });
    } else {
      return res.status(200).json({
        title: "BLOG | CREATE NEW BLOG",
        user: req.user,
        authData,
      });
    }
  });
}

// validate new blog content
const msgErr = "The text exceeds the number of characters allowed.";
const validateUser = [
  body("title").trim().isLength({ max: 60 }).withMessage(`${msgErr}: 60`),
  body("content")
    .trim()
    .isLength({ max: 15000 })
    .withMessage(`${msgErr}: 2500 words`),
];

const postNew = [
  validateUser,
  async (req, res) => {
    const authData = jwt.verify(req.token, secret_key, (err, authData) => {
      if (err) {
        return res.status(403).json({
          err: err,
        });
      } else {
        return authData;
      }
    });
    if (authData.statusCode !== 403) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          title: "BLOG | CREATE NEW BLOG",
          user: req.user,
          errors: errors.array(),
        });
      }
      const id = uuidv4();
      await db_posts.createNewPost(req, res, id, authData);
    }
  },
];

// same validate variables of new blog
const updatePost = [
  validateUser,
  async (req, res) => {
    const { authorid, postid } = req.params;
    const authData = jwt.verify(req.token, secret_key, (err, authData) => {
      if (err) {
        return res.status(403).json({
          err: err,
        });
      } else {
        return authData;
      }
    });
    if (authData.statusCode !== 403) {
      switch (Number(authData.userId) === Number(authorid)) {
        case true: {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({
              title: "BLOG | UPDATE",
              user: req.user,
              errors: errors.array(),
            });
          }
          await db_posts.updatePost(req, res, postid);
          break;
        }
        case false:
          res.status(400).json({
            text: "Post can only be modified by the author",
          });
          break;
      }
    }
  },
];

async function deletePost(req, res) {
  const { authorid, postid } = req.params;
  const authData = jwt.verify(req.token, secret_key, (err, authData) => {
    if (err) {
      return res.status(403).json({
        err: err,
      });
    } else {
      return authData;
    }
  });
  if (authData.statusCode !== 403) {
    switch (Number(authData.userId) === Number(authorid)) {
      case true:
        await db_posts.deletePost(req, res, postid);
        break;
      case false:
        res.status(400).json({
          text: "Post can only be deleted by the author",
        });
        break;
    }
  }
}

module.exports = {
  get,
  getByAuthor,
  getPostById,
  getNew,
  postNew,
  updatePost,
  deletePost,
};
