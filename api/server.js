let express = require('express'),
    app = express(),
    debug = require("debug"),
    port = process.env.PORT || 80,
    bodyParser = require('body-parser'),
    log = debug("api-entry");

log("...log")
// @todo remove the mongoose connect config
// should add lowDB connect config

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let routes = require('./routes/todoListRoutes'); //importing route
routes(app); //register the route

app.use(function(req, res){
    res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);
