const { parentPort } = require('node:worker_threads');
const logs = []
var key = () => {
    return `x-${Math.random()}-${logs.length}-${Date.now()}`
};
const map = {}
let logUpdate;
let hold = false;
module.exports = print

async function print(id, msg) {
    if (arguments.length <= 1) {
        msg = id;
        id = key()
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
        await print.drop();
    }
    return id;
}

print.add = function () {
    hold = true;
    print(...arguments)
    hold = false;
}
print.drop = async function () {
    if (!logUpdate) {
        logUpdate = (await import('log-update')).default
    }
    var log = ""
    // console.log(logs);
    logs.map(val => {
        if (typeof val === "string" && !val.trim()) return;
        log += val + "\n";
    })
    // console.log(log);
    // console.log("-------------");
    logUpdate(log)
    log = void 0;
}
parentPort.on('message', ({ type, args }) => {
    switch (type) {
        case "drop":
            print.drop(...args)
            break;
        case "add":
            print.add(...args)
            break;
        case "print":
            print(...args)
            break;
    }
});