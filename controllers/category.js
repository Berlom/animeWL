const { validationResult } = require('express-validator/check');
const { listIndexes } = require('../models/category');

const Category = require('../models/category');

/************************ GETTING THE LIST OF ALL CATEGORIES ***********************/
exports.getCategories = async (req,res)=>{
    try{
        const category = await Category.find().populate('anime');
        res.json(category);
    }catch(err){
        res.status(500).json({
            error: err
        });
    }
}

/************************ GETTING A CATEGORY BY NAME ***********************/
exports.getCategory = async (req,res)=>{
    try{
        const category = await Category.findOne({
            slug: req.params.slug
        }).populate('anime');
        res.json(category);
    }catch(err){
        res.status(500).json({
            error: err
        });
    }
}

/************************ UPDATING A CATEGORY ***********************/
exports.editCategory = async (req,res)=>{
    const errors = validationResult(req);
    const error = errors.array();
    if(!errors.isEmpty()){
      return res.status(422).json({
        message: 'error in validation',
        errors : error[0].msg
      });
    }

    const category = await Category.findOne({slug : req.params.slug}); 
    if(!category){
        return res.status(422).json({
            message: 'please enter a valid category name'
        });
    }

    const existCategory = await Category.findOne({name: req.body.name});
    if(existCategory){
        return res.status(422).json({
            message: 'this category already exists'
        });
    }

    category.name = req.body.name

    category.save()
    .then(result=>{
        res.status(201).json({
            message: 'successfully added',
            category: result
        });
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    });
}

/************************ ADDING CATEGORY ***********************/
exports.addCategory = async (req,res)=>{
    const errors = validationResult(req);
    const error = errors.array();
    if(!errors.isEmpty()){
      return res.status(422).json({
        message: 'error in validation',
        errors : error[0].msg
      });
    }

    const existCategory = await Category.findOne({name : req.body.name}); 
    if(existCategory){
        return res.status(422).json({
            message: 'this category already exists'
        });
    }

    const category = new Category({
        name: req.body.name
    });

    category.save()
    .then(result=>{
        res.status(201).json({
            message: 'successfully added',
            category: result
        });
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    });
}

/************************ DELETING A CATEGORY ***********************/
exports.deleteCategory = async (req,res)=>{
    const category = await Category.findOne({
        slug: req.params.slug
    });
    if(!category){
        return res.status(422).json({
            message: "this category does not exist"
        });
    };
    if(category.anime.length == 0){
        await Category.findOneAndDelete({
            slug: req.params.slug
        });
        try{
            res.status(200).json({
                message: "deleted with success"
            });
        }catch(err){
            res.status(500).json({
                message: "internal error",
                error: err
            });
        }
    }
    else{
        res.status(400).json({
            message: "cannot delete this category"
        });
    }
}