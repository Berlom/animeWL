const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

const app = express();
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const animeRoute = require('./routes/anime');
const categoryRoute = require('./routes/category');
const studioRoute = require('./routes/studio');

const multer = require('multer');
const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null, file.originalname)
    }
});
const upload = multer({storage: fileStorage});


mongoose.connect(process.env.DB_CONNECT,
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true
},
()=>{
    console.log('connected to db');
});
app.use(cors());
// app.use(express.json()); 
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload.single('image'));

app.use('/auth',authRoutes);
app.use('/anime',animeRoute);
app.use('/category',categoryRoute);
app.use('/studio',studioRoute);

app.listen(6969,()=>console.log('server running on port 6969'));