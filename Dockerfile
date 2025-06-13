# 1) Base
FROM node:18-alpine

# 2) Ponto de trabalho dentro do container
WORKDIR /usr/src/app

# 3) Copia apenas package.json para instalar dependências
#    a partir da sub-pasta google-drive-uploader
COPY google-drive-uploader/package*.json ./

# 4) Instala dependências de produção
RUN npm install --production

# 5) Copia TODO o código da pasta google-drive-uploader para /usr/src/app
COPY google-drive-uploader/ ./

# 6) Expõe a porta da API
EXPOSE 3000

# 7) Comando padrão para iniciar a aplicação
CMD ["node", "index.js"]
