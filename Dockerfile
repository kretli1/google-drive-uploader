# 1) Base
FROM node:18-alpine

# 2) Ponto de trabalho dentro do container
WORKDIR /usr/src/app

# 3) Copia apenas package.json para instalar dependências
COPY package.json package-lock.json* ./

# 4) Instala deps
RUN npm install --production

# 5) Copia TODO o código
COPY src/ ./src/

# 6) Expõe porta da API
EXPOSE 3000

# 7) Comando padrão
CMD ["node", "src/index.js"]
