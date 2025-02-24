const db_users = require("../prisma_queries/users");
const passwordRequirements =
  "Password must contain at least one number, one uppercase and lowercase letter, one special character, and at least 8 or more characters";
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passwordValidation = require("./sign_up_password_validation");

// GET /sign_up
async function newUserGet(req, res) {
  switch (req.isAuthenticated()) {
    case false:
      res.json({
        title: "BLOG | New User",
        user: req.user,
        passwordRequirements: passwordRequirements,
      });
      break;
    case true:
      res.status(302).json({
        title: "Logout Required",
        user: req.user,
        text: "You are already Login - Logout here is you want:",
      });
      break;
  }
}

// sign-up POST form validation
const emailErr = "must be a valid email address";
const usernameErr = "Excessive use of characters";
const passwordErr = passwordRequirements;
const confirmErr = "Confirmation password must be equal to password";

const validateUser = [
  body("email").trim().isEmail().withMessage(`Email ${emailErr}`),
  body("username")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage(`Username has ${usernameErr}`),
  body("user_password")
    .custom((value) => {
      return passwordValidation(value);
    })
    .withMessage(passwordErr),
  body("confirm_password")
    .custom((value, { req }) => {
      return value === req.body.user_password;
    })
    .withMessage(confirmErr),
];

const newUserPost = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        title: "BLOG | New User",
        user: req.user,
        passwordRequirements: passwordRequirements,
        errors: errors.array(),
      });
    }

    bcrypt.hash(req.body.user_password, 10, async (err, hashedPassword) => {
      if (err) {
        console.log(err);
      }
      // otherwise, store hashedPassword in DB
      try {
        await db_users.createUser(req, res, hashedPassword);
        // res.json() answer inside prisma .then
      } catch (err) {
        return next(err);
      }
    });
  },
];

module.exports = {
  newUserGet,
  newUserPost,
};
