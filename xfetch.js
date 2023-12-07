
const { log } = require('node:console');
const { EventEmitter } = require('node:events');
const { Readable } = require('node:stream');

Uint8Array.prototype.written = 0
Uint8Array.prototype.write = function (arr) {
    const arrLen = arr.length
    const thisLen = this.length
    if (arrLen + this.written > thisLen) {
        const point = thisLen - this.written;
        const _arr = arr.subarray(0, point)
        this.set(_arr, this.written)
        this.written += _arr.length
        return arr.subarray(point, arrLen)
    } else {
        this.set(arr, this.written)
        this.written += arr.length
    }
}
let _MAX_BUFFER = 10_000
// const MAX_BUFFER = 1_000_000
let _TIMEOUT = 20_000 + ((_MAX_BUFFER / 1000) * 100)
module.exports = async function () {
    let MAX_BUFFER = _MAX_BUFFER
    let TIMEOUT = _TIMEOUT
    if (typeof arguments[1] === "object") {
        MAX_BUFFER = Number(arguments[1].MAX_BUFFER) || MAX_BUFFER
        TIMEOUT = Number(arguments[1].TIMEOUT) || TIMEOUT
    }

    async function _timeout() {
        uint8Array&&uint8Array.written&&await stream.push(Buffer.from(uint8Array.subarray(0, uint8Array.written)))
        stream.emit("timeout")
        stream.destroy()
    }
    async function _error(err) {
        uint8Array&&uint8Array.written&&await stream.push(Buffer.from(uint8Array.subarray(0, uint8Array.written)))
        stream.emit("error",err)
        stream.destroy()
    }

    let stream;
    let timeout;
    let busy = false;
    let uint8Array = new Uint8Array(MAX_BUFFER)

    class Stream extends Readable {
        constructor() {
            super(...arguments)
            stream = this;
            // this.push = (msg) => {
            //     if (!msg) {
            //         stream.emit("end")
            //     } else {
            //         stream.emit("data", msg)
            //     }
            // }
        }
        _read() {
            if(busy) return;
            busy=true
            timeout = setTimeout(_timeout, TIMEOUT);
            try {
                res.read().then(next).catch(_error)
            } catch (error) {
                print("ft","error1=> "+error)
                _error(error)
            }
        }
        _destroy(err){
            res.cancel("destroyed");
            if(err) stream.emit("error",err)
            stream.removeAllListeners();
        }
    }

    const req = await fetch(...arguments)
    const res = req.body.getReader()
    req.stream=new Stream();
    



    function next({ value, done }) {
        clearTimeout(timeout)
        if (done) {
            stream.push(Buffer.from(uint8Array.subarray(0, uint8Array.written)))
            uint8Array = void 0;
            if (stream.destroyed) return;
            stream.push(null)
            return
        }

        while (value = uint8Array.write(value)) {
            stream.push(Buffer.from(uint8Array))
            if (stream.destroyed) return;
            uint8Array = new Uint8Array(MAX_BUFFER)
        }

        uint8Array.written === uint8Array.length && (stream.push(Buffer.from(uint8Array)),uint8Array = new Uint8Array(MAX_BUFFER))
        if (stream.destroyed) return;
        timeout = setTimeout(_timeout, TIMEOUT);
        try {
            res.read().then(next).catch(_error)
        } catch (error) {
            print("ft","error2=> "+error)
            _error(error)
        }
    }

    return req
}