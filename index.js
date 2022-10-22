const express = require("express");
const fs = require("fs");
const multer = require("multer");
// get text from image
const Tesseract = require("tesseract.js");
// get text from pdf
const pdfParse = require("pdf-parse");

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
app.use(express.static("public"));

// setup routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/convert", (req, res) => {
  // if(!req){
  //   res.sendStatus(400);
  //   res.end()
  // }
  uploads(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, async (err, data) => {
      if (err) return console.log(`Error: `, err);
      if (req.file.mimetype === "application/pdf") {
        pdfParse(data).then((result) => {
          res.render("convert", { data: result.text.trimStart() });
          res.end();
        });
      }
      if (
        req.file.mimetype == "image/png" ||
        req.file.mimetype == "image/jpeg"
      ) {
        Tesseract.recognize(data, "eng", { tessjs_create_pdf: "1" })
          .then(({ data: { text } }) => {
            res.render("convert", { data: text });
            res.end();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  });
});

// server listenning
app.listen(PORT, () => {
  console.log(`Server Runnung into port ${PORT}`);
});
