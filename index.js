const express = require("express");
const fs = require("fs");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const app = express();
// const worker = createWorker({
//     logger: m => console.log(m)
//   });

// declare port
const PORT = process.env.PORT || 4000;

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, res, cb) => {
    cb(null, res.originalname);
  },
});

const uploads = multer({
  storage,
}).single("convertingFile");

app.set("view engine", "ejs");
app.use(express.static('public'));

// setup routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/convert", (req, res) => {
  uploads(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`,async (err, data) => {
      if (err) return console.log(`Error: `, err);

      Tesseract.recognize(
        data,
        'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        res.send('index',{data:text})
      })
    });
  });
});

// server listenning
app.listen(PORT, () => {
  console.log(`Server Runnung into port ${PORT}`);
});
