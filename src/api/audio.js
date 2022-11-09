const express = require('express');
const path = require('path')
const fs = require('fs')
const router = express.Router();
const multer = require('multer')

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    // prevent duplicate names overwriting an existing file
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  },
  destination: function (req, file, cb) {
    // console.log('storage')
    cb(null, './uploads')
  },
})

const upload = multer({ storage })

const directoryPath = path.join(__dirname, '../../uploads');

router.get('/', (req, res) => {
  res.json(['😀', '😳', '🙄']);
});

router.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file)
  if(req.file === undefined) {
    res.status(500)
    res.send("Nice try, you actually gotta upload a file.");
  } else {
    res.send("File successfully uploaded")
  }
});

router.get('/metadata', async (req, res) => {
  if(req.query.name) {
    const name = req.query.name
    const filePath = path.join(__dirname, `../../uploads/${name}`);
    fs.stat(filePath, (err, stats) => {
      if(err) {
        console.log(err)
        res.statusCode = 400;
        return res.json({
          status: "Whoops, that file does not exist!"
        });
      } else {
        console.log(stats)
        res.send({metadata: stats})
      }
    })
  } else {
    res.send("Please provide a param in the request.")
  }
})

router.get('/list', (req, res) => {
  fs.readdir(directoryPath, (err, files) => {
    //handling error
    if (err) {
      res.sendStatus(404);
      res.send('Unable to scan directory: ' + err);
    }
    res.json({all_files: files})

  });
})

router.get('/file', async (req, res, next) => {
  // TODO(ruhaan): I'd like to implement a more robust error file system, where a malicious filename will not allow
  //  unwanted access to files. A database of filepaths will be conducive to this.
  let options = {
    root: path.join(__dirname, '../../uploads'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  if(req.query.name) {
    const fileName = req.query.name
    res.sendFile(fileName, options, (err) => {
      if(err) {
        next(err)
      } else {
        console.log('Sent:', fileName)
      }
    })
  }

  res.send("No filename provided!");
})

module.exports = router
