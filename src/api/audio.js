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
  res.json("You've hit the audio endpoint. Have fun!");
});

// use query here because we want to "filter" results
router.get('/file',  (req, res, next) => {
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

// use param here because we want to get the metadata of a specific file
router.get('/file/:file/metadata', async (req, res) => {
  const fileName = req.params.file
  console.log(req.params)
  const filePath = path.join(__dirname, `../../uploads/${fileName}`);
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
})

router.get('/file/:file/download', (req, res) => {
  const fileName = req.params.file
  const filePath = path.join(__dirname, `../../uploads/${fileName}`);
  res.download(filePath, (err) => {
    if(err) {
      // res.statusCode = 400;
      return res.json({
        status: "Whoops, that file does not exist!"
      });
      console.log(err);
    }

  })

})

router.get('/list', (req, res) => {
  // async because I don't want to halt the server when this is ongoing
  fs.readdir(directoryPath, (err, files) => {
    //handling error
    if (err) {
      res.sendStatus(404);
      res.send('Unable to scan directory: ' + err);
    }
    // const data = JSON.stringify(files)
    res.json({all_files: files})

  });
})

router.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file)
  if(req.file === undefined) {
    res.status(500)
    res.send("Nice try, you actually gotta upload a file.");
  } else {
    res.send("File successfully uploaded")
  }
});


module.exports = router
