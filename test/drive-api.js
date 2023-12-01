const { log } = require('console');
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
  const { listFiles, oauth2Client, getPortionOfFile, listFilesOnly,deleteFile, service, findFileById, findFileByName } = _require(md, "Response");
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
        if(val.trim().toLowerCase()!=="y") return log("terminated"),resolve();
      }else{
        fs.writeFile(_name,Buffer.alloc(file.size),err=>{
          if(err) log(err)
        })
      }
      fs.writeFileSync(name,buf)
      fd=fs.openSync(name,"r+")
    }

    if (start >= file.size) {
      log(`done: ${Size(start)}`)
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
      
      setTimeout(() => {
        if (res.closed || res.destroyed) return
        if (start === pStart) {
          logUpdate("retry from: " + Size(start))
          res.destroy()
          close()
          __foo(...arg)
        }
      }, 4000)
    })
    return prom
  }

  const arg={_service:service}
  function p(params) {
    const q="enter query"
    prompt.get(q,async (err,val)=>{
    if (!err) {
      await eval(val[q])
    p();
    }
    })
  }
  p()
  // await download('16WV55jaOmEp8jA_O9snG4F3iFPpiY2_d')
  // fu
  // log("done!")
//1.2
  // 100+151+134+139+124
  // 618mb used

// ["1X0ReFbqWRzaJaZIKW7xwVDqqNLAlxN41",'1fxmBWzhGIlyApIsJeDRzj0inepbdUV1p','1K-SI3psQPia2J2Zob8FXC2Is9iasJVsP','1Q5Js80YSu-5Fx-twiyVWr4RSIDywQiIJ','1G-zTkpYo-36bVaTr-YStTAFk7g-dalDm','1CUjE6RYkX5vuBRy7LEDHi4ozgvXvOcZ2','1xTULosTY-sAhQT0ZU6HuOPIfOXkerEzL'].forEach(async val=>log(await deleteFile(val,arg)))
  // l.forEach(async ({id,name}) => {
  //   d=await deleteFile("1efxX9c--8mNlNcyURPTpWoHYi8ic3Ia1",{_service:service})
  // logUpdate(d)
  // });
  // file= await listFilesOnly({_service:service})
  // log(file)
})();
