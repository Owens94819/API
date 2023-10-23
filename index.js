require('dotenv').config()

const express = require("express"),
  ENV = process.env,
  app = express(),
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

TEST=false;
globalThis.express = express;
globalThis._require=_require;
_require.module = {};
function _require(md, key) {
  const _md = md.toLowerCase();
  if (!_require.module.hasOwnProperty(_md)) {
    if(key){
      const res= _require.module[_md] = require(md);
      _require.module[_md]=res[key]
      return res
    }else{
     return  _require.module[_md] = require(md);
    }
  }
  return _require.module[_md];
}