const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const studioSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    slug:{
        type: String,
        slug: "name"
    },
    anime:[{
        type: Schema.Types.ObjectId,
        ref:"anime"
    }]
});

module.exports = mongoose.model("Studio",studioSchema);