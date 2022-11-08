const express = require('express');

const router = express.Router();
const multer = require('multer')

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    // console.log('filename')
    cb(null, file.originalname)
  },
  destination: function (req, file, cb) {
    // console.log('storage')
    cb(null, './uploads')
  },
})

const upload = multer({ storage })


router.get('/', (req, res) => {
  res.json(['😀', '😳', '🙄']);
});

router.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file)
  res.json("upload route hit");
});

module.exports = router;
