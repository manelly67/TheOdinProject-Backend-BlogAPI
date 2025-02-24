const { Router } = require("express");
const router = Router();
const loginController = require("../controllers/login");
const { clearMessages } = require("./middlewares");

router.get("/", loginController.get);

// the following route require password.js
router.post("/", clearMessages ,loginController.post);

module.exports = router;
