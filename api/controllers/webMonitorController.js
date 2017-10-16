'use strict';

const debug = require("debug"),
      low   = require('lowdb'),
      db    = low('db/db.json'),
      log   = debug("api-todoListController");

log("start...")
exports.list = function (req, res) {
    res.json(db.get("network").value())
};
