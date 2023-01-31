const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const { uploadFile, getFileStream } = require('../s3');
// const unlinkFile = util.promisify(fs.unlink);
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

const fs = require('fs');

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({ storage, limits: { fileSize: 1000000 * 100 } }).single(
  'myfile'
); //100mb

// router.post('/', (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(500).send({ error: err.message });
//     }
//     const file = new File({
//       filename: req.file.filename,
//       uuid: uuidv4(),
//       path: req.file.path,
//       size: req.file.size,
//     });
//     const response = await file.save();
//     res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
//   });
// });

router.post('/', upload, async (req, res) => {
  // console.log(req.file);
  const result = await uploadFile(req.file);
  const uuid = uuidv4();
  // console.log('S3 response', result);
  fileLink = `${process.env.APP_BASE_URL}/files/${uuid}`;

  const file = new File({
    filename: req.file.filename,
    uuid: uuid,
    path: req.file.path,
    size: req.file.size,
    aws_path: fileLink,
  });
  const response = await file.save();

  // You may apply filter, resize image before sending to client

  // Deleting from local if uploaded in S3 bucket
  // await unlinkFile(req.file.path);
  await fs.unlinkSync(file.path);
  fileLink = `${process.env.APP_BASE_URL}/files/${response.uuid}`;
  res.send({
    status: 'success',
    message: 'File uploaded successfully',
    data: req.file,
    uuid: response.uuid,
    downloadLink: fileLink,
  });
  // res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
});

router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res
      .status(422)
      .send({ error: 'All fields are required except expiry.' });
  }
  // Get data from db
  try {
    const file = await File.findOne({ uuid: uuid });
    // if (file.sender) {
    //   return res.status(422).send({ error: 'Email already sent once.' });
    // }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require('../services/mailService');
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'DroPT file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: require('../services/emailTemplate')({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=mail`,
        size: parseInt(file.size / 1000) + ' KB',
        expires: '12 hours',
      }),
    })
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: 'Error in email sending.' });
      });
  } catch (err) {
    return res.status(500).send({ error: 'Something went wrong.' });
  }
});
var request = require('request');
router.post('/sendWhatsapp', async (req, res) => {
  // console.log(req.body);
  try {
    const { senderName, uuid, to } = req.body;
    console.log(senderName);
    const file = await File.findOne({ uuid: uuid });
    console.log(file.aws_path);
    const url1 = `${process.env.APP_BASE_URL}/files/${file.uuid}?source=whatsapp`;
    // const slugify = (string) =>
    //   string
    //     .toLowerCase()
    //     .replace(/\s+/g, '-')
    //     .replace(/[^\w-]+/g, '');

    // const newurl = slugify(url1);
    // console.log(newurl);
    const url = `http://api.ultramsg.com/${process.env.ULTR_INSTANCE}/messages/chat`;

    var options = {
      method: 'POST',
      url: 'https://api.ultramsg.com/instance30607/messages/chat',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {
        token: process.env.ULTR_TOKEN,
        to: to,
        body:
          'Hi There! 😀 \n' +
          '*' +
          senderName +
          '*' +
          '  has shared  something with you. Please click below to download \n\n' +
          url1 +
          ' \n *Link Will Expire in 12 hours* ⏰ ' +
          '\n\nWant To Share A File with *DroPT*. \n Go To👇 \n' +
          process.env.APP_BASE_URL,
        priority: '1',
        referenceId: '',
      },
    };

    // var options_1 = {
    //   method: 'POST',
    //   url: 'https://api.ultramsg.com/instance30607/messages/link',
    //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //   form: {
    //     token: 'yqduyfwpiag45mjw',
    //     to: '+917007375070',
    //     link: url1,
    //     referenceId: '',
    //   },
    // };

    request(options, function (error, response, body) {
      if (error) {
        res.status(500).json({ error: 'Error in sending message' });
        throw new Error(error);
      }

      console.log(body);
      res.json({ success: true });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error in email sending.' });
  }
});

module.exports = router;
