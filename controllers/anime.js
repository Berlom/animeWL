const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator/check");
const fs = require("fs");

const Anime = require("../models/anime");
const Category = require("../models/category");
const Studio = require("../models/studio");
const axios = require("axios");

/************************ GETTING THE LIST OF ALL ANIMES ***********************/
exports.getAnimes = async (req, res) => {
  try {
    const anime = await Anime.find()
      .populate("category", "name")
      .populate("studio", "name");
    res.json(anime);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

/************************ GETTING THE LIST OF LIMITED ANIMES ***********************/
exports.getLimitedAnimes = async (req, res) => {
  try {
    const lim = parseInt(req.params.limit);
    const start = parseInt(req.params.start);
    const anime = await Anime.find()
      .populate("category", "name")
      .populate("studio", "name")
      .skip(start)
      .limit(lim);
    res.json(anime);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

/************************ GETTING THE ANIME COUNT ***********************/
exports.getCount = async (req, res) => {
  try {
    const count = Anime.count({}, (err, count) => {
      res.json(count);
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

/************************ GETTING A SPECIFIC ANIME ***********************/
exports.getAnime = async (req, res) => {
  try {
    const anime = await Anime.findOne({
      slug: req.params.slug,
    })
      .populate("category", "name")
      .populate("studio", "name");
    res.json(anime);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

/************************ EDITING AN ANIME ***********************/
exports.editAnime = async (req, res) => {
  const anime = await Anime.findOne({
    slug: req.params.slug,
  });
  if (!anime) {
    return res.status(422).json({
      message: "this anime doesn't exist",
    });
  }

  //validation errors
  const errors = validationResult(req);
  const error = errors.array();
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "error in validation",
      errors: error[0].msg,
    });
  }

  //validates the categories array
  const category = req.body.category ?? [];
  const categories = [];
  for (const element of category) {
    const category = await Category.findOne({
      name: element,
    });
    if (!category) {
      return res.status(422).json({
        message: "please enter a valid category name",
      });
    } else categories.push(category);
  }

  const studio = req.body.studio;
  const studios = [];
  for (const element of studio) {
    const studio = await Studio.findOne({
      name: element,
    });
    if (!studio) {
      return res.status(422).json({
        message: "please enter a valid studio name",
      });
    } else studios.push(studio);
  }

  //validating if the new anime doesn't exist in the list
  if (anime.name != req.body.name) {
    const existAnime = await Anime.findOne({
      name: req.body.name,
    });
    if (existAnime) {
      return res.status(422).json({
        message: "this anime already exists",
      });
    }
  }

  if (req.file) {
    fs.unlinkSync(anime.image);
    anime.image = req.file.path;
  }

  const oldCategory = anime.category;
  const oldStudio = anime.studio;
  //updating the existing anime
  anime.episodes = req.body.episodes;
  anime.description = req.body.description;
  anime.name = req.body.name;
  anime.aired = new Date(req.body.aired);
  anime.studio = studios;
  anime.category = categories;

  //saving the new anime
  await anime.save();
  try {
    //removing the old studio
    for (const element of oldStudio) {
      let exist = false;
      studios.forEach(async (elt) => {
        if (JSON.stringify(element) == JSON.stringify(elt._id)) {
          exist = true;
        }
      });
      if (!exist) {
        await Studio.findByIdAndUpdate(
          element,
          { $pull: { anime: anime._id } },
          { new: true, useFindAndModify: false }
        );
      }
    }

    //adding the anime in the new studio
    for (const element of studios) {
      if (!oldStudio.includes(element._id)) {
        await Studio.findByIdAndUpdate(
          element._id,
          { $push: { anime: anime._id } },
          { new: true, useFindAndModify: false }
        );
      }
    }

    //adding the anime in the new category
    for (const element of categories) {
      if (!oldCategory.includes(element._id)) {
        await Category.findByIdAndUpdate(
          element._id,
          { $push: { anime: anime._id } },
          { new: true, useFindAndModify: false }
        );
      }
    }

    //removing old categories
    for (const element of oldCategory) {
      let exist = false;
      categories.forEach(async (elt) => {
        if (JSON.stringify(element) == JSON.stringify(elt._id)) {
          exist = true;
        }
      });
      if (!exist) {
        await Category.findByIdAndUpdate(
          element,
          { $pull: { anime: anime._id } },
          { new: true, useFindAndModify: false }
        );
      }
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

/************************ ADDING AN ANIME ***********************/
exports.addAnime = async (req, res) => {
  const errors = validationResult(req);
  const error = errors.array();
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "error in validation",
      errors: error[0].msg,
    });
  }

  const existAnime = await Anime.findOne({
    name: req.body.name,
  });
  if (existAnime) {
    return res.status(422).json({
      message: "this anime already exists",
    });
  }

  const category = req.body.category;
  let categories = [];
  for (const element of category) {
    const category = await Category.findOne({
      name: element,
    });
    if (!category) {
      return res.status(422).json({
        message: "please enter a valid category name",
      });
    }
    categories.push(category);
  }

  const studio = req.body.studio;
  let studios = [];
  for (const element of studio) {
    const studio = await Studio.findOne({
      name: element,
    });
    if (!studio) {
      return res.status(422).json({
        message: "please enter a valid studio name",
      });
    }
    studios.push(studio);
  }

  if (!req.file) {
    res.status(422).json({
      message: "no image given",
    });
  }

  const anime = new Anime({
    name: req.body.name,
    episodes: req.body.episodes,
    category: categories,
    aired: new Date(req.body.aired),
    description: req.body.description,
    studio: studios,
    image: req.file.path,
  });

  console.log(anime);

  // await anime.save();
  // try{
  //     for(const element of categories){
  //         await Category.findByIdAndUpdate(
  //             element._id,
  //             { $push: { anime: anime._id } },
  //             { new: true, useFindAndModify: false }
  //         );
  //     }

  //     for(const element of studios){
  //         await Studio.findByIdAndUpdate(
  //             element._id,
  //             { $push: { anime: anime._id } },
  //             { new: true, useFindAndModify: false }
  //         );
  //     }

  // res.status(201).json({
  //     message: "added with success",
  //     anime: anime
  // });
  // }catch(err){
  //     res.status(500).json({
  //         error: err
  //     });
  // }
};

/************************ DELETING AN ANIME ***********************/
exports.deleteAnime = async (req, res) => {
  const anime = await Anime.findOne({
    slug: req.params.slug,
  });

  if (!anime) {
    return res.status(422).json({
      message: "this anime does not exist",
    });
  }

  // fs.unlinkSync(anime.image);

  const id = anime._id;

  await Anime.findOneAndDelete({
    slug: req.params.slug,
  });

  try {
    const category = anime.category;

    for (const element of category) {
      await Category.findByIdAndUpdate(
        element._id,
        { $pull: { anime: id } },
        { new: true, useFindAndModify: false }
      );
    }

    const studio = anime.studio;

    for (const element of studio) {
      await Studio.findByIdAndUpdate(
        element._id,
        { $pull: { anime: id } },
        { new: true, useFindAndModify: false }
      );
    }

    res.status(200).json({
      message: "deleted with success",
    });
  } catch (err) {
    res.status(500).json({
      message: "internal error",
      error: err,
    });
  }
};

/************************ ADDING ALL ANIMES ***********************/
exports.addAllAnimes = async (req, res) => {
  //a total of 46,059 anime
  for (i = 46940; i <= 49000; i++) {
    try {
      const url = "https://api.jikan.moe/v3/anime/" + i;
      const response = await axios.get(url);
      const donnee = response.data;
      const existAnime = await Anime.findOne({ name: donnee.title });
      if (existAnime) {
        console.log(i + ":" + existAnime.name + " already exists.");
        continue;
      }

      const categories = [];
      const exist = true;
      for (const element of donnee.genres) {
        const category = await Category.findOne({
          name: element.name,
        });
        if (!category) {
          exist = false;
          console.log("this category doesn't exist");
        }
        categories.push(category);
      }

      const studios = [];
      for (const element of donnee.studios) {
        const studio = await Studio.findOne({
          name: element.name,
        });
        if (!studio) {
          exist = false;
          console.log("this studio doesn't exist");
        }
        studios.push(studio);
      }

      if (!exist) {
        continue;
      }

      const date =
        String(donnee.aired.prop.from.day) +
        "/" +
        String(donnee.aired.prop.from.month) +
        "/" +
        String(donnee.aired.prop.from.year);
      const aired = new Date(date);

      const anime = new Anime({
        name: donnee.title,
        category: categories,
        studio: studios,
        description: donnee.synopsis,
        episodes: donnee.episodes,
        aired: aired,
        image: donnee.image_url,
        trailer: donnee.trailer_url,
        type: donnee.type,
      });

      await anime.save();
      try {
        for (const element of categories) {
          await Category.findByIdAndUpdate(
            element._id,
            { $push: { anime: anime._id } },
            { new: true, useFindAndModify: false }
          );
        }

        for (const element of studios) {
          await Studio.findByIdAndUpdate(
            element._id,
            { $push: { anime: anime._id } },
            { new: true, useFindAndModify: false }
          );
        }

        console.log(i + ": " + anime.name + " added.");
      } catch (err) {
        console.log("error.");
      }
    } catch (error) {
      console.log(i + ":error.");
    }
  }
  res.status(200).send("success");
};
