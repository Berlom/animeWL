const express = require('express');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Anime = require('../models/anime');
const sgmail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;
sgmail.setApiKey(apiKey);

/************************ LOGGING IN ***********************/
exports.login =  async (req, res)=>{
  const errors = validationResult(req);
  const error = errors.array();
  if(!errors.isEmpty()){
    return res.status(403).json({
      errors: 'error in validation',
      message : error[0].msg
    });
  }

  const user = await User.findOne({email: req.body.email});
  if (!user){
    return res.status(403).json({message: "invalid mail or password"});
  }

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid){
    return res.status(403).json({message: "invalid mail or password"});
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
      errors: 'error in validation',
      message : error[0].msg
    });
  }

  const existUser = await User.findOne({email: req.body.email});
  if (existUser){
    return res.status(422).json({
      message: "this user already exists"
    });
  }

  const hashedPw = await bcrypt.hash(req.body.password, 12)
    const user = new User({
      email: req.body.email,
      password: hashedPw,
      username: req.body.username,
      role: "user"
    });

    await  user.save();
        
    const msg = {
      to: req.body.email, // Change to your recipient
      from: 'berlom69@gmail.com', // Change to your verified sender
      subject: 'Ativating Account',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    await sgmail.send(msg);
    res.status(200).send(user._id);
      
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
  const exist = Object.values(user.watchList).find(test=>{
    return String(anime._id).localeCompare(test) == 0
  });
  if (exist == undefined){
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
  else{
    res.send("already exists");
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
