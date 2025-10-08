# ⚡ Быстрый старт

Пошаговое руководство для запуска бота за 10 минут.

## 📋 Что вам понадобится

Перед началом подготовьте следующие данные:

### 1. Green API (WhatsApp)
- [ ] Instance ID
- [ ] API Token

**Где получить:** [docs/GREEN_API_SETUP.md](docs/GREEN_API_SETUP.md)

### 2. Telegram API
- [ ] API ID
- [ ] API Hash
- [ ] Номер телефона

**Где получить:** [docs/TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md)

### 3. Directus
- [ ] URL (например: `http://localhost:8055`)
- [ ] Email
- [ ] Password

**Настройка:** [docs/DIRECTUS_SETUP.md](docs/DIRECTUS_SETUP.md)

### 4. DeepSeek AI
- [x] API Key: `sk-f50b8be3160c4e6db542ede7217638a0` (уже предоставлен)

---

## 🚀 Шаги установки

### Шаг 1: Установка зависимостей

```bash
cd wa_tg_bot
pip install -r requirements.txt
```

### Шаг 2: Настройка .env файла

Скопируйте пример и заполните своими данными:

```bash
cp .env.example .env
```

Откройте `.env` и заполните:

```bash
# Green API (WhatsApp)
GREEN_API_INSTANCE_ID=your_instance_id_here
GREEN_API_TOKEN=your_token_here

# Telegram
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
TELEGRAM_PHONE=+79001234567

# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_EMAIL=your_email@example.com
DIRECTUS_PASSWORD=your_password

# DeepSeek AI (уже заполнено)
DEEPSEEK_API_KEY=sk-f50b8be3160c4e6db542ede7217638a0
```

### Шаг 3: Настройка Directus

Создайте необходимые коллекции в Directus:

1. Откройте [docs/DIRECTUS_SETUP.md](docs/DIRECTUS_SETUP.md)
2. Следуйте инструкциям для создания коллекций
3. Добавьте тестовый промпт

**Быстрый способ (SQL):**

```sql
-- Выполните этот SQL в вашей PostgreSQL базе
-- (см. полный скрипт в docs/DIRECTUS_SETUP.md)
```

### Шаг 4: Первый запуск

```bash
python src/main.py
```

**Что произойдет:**

1. Бот инициализируется
2. Подключится к Directus
3. Инициализирует DeepSeek AI
4. Запустит WhatsApp бот (если включен)
5. Запустит Telegram бот (если включен)
   - При первом запуске Telegram попросит код подтверждения
   - Введите код из Telegram
   - Если включена 2FA - введите пароль

### Шаг 5: Тестирование

#### Тест WhatsApp

1. Отправьте сообщение на номер, подключенный к Green API
2. Бот должен ответить через 2-3 секунды
3. Проверьте логи: `logs/bot.log`

#### Тест Telegram

1. Отправьте сообщение себе (или другому пользователю)
2. Бот должен ответить
3. Проверьте логи

---

## 🔧 Настройка поведения

### Изменение промпта

1. Откройте Directus Admin Panel
2. Перейдите в коллекцию `bot_prompts`
3. Отредактируйте промпт с `name = "default"`
4. Изменения применятся сразу (перезапуск не нужен)

### Отключение мессенджера

Отредактируйте `.env`:

```bash
# Отключить WhatsApp
WHATSAPP_ENABLED=false

# Отключить Telegram
TELEGRAM_ENABLED=false
```

### Изменение задержки ответа

```bash
# Задержка перед ответом (секунды)
AUTO_REPLY_DELAY_SECONDS=5
```

### Настройка AI

```bash
# Температура (0.0 - 2.0)
# Меньше = более предсказуемо
# Больше = более креативно
AI_TEMPERATURE=0.7

# Максимум токенов в ответе
AI_MAX_TOKENS=2000
```

---

## 📊 Мониторинг

### Просмотр логов

```bash
# В реальном времени
tail -f logs/bot.log

# Последние 100 строк
tail -n 100 logs/bot.log

# Поиск ошибок
grep ERROR logs/bot.log
```

### Просмотр истории в Directus

1. Откройте Directus Admin Panel
2. Коллекция `bot_messages` - вся история
3. Коллекция `bot_states` - текущие состояния

---

## 🐛 Решение проблем

### Бот не запускается

**Проверьте:**
1. Все ли зависимости установлены: `pip list`
2. Правильно ли заполнен `.env`
3. Доступен ли Directus: `curl http://localhost:8055`

### WhatsApp не отвечает

**Проверьте:**
1. Статус инстанса в Green API (должен быть "authorized")
2. Логи бота на наличие ошибок
3. Правильность Instance ID и Token

### Telegram не подключается

**Проверьте:**
1. Правильность API ID и API Hash
2. Формат номера телефона (должен начинаться с +)
3. Наличие файла сессии в `sessions/`

### AI не генерирует ответы

**Проверьте:**
1. Правильность DeepSeek API Key
2. Наличие промпта в Directus
3. Логи на наличие ошибок API

---

## 🎯 Следующие шаги

После успешного запуска:

1. **Настройте промпты** для разных сценариев
2. **Добавьте команды** (например, /help, /start)
3. **Настройте состояния** для сложных диалогов
4. **Интегрируйте с CRM** через Directus
5. **Настройте уведомления** и напоминания

---

## 📚 Дополнительная документация

- [README.md](README.md) - Общее описание проекта
- [ARCHITECTURE.md](ARCHITECTURE.md) - Архитектура системы
- [docs/GREEN_API_SETUP.md](docs/GREEN_API_SETUP.md) - Настройка WhatsApp
- [docs/TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md) - Настройка Telegram
- [docs/DIRECTUS_SETUP.md](docs/DIRECTUS_SETUP.md) - Настройка Directus
- [DEPLOYMENT.md](DEPLOYMENT.md) - Деплой в продакшен

---

## 💬 Нужна помощь?

Если что-то не работает:

1. Проверьте логи: `logs/bot.log`
2. Проверьте документацию выше
3. Убедитесь, что все credentials правильные
4. Проверьте, что Directus доступен

**Готово!** Ваш бот должен работать. 🎉

