const { log } = require('console');
const chalk = require('chalk');
// log(chalk.bgBlue.bold)
const keypress = require('keypress');
const { Worker, MessageChannel } = require('node:worker_threads');
const prompt = require('prompt');
// const { escape } = require('querystring');
// const { send, kill } = require('process');

// const logUpdate = require('log-update');
(async () => {
  const app_data_path = ".bin/app-data.json";
  const _path = ".bin/downloads"

  const thd = new Worker("./test/data.worker.js", {
    workerData: {
      _path,
      app_data_path
    }
  })
  thd.id = 0;

  // return
  const { default: logUpdate } = await import('log-update')

  function pg(n) {
    if (n || pg.i.length > 3) {
      pg.i = ""
    } else {
      pg.i += "."
    }
    return pg.i
  }
  pg.i = ""
  function Size(n, f) {
    var t;
    if (n < Size._kb) {
      //b
      t = "b"
    } else if (n < Size._mb) {
      // kb
      t = "kb"
      n = n / Size._kb
    } else if (n < Size._gb) {
      //mb
      t = "mb"
      n = n / Size._mb
    } else {
      //gb
      t = "gb"
      n = n / Size._gb
    }
    if (!f) n = parseInt(n)
    //((n) / 1024) / 1024
    return n + t
  }
  Size._kb = 1024
  Size._mb = Size._kb * Size._kb
  Size._gb = Size._mb * Size._mb

  TEST = true
  const md = './x/MY-GOOGLE-DRIVE/index.js';
  const exp = _require(md, "Response");
  const { listFiles, oauth2Client, getPortionOfFile, listFilesOnly, deleteFile, service, findFileById, findFileByName, _listFilesOnly, getLastFile } = exp;
  TEST = false;

  const fs = require('fs');
  const path = require('path');
  const https = require('https');

  !fs.existsSync(_path) && fs.mkdirSync(_path)

  async function download(id, resolve, prom) {

    function log(...arg) {
      print("header", arg.join("\n"))
    }
    function logUpdate(...arg) {
      print("body", arg.join("\n"))
    }
    function title(...arg) {
      // log(...arg)
      print("title", arg.join("\n"))
    }
    function setFile() {
      pg(true)
      const d = setInterval(() => {
        if (!active) {
          print("header", "resolving so process")
          clearInterval(d)
          return;
        }
        logUpdate("setting " + file.name.substring(0, 35) + pg())
      }, 200)

      fs.createReadStream(pending_name, { start: fds })
        .pipe(fs.createWriteStream(origin_name))
        .on("close", () => {
          fs.unlinkSync(pending_name)
          clearInterval(d)
          logUpdate(`(${file.name}) -completed`)
          resolve()
        })
    }
    function close() {
      fs.closeSync(fd)
    }
    function byteSize(val) {
      const buf = Buffer.alloc(fds)
      buf.fill(" ").write("" + val)
      fs.writeSync(fd, buf, 0, null, 0)
    }
    function write(data) {
      if (data instanceof Buffer) {
        fs.writeSync(fd, data, 0, null, fds + start)
      } else {
        fs.writeSync(fd, data, fds + start)
      }
      start += data.length;
      byteSize(start)
    }
    function kill(res) {
      res && res.destroy()
      close()
      resolve();
    }

    let file;
    const __foo = arguments.callee
    if (!resolve) {
      prom = new Promise((res, rej) => {
        resolve = res
      })
    }
    const arg = [id, resolve, prom]
    if (!active) {
      resolve();
      return prom
    }

    try {
      file = await findFileById({ _service: service, id })
      file.size = Number(file.size)
    } catch (error) {
      logUpdate("Retring: file-id-err" + pg())
      setTimeout(function () {
        __foo(...arg)
      }, 200)
      return prom
    }
    if (!file) {
      resolve()
      return log("file not found")
    }
    const origin_name = path.join(_path, file.name);
    const pending_name = origin_name + ".pending";

    let start = 0,
      _exist = fs.existsSync(origin_name),
      fds = (file.size + "").length,
      fd;

    if (fs.existsSync(pending_name)) {
      fd = fs.openSync(pending_name, "r+")
      start = Buffer.alloc(fds)
      fs.readSync(fd, start, 0, start.length, 0)
      start = start.toString().trim()
      if (start === "D") {
        setFile()
        return prom
      }
      start = +start
    } else {
      const buf = Buffer.alloc(fds)
      buf.fill(" ").write("0")
      if (_exist) {
        INPUT_PAUSED = true
        const q = "file exist, want to conti..(y/n)"
        const val = (await prompt.get(q))[q]
        if (val.trim().toLowerCase() !== "y") return logUpdate("terminated"), resolve();
        INPUT_PAUSED = false
      } else {
        fs.writeFile(origin_name, Buffer.alloc(file.size), err => {
          if (err) log(err)
        })
      }
      fs.writeFileSync(pending_name, buf)
      fd = fs.openSync(pending_name, "r+")
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
      logUpdate("retring" + pg())
      return __foo(...arg)
    }

    logUpdate(`pending: ${Size(start)} - ${Size(file.size, true)}`);

    let timeout;

    res.on("end", function () {
      if (!active) {
        kill()
        return
      }
      logUpdate(`downloading: ${Size(start)} - ${Size(file.size)}`)
      title(`downloading: done!`)
      byteSize("D")
      close()
      setFile()
    })

    res.on("timeout", function () {
      logUpdate("retry from: " + Size(start))
      close()
      __foo(...arg)
    })

    res.on("error", function () {
      logUpdate("An Error occured.\nNow retrying: " + Size(start))
      close()
      __foo(...arg)
    })

    res.on("data", function (e) {
      if (!active) {
        kill(res)
        return
      }
      write(e)
      logUpdate(`downloading: ${Size(start, true)} - ${Size(file.size)} - (speed: ${Size(e.length)})`)
    })
    return prom
  }

  const arg = { _service: service }

  let _app_data;
  let app_data;
  if (!fs.existsSync(app_data_path)) {
    _app_data = app_data = await listFilesOnly(arg)
    fs.writeFileSync(app_data_path, JSON.stringify(app_data))
  } else {
    app_data = fs.readFileSync(app_data_path)
    _app_data = app_data = JSON.parse(app_data)
  }
  function setDataSet() {
    let n = parseInt(prvn % max_page);
    n = n < 0 ? 0 : n;
    prvn = (pageId * max_page) + n
    usr_ipt = prvn + 1
    render.check(prvn)
    // print(`n:${n}, prvn:${prvn}, ${!(!app_data[prvn])}, ${pageId}`)
    app_data[prvn] && setItem(app_data[prvn], prvn, true)
    if (app_data.length) {
      num(usr_ipt)
    } else {
      num(false)
    }
  }

  function render() {
    var id = pageId * max_page;
    let _i = 0;
    for (let i = id; i < (id + max_page); i++) {
      _i += 1;
      if (!app_data[i]) {
        print.add("item-" + (_i), "")
        continue;
      };
      setItem(app_data[i], i, void 0, true)
    }
    print.drop();
    return true
  }
  render.i = 0

  render.len = () => {
    var len = app_data.length / max_page
    if (len.toString().includes(".")) {
      len = parseInt(len) + 1
    }
    return len
  }
  render.next = (_prvn) => {
    pageId += 1
    if (pageId >= render.len()) {
      pageId -= 1
      return
    }
    if (typeof _prvn === "number" && app_data[_prvn]) {
      prvn = _prvn
    } else {
      let n = (max_page - 1)
      prvn = (pageId * max_page) + n

      while (!app_data[prvn] && app_data.length > 0) {
        n -= 1
        prvn = (pageId * max_page) + n
      }
    }

    return render()
  }
  render.prev = (_prvn) => {
    pageId -= 1
    if (pageId < 0) {
      pageId = 0
      return
    }
    if (typeof _prvn === "number" && app_data[_prvn]) {
      prvn = _prvn
    } else {
      prvn = (pageId * max_page) + (max_page - 1)

    }
    return render()
  }
  render.check = (_prvn) => {
    if (pageId > render.len()) {
      while (render.len() >= pageId && pageId > 0) {
        pageId -= 1
      }
    }
    if (typeof _prvn === "number" && app_data[_prvn]) {
      prvn = _prvn
    } else {
      prvn = (pageId * max_page)

    }
    return render()
  }
  function close(blk, noDrop) {
    busy = active = CMD = false
    print.add("home_cmd", blk ? "" : HC)
    print.add("header", "")
    print.add("title", "")
    print.add("body", "")
    !noDrop && print.drop()
    //data = app_data[prvn]
    //data && setItem(data, prvn)
  }
  function setItem({ name }, key, s, int) {
    key += 1;
    const n = key - (pageId * max_page)
    if (n <= 0 || n > max_page) {
      return
    }
    const msg = `${chalk.bgBlue(key + ")")} ${s ? chalk.bgYellow(name) : name}\n`
    if (int) {
      print.add("item-" + (n), msg)
    } else {
      print("item-" + (n), msg)
    }
  }

  function send() {
    fille = null
    let n = Number(usr_ipt);
    usr_ipt = ""
    num(false)
    if (!n) return close();
    n -= 1;
    const data = app_data[n];
    if (!data) return close();
    let d = n;
    d = d / max_page;
    d = parseInt(d)
    if (d !== pageId) {
      pageId = d
      render()
    }
    if (prvn >= 0) setItem(app_data[prvn], prvn)
    prvn = n
    // file = data
    setItem(data, n, true)
    // CMD = true
    // active = true
    // print("home_cmd", EC)
  }

  function num(usr_ipt) {
    if (usr_ipt === false) {
      print("input", chalk`{gray ~}{bgBlue.italic ${IC}}{gray ~}`)
    } else {
      print("input", chalk`{gray ~}{bgBlue.bold ${usr_ipt}}{gray ~}`)
    }
  }


  const IC = chalk`Type...`
  const HC = chalk`
  [{yellow Ctrl}+{yellow Right}]: Next page
  [{yellow Ctrl}+{yellow Left}]: Previous page
  [{yellow Ctrl}+{yellow UP}]: Move Up
  [{yellow Ctrl}+{yellow Down}]: Move Down
  {gray ---}
  [{yellow Ctrl}+{yellow R}]: Refresh page
  [{yellow Ctrl}+{yellow D}]: Download
  [{yellow Ctrl}+{yellow F}]: Info
  {gray ---}
  [{yellow Ctrl}+{yellow S}]: Search Input
  [{yellow Ctrl}+{yellow Z}]: Return Home
  {gray ---}
  [{yellow enter}]: Select
  [{yellow delete}]
  `
  const BS = chalk`[{yellow esc}]: escape`
  const IV = chalk`{red Invalid Command}.\n${BS}`
  const ER = chalk`{red Empty Result}.\n${BS}`
  const ES = `${BS}`

  //#region 
  keypress(process.stdin)
  let key_cmd = {
    escape: () => {
      if (!escapable) return print("body", "This process should automatically exit once done, untill then please hold");
      close()
    },
    return: () => {
      if (CMD) {
        key_cmd.file.return()
      } else {
        key_cmd.main.return()
      }
    },
    main: {
      r: async () => {
        print.add("home_cmd", ES)
        print.add("header", "Refresh")
        print.add("title", "Sorting Data")
        print("body", "Please wait, this should not take long")
        const id = thd.id += 1

        escapable = false;
        try {
          app_data = _app_data = await listFilesOnly(arg)
          thd.once("message", data => {
            escapable = true;
            close()
            setDataSet()
          })
          thd.postMessage({
            id,
            type: "refresh",
            _app_data
          })

        } catch (err) {
          print("body", "process Failed. you can [esc] and try again.\n" + err)
          escapable = true;
          return
        }
      },
      return: () => {
        send()
      },
      s: () => {
        let s = usr_ipt.toString().toLowerCase().trim();
        const rst = [];
        app_data.map(v => v.name.toLowerCase().includes(s) && rst.push(v))
        app_data = rst
        prvn = pageId = 0;
        setDataSet()
        if (rst.length === 0) {
          print("home_cmd", ER)
        }
      },
      z: () => {
        app_data = _app_data
        prvn = pageId = 0;
        close()
        setDataSet()
      },
      up: () => {
        const m = (pageId * max_page)
        let n = prvn - 1
        const data = app_data[n]
        if (!data) return;
        if (n < m) {
          // print(999,`n:${n}-m:${m}`)
          render.prev()
        } else {
          if (prvn >= 0) setItem(app_data[prvn], prvn)
        }

        prvn = n
        setItem(data, prvn, true)
        usr_ipt = prvn + 1
        num(usr_ipt)
      },
      down: () => {
        const m = (pageId * max_page) + max_page
        let n = prvn + 1
        const data = app_data[n]
        if (!data) return;
        if (n >= m) {
          render.next()
        } else {
          if (prvn >= 0) setItem(app_data[prvn], prvn)
        }
        prvn = n
        setItem(data, prvn, true)
        usr_ipt = prvn + 1
        num(usr_ipt)
      },
      left: () => {
        if (render.prev(prvn - max_page) && app_data[prvn]) {
          const data = app_data[prvn]
          setItem(data, prvn, true)
          usr_ipt = prvn + 1
          num(usr_ipt)
        }

      },
      right: () => {
        if (render.next(prvn + max_page) && app_data[prvn]) {
          const data = app_data[prvn]
          setItem(data, prvn, true)
          usr_ipt = prvn + 1
          num(usr_ipt)

        }
      },
    },
    file: {
      d: () => {
        active = true
        print.add("header", "Initializing Download")
        print("body","Looking up file")
        download(file.id).then(() => {
          // print("header", "")
          // print("title", "")
          print("body", "")
          active = busy = false
        })
      },
      f: () => {
        print("body", `
              name: ${file.name}
              size: ${file.size}
              id: ${file.id}
              modifiedTime: ${file.modifiedTime}
              mimeType: ${file.mimeType}
              `)
        busy = false
      },
      delete: async () => {
        escapable = false;
        print("header", file.name)
        print("title", "Deleting...")
        print("body", "Please wait, this should not take long")
        const id = thd.id += 1
        const del = await deleteFile(file.id, arg)
        if (del === false) {
          print("title", "Looks like this file no longer exist")
        } else if (typeof del === "string") {
          print("title", del)
          print("body", "")
          escapable = true;
          busy = false
          setDataSet()
          return
        }
        thd.once("message", data => {
          _app_data = data._app_data
          app_data = data.app_data
          escapable = true;
          busy = false
          // close()
        print("body", "Successfully Deleted!")
          setDataSet()
        })
        thd.postMessage({
          id,
          type: "delete",
          index: file.id,
          app_data,
          _app_data
        })
      },
      return: () => {
        // print(usr_ipt)
      }
    }
  }
  let prvn = -1
  let _prvn = -1
  let file = null;
  let CMD = false
  INPUT_PAUSED = false
  let active = false
  let escapable = true;

  let usr_ipt = "";
  let busy = false
  data_set = [];
  const max_page = 5;
  let pageId = 0;
  let pageKey = 0;

  var t;

  setDataSet()
  print("home_cmd", HC)
  print("header", "")
  print("title", "")
  print("body", "")

  //#endregion

  process.stdin.on("keypress", async (ch, arg) => {
    if (arg) var { name, ctrl } = arg;
    if (ctrl && name === "c") return process.exit();
    if (INPUT_PAUSED) return;
    if (name === "escape") {
      key_cmd.escape()
      return
    }
    // if (name === "return") {
    //   key_cmd.return();
    //   return
    // }
    // print("--",`name:${name}-ch:${ch}-ctrl:${ctrl},\n${JSON.stringify(arg)}`)

    if (!ctrl) {
      if (name === "backspace") {
        if (typeof usr_ipt !== "string") usr_ipt += ""
        usr_ipt && (usr_ipt = usr_ipt.substring(0, usr_ipt.length - 1))
      } else {
        usr_ipt += ch || ""
      }
      num(usr_ipt.trim() || false)
    }



    if (busy) return;



    if (ctrl) {
      if (key_cmd.main[name]) {
        close()
        key_cmd.main[name]()
        return
      } else if (key_cmd.file[name]) {
        file = app_data[prvn]
        if (!file) return
        close(true, true)
        print("home_cmd", ES)
        busy = true
        await key_cmd.file[name]()
        return
      } else {
        print("home_cmd", IV)
      }
    } else if (name === "delete") {
      file = app_data[prvn]
      if (!file) return
      close(true, true)
      print("home_cmd", ES)
      busy = true
      await key_cmd.file.delete()
      return
    } else if (name === "return") {
      key_cmd.main.return();
      return
    }
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()
})();
