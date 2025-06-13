require('dotenv').config();
const fs = require('fs');
const { google } = require('googleapis');

const authClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Faz upload de um arquivo para o Google Drive.
 * @param {object} options
 * @param {string} options.accessToken   — token OAuth2 vindo da requisição
 * @param {string} options.filePath      — caminho local do arquivo
 * @param {string} options.filename      — nome do arquivo no Drive
 * @param {string} options.mimeType      — tipo MIME do arquivo
 * @param {string} options.folderId      — ID da pasta no Drive
 * @returns {Promise<DriveFile>}         — metadados completos do arquivo criado
 */
async function uploadFile({ accessToken, filePath, filename, mimeType, folderId }) {
  authClient.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: 'v3', auth: authClient });

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId]
    },
    media: {
      mimeType,
      body: fs.createReadStream(filePath)
    },
    fields: 'id, name, mimeType, size, webViewLink'
  });

  return response.data;
}

module.exports = { uploadFile };
