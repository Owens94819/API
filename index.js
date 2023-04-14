//require("./HTTPParser");


  express = require("express"),
  app = express(),
  // fetch = require("node-fetch"),
  url = require("url"),
  http = require("http"),
  https = require("https"),
  server = app.listen(process.env.PORT || 12345, () => {
  /*   setTimeout (()=>{
     	console.log(8)
     fetch("http:/\/localhost:12345/XRequest?id=0&src=http:/\/localhost:8158/test.js")
   .then(e=>e.text())
  .then(console.log)
  },2000);
  */
    var port = server.address().port;
    console.log(`http://localhost:${port}\n-----------`);
  }),
  _end="XRequest.res[$][1].remove();XRequest.resId--;";

app.use((req, res, next) => {
  return res.send("1hello uu");
	try{
	var md="./x"+req.path.toUpperCase().replace(/\\$|\/$|$/,"/index.js")
	require(md)(req,res,next)
  }catch(e){
  	next()
  	}
});

app.use((req, res) => {
  res.json({
    status:1
  })
});
