const CDP = require('chrome-remote-interface');

CDP((client) => {
    // extract domains
    const {Network, Page, Console, Runtime, Debugger, Log} = client;
    // setup handlers
/*
    Network.loadingFailed((params) => {
        console.log("loadingFailed --- : " ,params); // 打印所有的请求
    });
*/
    /*Console.messageAdded((params) => {
        console.log("messageAdded --- : " ,params); // 打印所有的请求
    });
    Log.entryAdded((params) => {
        console.log("entryAdded --- : " ,params); // 打印所有的请求
    });*/

    Debugger.scriptParsed((params) => {
        console.log("scriptParsed --- : " ,params);
    });

    Runtime.exceptionThrown((params) => {
        console.log("exceptionThrown --- : " ,params);
    });

    Debugger.scriptFailedToParse((params) => {
        console.log("scriptFailedToParse --- : " ,params);
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
});