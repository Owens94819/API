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
    logs.map(val => {
        if (typeof val === "string" && !val.trim()) return;
        log += val + "\n"
    })
    logUpdate(log)
    log = void 0;
}