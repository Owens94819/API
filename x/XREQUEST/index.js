

// var _end="XRequest.res[$][1].remove();XRequest.resId--;"

module.exports=(req, res) => {
  res.setHeader("content-type", "text/javascript");
  var src= req.query.src;
  var id = req.query.id;
  var _http;
  var end=_end.replace("$",id)
  
  try{
  	
  src=url.parse(src)
  
  "https:"===src.protocol && (_http = https)
  ||
  "http:"===src.protocol && (_http = http);
  
 // src.headers=req.headers;
  //console.log(src)
  //res.write(";;")
  _http
    .get(src, (req) => {
    	 //console.log("ready");
      req.setEncoding("utf8");
      res.write(end+`XRequest.res[${id}][0](delete XRequest.res[${id}] &&\``);
      req.on("data", (ch) => res.write(ch.replace(/[\`\\\$\{]/g, "\\$&")));
      req.on("end", () => res.end(`\`);`));
    })
    .on("error", (e) => {
      console.log("err", src, e);
      res.end(end+`XRequest.res[${id}][0]("",delete XRequest.res[${id}])`);
    });

  }catch(e){
  	console.error("catch",e)
      res.end(end+`XRequest.res[${id}][0]("",delete XRequest.res[${id}])`);
  	return
   }
  
}
