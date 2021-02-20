const express = require('express');
const router = express.Router();
const token = require('./verifyToken');
const admin = require('./verifyAdmin');

const animeController = require('../controllers/anime');

router.post('/add',token,admin, animeController.addAnime);
router.get('/',token,animeController.getAnimes);
router.get('/:slug',token,animeController.getAnime);
router.put('/edit/:slug',token,admin,animeController.editAnime);
router.delete('/delete/:slug',token,admin,animeController.deleteAnime);

module.exports = router;