const express = require('express');

const audio = require('./audio');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/audio', audio);

module.exports = router;
