const { cwd } = require("node:process");
const fs = require("node:fs")
const path = require("node:path")
const token_path=path.join(cwd(),"temp/assets/token.json");
let token;
if(fs.existsSync(token_path)){
   token = require(token_path);
}else{
  token=JSON.parse(ENV["google-drive"]).token
}

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const { OAuth2: OAuth2Client } = google.auth;

const mimeType = require('mime-types');
const xfetch = require('../../xfetch');
const { log } = require('node:console');

const oauth2Client = new OAuth2Client(token.client_id, token.client_secret)
oauth2Client.setCredentials(token);

const service = google.drive({ version: 'v3', auth: oauth2Client });

const defaultFolderName = "my plan"
const parentFolderId = "root"

const rootFolderId = new Promise((r, j) => {
  async function foo() {
    try {
      const response = await service.files.list({
        q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${defaultFolderName}'`
      })
      const files = response.data.files;
      if (files.length > 0) {
        r(files[0].id)
      } else {
        console.log("creating default folder");
        const folderMetaData = {
          name: defaultFolderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentFolderId],
        }
        const newFolder = await service.files.create({
          resource: folderMetaData
        })
        r(newFolder.data.id)
      }
    } catch (err) {
      foo()
    }
  }
  foo()
});

const exp = { service, oauth2Client };

/**
 * 
 * @fields id, name, mimeType, size, createdTime,modifiedTime, trashed
 * @pageToken : nextPageToken
 * @orderBy "name desc" "name asc"
 * @pageSize
 * @fields: "files(modifiedTime), nextPageToken, incompleteSearch",
 * createdTime > '2021-01-01T00:00:00'
 * siz>2, >=, !=, and, or
 */

exp.createFile = async function ({ stream, q, name, type, _service, obj }, cb) {

  const requestBody = {
    name: name,
    fields: 'id',
    parents: [await rootFolderId]
  };

  const media = {
    mimeType: type,
    body: stream,
    resumable: true
  };
  cb.onUploadProgress && cb.onUploadProgress({ bytesRead: -1 })
  if (!q.prog) cb = void 0;
  const file = await _service.files.create({
    requestBody,
    media: media,
  }, cb);

  return file;
}
exp.updateFile = async function (fileId, { stream, q, type, _service }, cb) {
  const media = {
    mimeType: type,
    body: stream,
    resumable: true
  };
  cb.onUploadProgress && cb.onUploadProgress({})
  if (!q.prog) cb = void 0;
  const file = await _service.files.update({
    fileId,
    media: media,
  }, cb);

  return file;
}
exp.findFileByName = async function ({ name, _service }) {
  const response = await _service.files.list({
    q: `'${await rootFolderId}' in parents and name = '${name}'`,
    fields: "files(id, size, name, mimeType)"
  })

  const files = response.data.files;
  if (files.length > 0) {
    return files[0];
  } else {
    return false;
  }

  return file;
}
exp.findFileById = async function ({ id, _service }) {
  const response = await _service.files.get({
    fileId: id,
    fields: "id, size, name, mimeType"
  });
  const file = response.data;
  if (file) {
    return file;
  } else {
    return false;
  }
}
exp.getLastFile = async function ({ _service, orderBy = "modifiedTime desc" }) {
  const res = await _service.files.list({
    orderBy,
    pageSize: 1,
    q: `'${await rootFolderId}' in parents`,
    fields: "files(modifiedTime)",
  });
  return res.data.files[0];
}
exp.matchLastFile = async function (query, { _service, orderBy = "name" }) {
  // query=query.trim();
  // const _q=""
  // query.match(/^\*/)&&(_s="startWith")&&query.substring(1)
  // query.match(/\*$/)&&query.substring(1)
  const res = await _service.files.list({
    orderBy,
    // pageSize:1,
    q: `'${await rootFolderId}' in parents and name contains '${query}'`,
    fields: "files(id, name, modifiedTime, size)",
  });
  return res.data.files;
}
exp._listFilesOnly = async function ({ _service, orderBy = "name" }) {
  const res = await _service.files.list({
    orderBy,
    q: `'${await rootFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder' and createdTime >= '2023-11-30T18:54:16.296Z'`, // Replace with the folder ID you want to list files from
    fields: "files(id, name, mimeType, size, createdTime, modifiedTime)"
  });

  const files = res.data.files;
  return files;
}
exp.listFiles = async function ({ _service, orderBy = "name" }) {
  const res = await _service.files.list({
    orderBy,
    q: `'${await rootFolderId}' in parents and trashed = false`, // Replace with the folder ID you want to list files from
    fields: "files(id, name, mimeType, size)"
  });

  const files = res.data.files;
  return files;
}
exp.listFilesOnly = async function ({ _service, orderBy = "name" }) {
  const res = await _service.files.list({
    orderBy,
    q: `'${await rootFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`, // Replace with the folder ID you want to list files from
    fields: "files(id, name, mimeType, size, modifiedTime)"
  });
  const files = res.data.files;
  return files;
}
exp.getFileLink = async function (fileId, { _service }) {
  const res = await _service.files.get({
    fileId,
    fields: "webViewLink"
  });

  const link = res.data.webViewLink;
  return link;
}
exp.deleteFile = async function (fileId, { _service }) {
  try {
    await _service.files.delete({
      fileId: fileId, // ID of the file you want to delete
    });
    return true
  } catch (error) {
    return error + "";
  }
}
exp.downloadFile = async function (fileId, { _service, stream }) {
  const response = await _service.files.get({
    fileId: fileId, // ID of the file you want to download
    alt: 'media', // Use 'media' to get the file content
  }, { responseType: 'stream' });

  return response;
}
exp.getPortionOfFile = async function (fileId, { startByte, endByte, MAX_BUFFER, TIMEOUT, _service: { context: { _options: { auth } } } }) {
  let fields = "";
  let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&fields=${fields}`;
  const headers = {
    'Range': `bytes=${startByte}-${endByte}`,
    'Authorization': `Bearer ${(await auth.getAccessToken()).token}`, // Replace with your access token
  };

  const req = await xfetch(url, {
    headers,
    method: "GET",
    MAX_BUFFER,
    TIMEOUT
  })

  if (!req.status || req.status > 400) {
    throw new Error(`Failed to download the portion of the file. Status: ${req.code}`);
  }

  return req;
}
exp.setPortionOfFile = async function (fileId, { startByte, endByte, _service: { context: { _options: { auth } } } }) {
  return null
}
exp.uploadBasic = async function ({ name, q, type, obj }) {

  try {
    const fileId = (await exp.findFileByName(...arguments))?.id;
    let file;
    // console.log(fileId);
    if (fileId) {
      file = await exp.updateFile(fileId, ...arguments)
    } else {
      file = await exp.createFile(...arguments);
    }
    return file;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

exp.Response = async function (req, res) {
  const msg = {
    msg: null,
    _id: null,
    type: "uploading"
  };

  const q = req.query;
  const url = decodeURIComponent(q.url || "");
  let type = decodeURIComponent(q.type || "");
  let name = decodeURIComponent(q.name || "");
  let token = decodeURIComponent(q.token || "");
  let okstatus = Boolean(q.okstatus);

  let _service = service;
  res._write = res.write
  res._end = res.end
  res.write = function (e) {
    res._write("data: " + JSON.stringify(msg) + "\n\n")
  }
  res.end = function (e) {
    res._end("data: " + JSON.stringify(msg) + "\n\n")
    puts("console-3", `\n${url}\n-------`);
  }

  if (okstatus) res.status = Function();

  puts("console-1", `\n---${url}\n`);


  res.setHeader("content-type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  function err(err, s) {
    msg.type = 'error'
    msg.msg = err
    res.status(s || 206);
    res.end(err);
  }

  if (token) {
    try {
      token = JSON.parse(token);
      setToken(token);
      const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/drive',
        credentials: token
      });

      _service = google.drive({ version: 'v3', auth });
    } catch (error) {
      err("Credential Error (1): " + error, 204)
      return;
    }
  }


  try {


    const request = await xfetch(url, { MAX_BUFFER: 2_000_000, TIMEOUT: 40_000 })
    if (request.ok) {
      if (!type) type = (request.headers.get("content-type") || "");

      let _type = type.replace(/\;[^]+$/, "").trim();
      const iv = /[^(a-z)(0-9)_\-.@]/ig;

      if (!name) {
        name = (url.match(/[^\\\/]+$/) || [`Unknown - ${Date.now()}`])[0].replace(/\?([^]?)+$/, "").replace(iv, "_ ");
      }

      let ext = (name.match(/[^\\\/.]+$/) || [""])[0].toLowerCase();
      ext = mimeType.types[ext]
      if (!ext) {
        ext = (mimeType.extensions[_type] || [])[0];
        if (ext) {
          name += "." + ext;
        }
      }
      if (!type) type = mimeType.lookup(name) || "application/octet-stream"

      q.prog = (q.prog || "").includes("y")
      res.write();

      const file = await exp.uploadBasic({ stream: request.stream, q, name, type, _service, obj: msg }, {
        onUploadProgress: (progressEvent,d) => {
          // console.log(progressEvent);
          // puts("console-2", `progressEvent: ${JSON.stringify(progressEvent)}`);

          let { bytesRead } = progressEvent;
          if (!bytesRead) {
            msg.type = "updating"
            bytesRead = progressEvent;
          } else {
            msg.type = "uploading"
          }
          if (bytesRead < 0) bytesRead = 0
          msg.msg = bytesRead
          msg._id = bytesRead

          try {
            puts("console-2", `
              progressEvent: ${JSON.stringify(progressEvent)}\n
              Uploaded ${bytesRead} bytes
              `);
          } catch (error) {
            console.log("JSON ERR-000"+error);
          }
          res.write();
          // setTimeout(() => {
          //   console.log(d)
          // }, 6000);
        }
      }).catch(err => err + "");

      if (typeof file === 'string') {
        msg.type = "error"
        puts("console-2", msg.msg = 'Credential Error (2):' + file);
        res.status(206);
        res.end();
      } else {
        file.data.link = await exp.getFileLink(file.data.id, { _service })
        msg.type = 'complete'
        msg.msg = file.data
        res.end();
      }
    } else {
      msg.type = "error"
      msg.msg = "response not ok";
      res.status(206);
      res.end();
      puts("console-2", `
      ${msg.msg}
      ${request.headers}
      ${request.status}
      ${request.statusText}
      `)
    }

  } catch (error) {
    err(error + "");
  }
}


// function setToken(token) {
//   token.client_id = credentials.web.client_id
//   token.client_secret = credentials.web.client_secret
//   if (!token.type) token.type = "authorized_user";
// }


if (TEST) {
  module.exports = exp
} else {
  module.exports = exp.Response
}