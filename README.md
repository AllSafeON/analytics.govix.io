# analytics.govix.io — Botamin Analytics Dashboard

Аналитический дашборд для данных голосового бота Botamin.

- **Сайт:** https://analytics.govix.io
- **GitHub:** https://github.com/AllSafeON/analytics.govix.io
- **Сервер:** 142.93.162.231 (SSH alias: `compro`)
- **PM2:** `analytics-govix` (порт 3030)
- **Web dir:** `/var/www/analytics.govix.io/`
- **App dir:** `/root/analytics.govix.io/`

---

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | HTML + Vanilla JS (Chart.js, PapaParse) |
| Backend | Express.js (Node.js) |
| AI | Claude Haiku via Anthropic API |
| Web server | Nginx |
| Process | PM2 |

---

## Первоначальная настройка (новый разработчик)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/AllSafeON/analytics.govix.io.git
cd analytics.govix.io
```

### 2. Установить зависимости backend

```bash
cd server
npm install
```

### 3. Настроить переменные окружения

```bash
cp server/.env.example server/.env
# Отредактировать server/.env — вписать ANTHROPIC_API_KEY
```

### 4. Настроить SSH доступ к серверу

```bash
# Добавить в ~/.ssh/config:
Host compro
  HostName 142.93.162.231
  Port 8402
  User root
  IdentityFile ~/.ssh/compro-server   # ключ получить у владельца проекта
```

---

## Workflow разработки

```
Локальные изменения → git commit → git push → deploy на сервер
```

### Быстрый деплой (commit + push + deploy)

```bash
./deploy.sh "feat: описание изменений"
```

### Только деплой (уже есть коммит)

```bash
./deploy.sh
```

### Вручную

```bash
git add -A
git commit -m "type: description"
git push origin main

ssh compro "
  cd /root/analytics.govix.io &&
  git pull origin main &&
  cp index.html /var/www/analytics.govix.io/index.html &&
  cd server && npm install --omit=dev &&
  pm2 restart analytics-govix --update-env
"
```

---

## Структура проекта

```
analytics.govix.io/
├── index.html              # Весь frontend (SPA, один файл)
├── deploy.sh               # Скрипт деплоя
├── server/
│   ├── index.js            # Express API (порт 3030)
│   ├── package.json
│   ├── ecosystem.config.cjs  # PM2 конфиг
│   ├── .env.example        # Шаблон переменных окружения
│   └── data.json           # Сохранённые данные (gitignored)
```

---

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|---------|
| GET | `/api/data` | Получить сохранённые данные дашборда |
| POST | `/api/data` | Сохранить CSV данные (тело: `{data, fileName}`) |
| DELETE | `/api/data` | Сбросить данные |
| POST | `/api/claude` | Proxy к Anthropic API (тело: `{prompt}`) |

---

## Переменные окружения (`server/.env`)

| Переменная | Описание | Обязательно |
|-----------|---------|------------|
| `ANTHROPIC_API_KEY` | Ключ Claude API (получить у владельца) | Да |
| `PORT` | Порт сервера | Нет (по умолчанию 3030) |

---

## Проверка состояния на сервере

```bash
# Логи backend
ssh compro "pm2 logs analytics-govix --lines 30 --nostream"

# Статус
ssh compro "pm2 list | grep analytics-govix"

# Тест API
curl https://analytics.govix.io/api/data | python3 -m json.tool
```
