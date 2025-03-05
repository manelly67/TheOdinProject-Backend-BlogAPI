const { Router } = require("express");
const { authoridIsNumber, roleAuthor, verifyToken } = require("./middlewares");
const postsController = require("../controllers/posts");

const router = Router();

router.get("/", postsController.get);

router.get("/new", verifyToken, roleAuthor, postsController.getNew);
router.post("/new", verifyToken, roleAuthor, postsController.postNew);

router.get("/:authorid", authoridIsNumber, postsController.getByAuthor);

router.get("/:authorid/:postid", authoridIsNumber, postsController.getPostById);

router.get("/:authorid/:postid/comments", authoridIsNumber);

router.put(
  "/:authorid/:postid",
  verifyToken,
  roleAuthor,
  postsController.updatePost
);

router.delete(
  "/:authorid/:postid",
  verifyToken,
  roleAuthor,
  postsController.deletePost
);

module.exports = router;
