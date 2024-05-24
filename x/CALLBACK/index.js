module.exports=({url,query,body}, res) => {
    if ((query["hub.mode"]==="subscribe")&&query["hub.verify_token"]&&query["hub.challenge"]) {
        res.send(query["hub.challenge"])
    }else{
        res.redirect('http://localhost:3000'+url);
    }
    console.log(query,body);
}
