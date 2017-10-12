'use strict';

const debug = require("debug"),
      low = require('lowdb'),
      db = low('db/db.json'),
    log = debug("api-controller");


log("start...")


exports.list_all_tasks = function (req, res) {
    log("list : ",db.get("network").value())
};


exports.read_a_task = function (req, res) {
    Task.findById(req.params.taskId, function (err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};
