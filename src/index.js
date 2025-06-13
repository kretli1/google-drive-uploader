require('dotenv').config();
const express = require('express');
const path = require('path');
const mime = require('mime-types');
const { uploadFile } = require('./driveService');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Health-check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.post('/upload', async (req, res) => {
  try {
    // 1. Extrai o access-token vindo do header
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization header ausente ou mal-formado' });
    }

    // 2. Extrai filePath do body
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'filePath é obrigatório' });
    }

    // 3. Determina nome e mimeType
    const filename = path.basename(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    // 4. Faz upload
    const fileData = await uploadFile({
      accessToken,
      filePath,
      filename,
      mimeType,
      folderId: process.env.GOOGLE_FOLDER_ID
    });

    // 5. Retorna metadados completos
    res.json({ success: true, file: fileData });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
      details: err.errors || err
    });
  }
});

// Inicializa servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Drive-uploader listening on port ${PORT}`);
});
