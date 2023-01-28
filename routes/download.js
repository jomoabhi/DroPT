const router = require('express').Router();
const File = require('../models/file');
const { uploadFile, getFileStream } = require('../s3');
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');

router.get('/:uuid', async (req, res) => {
  // Extract link and get file from storage send download stream
  const file = await File.findOne({ uuid: req.params.uuid });
  // Link expired
  if (!file) {
    return res.render('download', { error: 'Link has been expired.' });
  }
  const response = await file.save();
  // console.log(file.aws_path);
  const file1 = fs.createWriteStream('file.jpg');
  //   const request = https.get(file.aws_path, function (response) {
  //     response.pipe(file1);

  //     // after download completed close filestream
  //     file.on('finish', () => {
  //       file.close();
  //       console.log('Download Completed');
  //     });
  //   });

  // console.log(file.aws_path);
  res.attachment(file.filename);
  const result = await getFileStream(file.filename);
  result.pipe(res);
  //   console.log(result);
  // const filePath = `${file.aws_path}`;
  // console.log(filePath);
  //   res.download(filePath);
});

module.exports = router;
