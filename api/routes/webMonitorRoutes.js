'use strict';
module.exports = function(app) {
    let webMonitor = require('../controllers/webMonitorController');

    // webMonitor Routes
    app.route('/list')
        .get(webMonitor.list);
};
