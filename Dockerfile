# FROM nginx:latest
# COPY . /usr/share/nginx/html
# RUN chown -R nginx:nginx /usr/share/nginx/html

# Определяем базовый образ
FROM node:14

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

COPY . /app/public/

# Копируем файлы 'package.json' и 'package-lock.json' (если есть)
COPY package*.json ./

# Устанавливаем зависимости проекта
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Объявляем порт, который будет слушать приложение
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]

