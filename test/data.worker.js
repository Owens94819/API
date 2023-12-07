const { log } = require('node:console');
const fs = require('node:fs');
const { parentPort, MessageChannel, workerData: { app_data_path } } = require('node:worker_threads');


parentPort.on('message', ({ app_data,_app_data, index, type }) => {
    switch (type) {
        case "delete":
            app_data.find((v, i) => v.id === index && !(app_data.splice(i, 1), void 0))
            _app_data.find((v, i) => v.id === index && !(_app_data.splice(i, 1), void 0))
            fs.writeFileSync(app_data_path, JSON.stringify(_app_data))
            parentPort.postMessage({app_data,_app_data})
            break;

        case "refresh":
            fs.writeFileSync(app_data_path, JSON.stringify(_app_data))
            parentPort.postMessage(null)
            break;
    }
});