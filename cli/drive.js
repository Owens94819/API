const { log } = require('console');
const chalk = require('chalk');
// log(chalk.bgBlue.bold)
const keypress = require('keypress');
const { Worker, MessageChannel } = require('node:worker_threads');
const prompt = require('prompt');
const { EventEmitter } = require('stream');
const LocalStorage = require('./localStorage.js');
// const { escape } = require('querystring');
// const { send, kill } = require('process');

// const logUpdate = require('log-update');
(async () => {
  const app_data_path = "temp/app-data.json";
  const app_localStorage_path = "temp/localStorage";
  const _path = "temp/downloads"

  const localStorage = new LocalStorage(app_localStorage_path)

  const thd = new Worker("./cli/data.worker.js", {
    workerData: {
      _path,
      app_data_path
    }
  })

  thd.id = 0;

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

  async function download(id, prom_h, prom, puts) {
    function log(...arg) {
      puts("header", arg.join("\n"))
    }

    function logUpdate(...arg) {
      puts("body", arg.join("\n"))
    }
    function title(...arg) {
      // log(...arg)
      puts("title", arg.join("\n"))
    }
    function setFile() {
      event.off("cancel", kill)
      if (!fs.existsSync(origin_name)) {
        fs.writeFileSync(origin_name, "")
      }

      pg(true)
      const d = setInterval(() => {
        logUpdate("setting " + file.name.substring(0, 35) + pg())
      }, 200)

      const p = fs.createReadStream(pending_name, { start: fds });
      const o = fs.createWriteStream(origin_name)
      let closed;

      function cancel() {
        closed = true
        p.close();
        o.close();
        puts("header", "resolving so process")
        clearInterval(d)
        resolve()
      }
      p.pipe(o)
        .on("close", () => {
          event.off("cancel", cancel)
          if (closed) return;
          fs.unlinkSync(pending_name)
          clearInterval(d)
          logUpdate(`(${file.name}) -completed`)
          resolve()
        })

      event.once("cancel", cancel)
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
      let res;
      writing = new Promise(r => res = r)
      if (data instanceof Buffer) {
        fs.writeSync(fd, data, 0, null, fds + start)
      } else {
        fs.writeSync(fd, data, fds + start)
      }
      start += data.length;
      byteSize(start)
      res()
      writing = void 0;
    }
    function kill() {
      res && res.destroy();
      (typeof fd === "number") && close();
      resolve();
    }


    let writing;
    let file;
    let res;
    let fd;
    let resolve;
    let reject;
    let start;
    let origin_exist;
    let fds;

    event.once("cancel", kill)


    if (!prom_h) {
      prom = new Promise((res, rej) => {
        resolve = res
        reject = rej
        prom_h = [res, rej]
      })
    } else {
      resolve = prom_h[0]
      reject = prom_h[1]
    }

    const __foo__ = arguments.callee
    const __foo = function () {
      event.off("cancel", kill)
      __foo__(...arguments).catch(reject)
    }

    const arg = [id, prom_h, prom, puts]

    try {
      if (typeof id === "object"&&id.id) {
        file = id
      } else {
        file = await findFileById({ _service: service, id })
      }
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
      log("file not found")
      return prom;
    }

    if (!fs.existsSync(_path)) fs.mkdirSync(_path)
    const origin_name = path.join(_path, file.name);
    const pending_name = origin_name + ".pending";

    start = 0,
      origin_exist = fs.existsSync(origin_name),
      fds = (file.size + "").length;

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
      if (origin_exist) {
        log("Waiting for input...")
        logUpdate("")
        const val = await prompt("file exist, wish to overwrite? (y/n)")
        if (val.trim().toLowerCase() !== "y") {
          logUpdate("terminated"), resolve();
          return prom
        }
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
      return prom
    }


    async function fetch() {
      if (writing) await writing;

      log(file.name)
      const req = await getPortionOfFile(id, { MAX_BUFFER: 1500_000, TIMEOUT: 40_000, startByte: start, endByte: file.size, _service: service }).catch(err => { log(err) });

      if (!req || !req.stream) {
        logUpdate("retring" + pg())
        setTimeout(fetch, 1000)
        return
      }
      res = req.stream


      logUpdate(`pending: ${Size(start)} - ${Size(file.size, true)}`);

      res.on("end", function () {
        logUpdate(`downloading: ${Size(start)} - ${Size(file.size)}`)
        title(`downloading: done!`)
        byteSize("D")
        close()
        setFile()
      })

      res.on("timeout", function () {
        logUpdate("retry from: " + Size(start))
        setTimeout(fetch, 1000)
      })

      res.on("error", function () {
        logUpdate("An Error occured.\nNow retrying: " + Size(start))
        setTimeout(fetch, 1000)
      })

      res.on("data", function (e) {
        write(e)
        logUpdate(`downloading: ${Size(start, true)} - ${Size(file.size)} - (speed: ${Size(e.length)})`)
      })
    }
    fetch();
    return prom
  }

  const arg = { _service: service }
  const event = new EventEmitter();
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
    usr_ipt = pageCurrentIndex
    pageCurrentIndex -= 1
    render.check(pageCurrentIndex)
    app_data[pageCurrentIndex] && setItem(app_data[pageCurrentIndex], pageCurrentIndex, true)
    puts.add("input_header", IH)
    if (getMaxIndex()) {
      num(usr_ipt)
    } else {
      num(false)
    }
  }

  function getPageId(n = pageCurrentIndex) {
    let pageId = n / max_page_index;
    pageId = parseInt(pageId)
    return pageId
  }
  function getMaxIndex() {
    return app_data.length ? Number(app_data.length - 1) : 0;
  }
  function maxPage() {
    var len = (getMaxIndex()) / max_page_index
    if (len.toString().includes(".")) {
      len = parseInt(len)
    }
    return len
  }
  function render() {
    const pageId = getPageId();
    var id = pageId * max_page_index;
    let _i = 0;
    for (let i = id; i < (id + max_page_index); i++) {
      _i += 1;
      if (!app_data[i]) {
        puts.add("item-" + (_i), "")
        continue;
      };
      setItem(app_data[i], i, void 0, true)
    }
    puts.drop();
    return true
  }

  render.i = 0

  render.next = (_pageCurrentIndex) => {
    pageCurrentIndex += max_page_index
    if (pageCurrentIndex > getMaxIndex()) {
      pageCurrentIndex = getMaxIndex()
    } else {
      if (typeof _pageCurrentIndex === "number" && app_data[_pageCurrentIndex]) {
        pageCurrentIndex = _pageCurrentIndex
      } else {
        const pageId = getPageId();
        let n = (max_page_index - 1)
        pageCurrentIndex = (pageId * max_page_index) + n

        while (!app_data[pageCurrentIndex] && getMaxIndex() > 0) {
          n -= 1
          pageCurrentIndex = (pageId * max_page_index) + n
        }
      }
    }
    return render()
  }
  render.prev = (_pageCurrentIndex) => {
    pageCurrentIndex -= max_page_index
    if (pageCurrentIndex < 0) {
      pageCurrentIndex = 0
    } else {
      const pageId = getPageId();

      if (typeof _pageCurrentIndex === "number" && app_data[_pageCurrentIndex]) {
        pageCurrentIndex = _pageCurrentIndex
      } else {
        pageCurrentIndex = (pageId * max_page_index) + (max_page_index - 1)

      }
    }
    return render()
  }
  render.check = (_pageCurrentIndex) => {
    while (pageCurrentIndex > getMaxIndex() && (pageCurrentIndex > 0 || (pageCurrentIndex = 0))) {
      pageCurrentIndex -= max_page_index
    }
    if (typeof _pageCurrentIndex === "number" && app_data[_pageCurrentIndex]) {
      pageCurrentIndex = _pageCurrentIndex
    } else {
      pageCurrentIndex = (getPageId() * max_page_index)
    }
    return render()
  }
  async function close(blk, noDrop) {
    event.emit("cancel")
    busy = active = CMD = false
    puts.add("home_cmd", blk ? "" : HC)
    puts.add("input_header", IH)

    puts.add("header", "")
    puts.add("title", "")
    puts.add("body", "")
    !noDrop && puts.drop()
  }
  function setItem({ name }, key, s, int) {
    key += 1;
    const n = key - (getPageId() * max_page_index)
    if (n <= 0 || n > max_page_index) {
      return
    }
    if (s) localStorage.setItem("pageCurrentIndex", pageCurrentIndex + 1)
    const msg = `${chalk.bgBlue(key + ")")} ${s ? chalk.bgYellow(name) : name}\n`
    if (int) {
      puts.add("item-" + (n), msg)
    } else {
      puts("item-" + (n), msg)
    }
  }

  function send() {
    const pageId = getPageId()
    fille = null
    let n = Number(usr_ipt);
    usr_ipt = ""
    num(false)
    if (!n) return close();
    n -= 1;
    const data = app_data[n];
    if (!data) return close();
    const d = getPageId(n);
    const _pageCurrentIndex = pageCurrentIndex;
    pageCurrentIndex = n;

    if (d !== pageId) {
      render()
    }
    if (_pageCurrentIndex >= 0 && _pageCurrentIndex !== pageCurrentIndex) setItem(app_data[_pageCurrentIndex], _pageCurrentIndex)
    setItem(data, pageCurrentIndex, true)
  }

  function num(usr_ipt) {
    if (usr_ipt === false) {
      let DF = IC;
      if (typeof INPUT_PAUSED === "string" && INPUT_PAUSED.trim()) {
        DF = INPUT_PAUSED;
      }
      puts("input", chalk`{gray ~}{bgBlue.italic ${DF}}{gray ~}`)
    } else {
      puts("input", chalk`{gray ~}{bgBlue.bold ${usr_ipt}}{gray ~}`)
    }
  }
  async function prompt(_IC) {
    return new Promise((r, j) => {
      if (typeof _IC !== "string" || !_IC.toString().trim()) {
        j("Invalid INPUT")
        return
      }
      usr_ipt = "";
      INPUT_PAUSED = true
      _IC = _IC.toUpperCase();
      puts.add("input_header", _IC + ":")
      num(IC)
      function cancel() {
        puts.add("input_header", IH)
        j();
        event.off("message", msg)
        INPUT_PAUSED = false
      }
      function msg() {
        usr_ipt = "";
        puts.add("input_header", IH)
        puts("input", IC)

        event.off("cancel", cancel)
        r(...arguments)
        INPUT_PAUSED = false
      }
      event.once("message", msg)
      event.once("cancel", cancel)
    })
  }

  const IH = ""
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
    escape: (puts) => {
      if (!escapable) return puts("body", "This process should automatically exit once done, untill then please hold");
      close()
    },
    return: (puts) => {
      if (CMD) {
        key_cmd.file.return()
      } else {
        key_cmd.main.return()
      }
    },
    main: {
      r: async (puts) => {
        puts.add("home_cmd", ES)
        puts.add("header", "Refresh")
        puts.add("title", "Sorting Data")
        puts("body", "Please wait, this should not take long")
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
          puts("body", "process Failed. you can [esc] and try again.\n" + err)
          escapable = true;
          return
        }
      },
      return: (puts) => {
        send()
      },
      s: (puts) => {
        busy = true;
        puts("home_cmd", ES)
        puts("body", "use [enter] to submit")
        key_cmd.busy.push({
          name: "return", cb: () => {
            let s = usr_ipt.toString().toLowerCase().trim();
            const rst = [];
            app_data.map(v => v.name.toLowerCase().includes(s) && rst.push(v))
            if (rst.length === 0) {
              puts("home_cmd", ER)
            } else {
              app_data = rst
              pageCurrentIndex = 0;
              setDataSet()
            }
            busy = false
            key_cmd.global.push({
              name: "escape", cb: () => key_cmd.main.z(puts)
            })
          }
        })
      },
      z: (puts) => {
        app_data = _app_data
        pageCurrentIndex = 0;
        close()
        setDataSet()
      },
      up: (puts) => {
        const m = (getPageId() * max_page_index)
        let n = pageCurrentIndex - 1
        const data = app_data[n]
        if (!data) return;
        if (n < m) {
          render.prev()
        } else {
          if (pageCurrentIndex >= 0) setItem(app_data[pageCurrentIndex], pageCurrentIndex)
        }
        pageCurrentIndex = n
        setItem(data, pageCurrentIndex, true)
        usr_ipt = pageCurrentIndex + 1
        num(usr_ipt)
      },
      down: (puts) => {
        const m = (getPageId() * max_page_index) + max_page_index
        let n = pageCurrentIndex + 1
        const data = app_data[n]
        if (!data) return;
        if (n >= m) {
          render.next()
        } else {
          if (pageCurrentIndex >= 0) setItem(app_data[pageCurrentIndex], pageCurrentIndex)
        }
        pageCurrentIndex = n
        setItem(data, pageCurrentIndex, true)
        usr_ipt = pageCurrentIndex + 1
        num(usr_ipt)
      },
      left: (puts) => {
        if (render.prev(pageCurrentIndex - max_page_index) && app_data[pageCurrentIndex]) {
          const data = app_data[pageCurrentIndex]
          setItem(data, pageCurrentIndex, true)
          usr_ipt = pageCurrentIndex + 1
          num(usr_ipt)
        }

      },
      right: (puts) => {
        if (render.next(pageCurrentIndex + max_page_index) && app_data[pageCurrentIndex]) {
          const data = app_data[pageCurrentIndex]
          setItem(data, pageCurrentIndex, true)
          usr_ipt = pageCurrentIndex + 1
          num(usr_ipt)
        }
      },
    },
    file: {
      d: (puts) => {
        puts.add("header", "Initializing Download")
        puts("body", "Looking up file")
        key_cmd.busy.push({
          name: "return", cb: () => {
            if (INPUT_PAUSED) {
              event.emit("message", usr_ipt)
            }
          }
        })
        try {
          download(file.id, null, null, puts).then(() => {
            puts("body", "Download Resolved")
            busy = false
          }).catch(err => {
            puts("body", "Download Error: " + err)
          })
        } catch (error) {
          puts("body", "Catch Download Error(2): " + error)
        }
      },
      f: (puts) => {
        puts("body", `
              name: ${file.name}
              size: ${Size(file.size)}
              id: ${file.id}
              modifiedTime: ${file.modifiedTime}
              mimeType: ${file.mimeType}
              `)
        busy = false
      },
      delete: async (puts) => {
        escapable = false;
        puts("header", file.name)
        puts("title", "Deleting...")
        puts("body", "Please wait, this should not take long")
        const id = thd.id += 1
        const del = await deleteFile(file.id, arg)
        if (del === false) {
          puts("title", "Looks like this file no longer exist")
        } else if (typeof del === "string") {
          puts("title", del)
          puts("body", "")
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
          puts("body", "Successfully Deleted!")
          setDataSet()
        })
        thd.postMessage({
          id,
          type: "delete",
          index: file.id,
          app_data,
          _app_data
        })
      }
    },
    busy: [],
    global: []
  }

  const max_page_index = localStorage.getItem('max_page_index') || 5;
  let pageCurrentIndex = localStorage.getItem('pageCurrentIndex') || 1;

  let file = null;
  let CMD = false;
  INPUT_PAUSED = false
  let escapable = true;

  let usr_ipt = "";
  let busy = false


  setDataSet()
  puts("home_cmd", HC)
  puts("header", "")
  puts("title", "")
  puts("body", "")

  //#endregion

  process.stdin.on("keypress", async (ch, arg) => {
    if (arg) var { name, ctrl } = arg;
    if (ctrl && name === "c") return process.exit();
    let _puts = function () {
      if (false) {
        _puts = () => { }
        return
      }
      print(...arguments)
    }
    let puts = function () {
      _puts(...arguments)
    }
    puts.add = print.add
    puts.drop = print.drop
    function cancel() {
      puts.add = puts.drop = _puts = () => { }
    }
    function get_cmd(once) {
      !once && event.once("cancel", cancel)
      return key_cmd
    }

    if (busy) {
      const foo = get_cmd(true).busy.find(val => !val.ctrl === !ctrl && (val.name === name || val.name === ch))
      if (foo) {
        get_cmd().busy = [];
        foo.cb(puts)
        return
      };
    } else {
      const foo = get_cmd(true).global.find(val => !val.ctrl === !ctrl && (val.name === name || val.name === ch))
      if (foo) {
        get_cmd().global = [];
        foo.cb(puts)
        return
      };
    };


    if (name === "escape") {
      key_cmd.escape()
      return
    }

    if (!ctrl) {
      if (name === "backspace") {
        if (typeof usr_ipt !== "string") usr_ipt += ""
        usr_ipt && (usr_ipt = usr_ipt.substring(0, usr_ipt.length - 1))
      } else {
        usr_ipt += ch || ""
      }
      num(usr_ipt.trim() || false)
    }

    if (busy) return

    if (ctrl) {
      if (get_cmd(true).main[name]) {
        close()
        get_cmd().main[name](puts)
        return
      } else if (get_cmd(true).file[name]) {
        file = app_data[pageCurrentIndex]
        if (!file) return
        close(true, true)
        puts("home_cmd", ES)
        busy = true
        await get_cmd().file[name](puts)
        return
      } else {
        close(true, true)
        puts("home_cmd", IV)
      }
    } else if (name === "delete") {
      file = app_data[pageCurrentIndex]
      if (!file) return
      close(true, true)
      puts("home_cmd", ES)
      busy = true
      await get_cmd().file.delete(puts)
      return
    } else if (name === "return") {
      get_cmd().main.return(puts);
      return
    }
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()
})();
