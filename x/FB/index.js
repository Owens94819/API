
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const {e:encode,d:decode} =require("./char.js")
const LIMIT=5;
function atob(str) {
  return Buffer.from(str,"base64")+""
}
//{"1":"a29yZXkuamFja3Nvbg==","2":"Q29sU2Ft","3":true}

const serviceAccount = JSON.parse(process.env.fb_key);
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const store = db.collection('Emma');
module.exports=async ({query:{start,data}}, res) => {
 function write(msg) {
    res.write("data: " + msg + "\n\n")
  }
 function end(msg) {
    res.end("data: " + msg + "\n\n")
  }
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (!data) {
    // console.log( (await store.count().get()).data());
    res.setHeader("content-type", "text/event-stream");
    start=parseInt(start)||0;
    if (start<0) start=0
    // console.log(start);
    const item=store.orderBy('date').limit(LIMIT);
    let set=await item.offset(start).get()
    while(!set.empty) {
      start=start+LIMIT
      set.forEach(async (rst)=>{
        const data = rst.data();
        // await store.doc(rst.id).delete()
        try {
          write(decode(data.check))
          //  data.check=JSON.parse(decode(data.check));
          //  data.check[1]=atob(data.check[1])
          // console.log(data);
        } catch (error) {
          console.log("Decode error");
        }
      })
      // console.log(start);
      set=await item.offset(start).get()
    }
    end("close")
  }else{
    try {
      data=decodeURIComponent(data);
      if (data.length > 200) throw "too large";
      data=JSON.parse(data);
      if(!(atob(data[1]).trim()&&atob(data[2]).trim())) throw "invalid"
    } catch (error) {
      console.error("fb api: "+error)
      return res.end();
    }
    // const index = (await store.count().get()).data().count
    await store.add({
      check:encode(JSON.stringify(data)),
      date:Date.now(),
      // index,
      static:1
    })
    console.log("added- ",data);
    res.end("done!")
  }
}

