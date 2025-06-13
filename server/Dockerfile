# Используем официальный образ Node.js
FROM node:18

# Рабочая директория в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем ВЕСЬ код сервера (включая src/, db.sqlite и т.д.)
COPY . .

# Открываем порт сервера (убедитесь, что в коде он 5000)
EXPOSE 3000

# Запускаем сервер (команда из package.json -> "start": "node src/app.js")
CMD ["npm", "start"]