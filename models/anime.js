const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Schema = mongoose.Schema; 

const animeSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        slug: "name"
    },
    category:[{
        type: Schema.Types.ObjectId,
        ref: "category"
    }],
    studio:{
        type: Schema.Types.ObjectId,
        ref: "Studio"
    },
    description:{
        type: String
    },
    episodes:{
        type: Number,
        required: true
    },
    aired:{
        type: Date,
        required: true
    }
}); 

module.exports = mongoose.model('anime',animeSchema);