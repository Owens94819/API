
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
const _MAX_BUFFER = 100_000
const _TIMEOUT = 20_000 + ((_MAX_BUFFER / 1000) * 100)
const _SPEED_TIMEOUT = 900
async function xfetch(...argument) {
    let MAX_BUFFER = _MAX_BUFFER
    let TIMEOUT = _TIMEOUT
    let SPEED_TIMEOUT = _SPEED_TIMEOUT
    if (typeof arguments[1] === "object") {
        MAX_BUFFER = Number(arguments[1].MAX_BUFFER) || MAX_BUFFER
        TIMEOUT = Number(arguments[1].TIMEOUT) || TIMEOUT
        SPEED_TIMEOUT = Number(arguments[1].SPEED_TIMEOUT) || SPEED_TIMEOUT
    }
    function _speed_timeout() {
        if (uint8Array && uint8Array.written) {
            stream.push(Buffer.from(uint8Array.subarray(0, uint8Array.written)))
            uint8Array.set(new Uint8Array(uint8Array.written))
            uint8Array.written = 0;
        }
        speed_timeout = void 0
    }
    function _timeout() {
        callback = () => {
            stream.emit("timeout")
            stream.destroy()
        }
        if (uint8Array && uint8Array.written) {
            stream._push(Buffer.from(uint8Array.subarray(0, uint8Array.written)))
        } else {
            callback();
            callback = void 0
        }
    }
    function _error(err) {
        callback = () => {
            stream.emit("error", err)
            stream.destroy()
        }
        if (uint8Array && uint8Array.written) {
            stream._push(Buffer.from(uint8Array.subarray(0, uint8Array.written)))
        } else {
            callback();
            callback = void 0
        }
    }

    let stream;
    let args;
    let callback;
    let timeout;
    let speed_timeout;
    let busy = false;
    let uint8Array = new Uint8Array(MAX_BUFFER)

    class Stream extends Readable {
        constructor() {
            super(...arguments)
            stream = this;
        }
        _push() {
            clearTimeout(speed_timeout), speed_timeout = void 0, this.push(...arguments);
        }
        _read() {
            if (busy || stream.destroyed) return;
            if (callback) {
                callback(...arguments);
                callback = void 0;
                return;
            }
            timeout = setTimeout(_timeout, TIMEOUT);
            // if (speed_timeout === void 0) speed_timeout = setTimeout(_speed_timeout, SPEED_TIMEOUT);
            if (args) {
                next(args)
            } else {
                res.read().then(next).catch(_error)
            }
        }
        _destroy(err) {
            res.cancel("destroyed");
            if (err) stream.emit("error", err)
            stream.removeAllListeners();
        }
    }

    const req = await fetch(...argument)
    const res = req.body.getReader()
    req.stream = new Stream();

    function next({ value, done }) {
        args && (args = void 0)
        clearTimeout(timeout)
        if (done) {
            if (uint8Array && uint8Array.written) {
                stream._push(Buffer.from(uint8Array.subarray(0, uint8Array.written)))
                uint8Array = void 0;
            } else {
                stream._push(null)
            }
            return
        }

        value = uint8Array.write(value)

        if (value) {
            stream._push(Buffer.from(uint8Array))
            args = { value, done }
            uint8Array = new Uint8Array(MAX_BUFFER)
        } else if (uint8Array.written === uint8Array.length) {
            stream._push(Buffer.from(uint8Array))
            uint8Array = new Uint8Array(MAX_BUFFER)
        } else {
            stream._read();
        }
    }
    return req
}

module.exports = xfetch