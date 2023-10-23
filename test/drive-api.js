(async () => {
  TEST = true
  const md = './x/MY-GOOGLE-DRIVE/index.js';
  const { listFiles, oauth2Client, getPortionOfFile, listFilesOnly, service } = _require(md, "Response");
  TEST = false;

  const accessToken = await oauth2Client.getAccessToken();
  const id = "1hjqHSKm9t-ajGXKCo6OvyNFjk_xOJzLd";

  // list = await getPortionOfFile(id, { startByte: 0, endByte: 5, _service: service });
  // t = await list.text();
  // t=await listFilesOnly({_service:service});

  console.log(accessToken.token);
})();
