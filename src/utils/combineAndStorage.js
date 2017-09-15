/*
* combine And storage
* 合并，存储日志的细节
*
* */

/**
 * Created by xiaomi on 2017/8/30.
 */
const low = require('lowdb');
const db = low('db/db.json');
const uuid = require('uuid');
const debug = require('debug');
const log = debug("m-utils-combineAndStorage");
const DAY = 24 * 60 * 1000;
const moment = require('moment');
// const id = require("shortid");

/*
* @param collectionName {String}
* @param params {Object} collect information from chromeheadless
* */
exports.load = function (collectionName, params) {
    mergeLogs(collectionName, params);
    convertTimelineData(collectionName, params);
};

/*
* merge same error log together
* */
function mergeLogs(collectionName, params) {
    var v = db.get(collectionName).value(), // storage collection list
        r = [], // array list for store filtered data
        log = debug("m-mergelogs");

    if (v.length > 0) {
        /*
        * reduce实际就是前一个和后一个进行的操作
        * m : current item
        * o : next item
        * [] : initial array
        * */
        r = v.reduce(function (m, o) {
            // compare check the same err log
            return compare(collectionName, o, params) ?
                // combine the same timestamp
                [...m.slice(0, -1), combine(collectionName, o, params)] :
                [...m, o, params];
        }, []);
    } else {
        r.push(params)
    }

    db.set(collectionName, r).write();
}

/*
    * such as :
    * network : [[date:number] .... ]
    * scripts : [[date:number] .... ]
    * message : [[date:number] .... ]
    * total : [[date:number] .... ]
    * */
function convertTimelineData(collectionName, params) {
    var collection,
        log = debug("m-convertTimelineData"),
        _exist = false,
        date = moment(params.timestamp).format('l'); // date in the logs

    // read the data
    // load "count-" _ collectionName
    collection = db.get("count-" + collectionName).value();

    /*
    collection.map(function (x) {
        log("x : ", x[0], date);
        // have the same item
        if (x[0] == date) {
            ++x[1];
            x = [x[0], x[1]];
        // have not them same item
        }
        return x;
    });
    */
    collection.forEach(function(k,i){
        if (k[0] == date) {
            ++k[1];
            _exist = true;
        }
    });

    /*
    * have not them same item
    * update when there are no record
    * */
    if (!_exist) {
        collection.push([date,1]);
    }



    // if no date store in the array




    // save
    db.set("count-" + collectionName, collection).write();
}

// combine last item in the array
// combine time
// 1 and 2 => [1,2]
// [1,2] and 3 = > [1,3]
/*
* @param collection {Object}
* @param object {Object} storage collection information item key
* @param params {Object} collect information from chromeheadless
* */
function combine(collectionName, object, params) {
    let dict = {
        "network": 'entry.timestamp',
        "script" : 'timestamp',
        "message": ''
    };

    let _a = pathResolve(object , dict[collectionName]),
        _p = pathResolve(params , dict[collectionName]);

    if (_a instanceof Array) {
        _a = [_a[0], Math.max(_a.pop(), _p)] // [1,2] and 3 = > [1,3]
    } else {
        _a = [_a, _p]; // 1 and 2 => [1,2]
    }

    pathResolveSet(object, dict[collectionName], _a);

    return object;
}

/*
* check the same logs
* @param collectionName {String} Collection name
* @param o {object} previous item
* @param params {params} current item
* */
function compare(collectionName, o, params) {
    let dict = {
        "network": ['["entry"]["url"]', '["entry"]["text"]'],
        "script" : ['["exceptionDetails"]["url"]', '["exceptionDetails"]["lineNumber"]', '["exceptionDetails"]["columnNumber"]'],
        "message": ['["entry"]["url"]', '["entry"]["text"]']
    };

    // iterate all items in collectionName
    return dict[collectionName].map(function (item) {

        // compare key item in o and params
        // o["entry"]["url"] ?= ["xxx"]["xxx"]
        return new Function('return ' + "this" + item).bind(o)() == new Function('return ' + "this" + item).bind(params)()
    }).every(function (elem) {
        return elem; // check every item equals
    });
}

// reference : https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
// parse object and string path, such as ".path.subpath"
// could use curry refactor
function pathResolve(object, path) {
    return path.split('.')
        .reduce((o, p)=> o ? o[p] : undefined, object)
}

// reference : https://stackoverflow.com/questions/13719593/how-to-set-object-property-of-object-property-of-given-its-string-name-in-ja
function pathResolveSet(object, path, value) {
    var i;
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++)
        object = object[path[i]];

    object[path[i]] = value;
}
