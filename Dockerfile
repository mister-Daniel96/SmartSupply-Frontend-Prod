# Imagen base
FROM node:20

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Exponer puerto Angular
EXPOSE 4200

# Comando para correr Angular
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]