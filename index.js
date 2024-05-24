
const { log } = require('node:console');
const { WriteStream, ReadStream } = require('node:fs');

// const xfetch = require('./xfetch.js');

xfetch = require('./xfetch.js');
puts = print = require('./xlog.js');


require('dotenv').config()

const express = require("express"),
  ENV = process.env,
  app = express(),
  bodyParser = require("body-parser"),
  url = require("url");
  globalThis.TEST = false;

globalThis.ENV = ENV;
globalThis.express = express;
globalThis._require = _require;
_require.module = {};
app.use(bodyParser.json());
if (ENV.dev === "cmd") {
  import('./cli/drive.js')
} else {
  const server = app.listen(ENV.PORT || void 0, () => {
    var port = server.address().port;
    puts(`http://localhost:${port}\n-----------`);
    if (ENV.dev) import('./cli/drive.js')
  });
}

app.use("/test_xfetch", (req, res, next) => {
  res.write("mic, check-up")
});

app.use((req, res, next) => {
  try {
    var md = "./x" + req.path.toUpperCase().replace(/\\$|\/$|$/, "/index.js")
    _require(md)(req, res, next);
  } catch (e) {
    puts("console", e);
    next()
  }
});

app.use((req, res) => {
  res.json({
    status: 0
  })
});

function _require(md, key) {
  const _md = md.toLowerCase();
  if (!_require.module.hasOwnProperty(_md)) {
    if (key) {
      const res = _require.module[_md] = require(md);
      _require.module[_md] = res[key]
      return res
    } else {
      return _require.module[_md] = require(md);
    }
  }
  return _require.module[_md];
}


