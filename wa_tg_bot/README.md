# 🤖 Universal Messenger Bot for Directus

Универсальная система мессенджер-коммуникации для Directus с поддержкой WhatsApp и Telegram, интегрированная с DeepSeek AI.

## 📋 Описание

Этот проект представляет собой Python микросервис, который:
- 📱 Подключается к **WhatsApp** через Green API
- 💬 Подключается к **Telegram** через личный аккаунт (userbot)
- 🧠 Использует **DeepSeek AI** для генерации умных ответов
- 🗄️ Интегрируется с **Directus** для управления промптами и хранения истории
- 🔄 Поддерживает управление состояниями диалогов
- 📊 Логирует всю историю взаимодействий

## 🏗️ Архитектура

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│  WhatsApp   │◄────►│  Green API   │◄────►│  Python Bot     │◄────►│   Directus   │
│  (клиент)   │      │   Service    │      │   Service       │      │   REST API   │
└─────────────┘      └──────────────┘      │  - WhatsApp     │      └──────────────┘
                                            │  - Telegram     │              │
┌─────────────┐      ┌──────────────┐      │  - DeepSeek AI  │              ▼
│  Telegram   │◄────►│  Telegram    │◄────►│  - State Mgmt   │      ┌──────────────┐
│  (личный)   │      │     API      │      └─────────────────┘      │  PostgreSQL  │
└─────────────┘      └──────────────┘                               └──────────────┘
```

## ✨ Возможности

### MVP (Этап 1) - WhatsApp
- ✅ Отправка и получение сообщений через WhatsApp
- ✅ Генерация ответов на базе промптов из Directus
- ✅ Управление состояниями диалогов
- ✅ Сохранение истории в Directus

### Этап 2 - Telegram
- ✅ Подключение личного аккаунта Telegram
- ✅ Единая логика обработки для обоих мессенджеров
- ✅ Синхронизация состояний

### Этап 3 - Расширенные функции
- 🔄 Уведомления и напоминания
- 📊 Скоринг лидов
- 📈 Аналитика взаимодействий
- 🤖 Автоматизация бизнес-процессов

## 🚀 Быстрый старт

### Предварительные требования

- Python 3.10+
- Directus (уже установлен)
- Green API аккаунт
- Telegram API credentials

### Установка

1. **Клонируйте репозиторий и перейдите в директорию:**
```bash
cd wa_tg_bot
```

2. **Создайте виртуальное окружение:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

3. **Установите зависимости:**
```bash
pip install -r requirements.txt
```

4. **Настройте переменные окружения:**
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими credentials
```

5. **Запустите бота:**
```bash
python src/main.py
```

## 📚 Документация

- [Архитектура проекта](docs/ARCHITECTURE.md)
- [Настройка Green API (WhatsApp)](docs/GREEN_API_SETUP.md)
- [Настройка Telegram](docs/TELEGRAM_SETUP.md)
- [Настройка Directus](docs/DIRECTUS_SETUP.md)
- [Тестирование](docs/TESTING.md)
- [Деплой](DEPLOYMENT.md)
- [Решение проблем](docs/TROUBLESHOOTING.md)

## 🔧 Конфигурация

Основные настройки в `.env` файле:

```bash
# WhatsApp
GREEN_API_INSTANCE_ID=your_instance_id
GREEN_API_TOKEN=your_token

# Telegram
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE=+1234567890

# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_EMAIL=your_email
DIRECTUS_PASSWORD=your_password

# DeepSeek AI
DEEPSEEK_API_KEY=your_api_key
```

## 🧪 Тестирование

```bash
# Запустить все тесты
pytest

# Запустить с покрытием
pytest --cov=src

# Запустить конкретный тест
pytest tests/test_whatsapp.py
```

## 📦 Структура проекта

```
wa_tg_bot/
├── src/
│   ├── whatsapp/          # WhatsApp модуль
│   ├── telegram/          # Telegram модуль
│   ├── core/              # Общая бизнес-логика
│   ├── integrations/      # Интеграции (Directus, AI)
│   ├── utils/             # Утилиты
│   ├── config.py          # Конфигурация
│   └── main.py            # Точка входа
├── tests/                 # Тесты
├── docs/                  # Документация
├── sessions/              # Telegram сессии
└── logs/                  # Логи
```

## 🐳 Docker

```bash
# Сборка
docker-compose build

# Запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

## 🤝 Вклад в проект

Этот проект создан для интеграции с Directus CRM системой для бизнеса по аренде скутеров.

## 📄 Лицензия

MIT License

## 🔗 Полезные ссылки

- [Green API Documentation](https://green-api.com/docs/)
- [Telethon Documentation](https://docs.telethon.dev/)
- [DeepSeek API Documentation](https://platform.deepseek.com/api-docs/)
- [Directus Documentation](https://docs.directus.io/)

## 📞 Поддержка

Если у вас возникли вопросы или проблемы, обратитесь к документации в папке `docs/` или создайте issue.

---

**Версия:** 1.0.0 (MVP)  
**Статус:** В разработке  
**Последнее обновление:** 2025-01-08

