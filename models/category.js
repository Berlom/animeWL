const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Schema = mongoose.Schema; 

const categorySchema = new Schema({
    name:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        slug: "name"
    },
    anime:[{
        type: Schema.Types.ObjectId,
        ref: "anime"
    }]
}); 

module.exports = mongoose.model('category',categorySchema);