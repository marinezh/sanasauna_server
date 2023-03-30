"use strict";

function adapt(item) {
  return {
    name: item.name,
    translation: item.translation,
    keywords: item.keywords,
    example: item.example,
    level: item.level,
    links: item.links,
  };
}

module.exports = { adapt };
