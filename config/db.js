const mongoose = require('mongoose');
require('dotenv').config();
function connectDB() {
  mongoose.set('strictQuery', false);
  mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  });

  //   const connection = mongoose.connection;

  mongoose.connection
    .once('open', function () {
      console.log('MongoDB running');
    })
    .on('error', function (err) {
      console.log(err);
    });
}

module.exports = connectDB;
