const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const myObject = {};
require("dotenv").config({ processEnv: myObject });
const secret_key = process.env.SECRET_KEY || myObject.SECRET_KEY;

const db_users = require("../prisma_queries/users");
const db_posts = require("../prisma_queries/posts");
const db_comments = require("../prisma_queries/comments");

async function getByUser(req, res) {
  const { userid } = req.params;
  const userExists = await db_users.userExists(userid);
  switch (userExists) {
    case false:
      res.status(400).json({
        text: "this user does not exist",
      });
      break;
    case true:
      {
        const comments = await db_comments.getByUser(userid);
        res.status(200).json({
          commentsByUser: comments,
          userid: userid,
        });
      }
      break;
  }
}

async function getByUserAndPost(req, res) {
  const { userid, postid } = req.params;
  const userExists = await db_users.userExists(userid);
  const postExists = await db_posts.postExists(postid);
  switch (userExists) {
    case false:
      res.status(400).json({
        text: "this user does not exist",
      });
      break;
    case true:
      switch (postExists) {
        case false:
          res.status(400).json({
            text: "this post does not exist",
          });
          break;
        case true:
          {
            const comments = await db_comments.getByUserAndPost(userid, postid);
            res.status(200).json({
              commentsByUserAndPost: comments,
              userid: userid,
              postid: postid,
            });
          }
          break;
      }
  }
}

async function getByPost(req, res) {
  const { postid } = req.params;
  const postExists = await db_posts.postExists(postid);
  switch (postExists) {
    case false:
      res.status(400).json({
        text: "this post does not exist",
      });
      break;
    case true:
      {
        const comments = await db_comments.getByPost(postid);
        res.status(200).json({
          commentsByPost: comments,
          postid: postid,
        });
      }
      break;
  }
}

// Following routes require authentication
async function newGet(req, res) {
  const { postid } = req.params;
  const postExists = await db_posts.postExists(postid);
  switch (postExists) {
    case false:
      res.status(400).json({
        text: "this post does not exist",
      });
      break;
    case true:
      jwt.verify(req.token, secret_key, (err, authData) => {
        if (err) {
          res.status(403).json({
            err: err,
          });
        } else {
          return res.status(200).json({
            title: "BLOG | New Comment",
            user: req.user,
            post: postid,
            authData,
          });
        }
      });
      break;
  }
}

// validate content length
const msgErr = "The text exceeds the number of characters allowed.";
const validateContent = [
  body("text").trim().isLength({ max: 300 }).withMessage(`${msgErr}: 300`),
];

const newPost = [
  validateContent,
  async (req, res) => {
    const { postid } = req.params;
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
          title: "BLOG | New Comment",
          user: req.user,
          post: postid,
          authData,
          errors: errors.array(),
        });
      }
      const id = uuidv4();
      await db_comments.createComment(req, res, id, postid, authData);
    }
  },
];

async function getById(req, res) {
  const { commentid } = req.params;
  const commentExists = await db_comments.commentExists(commentid);
  switch (commentExists) {
    case false:
      res.status(400).json({
        text: "this comment id does not exist",
      });
      break;
    case true:
      {
        const comment = await db_comments.getById(commentid);
        res.status(200).json({
          comment_details: comment,
        });
      }
      break;
  }
}

// same validate as new comment
const updatebyId = [
  validateContent,
  async (req, res) => {
    const { commentid } = req.params;
    const commentExists = await db_comments.commentExists(commentid);
    switch (commentExists) {
      case false:
        res.status(400).json({
          text: "this comment id does not exist",
        });
        break;
      case true:
        {
          const authData = jwt.verify(
            req.token,
            secret_key,
            (err, authData) => {
              if (err) {
                return res.status(403).json({
                  err: err,
                });
              } else {
                return authData;
              }
            }
          );
          if (authData.statusCode !== 403) {
            const comment = await db_comments.getById(commentid);
            switch (Number(authData.userId) === Number(comment.userId)) {
              case true:
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({
                    title: "BLOG | UPDATE",
                    user: req.user,
                    errors: errors.array(),
                  });
                }
                await db_comments.updateComment(req, res, commentid);
                break;
              case false:
                res.status(400).json({
                  text: "Comment can only be modified by its author",
                });
                break;
            }
          }
        }
        break;
    }
  },
];

async function deleteById(req, res) {
  const { commentid } = req.params;
  const { postid } = req.params;
  const commentExists = await db_comments.commentExists(commentid);
  switch (commentExists) {
    case false:
      res.status(400).json({
        text: "this comment id does not exist",
      });
      break;
    case true:
      {
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
          const comment = await db_comments.getById(commentid);
          switch (Number(authData.userId) === Number(comment.userId)) {
            case true:
              await db_comments.deleteById(req,res,commentid);
              break;
            case false:
              {
              const [post] = await db_posts.getPostFromId(postid);
              switch(Number(authData.userId) === Number(post.authorId)){
                case true:
                  await db_comments.deleteById(req,res,commentid);
                break;
                case false:
                  res.status(400).json({
                    text: "Comment can only be deleted by its author or by the post owner",
                  });
                break;
              }
            }
            break;
          }
        }
      }
      break;
  }
}


module.exports = {
  getByUser,
  getByUserAndPost,
  getByPost,
  newGet,
  newPost,
  getById,
  updatebyId,
  deleteById,
};
