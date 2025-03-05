const { Router } = require("express");
const { roleAuthor, verifyToken } = require("./middlewares");
const homepageController = require("../controllers/homepage");

const router = Router();

router.get("/", homepageController.get);

router.get(
  "/mywork",
  verifyToken,
  roleAuthor,
  homepageController.getMyWork
);

module.exports = router;
