const CDP = require('chrome-remote-interface');

CDP(async client => {
  const { Page, Log } = client;

  await Promise.all([
    Page.enable(),
    Log.enable()
  ]);

  await Page.navigate({ url: "http://www.baidu.com" });
  await Page.loadEventFired();

  Log.startViolationsReport(config => {
    console.info("config :", config);
  });
  await Log.entryAdded(message => {
    console.log(message);
  });

  client.on('event', function(message){
    console.log(message);
  });

  client.close();
});


/*
CDP (async (client) => {
  // extract domains
  const {Log, Page} = client;

  await Log.enable();
  await Page.enable();

  Page.navigate({url: 'http://x.zhoup.com'});
  Log.entryAdded((msg) => {
    console.log(msg);
    console.log(".....")
  });

  Page.loadEventFired(() => {
    console.log("Loaded")
    Log.entryAdded((msg) => {
      console.log(msg);
      console.log(".....")
    });
  });


    console.log("ok")
});*/
