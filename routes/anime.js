const express = require("express");
const router = express.Router();
const token = require("./verifyToken");
const admin = require("./verifyAdmin");

const animeController = require("../controllers/anime");

router.post("/add", token, admin, animeController.addAllAnimes);
router.get("/", token, animeController.getAnimes);
router.get("/:start/:limit", token, animeController.getLimitedAnimes);
router.get("/count", animeController.getCount);
router.get("/:slug", token, animeController.getAnime);
router.put("/edit/:slug", token, admin, animeController.editAnime);
router.delete("/delete/:slug", token, admin, animeController.deleteAnime);

module.exports = router;
