const fs = require('fs');
const path = require('path');
module.exports=function(req, res){
  res.setHeader("content-type", "text/html");
  fs.createReadStream(path.join(__dirname,"views/index.html")).pipe(res);
}