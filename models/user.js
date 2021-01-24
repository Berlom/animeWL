const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema; 

const userSchema = new Schema({
    email:{
        type: String,
        required: true
        // unique: true
    },
    password:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
        // unique: true
    },
    watchList:[{
        type: Schema.Types.ObjectId,
        ref: 'anime'
    }],
    role:{
        type: String,
        required: true
    }    
}); 

// userSchema.plugin(uniqueValidator,{ message: 'Error, expected {PATH} to be unique.' });
module.exports = mongoose.model('user',userSchema);