const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator/check');

const Anime = require('../models/anime');
const Category = require('../models/category');
const Studio = require('../models/studio');

/************************ GETTING THE LIST OF ALL ANIMES ***********************/
exports.getAnimes = async (req,res)=>{
    try{
        const anime = await Anime.find().populate('category').populate('studio');
        res.json(anime);
    }catch(err){
        res.status(500).json({
            error: err
        });
    }
}

/************************ EDITING AN ANIME ***********************/
exports.editAnime = async (req,res)=>{
    const anime = await Anime.findOne({
        slug: req.params.slug
    });
    if(!anime){
        return res.status(422).json({
            message: "this anime doesn't exist"
        });
    }

    //validation errors
    const errors = validationResult(req);
    const error = errors.array();
    if(!errors.isEmpty()){
      return res.status(422).json({
        message: 'error in validation',
        errors : error[0].msg
      });
    }

    //validates the categories array
    const category = req.body.category;
    const categories = [];
    category.forEach(async (element) => {
        const category = await Category.findOne({
            name: element
        });
        if(!category){
            return res.status(422).json({
                message: "please enter a valid category name"
            });
        }else 
            categories.push(category);
    });
    
    //validates the studio
    const studio = await Studio.findOne({
        name: req.body.studio
    }); 
    if(!studio){
        return res.status(422).json({
            message: "this studio does not exist"
        });
    }

    const oldStudio = await Studio.findOne({
        _id: anime.studio
    }); 

    //validating if the new anime doesn't exist in the list
    if(anime.name != req.body.name){
        const existAnime = await Anime.findOne({
            name: req.body.name
        });
        if (existAnime){
            return res.status(422).json({
                message: "this anime already exists"
            });
        }
    }

    const oldCategory = anime.category;
    //updating the existing anime
    anime.episodes = req.body.episodes;
    anime.description = req.body.description;
    anime.name = req.body.name;
    anime.aired = new Date(req.body.aired);
    anime.studio = studio;
    anime.category = categories;

    //saving the new anime 
    await anime.save();
    try{
        //removing the old studio
        await Studio.findByIdAndUpdate(
            oldStudio._id,
            { $pull: { anime: anime._id } },
            { new: true, useFindAndModify: false }
        );

        //adding the anime in the new category
        categories.forEach(async (element)=>{
            if (!oldCategory.includes(element._id)){
                await Category.findByIdAndUpdate(
                    element._id,
                    { $push: { anime: anime._id } },
                    { new: true, useFindAndModify: false }
                );
            }
        });

        //removing old categories
        oldCategory.forEach(async (element)=>{
            let exist = false;
            categories.forEach(async (elt)=>{
                if(JSON.stringify(element) == JSON.stringify(elt._id)){
                    exist = true;
                }
            });
            if (!exist){
                await Category.findByIdAndUpdate(
                    element,
                    { $pull: { anime: anime._id } },
                    { new: true, useFindAndModify: false }
                );
            }
        });

        //adding the anime in the new studio
        if(studio._id != oldStudio._id){
            await Studio.findByIdAndUpdate(
                studio._id,
                { $push: { anime: anime._id } },
                { new: true, useFindAndModify: false }
            );
        }
        res.status(200).json({
            message: "edited with success",
            anime: anime
        });
    }catch(err){
        res.status(500).json({
            error: err
        });
    }
    
}

/************************ ADDING AN ANIME ***********************/
exports.addAnime = async (req,res)=>{
    const errors = validationResult(req);
    const error = errors.array();
    if(!errors.isEmpty()){
      return res.status(422).json({
        message: 'error in validation',
        errors : error[0].msg
      });
    }
    
    const existAnime = await Anime.findOne({
        name: req.body.name
    });
    if (existAnime){
        return res.status(422).json({
            message: "this anime already exists"
        });
    }

    const category = req.body.category;
    const categories = [];
    category.forEach(async (element) => {
        const category = await Category.findOne({
            name: element
        });
        if(!category){
            return res.status(422).json({
                message: "please enter a valid category name"
            });
        }
        categories.push(category);
    });
    

    const studio = await Studio.findOne({
        name: req.body.studio
    }); 
    if(!studio){
        return res.status(422).json({
            message: "this studio does not exist"
        });
    }

    const anime = new Anime({
        name: req.body.name,
        episodes: req.body.episodes,
        category: categories,
        aired: new Date(req.body.aired),
        description: req.body.description,
        studio: studio
    });
      
    await anime.save();
    try{
        categories.forEach(async (element)=>{
            await Category.findByIdAndUpdate(
                element._id,
                { $push: { anime: anime._id } },
                { new: true, useFindAndModify: false }
            );
        });
    
        await Studio.findByIdAndUpdate(
            studio._id,
            { $push: { anime: anime._id } },
            { new: true, useFindAndModify: false }
        );
        
    res.status(201).json({
        message: "added with success",
        anime: anime
    });
    }catch(err){
        res.status(500).json({
            error: err
        });
    }
}

/************************ DELETING AN ANIME ***********************/
exports.deleteAnime = async (req,res)=>{
    const anime = await Anime.findOne({
        slug: req.params.slug
    });
    
    if(!anime){
        return res.status(422).json({
            message: "this anime does not exist"
        });
    }
    
    await Anime.findOneAndDelete({
        slug: req.params.slug
    }); 

    try{
        const category = anime.category;

        category.forEach(async (element)=>{
            await Category.findByIdAndUpdate(
                element._id,
                { $pull: { anime: anime._id } },
                { new: true, useFindAndModify: false }
            );
        });

        const studio = await Studio.findOne({
            _id: anime.studio
        }); 

        await Studio.findByIdAndUpdate(
            studio._id,
            { $pull: { anime: anime._id } },
            { new: true, useFindAndModify: false }
        );

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