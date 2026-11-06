FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . ./

# Ejecutar vite build en modo watch para compilar automáticamente hacia dist
CMD ["npx", "vite", "build", "--watch"]
