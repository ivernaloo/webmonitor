const CDP = require('chrome-remote-interface');

(async () => {

  CDP(async protocol => {
    const { Page, Console } = protocol;

    Console.messageAdded(({ message }) => {
      console.log(message);
    });

    await Promise.all([
      Page.enable(),
      Console.enable()
    ]);

    await Page.navigate({ url: "http://x.zhoup.com" });
    await Page.loadEventFired();

    protocol.close();
  })
})();

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
