# 🚀 Руководство по деплою

Это руководство описывает различные способы развертывания бота в продакшене.

## Варианты деплоя

1. **Docker Compose** (рекомендуется) - простой и быстрый
2. **Systemd Service** - для Linux серверов
3. **PM2** - для Node.js окружения
4. **Kubernetes** - для масштабируемых решений

---

## 1. Docker Compose (Рекомендуется)

### Преимущества
- ✅ Изолированное окружение
- ✅ Легкое обновление
- ✅ Автоматический перезапуск
- ✅ Простое управление

### Подготовка

1. **Установите Docker и Docker Compose:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Проверка
docker --version
docker-compose --version
```

2. **Клонируйте проект:**
```bash
git clone <your-repo-url>
cd wa_tg_bot
```

3. **Настройте .env файл:**
```bash
cp .env.example .env
nano .env  # Отредактируйте credentials
```

### Запуск

```bash
# Сборка образа
docker-compose build

# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart
```

### Обновление

```bash
# Получить последние изменения
git pull

# Пересобрать и перезапустить
docker-compose up -d --build
```

---

## 2. Systemd Service (Linux)

### Преимущества
- ✅ Нативная интеграция с Linux
- ✅ Автозапуск при старте системы
- ✅ Управление через systemctl

### Установка

1. **Создайте виртуальное окружение:**
```bash
cd /opt/wa_tg_bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Создайте systemd service файл:**
```bash
sudo nano /etc/systemd/system/wa-tg-bot.service
```

Содержимое:
```ini
[Unit]
Description=WhatsApp Telegram Bot Service
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/opt/wa_tg_bot
Environment="PATH=/opt/wa_tg_bot/venv/bin"
ExecStart=/opt/wa_tg_bot/venv/bin/python src/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. **Активируйте и запустите:**
```bash
# Перезагрузить systemd
sudo systemctl daemon-reload

# Включить автозапуск
sudo systemctl enable wa-tg-bot

# Запустить
sudo systemctl start wa-tg-bot

# Проверить статус
sudo systemctl status wa-tg-bot

# Просмотр логов
sudo journalctl -u wa-tg-bot -f
```

### Управление

```bash
# Остановить
sudo systemctl stop wa-tg-bot

# Перезапустить
sudo systemctl restart wa-tg-bot

# Отключить автозапуск
sudo systemctl disable wa-tg-bot
```

---

## 3. PM2 (Process Manager)

### Преимущества
- ✅ Простое управление
- ✅ Мониторинг в реальном времени
- ✅ Автоматический перезапуск

### Установка PM2

```bash
npm install -g pm2
```

### Создайте ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'wa-tg-bot',
    script: 'venv/bin/python',
    args: 'src/main.py',
    cwd: '/opt/wa_tg_bot',
    interpreter: 'none',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Запуск

```bash
# Запустить
pm2 start ecosystem.config.js

# Просмотр логов
pm2 logs wa-tg-bot

# Мониторинг
pm2 monit

# Остановить
pm2 stop wa-tg-bot

# Перезапустить
pm2 restart wa-tg-bot

# Автозапуск при старте системы
pm2 startup
pm2 save
```

---

## 4. Kubernetes

### Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wa-tg-bot
spec:
  replicas: 1
  selector:
    matchLabels:
      app: wa-tg-bot
  template:
    metadata:
      labels:
        app: wa-tg-bot
    spec:
      containers:
      - name: bot
        image: your-registry/wa-tg-bot:latest
        envFrom:
        - secretRef:
            name: bot-secrets
        volumeMounts:
        - name: sessions
          mountPath: /app/sessions
      volumes:
      - name: sessions
        persistentVolumeClaim:
          claimName: bot-sessions-pvc
```

---

## Настройка окружения

### Production .env

```bash
# Environment
ENVIRONMENT=production

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/wa_tg_bot/bot.log

# Debug
DEBUG_MODE=false

# Directus (production)
DIRECTUS_URL=https://your-directus-domain.com
DIRECTUS_TOKEN=your_production_token

# AI
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
```

### Безопасность

1. **Используйте secrets для credentials:**
```bash
# Docker secrets
docker secret create green_api_token ./green_api_token.txt

# Kubernetes secrets
kubectl create secret generic bot-secrets \
  --from-literal=GREEN_API_TOKEN=your_token \
  --from-literal=TELEGRAM_API_HASH=your_hash
```

2. **Ограничьте доступ к .env:**
```bash
chmod 600 .env
```

3. **Используйте firewall:**
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

---

## Мониторинг

### Логирование

1. **Настройте ротацию логов:**
```bash
# /etc/logrotate.d/wa-tg-bot
/var/log/wa_tg_bot/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 your_user your_user
}
```

2. **Просмотр логов:**
```bash
# Docker
docker-compose logs -f --tail=100

# Systemd
sudo journalctl -u wa-tg-bot -f

# PM2
pm2 logs wa-tg-bot
```

### Health Checks

Добавьте health check endpoint в `src/main.py`:

```python
from aiohttp import web

async def health_check(request):
    return web.json_response({"status": "healthy"})

app = web.Application()
app.router.add_get('/health', health_check)
```

---

## Backup

### Telegram Sessions

```bash
# Backup
tar -czf sessions-backup-$(date +%Y%m%d).tar.gz sessions/

# Restore
tar -xzf sessions-backup-20250108.tar.gz
```

### Directus Database

```bash
# PostgreSQL backup
pg_dump -U directus directus > directus-backup-$(date +%Y%m%d).sql

# Restore
psql -U directus directus < directus-backup-20250108.sql
```

---

## Обновление

### Docker

```bash
git pull
docker-compose up -d --build
```

### Systemd

```bash
git pull
source venv/bin/activate
pip install -r requirements.txt --upgrade
sudo systemctl restart wa-tg-bot
```

### PM2

```bash
git pull
source venv/bin/activate
pip install -r requirements.txt --upgrade
pm2 restart wa-tg-bot
```

---

## Troubleshooting

### Проблема: Бот не запускается

**Проверьте:**
1. Логи: `docker-compose logs` или `journalctl -u wa-tg-bot`
2. .env файл: все ли credentials заполнены?
3. Порты: не заняты ли нужные порты?

### Проблема: Telegram сессия не работает

**Решение:**
1. Удалите старую сессию
2. Запустите бота локально для авторизации
3. Скопируйте сессию на сервер

### Проблема: Высокое потребление памяти

**Решение:**
1. Ограничьте память в docker-compose.yml:
```yaml
services:
  bot:
    mem_limit: 512m
```

2. Или в systemd:
```ini
[Service]
MemoryLimit=512M
```

---

## Checklist перед деплоем

- [ ] .env файл настроен с production credentials
- [ ] Все тесты пройдены
- [ ] Логирование настроено
- [ ] Backup настроен
- [ ] Мониторинг настроен
- [ ] Firewall настроен
- [ ] SSL сертификаты установлены (если нужны)
- [ ] Автозапуск настроен
- [ ] Документация обновлена

---

**Готово!** Ваш бот развернут в продакшене.

