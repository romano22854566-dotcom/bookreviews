# Этап 1 - сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все исходники
COPY . .

# CI=false - без этого react-scripts падает на warnings
ENV CI=false

# Собираем - react-scripts кладёт в папку BUILD (не dist!)
RUN npm run build

# Этап 2 - nginx
FROM nginx:alpine

# Копируем из папки build (не dist!)
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:80 || exit 1