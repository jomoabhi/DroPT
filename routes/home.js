const router = require('express').Router();
// const File = require('../models/file');
router.get('/', async (req, res) => {
  try {
    return res.render('home');
  } catch (err) {
    return res.status(400).send('error');
  }
});

module.exports = router;
