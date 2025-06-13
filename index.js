require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
app.use(express.json({ limit: '50mb' }));

// ────────── Health-check ──────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ────────── Upload de Arquivo para o Google Drive ───────
app.post('/upload', async (req, res) => {
  try {
    // 1. Extrai o access-token vindo do n8n ou outro cliente
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!accessToken) {
      return res.status(401).json({
        code: 401,
        errors: [{ message: 'Authorization header ausente ou mal-formado' }],
      });
    }

    // 2. Extrai os campos do body
    const { filePath, title, folderId } = req.body;

    if (!filePath || !title) {
      return res.status(400).json({
        code: 400,
        errors: [{ message: 'Os campos filePath e title são obrigatórios' }],
      });
    }

    // 3. Cria cliente OAuth2 apenas com o access-token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 4. Monta os metadados do arquivo
    const fileMetadata = {
      name: title,
    };
    // Adiciona o folderId se ele for fornecido
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    // 5. Monta o corpo da mídia para upload
    const media = {
      body: fs.createReadStream(filePath),
      mimeType: 'application/octet-stream', // Deixe o Drive detectar ou especifique se souber
    };

    // 6. Faz o upload do arquivo
    const fileResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: '*', // Solicita todos os campos do arquivo na resposta
    });

    const fileId = fileResponse.data.id;

    // 7. Define a permissão para "qualquer pessoa com o link"
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // 8. Retorna o objeto completo do arquivo
    res.json(fileResponse.data);

  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(err.code || 500).json({
      code: err.code || 500,
      errors: err.errors || [{ message: err.message }],
    });
  }
});

// ────────── Inicializa servidor ───
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Google-Drive-uploader escutando na porta ${PORT}`);
});
