const express = require("express");
const { body } = require("express-validator/check");
const authController = require("../controllers/auth");
const token = require("./verifyToken");
const cors = require("cors");

const router = express.Router();

router.post(
  "/register",
  cors(),
  [
    body("email").trim().isEmail().withMessage("please enter a valid mail"),
    body("password")
      .trim()
      .isAlphanumeric()
      .withMessage("the password must be alphanumeric")
      .isLength({ min: 6 })
      .withMessage("the password must contain at least 6 characters"),
    body("username")
      .trim()
      .isAlphanumeric()
      .withMessage("the username must be alphanumeric")
      .isLength({ min: 6 })
      .withMessage("the username must contain at least 6 characters"),
  ],
  authController.register
);

router.post(
  "/login",
  cors(),
  [
    body("email").trim().isEmail().withMessage("please enter a valid mail"),
    body("password")
      .trim()
      .isAlphanumeric()
      .withMessage("the password must be alphanumeric")
      .isLength({ min: 6 })
      .withMessage("the password must contain at least 6 characters"),
  ],
  authController.login
);

router.post("/watchlist/add", token, authController.addToList);
router.put("/watchlist/remove/:slug", token, authController.removeFromList);
router.get("/watchlist", token, authController.getWatchList);

module.exports = router;
