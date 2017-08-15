/**
 * Created by xiaomi on 2017/8/15.
 * read the data from low db
 */

const low = require('lowdb');
const db = low('db/db.json');
const debug = require('debug');
const log = debug("m-read");

exports.list = function(name){
    return getInfo(name)
};

/*
* return specific information
* @param {name}
* */
function getInfo(name){
    return db.get(name).value()
}