const { Router } = require("express");
const router = Router();
const { verifyToken, useridIsNumber } = require("./middlewares");
const commentController = require("../controllers/comments");

router.get("/user/:userid", useridIsNumber, commentController.getByUser);

router.get("/user/:userid/:postid", useridIsNumber, commentController.getByUserAndPost);

router.get("/:postid", commentController.getByPost);

router.get("/:postid/new", verifyToken, commentController.newGet);
router.post("/:postid/new", verifyToken, commentController.newPost);

router.get("/:postid/:commentid", commentController.getById);
router.put("/:postid/:commentid", verifyToken, commentController.updatebyId);
router.delete("/:postid/:commentid", verifyToken, commentController.deleteById);

module.exports = router;
