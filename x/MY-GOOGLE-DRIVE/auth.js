const exp = {};
exp.getAccessToken = async function () {
    const token = _require("./temp/assets/token.json")
    return await (await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: `client_secret=${token.client_secret}&grant_type=refresh_token&refresh_token=${token.refresh_token}&client_id=${token.client_id}`
    })).json();
}

exp.getAuthCode = async function () {
    const credential = _require("./temp/assets/credentials.json").web
    const scope = "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive"
    const reg = /^http:\/\/localhost:([0-9]+)($|\/.*)/
    const redirect_uri = credential.redirect_uris?.find(val => val.match(reg));
    const port = Number(redirect_uri.replace(reg, "$1"))
    const express = require('express');
    const chalkTemplate = (await import('chalk-template')).default;
    const chalk = require('chalk');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${redirect_uri}&prompt=consent&response_type=code&client_id=${credential.client_id}&scope=${scope}&access_type=offline`
    let closed = false;
    return new Promise((r, j) => {
        const server = express().use(async (req, res) => {
            if (closed) {
                return;
            }
            res.send("sent...")
            closed = true
            server.close();
            server.closeAllConnections();
            const _token = await (await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                body: `code=${req.query.code}&redirect_uri=${redirect_uri}&client_id=${credential.client_id}&client_secret=${credential.client_secret}&scope=&grant_type=authorization_code`
            })).json();
            _token.client_id = credential.client_id
            _token.client_secret = credential.client_secret
            r(_token)
        }).listen(port, async () => {
            puts("home_cmd", chalkTemplate`
      {gray ENTER THIS URL WITH A BROWSER }
      {blue ${url}}
      `)
        })
    })
}

module.exports = exp