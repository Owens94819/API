const { log } = require('node:console');
const chalk = require('chalk');
const keypress = require('keypress');
const { Worker } = require('node:worker_threads');
const { EventEmitter } = require('node:stream');
const LocalStorage = _require('./cli/localStorage.js');

(async () => {
  // const app_data_path = "temp/app-data.json";
  // const app_localStorage_path = "temp/localStorage";
  const downloads_path = "temp/downloads"

  let home_app_data = [];
  let app_data = home_app_data;

  const localStorage = new LocalStorage()
  const event = new EventEmitter();

  const thd = new Worker("./cli/data.worker.js", {
    workerData: {
      downloads_path
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

  const fs = require('fs');
  const path = require('path');
  const https = require('https');

  !fs.existsSync(downloads_path) && fs.mkdirSync(downloads_path)

  async function download([id, prom_h, prom], [puts]) {
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
    async function kill() {
      if (writing) await writing;
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

    const __foo__ = download
    const __foo = function () {
      event.off("cancel", kill)
      __foo__(...arguments).catch(reject)
    }

    const arg = [id, prom_h, prom, puts]

    try {
      if (typeof id === "object" && id.id) {
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

    if (!fs.existsSync(downloads_path)) fs.mkdirSync(downloads_path)
    const origin_name = path.join(downloads_path, file.name);
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
        const val = await prompt(["file exist, wish to overwrite? (y/n)"], [puts])
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

  function setDataSet([], []) {
    usr_ipt = pageCurrentIndex + 1
    render.check([pageCurrentIndex], [puts])
    app_data[pageCurrentIndex] && setItem([app_data[pageCurrentIndex], pageCurrentIndex, true], [puts])
    if (getMaxIndex([], [puts])) {
      num([usr_ipt], [puts])
    } else {
      num([false], [puts])
    }
  }

  function setDataWrapper([], []) {
    for (let i = 0; i < max_page_index; i++) {
      puts.add("item-" + (i + 1), "")
    }
  }

  function setDefaults([], []) {
    puts.add("app_header", AH)
    puts.add("input_header", IH)
    num([false, puts.add], [puts])
    puts.add("home_cmd", HC)
    puts.add("header", "")
    puts.add("title", "")
    puts.add("body", "")
    return puts
  }
  function getPageId([n = pageCurrentIndex], []) {
    let pageId = n / max_page_index;
    pageId = parseInt(pageId)
    return pageId
  }
  function getMaxIndex([], []) {
    return app_data.length ? Number(app_data.length - 1) : 0;
  }
  function maxPage([], []) {
    var len = (getMaxIndex([], [])) / max_page_index
    if (len.toString().includes(".")) {
      len = parseInt(len)
    }
    return len
  }
  function render([], []) {
    const pageId = getPageId([], [puts]);
    var id = pageId * max_page_index;
    let _i = 0;
    for (let i = id; i < (id + max_page_index); i++) {
      _i += 1;
      if (!app_data[i]) {
        puts.add("item-" + (_i), "")
        continue;
      };
      setItem([app_data[i], i, void 0, true], [puts])
    }
    puts.drop();
    return true
  }

  render.i = 0

  render.next = ([_pageCurrentIndex], []) => {
    pageCurrentIndex += max_page_index
    if (pageCurrentIndex > getMaxIndex([], [puts])) {
      pageCurrentIndex = getMaxIndex([], [puts])
    } else {
      if (typeof _pageCurrentIndex === "number" && app_data[_pageCurrentIndex]) {
        pageCurrentIndex = _pageCurrentIndex
      } else {
        const pageId = getPageId([], [puts]);
        let n = (max_page_index - 1)
        pageCurrentIndex = (pageId * max_page_index) + n

        while (!app_data[pageCurrentIndex] && getMaxIndex([], [puts]) > 0) {
          n -= 1
          pageCurrentIndex = (pageId * max_page_index) + n
        }
      }
    }
    return render([], [puts])
  }
  render.prev = ([_pageCurrentIndex], []) => {
    pageCurrentIndex -= max_page_index
    if (pageCurrentIndex < 0) {
      pageCurrentIndex = 0
    } else {
      const pageId = getPageId([], [puts]);

      if (typeof _pageCurrentIndex === "number" && app_data[_pageCurrentIndex]) {
        pageCurrentIndex = _pageCurrentIndex
      } else {
        pageCurrentIndex = (pageId * max_page_index) + (max_page_index - 1)

      }
    }
    return render([], [puts])
  }
  render.check = ([_pageCurrentIndex], []) => {
    while (pageCurrentIndex > getMaxIndex([], [puts]) && (pageCurrentIndex > 0 || (pageCurrentIndex = 0))) {
      pageCurrentIndex -= max_page_index
    }
    if (typeof _pageCurrentIndex === "number" && app_data[_pageCurrentIndex]) {
      pageCurrentIndex = _pageCurrentIndex
    } else {
      pageCurrentIndex = (getPageId([], [puts]) * max_page_index)
    }
    return render([], [puts])
  }
  async function close([blk, noDrop], []) {
    event.emit("cancel")
    busy = active = CMD = false
    setDefaults([], [puts])
    puts.add("home_cmd", blk ? "" : HC)
    if (noDrop) {
      num([usr_ipt, puts.add], [puts])
    } else {
      num([usr_ipt], [puts])
    }
  }
  function setItem([{ name }, key, s, int], []) {
    key += 1;
    const n = key - (getPageId([], [puts]) * max_page_index)
    if (n <= 0 || n > max_page_index) {
      return
    }
    if (s) localStorage.setItem("pageCurrentIndex", pageCurrentIndex)
    const msg = `${chalk.bgBlue(key + ")")} ${s ? chalk.bgYellow(name) : name}\n`
    if (int) {
      puts.add("item-" + (n), msg)
    } else {
      puts("item-" + (n), msg)
    }
  }

  function send([], [puts]) {
    const pageId = getPageId([], [puts])
    fille = null
    let n = Number(usr_ipt);
    usr_ipt = ""
    num([false, puts], [puts])
    if (!n) return close([], [puts]);
    n -= 1;
    const data = app_data[n];
    if (!data) return close([], [puts]);
    const d = getPageId([n], [puts]);
    const _pageCurrentIndex = pageCurrentIndex;
    pageCurrentIndex = n;

    if (d !== pageId) {
      render([], [puts])
    }
    if (_pageCurrentIndex >= 0 && _pageCurrentIndex !== pageCurrentIndex) setItem([app_data[_pageCurrentIndex], _pageCurrentIndex], [puts])
    setItem([data, pageCurrentIndex, true], [puts])
  }

  function num([usr_ipt, _puts], []) {
    if (!_puts) _puts = puts
    if (usr_ipt === false || !usr_ipt.toString().trim()) {
      let DF = IC;
      if (typeof INPUT_PAUSED === "string" && INPUT_PAUSED.trim()) {
        DF = INPUT_PAUSED;
      }
      _puts("input", chalk`{gray ~}{bgBlue.italic ${DF}}{gray ~}`)
    } else {
      _puts("input", chalk.gray("~") + chalk.bgBlue.bold(usr_ipt) + chalk.gray("~"))
    }
  }
  async function prompt([_IC], []) {
    return new Promise((r, j) => {
      if (typeof _IC !== "string" || !_IC.toString().trim()) {
        j("Invalid INPUT")
        return
      }
      usr_ipt = "";
      INPUT_PAUSED = true
      _IC = _IC.toUpperCase();
      puts.add("input_header", _IC + ":")
      num([IC], [puts])
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

  let file = null;
  let CMD = false;
  let INPUT_PAUSED = false;
  let busy = true;
  let escapable = true;
  let usr_ipt = "";

  const max_page_index = localStorage.getItem('max_page_index') || 5;

  const AH = ""
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

  puts.add("app_header", "")
  setDataWrapper([], [puts])
  setDefaults([], [puts]).drop()

  //#region 
  keypress(process.stdin)
  let key_cmd = {
    escape: ([], [puts]) => {
      if (!escapable) return puts("body", "This process should automatically exit once done, untill then please hold");
      close([], [puts])
    },
    return: ([], [puts]) => {
      // if (CMD) {
      // key_cmd.file.return()
      // } else {
      key_cmd.main.return([], [puts])
      // }
    },
    main: {
      r: async ([], [puts]) => {
        puts.add("home_cmd", ES)
        puts.add("header", "Refresh")
        puts.add("title", "Sorting Data")
        puts("body", "Please wait, this should not take long")
        const id = thd.id += 1

        escapable = false;
        try {
          app_data = home_app_data = await listFilesOnly(arg)
          thd.once("message", data => {
            escapable = true;
            close([], [puts])
            setDataSet([], [puts])
          })
          thd.postMessage({
            id,
            type: "refresh",
            home_app_data
          })

        } catch (err) {
          puts("body", "process Failed. you can [esc] and try again.\n" + err)
          escapable = true;
          return
        }
      },
      return: ([], [puts]) => {
        send([], [puts])
      },
      s: ([], [puts]) => {
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
              localStorage.setItem("app_data.json", app_data)
              pageCurrentIndex = 0;
              setDataSet([], [puts])
            }
            busy = false
            key_cmd.global.push({
              name: "escape", cb: () => key_cmd.main.z([], [puts])
            })
          }
        })
      },
      z: ([], [puts]) => {
        localStorage.setItem("app_data.json", app_data = home_app_data)
        pageCurrentIndex = 1;
        close([], [puts])
        setDataSet([], [puts])
      },
      up: ([], [puts]) => {
        const m = (getPageId([], [puts]) * max_page_index)
        let n = pageCurrentIndex - 1
        const data = app_data[n]
        if (!data) return;
        if (n < m) {
          render.prev([], [puts])
        } else {
          if (pageCurrentIndex >= 0) setItem([app_data[pageCurrentIndex], pageCurrentIndex], [puts])
        }
        pageCurrentIndex = n
        setItem([data, pageCurrentIndex, true], [puts])
        usr_ipt = pageCurrentIndex + 1
        num([usr_ipt], [puts])
      },
      down: ([], [puts]) => {
        const m = (getPageId([], [puts]) * max_page_index) + max_page_index
        let n = pageCurrentIndex + 1
        const data = app_data[n]
        if (!data) return;
        if (n >= m) {
          render.next([], [puts])
        } else {
          if (pageCurrentIndex >= 0) setItem([app_data[pageCurrentIndex], pageCurrentIndex], [puts])
        }
        pageCurrentIndex = n
        setItem([data, pageCurrentIndex, true], [puts])
        usr_ipt = pageCurrentIndex + 1
        num([usr_ipt], [puts])
      },
      left: ([], [puts]) => {
        if (render.prev([pageCurrentIndex - max_page_index], [puts]) && app_data[pageCurrentIndex]) {
          const data = app_data[pageCurrentIndex]
          setItem([data, pageCurrentIndex, true], [puts])
          usr_ipt = pageCurrentIndex + 1
          num([usr_ipt], [puts])
        }

      },
      right: ([], [puts]) => {
        if (render.next([pageCurrentIndex + max_page_index], [puts]) && app_data[pageCurrentIndex]) {
          const data = app_data[pageCurrentIndex]
          setItem([data, pageCurrentIndex, true], [puts])
          usr_ipt = pageCurrentIndex + 1
          num([usr_ipt], [puts])
        }
      },
    },
    file: {
      d: ([], [puts]) => {
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
          download([file.id, null, null], [puts]).then(() => {
            puts("body", "Download Resolved")
            busy = false
          }).catch(err => {
            puts("body", "Download Error: " + err)
          })
        } catch (error) {
          puts("body", "Catch Download Error(2): " + error)
        }
      },
      f: ([], [puts]) => {
        puts("body", `
              name: ${file.name}
              size: ${Size(file.size)}
              id: ${file.id}
              modifiedTime: ${file.modifiedTime}
              mimeType: ${file.mimeType}
              `)
        busy = false
      },
      delete: async ([], [puts]) => {
        escapable = false;
        puts.add("header", file.name)
          .add("title", "Deleting...")
          .add("body", "Please wait, this should not take long")
          .drop()
        const id = thd.id += 1
        const del = await deleteFile(file.id, arg)
        if (del === false) {
          puts("body", "Looks like this file no longer exist")
          escapable = true;
          busy = false
          setDataSet([], [puts])
          return
        } else if (typeof del === "string") {
          puts("title", del)
          puts("body", "")
          escapable = true;
          busy = false
          setDataSet([], [puts])
          return
        }
        thd.once("message", data => {
          home_app_data = data.home_app_data
          app_data = data.app_data
          escapable = true;
          busy = false
          // close()
          puts("body", "Successfully Deleted!")
          setDataSet([], [puts])
        })
        thd.postMessage({
          id,
          type: "delete",
          index: file.id,
          app_data,
          home_app_data
        })
      }
    },
    busy: [],
    global: []
  }

  let pageCurrentIndex = localStorage.getItem('pageCurrentIndex');
  if (typeof pageCurrentIndex !== "number") pageCurrentIndex = 0;
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
        foo.cb([], [puts])
        return
      };
    } else {
      const foo = get_cmd(true).global.find(val => !val.ctrl === !ctrl && (val.name === name || val.name === ch))
      if (foo) {
        get_cmd().global = [];
        foo.cb([], [puts])
        return
      };
    };


    if (name === "escape") {
      key_cmd.escape([], [puts])
      return
    }

    if (!ctrl) {
      if (name === "backspace") {
        if (typeof usr_ipt !== "string") usr_ipt += ""
        usr_ipt && (usr_ipt = usr_ipt.substring(0, usr_ipt.length - 1))
      } else {
        usr_ipt += ch || ""
      }
      num([usr_ipt.trim() && usr_ipt || false], [puts])
    }

    if (busy) return

    if (ctrl) {
      if (get_cmd(true).main[name]) {
        close([], [puts])
        get_cmd().main[name]([], [puts])
        return
      } else if (get_cmd(true).file[name]) {
        file = app_data[pageCurrentIndex]
        if (!file) return
        close([true, true], [puts])
        puts("home_cmd", ES)
        busy = true
        await get_cmd().file[name]([], [puts])
        return
      } else {
        close([true, true], [puts])
        puts("home_cmd", IV)
      }
    } else if (name === "delete") {
      file = app_data[pageCurrentIndex]
      if (!file) return
      close([true, true], [puts])
      puts("home_cmd", ES)
      busy = true
      await get_cmd().file.delete([], [puts])
      return
    } else if (name === "return") {
      get_cmd().main.return([], [puts]);
      return
    }
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()



  //#region 
  const credentials_path = "temp/assets/credentials.json"
  const token_path = "temp/assets/token.json"
  if (!fs.existsSync(credentials_path)) {
    async function crd() {
      key_cmd.busy.push({
        name: "return", cb: function () {
          if (INPUT_PAUSED) {
            event.emit("message", usr_ipt)
          }
        }
      })
      puts("app_header", chalk`can not proceed without a google api credentials.\n refer:{blue https://console.cloud.google.com/apis/} `)
      try {
        const credentials = JSON.parse(await prompt("Enter your json credentials"))
        if (!credentials.web || !credentials.web.client_id || !credentials.web.client_secret) {
          throw chalk`
      {red invalid credentials entered, try another!.}
      here are values the credentials show atleast have:
     ${chalk.blue(`{
        "web": {
            "client_id": "*******",
            "project_id": "*******",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_secret": "*******",
            "redirect_uris": [
                "http://localhost:****"
            ]
        }
    }`)}
      `
        }
        if (!credentials.redirect_uris || !credentials.redirect_uri) {
          throw chalk`{red no redirect url in your json credential, you should refer to your google-api to set it up}`
        }
        fs.writeFileSync(credentials_path, JSON.stringify(credentials))
      } catch (error) {
        puts("header", error + "")
        await crd();
      }
    }
    await crd();
    setDefaults([], [puts])
    return
  }

  const auth = _require('./x/MY-GOOGLE-DRIVE/auth.js');
  if (!fs.existsSync(token_path)) {
    puts.add("app_header", chalk`{red no token found.} `)
    const token = await auth.getAuthCode();
    fs.writeFileSync(token_path, JSON.stringify({
      "type": token.token_type,
      "client_id": token.client_id,
      "client_secret": token.client_secret,
      "refresh_token": token.refresh_token
      // "access_token": token.access_token
    }))
    setDefaults([], [puts])
  }

  TEST = true
  const exp = _require('./x/MY-GOOGLE-DRIVE/index.js', "Response");
  const { listFiles, oauth2Client, getPortionOfFile, listFilesOnly, deleteFile, service, findFileById, findFileByName, _listFilesOnly, getLastFile } = exp;
  TEST = false;

  const arg = { _service: service }

  if (!localStorage.hasItem("home_app_data.json")) {
    home_app_data = await listFilesOnly(arg)
    localStorage.setItem("home_app_data.json", home_app_data)
  }else{
    home_app_data = localStorage.getItem("home_app_data.json")
  }
  if (!localStorage.hasItem("app_data.json")) {
    app_data = home_app_data
    localStorage.setItem("app_data.json", app_data)
  }else{
    app_data = localStorage.getItem("app_data.json")
  }

  //#endregion

  setDataSet([], [puts])
  busy = false;
})();
