const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const animeRoute = require('./routes/anime');
const categoryRoute = require('./routes/category');
const studioRoute = require('./routes/studio');

mongoose.connect(process.env.DB_CONNECT,
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true
},
()=>{
    console.log('connected to db');
});

// app.use(express.json()); 
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/auth',authRoutes);
app.use('/anime',animeRoute);
app.use('/category',categoryRoute);
app.use('/studio',studioRoute);

app.listen(3000,()=>console.log('server running'));