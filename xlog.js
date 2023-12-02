const logs = []
var key=()=>{
    return `x-${Math.random()}-${logs.length}-${Date.now()}`
};
const map = {}
let logUpdate;
module.exports = async function (id,msg) {
    if(!logUpdate){
        logUpdate=(await import('log-update')).default
    }
    if (arguments.length<=1) {
        msg=id;
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
    logUpdate(logs.join("\n"))
    return id;
}