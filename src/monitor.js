const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const _exec = require('child_process').exec;
const low = require('lowdb');
const db = low('db/db.json');
const uuid = require('uuid');
const debug = require('debug');
const log = debug("m-monitor");



start();
// Set some defaults if your JSON file is empty
function start() {
    // cleanChromePID(); // clean the chrome process
    log(".....")

    // fake logic, mcok for test
    monitor();

    // @todo real logic, mock dash for test
    /*
    launchChrome().then(chrome => {
        log(`Chrome debuggable on port: ${chrome.port}`);
        //entry function
        monitor(chrome);
        // chrome.kill();
    })
    */;
};


function monitor(chrome) {
    log("start monitor ");
    // fake logic, mcok for test
    combineAndStorage('network', {
        "entry": {
            "source": "network",
            "level": "error",
            "text": "Failed to load resource: the server responded with a status of 404 (Not Found)",
            "timestamp": [
                1504065079506.42,
                1504077877726.44
            ],
            "url": "http://x.zhoup.com/res/lib/lightgallery/js/lightgaller.min.js",
            "networkRequestId": "85256.11"
        }
    });

    // @todo real logic, mock dash for test
    /*CDP((client) => {
        log("CDP running");
        // extract domains
        const {Network, Page, Console, Runtime, Debugger, Log} = client;
        // setup handlers

        Console.messageAdded((params) => {
            log("messageAdded");
            combineAndStorage('message', params);
        });

        /!*
         * network 网络加载问题数据的记录
         * *!/
        Log.entryAdded((params) => {
            log("entryAdded"); // 打印所有的请求
            combineAndStorage('network', params);
        });

        /!*
         * middleware for filter and storage method
         * @collection {string} collection name
         * @params {object} object item needed saved
         * *!/



        Runtime.exceptionThrown((params) => {
            combineAndStorage('script', params);
        });

        // enable events then start!
        Promise.all([
            Network.enable(),
            Log.enable(),
            Page.enable(),
            Debugger.enable(),
            Console.enable(),
            Runtime.enable()
        ]).then((client) => {
            Page.navigate({url: "http://x.zhoup.com/fail.html"});
            log("navigate to web")
        }).catch((err) => {
            console.error(err);
        });
    })*/
}

function launchChrome(headless = true) {
    return chromeLauncher.launch({
        port       : 9222, // Uncomment to force a specific port of your choice.
        chromeFlags: [
            '--disable-gpu',
            '--headless'
        ]
    });
}

function cleanChromePID() {
    _exec("ps aux | grep -i chrome  | awk {'print $2'} | xargs kill -9", (err, stdout, stderr) => {
        log("clean pid");
        if (err) {
            // node couldn't execute the command
            return;
        }
        // the *entire* stdout and stderr (buffered)
        log(`stdout: ${stdout}`);
        log(`stderr: ${stderr}`);
    });
}

function combineAndStorage(collection, params) {
    var v = db.get(collection).value(),
        r = [];

    // combine time
    // 1 and 2 => [1,2]
    // [1,2] and 3 = > [1,3]
    function combine(collection, object, params) {
        let log = debug("m-combine");
        let dict = {
            "network": 'entry.timestamp',
            "script" : 'timestamp',
            "message": ''
        };

        let _a = pathResolve(object , dict[collection]),
            _p = pathResolve(params , dict[collection]);

        if (_a instanceof Array) {
            _a = [_a[0], Math.max(_a.pop(), _p)] // [1,2] and 3 = > [1,3]
        } else {
            _a = [_a, _p]; // 1 and 2 => [1,2]
        }

        log(_a, _p)
        log("return out from logic");
        pathResolveSet(object, dict[collection], _a);

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

    function compare(collection, o, params) {
        let dict = {
            "network": ['["entry"]["url"]', '["entry"]["text"]'],
            "script" : ['["exceptionDetails"]["url"]', '["exceptionDetails"]["lineNumber"]', '["exceptionDetails"]["columnNumber"]'],
            "message": ['["entry"]["url"]', '["entry"]["text"]']
        };

        return dict[collection].map(function (item) {

            // compare key item in o and params
            return new Function('return ' + "this" + item).bind(o)() == new Function('return ' + "this" + item).bind(params)()
        }).every(function (elem) {
            return elem;
        });
    }

    if (v.length > 0) {
        r = db.get(collection).value().reduce(function (m, o) {
            return compare(collection, o, params) ?
                [...m.slice(0, -1), combine(collection, o, params)] :
                [...m, o, params];
        }, []);
    } else {
        r.push(params)
    }

    db.set(collection, r).write();
}


/*        
Debugger.scriptParsed((params) => {
    console.log("************************************")
    
    console.log("scriptParsed --- : " ,params);
    console.log("************************************")
});
*/


/*        Runtime.exceptionRevoked((params) => {
 console.log("!!!!!!脚本错误++++++++++++++++++++++++++++++");
 console.log("exceptionRevoked --- : " ,params);
 console.log("+++++++++++++++++++++++++++++++++++++")
 });
 Debugger.scriptFailedToParse((params) => {
 console.log("-------------------------------------")
 console.log("scriptFailedToParse --- : " ,params);
 console.log("-------------------------------------")
 });*/