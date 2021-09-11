const { validationResult } = require('express-validator/check');
const Studio = require('../models/studio');
const axios = require('axios');
const { parse } = require('dotenv');
/************************ GETTING THE LIST OF ALL STUDIOS ***********************/
exports.getStudios = async (req,res)=>{
    try{
        const studio = await Studio.find().populate('anime','name');
        res.json(studio);
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}

/************************ GETTING THE LIST OF LIMITED STUDIOS ***********************/
exports.getLimitedStudios = async (req,res)=>{
    try{
        const lim = parseInt(req.params.limit);
        const studio = await Studio.find().populate('anime','name').limit(lim);
        res.json(studio);
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}

/************************ GETTING THE LIST ANIMES PER STUDIO ***********************/
exports.getAnimePerStudio = async (req,res)=>{
    try{
        const slug = req.params.slug;
        const studio = await Studio.find({slug: slug}).populate('anime','name');
        res.json(studio);
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}

/************************ EDITING A STUDIO ***********************/
exports.editStudio = async (req,res)=>{
    const errors = validationResult(req);
    const error = errors.array();
    if(!errors.isEmpty()){
      return res.status(422).json({
        message: 'error in validation',
        errors : error[0].msg
      });
    }

    const studio = await Studio.findOne({slug : req.params.slug}); 
    if(!studio){
        return res.status(422).json({
            message: 'this studio does not exist'
        });
    }

    const existStudio = await Studio.findOne({name : req.body.name}); 
    if(existStudio){
        return res.status(422).json({
            message: 'this studio already exists'
        });
    }

    studio.name = req.body.name;

    studio.save()
    .then(result=>{
        res.status(201).json({
            message: 'successfully edited',
            studio: result
        });
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    });
}

/************************ ADDING A NEW STUDIO ***********************/
exports.addStudio = async (req,res)=>{
    const errors = validationResult(req);
    const error = errors.array();
    if(!errors.isEmpty()){
      return res.status(422).json({
        message: 'error in validation',
        errors : error[0].msg
      });
    }

    const existStudio = await Studio.findOne({name : req.body.name}); 
    if(existStudio){
        return res.status(422).json({
            message: 'this studio already exists'
        });
    }

    const studio = new Studio({
        name: req.body.name
    });

    studio.save()
    .then(result=>{
        res.status(201).json({
            message: 'successfully added',
            studio: result
        });
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    });
}

/************************ DELETING A STUDIO ***********************/
exports.deleteCategory = async (req,res)=>{
    const studio = await Studio.findOne({
        slug: req.params.slug
    });
    if(!studio){
        return res.status(422).json({
            message: "this studio does not exist"
        });
    };
    if(studio.anime.length == 0){
        await Studio.findOneAndDelete({
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
            message: "cannot delete this studio"
        });
    }
}
/************************ ADDING ALL STUDIOS ***********************/
exports.addAllStudios = async (req,res)=>{
    for(i = 4000; i<=4001; i++){
        try{
            const url = "https://api.jikan.moe/v3/producer/"+i;
            const response = await axios.get(url);
            const donnee = response.data;
            const studioName = String(donnee.meta.name);

            const existStudio = await Studio.findOne({name : studioName}); 
            if(existStudio){
                console.log(i +": " +studioName+" already exists");
                continue;
            }

            const studio = new Studio({
                name: studioName
            });

            await studio.save();
            try{
                console.log(i +": " +studioName+" added");
            }catch(err){
                console.log(err);
            }
        }catch(err){
            console.log(i +": error");
        }
    }
}