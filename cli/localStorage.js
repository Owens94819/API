const fs = require('node:fs');
const path = require('node:path');
module.exports=class localStorage {
    #path
    #checkState(){

    }
    constructor(path){
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
        this.#path=path
    }
    setItem(key, value){
        key = encodeURIComponent(key);
        key=path.join(this.#path,key)
        const obj={
            data:value
        }
        const buf=Buffer.from(JSON.stringify(obj))
        this.#checkState()
        fs.writeFileSync(key, buf)
    }
    getItem(key){
        key = encodeURIComponent(key);
        key=path.join(this.#path,key)
        if (!fs.existsSync(key)) {
            return null
        }
        this.#checkState()
        return JSON.parse(fs.readFileSync(key).toString()).data
    }
}