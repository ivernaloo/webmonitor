'use strict';
module.exports = function(app) {
    let todoList = require('../controllers/todoListController');

    // todoList Routes
    app.route('/tasks')
        .get(todoList.list_all_tasks);
};
