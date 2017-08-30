const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const _exec = require('child_process').exec;
const debug = require('debug');
const log = debug("m-monitor");
const combineAndStorage = require("./utils/CombineAndStorage").load;


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
            "timestamp": 1504097877726.44,
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