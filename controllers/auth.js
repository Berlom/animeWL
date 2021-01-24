const express = require('express');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Anime = require('../models/anime');
const user = require('../models/user');

/************************ LOGGING IN ***********************/
exports.login =  async (req, res)=>{
  const errors = validationResult(req);
  const error = errors.array();
  if(!errors.isEmpty()){
    return res.status(422).json({
      message: 'error in validation',
      errors : error[0].msg
    });
  }

  const user = await User.findOne({email: req.body.email});
  if (!user){
    return res.status(422).json({message: "invalid mail or password"});
  }

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid){
    return res.status(422).json({message: "invalid mail or password"});
  }

  const token = jwt.sign({_id: user._id, role: user.role}, process.env.SECRET_TOKEN,{
    expiresIn: "365d"
  });
  res.header('Authorization', token).send(token);
}

/************************ REGISTRING A NEW USER ***********************/  
exports.register = async (req, res)=>{ 
  const errors = validationResult(req);
  const error = errors.array();
  if(!errors.isEmpty()){
    return res.status(422).json({
      message: 'error in validation',
      errors : error[0].msg
    });
  }

  const existUser = await User.findOne({email: req.body.email});
  if (existUser){
    return res.status(422).json({
      message: "this user already exists"
    });
  }

  bcrypt.hash(req.body.password, 12).then(hashedPw=>{
    const user = new User({
      email: req.body.email,
      password: hashedPw,
      username: req.body.username,
      role: "user"
    });

    return user.save();
      }).then(result=>{
      res.status(200).json({user: result._id});
    }).catch(err=>{
      res.status(500).json({
        error : err
      });
    });
}

/************************ ADDING TO WATCHLIST ***********************/
exports.addToList = async (req,res)=>{
  //getting the user by the token
  const id = req.user._id;
  const user = await User.findOne({
    _id: id
  });

  const anime = await Anime.findOne({
    name : req.body.anime
  });

  if(!anime){
    res.status(400).json({
      message: "please enter a valid anime name"
    });
  }

  user.watchList.push(anime._id);
  await user.save();
  try{    
    res.status(200).json({
      message: "added successfully"
    });
  }catch(err){
    res.status(500).json({
      message: "internal error"
    });
  }
}

/************************ REMOVING FROM WATCHLIST ***********************/
exports.removeFromList = async (req,res)=>{
  const id = req.user._id;
  const user = await User.findOne({
    _id: id
  });

  const anime =await Anime.findOne({
    slug: req.params.slug
  });

  i=0;
  exist = false;
  user.watchList.forEach(element => {
    if(String(element) == String(anime._id)){
      exist = true;
      user.watchList.splice(i,1);
    } 
    i++; 
  });

  if(exist){
    await user.save();
    try{
      res.status(200).json({
        message: "deleted successfully"
      });
    }catch(err){
      res.status(500).json({
        message: "internal error"
      });
    }
  }else{
    res.status(400).json({
      message: "this anime doesn't exist in your watchlist"
    });
  }
}

/************************ GETTING WATCHLIST ***********************/
exports.getWatchList = async (req,res)=>{
  const id = req.user._id;
  const user = await User.findOne({
    _id: id
  }).populate('watchList');
  res.send(user.watchList);
}