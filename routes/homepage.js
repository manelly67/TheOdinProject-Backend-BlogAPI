const { Router } = require("express");
const { verifyToken } = require("./middlewares");
const homepageController = require("../controllers/homepage");

const router = Router();

router.get("/", homepageController.get);

router.get(
  "/mywork",
  verifyToken,
  homepageController.getMyWork
);

module.exports = router;
