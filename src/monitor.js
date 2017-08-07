const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const exec = require('child_process').exec;
const low = require('lowdb');
const db = low('db/db.json');
const uuid = require('uuid');
const debug = require('debug');
const log = debug("m-monitor");


// Set some defaults if your JSON file is empty
exports.start = function () {
    // cleanChromePID(); // clean the chrome process
    launchChrome().then(chrome => {
        console.log(`Chrome debuggable on port: ${chrome.port}`);
        //entry function
        monitor(chrome);
        // chrome.kill();
    });
};



function monitor(chrome) {

    CDP((client) => {
        // extract domains
        const {Network, Page, Console, Runtime, Debugger, Log} = client;
        // setup handlers

        Console.messageAdded((params) => {
            combineAndStorage('message', params);
        });

        /*
         * network 网络加载问题数据的记录
         * */
        Log.entryAdded((params) => {
            // console.log("entryAdded --- : ", params); // 打印所有的请求
            combineAndStorage('network', params);
        });

        /*
         * middleware for filter and storage method
         * @collection {string} collection name
         * @params {object} object item needed saved
         * */

        function combineAndStorage(collection, params) {
            var v = db.get(collection).value(),
                r = [];

            function combine(collection, object, params) {
                log("......................")
                log("display : ","collection : ", collection, "object : ",object, "params : ",params);

                let dict = {
                    "network": ['.entry.timestamp'],
                    "script" : ['.timestamp'],
                    "message": ['']
                };

                let _a = eval("object" + dict[collection]),
                    _p = eval("params" + dict[collection]);
                if (_a instanceof Array) {
                    _a = [_a[0], Math.max(_a.pop(), _p)]
                } else {
                    _a = [_a, _p];
                }

                new Function('return object' + dict[collection] + "=" + _a).bind(_a)()
                log("results  ::: ", eval("object" + dict[collection]));
                log("results  ::: ", _a);

                return object;
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
        }).catch((err) => {
            console.error(err);
        });
    })
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
    exec("ps aux | grep -i chrome  | awk {'print $2'} | xargs kill -9", (err, stdout, stderr) => {
        console.log("clean pid");
        if (err) {
            // node couldn't execute the command
            return;
        }
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
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