
const { log } = require('node:console');
const { WriteStream, ReadStream } = require('node:fs');
const { Stream, Duplex, Readable } = require('node:stream');
const net = require('node:net');
const { EventEmitter } = require('node:events');
print = require('./xlog.js');
xfetch = require('./xfetch.js');


require('dotenv').config()

const express = require("express"),
  ENV = process.env,
  app = express(),
  // fetch = require("node-fetch"),
  prompt = require("prompt"),
  url = require("url"),
  http = require("http"),
  https = require("https"),
  server = app.listen(ENV.PORT||void 0, () => {
    var port = server.address().port;
    console.log(`http://localhost:${port}\n-----------`);
    ENV.dev && require('./test/drive-api.js')
  });

app.use((req, res, next) => {
  try {
    var md = "./x" + req.path.toUpperCase().replace(/\\$|\/$|$/, "/index.js")
    _require(md)(req, res, next);
  } catch (e) {
    console.error(e);
    next()
  }
});

app.use((req, res) => {
  res.json({
    status: 0
  })
});
 
TEST = false;
globalThis.ENV = ENV;
globalThis.express = express;
globalThis._require = _require; 
_require.module = {};
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


// ENV.dev=""

// u="http://localhost:8080/k"
// // u="https://github.com"

// xfetch(u,{MAX_BUFFER:70_000_000,TIMEOUT:1000}).then(({stream})=>{
//   stream.pipe(WriteStream("text")).on("close",e=>log("cl"))

//   stream.on("data",buf=>{
//     log(buf.length,stream.destroyed)
//   })
//   .on("end",buf=>{
//     log("end")
//   })
//   .on("close",buf=>{
//     log("close")
//   })
//   .on("error",buf=>{
//     log("error")
//   })
//   .on("timeout",buf=>{
//     log("timeout")
//   })
// })
