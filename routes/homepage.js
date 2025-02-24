const { Router } = require("express");
const { isAuth, roleAuthor, verifyToken } = require("./middlewares");
const homepageController = require("../controllers/homepage");

const router = Router();

router.get("/", homepageController.get);

router.get(
  "/mywork",
  isAuth,
  roleAuthor,
  verifyToken,
  homepageController.getMyWork
);

module.exports = router;
