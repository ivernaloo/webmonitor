const CDP = require('chrome-remote-interface');

(async function() {

  const protocol = await CDP();

// Extract the DevTools protocol domains we need and enable them.
// See API docs: https://chromedevtools.github.io/devtools-protocol/
  const {Page, Runtime} = protocol;
  await Page.enable();
  await Runtime.enable();

  Page.navigate({url: 'http://www.chromestatus.com/'});

// Wait for window.onload before doing stuff.
  Page.loadEventFired(async () => {
    const js = "document.querySelector('title').textContent";
    // Evaluate the JS expression in the page.
    const result = await Runtime.evaluate({expression: js});

    console.log('Title of page: ' + result.result.value);

    protocol.close();
  });


})();