const fetch = require('node-fetch');
const fs = require('fs');

async function getPortionOfFile(fileId, startByte, endByte, outputPath) {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const headers = {
      'Range': `bytes=${startByte}-${endByte}`,
      'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Replace with your access token
    };

    const response = await fetch(url, { method: 'GET', headers });
    
    if (!response.ok) {
      throw new Error(`Failed to download the portion of the file. Status: ${response.status}`);
    }

    const writer = fs.createWriteStream(outputPath);
    
    response.body
      .on('end', () => {
        console.log(`Portion of file with ID ${fileId} has been downloaded to ${outputPath}`);
      })
      .on('error', (err) => {
        console.error('Error downloading the portion of the file:', err);
      })
      .pipe(writer);
  } catch (error) {
    console.error('Error downloading the portion of the file:', error);
  }
}

// Replace 'Your File ID', startByte, endByte, 'Output Path', and 'YOUR_ACCESS_TOKEN' with your values.
getPortionOfFile('Your File ID', 5, 10, 'Output Path');
