const CDP = require('chrome-remote-interface');

CDP.List(function (err, targets) {
  if (!err) {
    console.log(targets);
  }
});