const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const token = require('./verifyToken');
const admin = require('./verifyAdmin');
const categoryController = require('../controllers/category');

router.post('/add',token,admin,
[
    body('name').trim().isAlpha().withMessage('the name must be alphabetic')
],
categoryController.addCategory);
router.get('/',token,categoryController.getCategories);
router.get('/:slug',token,categoryController.getCategory);
router.delete('/delete/:slug',token,admin,categoryController.deleteCategory);

module.exports = router;