!process.env.production&&require("./HTTPParser");


  express = require("express"),
  app = express(),
  // fetch = require("node-fetch"),
  url = require("url"),
  http = require("http"),
  https = require("https"),
  server = app.listen(process.env.PORT || 1000, () => {
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
  res_end="res[0]&&res[0].remove&&res[0].remove();XRequest.resId--;",
  res_error=`res[1].foo("",delete res[1].foo && delete XRequest.res[id]);`,
  res_st=`try{`,
  res_ls=`}catch(err){res[0]&&res[0].logger(err);}`;

app.use((req, res, next) => {
	try{
	var md="./x"+req.path.toUpperCase().replace(/\\$|\/$|$/,"/index.js")
	require(md)(req,res,next)
  }catch(e){
  	next()
  	}
});

app.use((req, res) => {
  res.json({
    status:0
  })
});
