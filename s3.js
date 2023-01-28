require('dotenv').config();
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// UPLOAD FILE TO S3
function uploadFile(file) {
  // console.log(file.path);
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

// DOWNLOAD FILE FROM S3
function getFileStream(fileKey) {
  // console.log(fileKey);
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
  //    res.attachment(fileKey);
  // var fileStream = s3.getObject(options).createReadStream();
  // fileStream.pipe(res);
}
function deleteFileS3(fileKey) {
  var params = { Bucket: bucketName, Key: fileKey };

  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack); // error
    else console.log('deleted success'); // deleted
  });
  return;
}
// deleteFileS3('abhi');
// console.log('abhinav');
module.exports = { uploadFile, getFileStream, deleteFileS3 };
