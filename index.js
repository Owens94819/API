function _require(md) {
  const _md = md.toLowerCase();
  if (!_require.module.hasOwnProperty(_md)) _require.module[_md] = require(md);
  return _require.module[_md];
}

_require.module = {};

const express = require("express"),
  app = express(),
  url = require("url"),
  http = require("http"),
  https = require("https"),
  server = app.listen(process.env.PORT || 1000, () => {
    var port = server.address().port;
    console.log(`http://localhost:${port}\n-----------`);
    // return;
    // setTimeout(() => {
      // let url = "https://www.google.com/search?q=send+stream+as+response+content-type+nodejs&sca_esv=575386901&hl=en&tbm=isch&sxsrf=AM9HkKk_qc6SIlKvRVhCIEAhSdTnngyPbw:1697882354761&source=lnms&sa=X&ved=2ahUKEwjlzoDV8IaCAxXzLUQIHWUhDegQ_AUoAXoECAIQAw&biw=1366&bih=629&dpr=1"
     // url = "http://localhost:5000/titles/htmx in 100 seconds(720P_HD).mp4"
      // url=encodeURIComponent(url);
      // fetch("http:/\/localhost:1000/my-google-drive?url="+url)
      //   .then(e => "done!")
      //   .then(console.log) 
    // }, 1000);
  });

app.use((req, res, next) => {
  try {
    var md = "./x" + req.path.toUpperCase().replace(/\\$|\/$|$/, "/index.js")
    _require(md)(req, res, next)
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


global.express = express;