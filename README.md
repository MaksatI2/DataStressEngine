# K6 Load Tester Dashboard

Полнофункциональное приложение для управления нагрузочным тестированием с помощью K6.

## 🏗️ Структура проекта

```
k6-load-tester/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       └── index.js
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── server.js
    ├── k6-tests/
    └── results/
```

## 🚀 Быстрый старт

### Предварительные требования

- Docker
- Docker Compose

### Установка и запуск

1. **Клонируйте проект**

Скопируйте по ссылке `https://github.com/MaksatI2/DataStressEngine.git`

2. **Запустите приложение**

```bash
docker-compose up --build
```

3. **Откройте браузер**

Перейдите на `http://localhost:3000`

## 📋 Использование

### Основные функции

1. **Настройка Webhook URL** - укажите адрес вашего вебхука
2. **Параметры нагрузки**:
   - Всего логов - общее количество запросов
   - Логов в секунду - скорость отправки
3. **Управление токенами**:
   - Добавление новых токенов
   - Выбор токенов для тестирования
   - Удаление токенов
4. **Запуск теста** - кнопка для старта нагрузочного тестирования
5. **Просмотр результатов**:
   - Время выполнения
   - Количество запросов
   - Успешность
   - Скорость отправки

## 🛠️ API Endpoints

### Backend API

- `POST /api/run-test` - Запуск теста
  ```json
  {
    "webhookUrl": "https://example.com/webhook",
    "totalLogs": 100,
    "logsPerSecond": 20,
    "selectedTokens": ["token1", "token2"]
  }
  ```

- `GET /api/health` - Проверка статуса сервера

## 🐳 Docker команды

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## 🔧 Разработка

### Локальный запуск без Docker

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 📊 Структура данных логов

Приложение генерирует структурированные логи с информацией о:
- Хосте и устройстве
- Типе интерфейса
- Метриках производительности
- Пороговых значениях
- Статусе и серьезности