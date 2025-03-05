const { Router } = require("express");
const { authoridIsNumber, isAuth, roleAuthor, verifyToken } = require("./middlewares");
const postsController = require("../controllers/posts");

const router = Router();

router.get("/", postsController.get);

router.get("/new", verifyToken, postsController.getNew);
router.post("/new", roleAuthor, verifyToken, postsController.postNew);

router.get("/:authorid", authoridIsNumber, postsController.getByAuthor);

router.get("/:authorid/:postid", authoridIsNumber, postsController.getPostById);

router.get("/:authorid/:postid/comments", authoridIsNumber);

router.put(
  "/:authorid/:postid",
  roleAuthor,
  verifyToken,
  postsController.updatePost
);

router.delete(
  "/:authorid/:postid",
  roleAuthor,
  verifyToken,
  postsController.deletePost
);

module.exports = router;
