module.exports=({url,query,body}, res) => {
    console.log(query,body);
    if ((query["hub.mode"]==="subscribe")&&query["hub.verify_token"]&&query["hub.challenge"]) {
        res.send(query["hub.challenge"])
    }else{
        res.redirect('http://localhost:3000'+url);
    }
}
