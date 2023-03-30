"use strict";

const path = require("path");

const { key, adapterFile, storageFile } = require("./storageConfig.json");

const { readStorage, writeStorage } = require("./readerWriter");

const storageFilePath = path.join(__dirname, storageFile);

console.log(storageFilePath);
console.log(__dirname);

const { adapt } = require(path.join(__dirname, adapterFile));

async function getAllFromStorage() {
  return await readStorage(storageFilePath);
}

async function getFromStorage(name) {
  return (
    (await readStorage(storageFilePath)).find((item) => item[key] == name) ||
    null
  );
}

async function getFromStorageByKeyword(keyword) {
  return (
    (await readStorage(storageFilePath)).filter((word) =>
      word.keywords.includes(keyword)
    ) || null
  );
}

async function addToStorage(newObject) {
  const storageData = await readStorage(storageFilePath);
  storageData.push(newObject);
  return await writeStorage(storageFilePath, storageData);
}

// check this function
async function updateStorage(modifiedObject) {
  const storageData = await readStorage(storageFilePath);
  const oldObject = storageData.find(
    (item) => item[key] == modifiedObject[key]
  );
  if (oldObject) {
    Object.assign(oldObject, adapt(modifiedObject));
    return await writeStorage(storageFilePath, storageData);
  }
  return false;
}

async function removeFromStorage(name) {
  const storageData = await readStorage(storageFilePath);
  const i = storageData.findIndex((item) => item[key] == name);
  if (i.length < 0) return false;
  storageData.splice(i, 1);
  return await writeStorage(storageFilePath, storageData);
}

getAllFromStorage().then(console.log).catch(console.log);
// getFromStorage("sanoa").then(console.log).catch(console.log);
// addToStorage({
//   name: "kesä",
//   translation: "hand",
//   img: "#",
//   keywords: ["nouns", "months", "substantiivit", "kuukaudet"],
//   example: [],
//   explanation: [],
//   level: "easy",
//   links: ["maa", "kuu"],
// })
//   .then(console.log)
//   .catch(console.log);

// updateStorage({
//   name: "kesä",
//   translation: "hand",
//   img: "#",
//   keywords: ["nouns", "parts of body", "substantiivit", "kuukaudet"],
//   example: [],
//   explanation: [],
//   level: "easy",
//   links: ["maa", "kuu"],
// })
//   .then(console.log)
//   .catch(console.log);
// removeFromStorage("sanoa").then(console.log).catch(console.log);

module.exports = {
  getAllFromStorage,
  getFromStorage,
  getFromStorageByKeyword,
  addToStorage,
  removeFromStorage,
  updateStorage,
};
