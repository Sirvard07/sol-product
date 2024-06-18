const express = require("express");
const app = express();
const cors = require("cors");
const pdf_generator = require("./pdf-generator");
const email_sender = require("./send-email");
const fs = require("fs");
require("dotenv").config();
const AWS = require("aws-sdk");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.use(cors());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  //res.setHeader("Access-Control-Allow-Origin", "https://solkart.no", "http://www.solkart.no/", "http://solkart.no/", "https://new.solkart.no/");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use(express.static("public"));

app.post("/addProject", (req, res) => {
  axios
    .post(
      "https://sunflow-api-internal-prod.azurewebsites.net/Projects",
      req.body
    )
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
    console.log("req",req);
});

const createFile = async (data, res, status) => {
  const sfNumber = data.SFNumber;
  const today = new Date();
  let time = today.getTime();
  
  const parentFolderPath = `${sfNumber}/files`;
  
  if (!fs.existsSync(parentFolderPath)) {
    fs.mkdirSync(parentFolderPath, { recursive: true });
  }

  pdf_generator
    .createPDF(data, time)
    .then(async (response) => {
      const filePath = `${sfNumber}/files/${response}.pdf`;
      const dstKey = filePath;
      const pdfFileBuffer = fs.readFileSync(dstKey);
      const TERMS_BUCKET = process.env.TERMS_BUCKET;
      const uploadArgs = {
        Bucket: TERMS_BUCKET,
        Key: dstKey,
        Body: pdfFileBuffer,
        ACL: "public-read",
      };
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      });
      const uploadResult = await s3.upload(uploadArgs).promise();

  console.log("uploadResult", uploadResult);
  console.log("status", status);


      if (uploadResult && uploadResult.Location && status === "addOrder") {
        res.status(200).send(uploadResult.Location);
        await email_sender.sendEmail(data, filePath);
      } else if (
        uploadResult &&
        uploadResult.Location &&
        status === "createPDF"
      ) {
        res.status(200).send(uploadResult.Location);
        let dir = `${sfNumber}`;
        fs.rmSync(dir, { recursive: true, force: true });
      } else {
        res.status(500).send("PDF upload failed!");
      }
    })
    .catch((error) => {
      console.log("error", error);
      res.status(500).send("PDF generation failed");
    });
};

app.post("/addOrder", async (req, res) => {
  await createFile(req.body, res, "addOrder");
});

app.post("/createPDF", async (req, res) => {
  await createFile(req.body, res, "createPDF");
});

app.listen(5000, () => {
  console.log("Started...");
});
