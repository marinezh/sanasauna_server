"use strict";

const path = require("path");

const express = require("express");
require("dotenv").config();
const cors = require("cors");
//const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors()); // Use this after the variable declaration
const port = process.env.PORT || 3000;
const host = process.env.PORT || "0.0.0.0";
const { storage } = require("./storage/serverConfig.json");
const { CLIENT_RENEG_LIMIT } = require("tls");

const Datastorage = require(path.join(
  __dirname,
  storage.storageFolder,
  storage.dataLayer
));

const dataStorage = new Datastorage();

/* Access to XMLHttpRequest has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. */
/* FIX */
// (also did npm install cors --save)

//const cors = require("cors");

//app.use(cors()); // Use this after the variable declaration

/* FIX END */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "ejsPages")); // connect folder pages with ejs files

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "styles"))); // connect folder public with scc file

console.log(__dirname);

const menuPath = path.join(__dirname, "menu.html"); // connect home page

app.get("/", (req, res) => res.sendFile(menuPath));
// Getting all words list
app.get("/all", (req, res) =>
  dataStorage.getAll().then((data) => res.render("allWords", { result: data }))
);

// Getting one word
app.get("/getWord", (req, res) =>
  res.render("getWord", {
    title: "Get",
    header1: "Get",
    action: "/getWord",
  })
);

app.post("/getWord", (req, res) => {
  if (!req.body) return res.sendStatus(500);

  const wordName = req.body.name; // becuose in getPerson we have name=id
  dataStorage
    .getOne(wordName)
    .then((word) => res.render("wordPage", { result: word }))
    .catch((error) => sendErrorPage(res, error));
});

// Adding new word to the database
app.get("/inputform", (req, res) => {
  res.render("form", {
    title: "Add word",
    header1: "Add a new word",
    action: "/input",
    name: { value: "", readonly: "" },
    translation: { value: "", readonly: "" },
    keywords: { value: "", readonly: "" },
    example: { value: "", readonly: "" },
    level: { value: "", readonly: "" },
    links: { value: "", readonly: "" },
  });
});

app.post("/input", (req, res) => {
  if (!req.body) return res.statusCode(500);

  dataStorage
    .insert(req.body)
    .then((status) => sendStatusPage(res, status))
    .catch((error) => sendErrorPage(res, error));
});

// update the word

app.get("/updateform", (req, res) =>
  res.render("form", {
    title: "Update word",
    header1: "Update Word data",
    action: "/updatedata",
    name: { value: "", readonly: "" },
    translation: { value: "", readonly: "readonly" },
    keywords: { value: "", readonly: "readonly" },
    example: { value: "", readonly: "readonly" },
    level: { value: "", readonly: "readonly" },
    links: { value: "", readonly: "readonly" },
  })
);

app.post("/updatedata", (req, res) => {
  if (!req.body) return res.sendStatus(500);

  dataStorage
    .getOne(req.body.name)
    .then((word) =>
      res.render("form", {
        title: "Update word",
        header1: "Update Word data",
        action: "/update1",
        name: { value: word.name, readonly: "readonly" },
        translation: { value: word.translation, readonly: "" },
        keywords: { value: word.keywords, readonly: "" },
        example: { value: word.example, readonly: "" },
        level: { value: word.level, readonly: "" },
        links: { value: word.links, readonly: "" },
      })
    )
    .catch((error) => sendErrorPage(res, error));
});

app.post("/update1", (req, res) => {
  if (!req.body) return res.statusCode(500);
  dataStorage
    .update(req.body)
    .then((status) => sendStatusPage(res, status))
    .catch((error) => sendErrorPage(res, error));
});

// removing Word
app.get("/removeword", (req, res) =>
  res.render("getWord", {
    title: "Remove",
    header1: "remove word",
    action: "/removeword",
  })
);

app.post("/removeword", (req, res) => {
  if (!req.body) return res.sendStatus(500);

  const wordName = req.body.name;
  dataStorage
    .remove(wordName)
    .then((status) => sendStatusPage(res, status))
    .catch((error) => sendErrorPage(res, error));
});

// API

app.get("/API/allwords", (req, res) => {
  dataStorage.getAll().then((data) => res.status(200).send(data));
});

app.get("/API/word/:word", (req, res) => {
  dataStorage
    .getOne(req.params.word)
    .then((data) => res.status(200).send(data));
});

app.get("/API/keyword/:keyword", (req, res) => {
  dataStorage
    .getByKeyword(req.params.keyword)
    .then((data) => res.status(200).send(data));
});

app.get("/API/allkeywords", (req, res) => {
  dataStorage.getAll().then((data) => {
    const allKeywords = [];
    data.forEach((word) => {
      console.log(word);
      word.keywords.forEach((keyword) => {
        if (!allKeywords.includes(keyword)) allKeywords.push(keyword);
      });
    });
    res.status(200).send(allKeywords);
  });
});

// END OF API

app.listen(port, host, () =>
  console.log(`Server ${host}:${port} listening...`)
);

// helper functions

function sendErrorPage(res, error, title = "Error", header1 = "Error") {
  sendStatusPage(res, error, title, header1);
}

function sendStatusPage(res, status, title = "Status", header1 = "Status") {
  return res.render("statusPage", { title, header1, status });
}
