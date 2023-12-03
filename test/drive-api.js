const { log } = require('console');
const chalk = require('chalk');
const keypress = require('keypress');
const prompt = require('prompt');

// const logUpdate = require('log-update');
(async () => {
  const {default:logUpdate}=await import('log-update')

  function pg(n) {
    if(n||pg.i.length>3){
      pg.i=""
    }else{
      pg.i+="."
    }
    return pg.i
  }
  pg.i=""
  function Size(n,f) {
    var t;
    if(n<Size._kb){
      //b
      t="b"
    }else if(n<Size._mb){
      // kb
      t="kb"
      n=n/Size._kb
    }else if(n<Size._gb){
      //mb
      t="mb"
      n=n/Size._mb
    }else{
      //gb
      t="gb"
      n=n/Size._gb
    }
    if(!f) n=parseInt(n)
    //((n) / 1024) / 1024
    return n+t
  }
  Size._kb=1024
  Size._mb=Size._kb*Size._kb
  Size._gb=Size._mb*Size._mb

  TEST = true
  const md = './x/MY-GOOGLE-DRIVE/index.js';
  const exp=_require(md, "Response");
  const { listFiles, oauth2Client, getPortionOfFile, listFilesOnly,deleteFile, service, findFileById, findFileByName,_listFilesOnly,getLastFile } = exp;
  TEST = false;

  const fs = require('fs');
  const path = require('path');
  const https = require('https');

  _path = ".bin/downloads"
  !fs.existsSync(_path) && fs.mkdirSync(_path)

  async function download(id, resolve) {

    function setFile() {
      pg(true)
      const d=setInterval(()=>{
      logUpdate("setting "+file.name.substring(0,35)+pg())
      },200)

      fs.createReadStream(name,{start:fds})
      .pipe(fs.createWriteStream(_name))
      .on("close",()=>{
        fs.unlinkSync(name)
        clearInterval(d)
        logUpdate(`(${file.name}) -completed`)
        logUpdate.done();
         resolve()
      })
    }
    function close() {
      fs.closeSync(fd)
    }
    function byteSize(val) {
      const buf = Buffer.alloc(fds)
      buf.fill(" ").write(""+val)
      fs.writeSync(fd,buf,0,null,0)
    }
    function write(data) {
      if (data instanceof Buffer) {
        fs.writeSync(fd,data,0,null,fds+start)
      }else{
        fs.writeSync(fd,data,fds+start)
      }
      start+=data.length;
      byteSize(start)
    }

    let file;
    const __foo = arguments.callee
    let prom;
    if (!resolve) {
      prom = new Promise((res, rej) => {
        resolve = res
      })
    }
    const arg = [id, resolve]
    try {
      file = await findFileById({ _service: service, id })
      file.size=Number(file.size)
    } catch (error) {
      logUpdate("retring: file-id-err"+pg())
      setTimeout(function () {
        __foo(...arg)
      },200)
      return
    }
    if (!file) {
      resolve()
      return log("file not found")
    }
    const _name = path.join(_path, file.name);
    const name = _name+".pending";

    let start=0,
    _exist=fs.existsSync(_name),
    fds=(file.size+"").length,
    fd;

    if (fs.existsSync(name)) {
    fd=fs.openSync(name,"r+")
      start = Buffer.alloc(fds)
      fs.readSync(fd,start,0,start.length,0)
      start=start.toString().trim()
      if(start==="D"){
        setFile()
        return prom
      }
      start=+start
    } else {
      const buf = Buffer.alloc(fds)
      buf.fill(" ").write("0")
      if(_exist){
        const q="file exist, want to conti..(y/n)"
        const val=(await prompt.get(q))[q]
        if(val.trim().toLowerCase()!=="y") return logUpdate("terminated"),resolve();
      }else{
        fs.writeFile(_name,Buffer.alloc(file.size),err=>{
          if(err) log(err)
        })
      }
      fs.writeFileSync(name,buf)
      fd=fs.openSync(name,"r+")
    }

    if (start >= file.size) {
      logUpdate(`done: ${Size(start)}`)
      byteSize("D")
      setFile()
      resolve()
      return prom
    }

    log(file.name)

    const res = await getPortionOfFile(id, { startByte: start, endByte: file.size, _service: service }).catch(err => { log(err) });

    if (!res) {
      close()
      logUpdate("retring"+pg())
      return __foo(...arg)
    }

    logUpdate(`pending: ${Size(start)} - ${Size(file.size, true)}`);

    let timeout;

    res.on("end", function (e) {
      logUpdate(`downloading: ${Size(start)} - ${Size(file.size)}`)
      logUpdate.done()
      log(`downloading: done!`)
      byteSize("D")
      close()
      setFile()
    })

    res.on("data", function (e) {
      write(e)
      logUpdate(`downloading: ${Size(start,true)} - ${Size(file.size)} - (speed: ${Size(e.length)})`)
      const pStart = start
      clearTimeout(timeout)
      timeout=setTimeout(() => {
        if (res.closed || res.destroyed) return
        if (start === pStart) {
          logUpdate("retry from: " + Size(start))
          res.destroy()
          close()
          __foo(...arg)
        }
      }, 25000)
    })
    return prom
  }

  const arg={_service:service}
  function p(params) {
    const q="enter query"
    prompt.get(q,async (err,val)=>{
    if (!err) {
      try {
        await eval(val[q])
      } catch (error) {}
    p();
    }
    })
    
  }
  
  const app_data_path=".bin/app-data.json";
  let app_data;
  if(!fs.existsSync(app_data_path)){
    app_data= await exp.matchLastFile("Breaking",arg)
    fs.writeFileSync(app_data_path,JSON.stringify(app_data))
  }else{
    app_data=fs.readFileSync(app_data_path)
    app_data=JSON.parse(app_data)
  }

  // log(await listFilesOnly(arg))
  // log(await exp.matchLastFile("Breaking",arg))
  p()

  keypress(process.stdin)
  let i=0
  let cur;
  let busy=false
  app_data.forEach((val,key)=>{
    print("item-"+(key+1),`${chalk.blue(key+")")} ${(val.name)}\n`)
  })

  process.stdin.on("keypress",(ch,arg)=>{
    if(!arg) return;
    let {name,ctrl}=arg
    if(busy) return;
    if(ctrl&&name==="c") return process.exit();
    log(name)
    // name=Number(name)
    // const item=app_data[name]
    // if(!item) return;
    // print(item)
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()
})();
