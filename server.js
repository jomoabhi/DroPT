require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');

const cron = require('node-cron');
const fetchData = require('./script');
// Cors
// const favicon = require('serve-favicon');

const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(','),
  // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
};

// Default configuration looks like
// {
//     "origin": "*",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//     "preflightContinue": false,
//     "optionsSuccessStatus": 204
//   }

app.use(cors(corsOptions));
app.use(express.static('public'));
// app.use(favicon(__dirname + '/public/favicon.ico'));
const connectDB = require('./config/db');
connectDB();

app.use(express.json());

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use('/', require('./routes/home'));
// Routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

cron.schedule('*/59 * * * * *', async function () {
  console.log('---------------------');
  await fetchData();
  console.log('running a task every 59 seconds');
});
app.listen(PORT, console.log(`Listening on port ${PORT}.`));
