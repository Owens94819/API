let logs = []
// const chalk = require('chalk');
var key = () => {
    return `x-${Math.random()}-${logs.length}-${Date.now()}`
};
let map = {}
let _logUpdate;
let hold = false;

async function logUpdate(){
    if (!_logUpdate) {
        _logUpdate = (await import('log-update')).default
    }
    _logUpdate(...arguments)
}
module.exports = print

 function print(id, msg) {
     if (arguments.length <= 1) {
         msg = id;
         id = key()
        }
        if (!process.env.dev) {
            return console.log(msg);
        }
    if (map.hasOwnProperty(id)) {
        id = map[id]
        logs[id] = msg
    } else {
        const _id = logs.push(msg) - 1
        map[id] = _id;
    }
    // console.clear()
    // console.log(logs);
    if (!hold) {
         print.drop();
    }
    return print;
}

print.add = function () {
    hold = true;
    print(...arguments)
    hold = false;
    return print
}
print.drop = function () {
    var log = ""
    logs.map(val => {
        if (typeof val === "string" && !val.trim()) return;
        log += val + "\n"
    })
    logUpdate((log))
    log = void 0;
    return print
}
print.clear = function() {
    logs=[]
    map={}
    return print
}


/****
 * 
 * const { Worker } = require('node:worker_threads');

const thd = new Worker("./test/log.worker.js")
module.exports = print

async function print(...args) {
    thd.postMessage({type:"print",args})
}

print.add = function (...args) {
    thd.postMessage({type:"add",args})
}
print.drop = async function (...args) {
    thd.postMessage({type:"drop",args})
}
 */