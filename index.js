/**
 * Created by xiaomi on 2017/7/26.
 */
// const path = require("path");
const child_process = require('child_process');
const read = require("./src/read");
const debug = require('debug');
const log = debug("m-index");

log("INDEX");
child_process.fork("./src/monitor.js"); // async process for monitor the data

// @todo read


// @todo web page visualization
