const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const exec = require('child_process').exec;


exports.start = function (){
    // cleanChromePID(); // clean the chrome process
    launchChrome().then(chrome => {
        console.log(`Chrome debuggable on port: ${chrome.port}`);

        //entry function
        monitor(chrome);
        // chrome.kill();
    });
};



function monitor(chrome){


    CDP((client) => {
        // extract domains
        const {Network, Page, Console, Runtime, Debugger, Log} = client;
        // setup handlers


        Console.messageAdded((params) => {
            console.log("消息输出%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            console.log("messageAdded --- : " ,params); // 打印所有的请求
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        });
        Log.entryAdded((params) => {
            console.log("网络加载问题^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log("entryAdded --- : " ,params); // 打印所有的请求
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        });

        Debugger.scriptParsed((params) => {
            console.log("************************************")

            console.log("scriptParsed --- : " ,params);
            console.log("************************************")
        });

        Runtime.exceptionThrown((params) => {
            console.log("脚本错误++++++++++++++++++++++++++++++");
            console.log("exceptionThrown --- : " ,params);
            console.log("+++++++++++++++++++++++++++++++++++++")
        });
        Runtime.exceptionRevoked((params) => {
            console.log("!!!!!!脚本错误++++++++++++++++++++++++++++++");
            console.log("exceptionRevoked --- : " ,params);
            console.log("+++++++++++++++++++++++++++++++++++++")
        });
        Debugger.scriptFailedToParse((params) => {
            console.log("-------------------------------------")
            console.log("scriptFailedToParse --- : " ,params);
            console.log("-------------------------------------")
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
            Page.navigate({ url: "http://x.zhoup.com/fail.html" });
        }).catch((err) => {
            console.error(err);
        });
    })
}

function launchChrome(headless=true) {
    return chromeLauncher.launch({
        port: 9222, // Uncomment to force a specific port of your choice.
        chromeFlags: [
            '--disable-gpu',
            headless ? '--headless' : ''
        ]
    });
}

function cleanChromePID(){
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