/**
 * Created by xiaomi on 2017/8/30.
 */
const low = require('lowdb');
const db = low('db/db.json');
const uuid = require('uuid');
const debug = require('debug');
const log = debug("m-utils-combineAndStorage");
const DAY = 24 * 60 * 1000;
// const id = require("shortid");

log("start");

/*
* @param collectionName {String}
* @param params {Object} collect information from chromeheadless
* */
exports.load = function(collectionName, params) {
    var v = db.get(collectionName).value(), // storage collection list
        log = debug("m-utils-load"),
        r = []; // array list for store filtered data

    // v is json data
    if (v.length > 0) {
        /*
        * @param m {object} previous item in the v list
        * @param o {object} current item in the v list
        * */
        r = v.reduce(function (m, o) {
            return compare(collectionName, o, params) ?  // compare adjacement elements
                [...m.slice(0, -1), combine(collectionName, o, params)] :
                [...m, o, params];
        }, []);
    } else {
        // params.id = id.generate();
        r.push(params)
    }

    // log("id : ", id.generate());
    // log("r : ", r);
    db.set(collectionName, r).write();
};

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
    let log = debug("m-combine");
    let dict = {
        "network": 'entry.timestamp',
        "script" : 'timestamp',
        "message": ''
    };

    let _a = pathResolve(object , dict[collectionName]),
        _p = pathResolve(params , dict[collectionName]); // probably, return single number or array

    log("_a : ", _a);
    log("_p : ", _p);

    if (_a instanceof Array) {
        log("max combine", _p - _a.pop() > DAY);
         // @todo change to index storage, such as {date: data}
         // @todo change to moment support
         // @todo where lowdb support link
        // _a maybe : xx , [xx,xx], [[xxx,xx],[xx,xx]], [[xxx,xxx],xx]
         _p.
        /*
        if( _a.pop() instanceof  Array ){
            // compare the last time

        } else {

        }
        */
        _a = [_a[0], Math.max(_a.pop(), _p)] // [1,2] and 3 = > [1,3]
    } else {
        log("direct combine")
        _a = [_a, _p]; // 1 and 2 => [1,2]
    }

    log(_a, _p);
    log("return out from logic");
    pathResolveSet(object, dict[collectionName], _a);

    return object;
}

// reference : https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
// parse object and string path, such as ".path.subpath"
// could use curry refactor
function pathResolve(object, path){
    return path.split('.')
        .reduce((o, p)=> o ? o[p] : undefined, object)
}

// reference : https://stackoverflow.com/questions/13719593/how-to-set-object-property-of-object-property-of-given-its-string-name-in-ja
function pathResolveSet(object, path, value){
    var i;
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++)
        object = object[path[i]];

    object[path[i]] = value;
}


/*
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

    // iterate all items
    return dict[collectionName].map(function (item) {

        // compare key item in o and params
        // o["entry"]["url"] ?= ["xxx"]["xxx"]
        return new Function('return ' + "this" + item).bind(o)() == new Function('return ' + "this" + item).bind(params)()
    }).every(function (elem) {
        return elem; // check every item equals
    });
}