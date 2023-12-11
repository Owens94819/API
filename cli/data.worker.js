const { log } = require('node:console');
const fs = require('node:fs');
const localStorage = new (require('./localStorage.js'));
const { parentPort, MessageChannel, workerData: { downloads_path } } = require('node:worker_threads');


parentPort.on('message', ({ app_data,home_app_data, index, type }) => {
    switch (type) {
        case "delete":
            app_data.find((v, i) => v.id === index && !(app_data.splice(i, 1), void 0))
            home_app_data.find((v, i) => v.id === index && !(home_app_data.splice(i, 1), void 0))
            localStorage.setItem("home_app_data.json", home_app_data)
            localStorage.setItem("app_data.json", app_data)
            parentPort.postMessage({app_data,home_app_data})
            break;

        case "refresh":
            localStorage.setItem("home_app_data.json", home_app_data)
            localStorage.setItem("app_data.json", home_app_data)
            parentPort.postMessage(null)
            break;
    }
});