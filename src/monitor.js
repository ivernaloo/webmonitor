const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const exec = require('child_process').exec;
const low = require('lowdb');
const db = low('db/db.json');
const uuid = require('uuid');

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

        // Console.messageAdded((params) => {
        //     console.log("消息输出%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        //     console.log("messageAdded --- : ", params); // 打印所有的请求
        //     console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        //     db.get('message').push({
        //         id     : uuid(),
        //         content: params,
        //         time   : new Date().getTime()
        //     }).write();
        // });

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
        function combineAndStorage(collection, params){
            var v = db.get(collection).value(),
                r = [];

            if (v.length > 0) {
                r = db.get(collection).value().reduce(function (m, o) {
                    var o_url  = o.entry.url,
                        o_text = o.entry.text;
                    return o_url == params.entry.url && o_text == params.entry.text ?
                        [...m.slice(0,-1), combine(o, params)] :
                        [...m, o, params];
                }, []);
            } else {
                r.push(params)
            }

            db.set(collection, r).write();
            function combine(object, params) {
                var _a = object.entry.timestamp,
                    _p = params.entry.timestamp;
                if (_a instanceof Array) {
                    _a = [_a[0], Math.max(_a.pop(), _p)]
                } else {
                    _a = [_a, _p];
                }

                object.entry.timestamp = _a;
                return object;
            }    
        }
        /*        Debugger.scriptParsed((params) => {
         console.log("************************************")

         console.log("scriptParsed --- : " ,params);
         console.log("************************************")
         });*/

        // Runtime.exceptionThrown((params) => {
        //     console.log("脚本错误++++++++++++++++++++++++++++++");
        //     console.log("exceptionThrown --- : ", params);
        //     console.log("+++++++++++++++++++++++++++++++++++++")
        //     db.get('script').push({
        //         id     : uuid(),
        //         content: params,
        //         time   : new Date().getTime()
        //     }).write();
        // });
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