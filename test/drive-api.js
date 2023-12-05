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

      const stream = fs.createReadStream(name, { start: fds })
      stream.pipe(fs.createWriteStream(_name))
        .on("close", () => {
          stream.close();
          fs.unlinkSync(name)
          clearInterval(d)
          logUpdate(`(${file.name}) -completed`)
          // logUpdate.done();
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
      logUpdate("retring: file-id-err" + pg())
      setTimeout(function () {
        __foo(...arg)
      }, 200)
      return prom
    }
    if (!file) {
      resolve()
      return log("file not found")
    }
    const _name = path.join(_path, file.name);
    const name = _name + ".pending";

    let start = 0,
      _exist = fs.existsSync(_name),
      fds = (file.size + "").length,
      fd;

    if (fs.existsSync(name)) {
      fd = fs.openSync(name, "r+")
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
        fs.writeFile(_name, Buffer.alloc(file.size), err => {
          if (err) log(err)
        })
      }
      fs.writeFileSync(name, buf)
      fd = fs.openSync(name, "r+")
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

    res.on("end", function (e) {
      if (!active) {
        kill()
        return
      }
      logUpdate(`downloading: ${Size(start)} - ${Size(file.size)}`)
      // logUpdate.done()
      title(`downloading: done!`)
      byteSize("D")
      close()
      setFile()
    })

    res.on("data", function (e) {
      if (!active) {
        kill(res)
        return
      }
      write(e)
      logUpdate(`downloading: ${Size(start, true)} - ${Size(file.size)} - (speed: ${Size(e.length)})`)
      const pStart = start
      clearTimeout(timeout)
      timeout = setTimeout(() => {
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

  const arg = { _service: service }

  let app_data;
  if (!fs.existsSync(app_data_path)) {
    app_data = await listFilesOnly(arg)
    fs.writeFileSync(app_data_path, JSON.stringify(app_data))
  } else {
    app_data = fs.readFileSync(app_data_path)
    app_data = JSON.parse(app_data)
  }
  function setDataSet() {
    let n = parseInt(prvn % max_page);
    n = n < 0 ? 0 : n;
    prvn = (pageId * max_page) + n
    usr_ipt = prvn + 1
    render.check(prvn)
    // print(`n:${n}, prvn:${prvn}, ${!(!app_data[prvn])}, ${pageId}`)
    app_data[prvn] && setItem(app_data[prvn], prvn, true)
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
  function close() {
    busy = active = CMD = false
    print.add("home_cmd", HC)
    print.add("header", "")
    print.add("title", "")
    print.add("body", "")
    print.drop()
    //data = app_data[prvn]
    //data && setItem(data, prvn)
  }
  function setItem({ name }, key, s, int) {
    key += 1;
    const n = key - (pageId * max_page)
    if (n <= 0 || n > max_page) {
      return
    }
    if (int) {
      print.add("item-" + (n),
        `${chalk.blue((key) + ")")} ${s ? chalk.yellow(name) : name}\n`)
    } else {
      print("item-" + (n),
        `${chalk.blue((key) + ")")} ${s ? chalk.yellow(name) : name}\n`)
    }
  }

  function send() {
    fille = null
    let n = Number(usr_ipt);
    usr_ipt = ""
    print("input", IC)
    if (!n) return close();
    n -= 1;
    const data = app_data[n];
    if (!data) return close();
    let d = n;
    d = d / max_page;
    d = parseInt(d)
    if (d !== pageId) {
      pageId = d
      print(d)
      render()
    }
    if (prvn >= 0) setItem(app_data[prvn], prvn)
    prvn = n
    file = data
    setItem(data, n, true)
    CMD = true
    active = true
    print("home_cmd", EC)
  }



  const IC = "Type..."
  const HC = `
  [Ctrl+N]: Next page
  [Ctrl+P]: previous page
  [Ctrl+R]: Refresh page
  `
  const BS = "[esc]: escape"
  const IV = `Invalid Command.\n${BS}`
  const EC = `
  Enter Command
  [Ctrl+D]: download,
  [Ctrl+F]: info, 
  [delete], 
  [enter]: execute input, 
  [esc]: cancel`

  //#region 
  keypress(process.stdin)
  let key_cmd = {
    escape: () => {
      if (!escapable) return print("body", "This process will automatically exit once done, untill then please hold");
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
      n: () => {
        render.next()
        const data = app_data[prvn]
        data && setItem(data, prvn, true)

      },
      p: () => {
        render.prev()
        const data = app_data[prvn]
        data && setItem(data, prvn, true)
      },
      r: async () => {
        print("header", "Refresh")
        print("title", "Sorting Data")
        print("body", "Please wait, this should not take long")

        escapable = false;
        try {
          app_data = await listFilesOnly(arg)
          thd.once("message", data => {
            escapable = true;
            close()
            setDataSet()
          })
          thd.postMessage({
            id,
            type: "refresh",
            app_data
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
        print("input", `~${chalk.bgBlue.bold(usr_ipt)}~`)
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
        print("input", `~${chalk.bgBlue.bold(usr_ipt)}~`)
      },
      left: () => {
        if (render.prev(prvn - max_page) && app_data[prvn]) {
          const data = app_data[prvn]
          setItem(data, prvn, true)
          usr_ipt = prvn + 1
          print("input", `~${chalk.bgBlue.bold(usr_ipt)}~`)
        }

      },
      right: () => {
        if (render.next(prvn + max_page) && app_data[prvn]) {
          const data = app_data[prvn]
          setItem(data, prvn, true)
          usr_ipt = prvn + 1
          print("input", `~${chalk.bgBlue.bold(usr_ipt)}~`)

        }
      },
    },
    file: {
      d: () => {
        print("header", "Initializing Download")
        // print("title", "Resolving...")
        download(file.id).then(() => {
          // print("header", "")
          // print("title", "")
          print("body", "")
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
      },
      delete: async () => {
        escapable = false;
        print("header", file.name)
        print("title", "Deleting...")
        print("body", "Please wait, this should not take long")
        const id = thd.id += 1
        const del = await deleteFile(file.id, arg)
        if (!del) print("title", "Looks like this file no longer exist")
        thd.once("message", data => {
          app_data = data
          escapable = true;
          close()
          setDataSet()
        })
        thd.postMessage({
          id,
          type: "delete",
          index: file.id,
          app_data
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
  const max_page = 10;
  let pageId = 0;
  let pageKey = 0;

  var t;
  setDataSet()

  print("input", IC)
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
    if (name === "return") {
      key_cmd.return();
      return
    }

    if (!ctrl) {
      if (name === "backspace") {
        if (typeof usr_ipt !== "string") usr_ipt += ""
        usr_ipt && (usr_ipt = usr_ipt.substring(0, usr_ipt.length - 1))
      } else {
        usr_ipt += ch || ""
      }
      print("input", usr_ipt.trim() || IC)
    }



    if (busy) return;
    if (CMD) {
      busy = true
      if (ctrl) {
        if (key_cmd.file[name]) {
          key_cmd.file[name]()
        } else {
          print("home_cmd", IV)
          return
        }
      } else if (name === "delete") {
        key_cmd.file.delete()
      }
      print("home_cmd", BS)
      return
    }

    if (ctrl) {
      if (key_cmd.main[name]) {
        key_cmd.main[name]()
        return
      }
    }
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()
})();
