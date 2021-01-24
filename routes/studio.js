const express = require('express');
const router = express.Router();
const token = require('./verifyToken');
const admin = require('./verifyAdmin');
const { body } = require('express-validator/check');
const studioController = require('../controllers/studio');

router.post('/add',token,admin, studioController.addStudio);
router.get('/',token,studioController.getStudios);
router.get('/:slug',token,studioController.getAnimePerStudio);
router.put('/edit/:slug',token,admin,studioController.editStudio);
router.delete('/delete/:slug',token,admin,studioController.deleteCategory);
module.exports = router;