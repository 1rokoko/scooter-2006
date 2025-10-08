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

## ✅ Статус: РАБОТАЕТ!

- ✅ **WhatsApp бот** получает и отвечает на сообщения
- ✅ **Telegram бот** получает и отвечает на сообщения
- ✅ **DeepSeek AI** генерирует контекстные ответы
- ✅ **История** сохраняется в Directus
- ✅ **Лиды** автоматически создаются при первом сообщении

## ✨ Возможности

### MVP (Этап 1) - WhatsApp ✅
- ✅ Отправка и получение сообщений через WhatsApp
- ✅ Генерация ответов на базе промптов из Directus
- ✅ Управление состояниями диалогов
- ✅ Сохранение истории в Directus

### Этап 2 - Telegram ✅
- ✅ Подключение личного аккаунта Telegram
- ✅ Единая логика обработки для обоих мессенджеров
- ✅ Синхронизация состояний
- ✅ Автоматическое создание лидов

### Этап 3 - Расширенные функции 🔄
- 🔄 Уведомления и напоминания
- 🔄 Скоринг лидов
- 🔄 Аналитика взаимодействий
- 🔄 Автоматизация бизнес-процессов

## 📚 Документация для разработчиков

### 🎯 Начните отсюда:
- **[📖 Как работать с системой](docs/HOW_TO_WORK_WITH_SYSTEM.md)** - **ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ!**
- **[📊 Схема базы данных](docs/DATABASE_SCHEMA.md)** - Все коллекции и примеры использования

### 📖 Дополнительная документация:
- [🏗️ Архитектура](ARCHITECTURE.md) - Общая архитектура системы
- [🚀 Быстрый старт](QUICKSTART.md) - Установка и запуск
- [Directus Setup](docs/DIRECTUS_SETUP.md)
- [Green API Setup](docs/GREEN_API_SETUP.md)
- [Telegram Setup](docs/TELEGRAM_SETUP.md)

## 🎯 Как формулировать задачи

**✅ ПРАВИЛЬНО:**
```
ЗАДАЧА: Добавить проверку наличия скутера в БД

КОНТЕКСТ:
- Файл: wa_tg_bot/src/core/message_processor.py
- Коллекция: scooters (поля: model, available, price)

ТРЕБОВАНИЯ:
1. При вопросе "Есть ли Honda PCX?" проверить БД
2. Если available=true, ответить с ценой
3. Если available=false, сообщить когда будет доступен
```

**❌ НЕПРАВИЛЬНО:**
```
"Сделай так, чтобы бот знал про скутеры"
```

**Подробнее:** [docs/HOW_TO_WORK_WITH_SYSTEM.md](docs/HOW_TO_WORK_WITH_SYSTEM.md)

## 📁 Ключевые файлы

| Файл | Назначение | Когда использовать |
|------|-----------|-------------------|
| `src/core/message_processor.py` | **ГЛАВНЫЙ** - вся бизнес-логика | При добавлении ЛЮБОЙ логики |
| `src/integrations/directus.py` | Работа с БД | При работе с данными |
| `src/integrations/ai.py` | AI ответы | При изменении AI логики |
| `src/whatsapp/bot.py` | WhatsApp бот | При работе с WhatsApp |
| `src/telegram/bot.py` | Telegram бот | При работе с Telegram |

## 🗄️ База данных (Directus)

| Коллекция | Назначение |
|-----------|-----------|
| `bot_prompts` | Системные промпты для AI |
| `bot_messages` | История всех сообщений |
| `bot_states` | Состояния диалогов |
| `leads` | Лиды (автоматически создаются) |

**Directus UI:** http://localhost:8055
- Email: seocos@gmail.com
- Password: directus2024!

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

