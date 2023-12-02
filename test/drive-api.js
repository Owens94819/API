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
  const { listFiles, oauth2Client, getPortionOfFile, listFilesOnly,deleteFile, service, findFileById, findFileByName,_listFilesOnly,getLastFile } = _require(md, "Response");
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
    app_data= await _listFilesOnly(arg)
    fs.writeFileSync(app_data_path,JSON.stringify(app_data))
  }else{
    app_data=fs.readFileSync(app_data_path)
    app_data=JSON.parse(app_data)
  }

  // log(await matchLastFile("name contains 'Breaking_Bad' and name endsWith '.webm'",arg))
  p()

  return;
  keypress(process.stdin)
  let i=0
  let cur;
  let busy=false
  app_data.forEach((val,key)=>{
    print(`${chalk.blue(key+")")} ${(val.name)}\n`)
  })
  // console.log(``)
// console.log("0000");
// console.clear("0000");
  process.stdin.on("keypress",(ch)=>{
    if(!arguments[1]) return;
    let {name,ctrl}=arguments[1]
    if(busy) return;
    if(ctrl&&name==="c") return process.exit();
    print(name)
    // name=Number(name)
    // const item=app_data[name]
    // if(!item) return;
    // print(item)
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()

  // await download('16WV55jaOmEp8jA_O9snG4F3iFPpiY2_d')
  // fu
  // log("done!")
//1.2
  // 100+151+134+139+124
  // 618mb used

l=[
  {
      "mimeType": "video/webm",
      "size": "129239420",
      "id": "1HNmieHD6OoghMHxZ9WkCmtMvD33LwNsQ",
      "name": "Breaking_Bad_-_S02E01_-_Seven_Thirty-Seven_94d4ac3b18ba2d12e65bdf340c05c97c.webm",
      "createdTime": "2023-11-30T18:54:16.296Z",
      "modifiedTime": "2023-11-30T18:54:16.296Z"
  },
  {
      "mimeType": "video/webm",
      "size": "131213731",
      "id": "16WV55jaOmEp8jA_O9snG4F3iFPpiY2_d",
      "name": "Breaking_Bad_-_S02E02_-_Grilled_f8b74aa74d38219524c45dd4cb591b8a.webm",
      "createdTime": "2023-11-30T19:10:45.346Z",
      "modifiedTime": "2023-11-30T19:10:45.346Z"
  },
  {
      "mimeType": "video/webm",
      "size": "128289548",
      "id": "1aYfz1ImXctyxfiAz-HvYhXyNgyBPhewz",
      "name": "Breaking_Bad_-_S02E03_-_Bit_by_a_Dead_Bee_010dfb6fe1c27692b95889fdbbd086d0.webm",
      "createdTime": "2023-11-30T19:40:22.524Z",
      "modifiedTime": "2023-11-30T19:40:22.524Z"
  },
  {
      "mimeType": "video/webm",
      "size": "128804933",
      "id": "157UNMcYRQAG0Ty_NIn-n7rJy_PeV_OWm",
      "name": "Breaking_Bad_-_S02E04_-_Down_e89ce25a37deaf8a98941abb403280e7.webm",
      "createdTime": "2023-11-30T19:40:22.451Z",
      "modifiedTime": "2023-11-30T19:40:22.451Z"
  },
  {
      "mimeType": "video/webm",
      "size": "129484825",
      "id": "1r9O0Ay1zMX4R6P0fjB3aWHL3Emm4WoGI",
      "name": "Breaking_Bad_-_S02E05_-_Breakage_08ab239c22a1a16e84e71b0f83182b83.webm",
      "createdTime": "2023-12-01T09:55:10.426Z",
      "modifiedTime": "2023-12-01T09:55:10.426Z"
  },
  {
      "mimeType": "video/webm",
      "size": "128883733",
      "id": "16y7VnG0LEhzLrffLzHlmuumFjREM1YTI",
      "name": "Breaking_Bad_-_S02E06_-_Peekaboo_4fa214b5306ffbbe04b7e4d0ad7c6b10.webm",
      "createdTime": "2023-12-01T10:09:48.146Z",
      "modifiedTime": "2023-12-01T10:09:48.146Z"
  },
  {
      "mimeType": "video/webm",
      "size": "129495532",
      "id": "1_7CkjYsNRvN77DbK_taAMwhIB8jOLd9U",
      "name": "Breaking_Bad_-_S02E07_-_Negro_y_Azul_be9cadce70a1a26aa6ceb6fae2931301.webm",
      "createdTime": "2023-12-01T10:39:30.590Z",
      "modifiedTime": "2023-12-01T10:39:30.590Z"
  },
  {
      "mimeType": "video/webm",
      "size": "129338094",
      "id": "1zOzUc2FGiJCTTfzDh6TsGpDNLU-oF4-t",
      "name": "Breaking_Bad_-_S02E08_-_Better_Call_Saul_d2a477d0446c37a5b0a0c94af83f583b.webm",
      "createdTime": "2023-12-01T10:58:01.301Z",
      "modifiedTime": "2023-12-01T10:58:01.301Z"
  },
  {
      "mimeType": "video/webm",
      "size": "129061585",
      "id": "1hLsl8shj3LAGSUWt2vpdrugcuWprE6Ia",
      "name": "Breaking_Bad_-_S02E09_-_4_Days_Out_ade341013452656a08c4ac59195097b0.webm",
      "createdTime": "2023-12-01T11:02:10.220Z",
      "modifiedTime": "2023-12-01T11:02:10.220Z"
  },
  {
      "mimeType": "video/webm",
      "size": "128887481",
      "id": "1kQBK_9qJRHfEuL7xpoAbSNL-0hUEBr3F",
      "name": "Breaking_Bad_-_S02E12_-_Phoenix_2d9f55124c0b71fa86ba224bb5c92720.webm",
      "createdTime": "2023-12-02T09:39:46.638Z",
      "modifiedTime": "2023-12-02T09:39:46.638Z"
  }]
  l.forEach(async ({id,name}) => {
    d=await deleteFile("1efxX9c--8mNlNcyURPTpWoHYi8ic3Ia1",{_service:service})
  log(d,name)
  });
  // file= await listFilesOnly(arg).then(log)
  // log(file)
})();
