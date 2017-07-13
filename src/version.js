const CDP = require('chrome-remote-interface');

(async function() {

  const protocol = await CDP();

// Extract the DevTools protocol domains we need and enable them.
// See API docs: https://chromedevtools.github.io/devtools-protocol/
  const {Page} = protocol;
  await Page.enable();

  Page.navigate({url: 'https://www.chromestatus.com/'});

// Wait for window.onload before doing stuff.
  Page.loadEventFired(async () => {
    const version = await CDP.Version(); // get the version

    console.log(version['User-Agent']);

    protocol.close();
  });

})();