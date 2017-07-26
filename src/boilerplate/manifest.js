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
    const manifest = await Page.getAppManifest(); // get the AppManifest

    if (manifest.url) {
      console.log('Manifest: ' + manifest.url);
      console.log(manifest.data);
    } else {
      console.log('Site has no app manifest');
    }

    protocol.close();
  });

})();