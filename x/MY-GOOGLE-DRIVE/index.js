

const token = require('./assets/token.json');
const credentials = require('./assets/credentials.json');
const fs = require('fs');
const proto = { https: require('https'), http: require('http') };
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const mimeType = require('mime-types');
const { OAuth2: OAuth2Client } = google.auth;
setToken(token);


const oauth2Client = new OAuth2Client(token.client_id, token.client_secret)
oauth2Client.setCredentials(token);
const service = google.drive({ version: 'v3', auth: oauth2Client });

const defaultFolderName = "my plan"
const parentFolderId = "root"
const rootFolderId = new Promise(async (r, j) => {
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
    console.error(err);
    r(parentFolderId)
  }
});


async function createFile({ stream, name, type, _service }, cb) {

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

  const file = await _service.files.create({
    requestBody,
    media: media,
  }, cb);

  return file;
}
async function updateFile(fileId, { stream, type, _service }, cb) {
  const media = {
    mimeType: type,
    body: stream,
    resumable: true
  };
  cb.onUploadProgress('updating')
  const file = await _service.files.update({
    fileId,
    media: media,
  }, cb);

  return file;
}
async function findFile({ name, _service }) {
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
async function listFiles({ _service }) {
  const res = await _service.files.list({
    q: `'${await rootFolderId}' in parents and trashed = false`, // Replace with the folder ID you want to list files from
    fields: "files(id, name, mimeType, size)"
  });

  const files = res.data.files;
  return files;
}
async function listFilesOnly({ _service }) {
  const res = await _service.files.list({
    q: `'${await rootFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`, // Replace with the folder ID you want to list files from
    fields: "files(id, name, mimeType, size)"
  });
  const files = res.data.files;
  return files;
}
async function getFileLink(fileId, { _service }) {
  const res = await _service.files.get({
    fileId,
    fields: "webViewLink"
  });

  const link = res.data.webViewLink;
  return link;
}
async function deleteFile(fileId, { _service }) {
  try {
    await _service.files.delete({
      fileId: fileId, // ID of the file you want to delete
    });
    return true
  } catch (error) {
    return false;
  }
}
async function downloadFile(fileId, { _service, stream }) {
  const response = await _service.files.get({
    fileId: fileId, // ID of the file you want to download
    alt: 'media', // Use 'media' to get the file content
  }, { responseType: 'stream' });

  return response;
}
async function getPortionOfFile(fileId, { startByte, endByte, _service: { context: { _options: { auth } } } }) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const headers = {
    'Range': `bytes=${startByte}-${endByte}`,
    'Authorization': `Bearer ${(await auth.getAccessToken()).token}`, // Replace with your access token
  };

  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    throw new Error(`Failed to download the portion of the file. Status: ${response.status}`);
  }

  return response;
}
async function setPortionOfFile(fileId, { startByte, endByte, _service: { context: { _options: { auth } } } }) {
  return null
}
async function uploadBasic({ name, type }) {
  if (!type) type = mimeType.lookup(name) || "application/octet-stream";

  try {
    const fileId = (await findFile(...arguments))?.id;
    let file;
    // console.log(fileId);
    if (fileId) {
      file = await updateFile(fileId, ...arguments)
    } else {
      file = await createFile(...arguments);
    }
    return file;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

async function Response(req, res) {
  const msg = {
    msg: null,
    type: null
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
    console.log("");
    console.log("");
    console.log(url);
    console.log('-----');
  }

  if (okstatus) res.status = Function();

  console.log("----");
  console.log(url);
  console.log("");
  console.log("");

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
    let http;
    if (url.match(/^https:(\/\/|\\\\)+/)) {
      http = proto.https
    } else {
      http = proto.http
    }

    const server = http.get(url, async function (stream) {
      const ok = stream.statusMessage.toLowerCase();
      if (ok) {
        if (!type) type = (stream.headers["content-type"] || "");

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

        const file = await uploadBasic({ stream, name, type, _service }, {
          onUploadProgress: (progressEvent) => {
            let { bytesRead } = progressEvent;
            if (!bytesRead) {
              msg.type = "updating"
              bytesRead = progressEvent;
            } else {
              msg.type = "uploading"
            }

            msg.msg = bytesRead

            console.log(`Uploaded ${bytesRead} bytes`);
            res.write();
          },
        }).catch(err => err + "");

        if (typeof file === 'string') {
          msg.type = "error"
          console.log(msg.msg = 'Credential Error (2):' + file);
          res.status(206);
          res.end();
        } else {
          file.data.link = await getFileLink(file.data.id, { _service })
          msg.type = 'complete'
          msg.msg = file.data
          res.end();
        }
      } else {
        msg.type = "error"
        console.error(msg.msg = "response not ok");
        res.status(206);
        res.end();
        console.log(stream.headers);
        console.log(stream.statusCode);
        console.log(stream.statusMessage);
      }

    })

    server.on("error", (error) => err(error + ""))

    server.end();
  } catch (error) {
    err(error + "");
  }
}


function setToken(token) {
  token.client_id = credentials.web.client_id
  token.client_secret
  if (!token.type) token.type = "authorized_user";
}


if (TEST) {
  module.exports = {
    Response,
    listFilesOnly,
     listFiles,
      getPortionOfFile,
      oauth2Client,
      service
  }
} else {
  module.exports = Response
}