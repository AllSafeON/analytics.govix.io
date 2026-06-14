#!/bin/bash
# Первоначальная настройка проекта для нового разработчика
# Запустить один раз: ./setup.sh

set -e

echo "==> Устанавливаю зависимости backend..."
cd server && npm ci && cd ..

echo "==> Создаю .env файл..."
if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo ""
  echo "⚠️  Файл server/.env создан. Вставь в него ANTHROPIC_API_KEY:"
  echo "    nano server/.env"
else
  echo "    server/.env уже существует — пропускаю"
fi

echo ""
echo "✅ Готово! Дальнейший workflow:"
echo ""
echo "   Разработка:   вносишь изменения в index.html или server/"
echo "   Деплой:       ./deploy.sh \"feat: описание изменений\""
echo ""
echo "   SSH для деплоя настроить в ~/.ssh/config:"
echo "   Host compro"
echo "     HostName 142.93.162.231"
echo "     Port 8402"
echo "     User root"
echo "     IdentityFile ~/.ssh/compro-server"
