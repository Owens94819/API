

// var _end="XRequest.res[$][1].remove();XRequest.resId--;"

module.exports=(req, res) => {
  res.setHeader("content-type", "text/javascript");
  var src= req.query.src;
  var id = Number(req.query.id);
  var _http;
 // var end=_end.replace("$",id)
  
  try{
  	
  src=url.parse(src)
  
  "https:"===src.protocol && (_http = https)
  ||
  "http:"===src.protocol && (_http = http);
  
 // src.headers=req.headers;
  //console.log(src)
  res.write(`var id=${id};var res= XRequest.res[id];`+res_st)
  _http
    .get(src, (req) => {
    	// console.log((req));
      req.setEncoding("utf8"); 
      res.write(res_end+` res[1].status=${res.statusCode}; res[1].statusText="${req.statusMessage.trim()}";res[1].foo(delete res[1].foo&&delete XRequest.res[${id}]&&\``);   	
      req.on("data", (ch) => res.write(ch.replace(/[\`\\\$\{]/g, "\\$&")));
      req.on("end", () => res.end(`\`);`+res_ls));
    })
    .on("error", (e) => {
      console.log("err", src, e);
      res.end(res_end+res_error+res_ls);
    })
   .end();

  }catch(e){
  	console.error("catch",e)
      res.end(res_end+res_error+res_ls);
  	return
   }
  
}
