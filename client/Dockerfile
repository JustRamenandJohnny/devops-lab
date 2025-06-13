# Базовый образ для React
FROM node:18

# Рабочая директория
WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь код клиента
COPY . .

ENV PORT=3001

# Стандартный порт React
EXPOSE 3001

ENV HOST=0.0.0.0

# Запуск React-приложения
CMD ["npm", "start"]