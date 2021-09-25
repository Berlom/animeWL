var express = require("express");
var router = express.Router();

const authRoute = require("./auth");
const animeRoute = require("./anime");
const categoryRoute = require("./category");
const studioRoute = require("./studio");

router.use("/anime", animeRoute);
router.use("/auth", authRoute);
router.use("/category", categoryRoute);
router.use("/studio", studioRoute);

module.exports = router;
