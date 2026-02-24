# Jwt-auth (Admin Panels)

Простой проект с сервером на Node.js (Express) и клиентом на React + Vite.

**Особенности**
- JWT-аутентификация для админ-панелей
- CRUD для бойцов, боёв и татами
- Разделение `client/` и `server/`

**Требования**
- Node.js 16+ и npm/yarn/pnpm

**Установка**
1. Клонировать репозиторий:

   git clone https://github.com/danilturko4-crypto/Jwt-auth-admin-panels.git
   cd Jwt-auth

2. Установить зависимости для сервера и клиента:

   cd server
   npm install

   cd ../client
   npm install

**Переменные окружения**
- Создайте `.env` в `server/` с примерно такими переменными:

```
PORT=5000
DB_URL=mongodb://localhost:27017/jwt-auth
JWT_SECRET=ваш_секрет
```

**Запуск в режиме разработки**
- Сервер:

```
cd server
npm run dev
```

- Клиент:

```
cd client
npm run dev
```

**Сборка для продакшена**

```
cd client
npm run build

cd ../server
npm start
```

**Структура проекта**
- `client/` — фронтенд (React + Vite)
- `server/` — бэкенд (Express)

**Контакты и вклад**
- Issues и pull requests приветствуются.

---
Скопировать этот файл можно в корне проекта: [README.md](README.md#L1).