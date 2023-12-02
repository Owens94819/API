const { log } = require('console');
print = require('./xlog.js');


require('dotenv').config()

const express = require("express"),
  ENV = process.env,
  app = express(),
  prompt = require("prompt"),
  url = require("url"),
  http = require("http"),
  https = require("https"),
  server = app.listen(ENV.PORT, () => {
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
// const fs = require('fs');
// process.stdout.write('\n')
// var stdout= process.stdout,
// y=stdout.columns;
// // stdout.cursorTo(0,y)
// stdout.write("start:"+y)
// log("\nooooo")
// setTimeout(() => {
// //   stdout.cursorTo(0,11)
// //   s=stdout.getWindowSize();
// r=stdout.moveCursor(0,-1)
// stdout.cursorTo(0,0)
// stdout.
//   stdout.cursorTo(0,10)
// stdout.write("[here]2\npp\n\n\nkkk\njj")
// stdout.cursorTo(0,10)
// stdout.write("here")
// // buf.write("--")
// // stdout.write("\n2 ppp:"+y)
// // stdout.write("\n3 ppp:"+y)
// // stdout.cursorTo(0,11)
// // stdout.write("ppp:"+y)
// // log(stdout.columns)
// }, 1000);
// // var Jetty = require("jetty");
// // var jetty = new Jetty(process.stdout);
// // // Clear the screen
// // // jetty.clear();
// // jetty.text("ppp").moveTo([0,0])

// // setTimeout(() => {
// //   process.stdout.cursorTo(-1)
// //   process.stdout.clearLine(1)
// // process.stdout.write('\nooo')
// // }, 100000);
// // prompt.start({noHandleSIGINT: true});
// // prompt.message="-"
// // //#region 
// // process.on('SIGIO', function() {
// //   console.log("up");
// // });
// // process.on('SIGINFO', function() {
// //   console.log("up");
// // });
// // prompt.on("up",e=>{
// //   log("up--")
// // })
// // //#endregion
// // prompt.get('l')
// // const print = require('./xlog.js');

// // print("1")
// // print("2")
// // print(1,"3")
// // print("4")
// // i=0
// // setInterval(()=>{
// // print(1,i++)
// // },1000)
// // set