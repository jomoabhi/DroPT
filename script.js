// Get all records older than 24 hours
async function fetchData() {
  const connectDB = require('./config/db');
  const File = require('./models/file');
  const fs = require('fs');
  const { deleteFileS3 } = require('./s3');
  connectDB();
  const files = await File.find({
    createdAt: { $lt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
  });
  if (files.length) {
    for (const file of files) {
      try {
        // fs.unlinkSync(file.path);
        await deleteFileS3(file.filename);
        await file.remove();
        console.log(`successfully deleted ${file.filename}`);
      } catch (err) {
        console.log(`error while deleting file ${err} `);
      }
    }
  }
  console.log('Job done!');
}

module.exports = fetchData;
