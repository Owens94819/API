const { log } = require('node:console');
const fs = require('node:fs');
const { parentPort, MessageChannel, workerData: { app_data_path } } = require('node:worker_threads');
function setDataSet(app_data) {
    const data_set=[];
    if (app_data.length >= max_page) {
      t = app_data.length / max_page
    } else {
      t = 1
    }
    var st = 0;
    for (let i = 0; i < t; i++) {
      data_set.push(app_data.slice(st, st += max_page))
    }
    return data_set
  }

parentPort.on('message', ({ app_data, index, type }) => {
    switch (type) {
        case "delete":
            app_data.find((v, i) => v.id === index && !(app_data.splice(i, 1), void 0))
            fs.writeFileSync(app_data_path, JSON.stringify(app_data))
            parentPort.postMessage(app_data)
            break;

        case "refresh":
            fs.writeFileSync(app_data_path, JSON.stringify(app_data))
            parentPort.postMessage()
            break;
    }
});