# 📚 Руководство по работе с системой ботов

## 🎯 Как правильно формулировать задачи для AI

### ✅ ПРАВИЛЬНАЯ формулировка задачи:

```
ЗАДАЧА: Добавить функцию проверки наличия скутера в базе данных

КОНТЕКСТ:
- Файл с бизнес-логикой: wa_tg_bot/src/core/message_processor.py
- Интеграция с Directus: wa_tg_bot/src/integrations/directus.py
- Коллекция в Directus: scooters (поля: id, model, price, available)

ТРЕБОВАНИЯ:
1. Когда пользователь спрашивает "Есть ли Honda PCX?", бот должен проверить наличие в БД
2. Если скутер есть и available=true, ответить "Да, Honda PCX доступен, цена X бат/день"
3. Если скутер есть но available=false, ответить "Honda PCX сейчас занят, будет доступен через X дней"
4. Если скутера нет, ответить "К сожалению, Honda PCX нет в наличии"

ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
- Бот корректно отвечает на вопросы о наличии
- Все запросы логируются
- История сохраняется в Directus
```

### ❌ НЕПРАВИЛЬНАЯ формулировка:

```
"Сделай так, чтобы бот знал про скутеры"
```

---

## 📁 Структура проекта и назначение файлов

### 🔧 Основные файлы конфигурации

| Файл | Назначение | Когда ссылаться |
|------|-----------|-----------------|
| `wa_tg_bot/.env` | Все секреты и настройки | При изменении API ключей, токенов |
| `wa_tg_bot/src/config.py` | Загрузка конфигурации | При добавлении новых настроек |
| `wa_tg_bot/requirements.txt` | Python зависимости | При добавлении новых библиотек |

### 🤖 Боты и обработка сообщений

| Файл | Назначение | Когда ссылаться |
|------|-----------|-----------------|
| `wa_tg_bot/src/main.py` | Точка входа, запуск ботов | При изменении логики запуска |
| `wa_tg_bot/src/whatsapp/bot.py` | WhatsApp бот (Green API) | При работе с WhatsApp функциями |
| `wa_tg_bot/src/telegram/bot.py` | Telegram бот (Telethon) | При работе с Telegram функциями |
| `wa_tg_bot/src/core/message_processor.py` | **ГЛАВНЫЙ ФАЙЛ** - обработка сообщений | **При добавлении ЛЮБОЙ бизнес-логики** |
| `wa_tg_bot/src/core/base.py` | Базовые классы и типы | При создании новых типов сообщений |

### 🔌 Интеграции

| Файл | Назначение | Когда ссылаться |
|------|-----------|-----------------|
| `wa_tg_bot/src/integrations/directus.py` | **Работа с БД через Directus** | **При работе с данными из БД** |
| `wa_tg_bot/src/integrations/ai.py` | Генерация ответов через DeepSeek AI | При изменении логики AI |

### 📊 База данных (Directus)

| Коллекция | Назначение | Поля |
|-----------|-----------|------|
| `bot_prompts` | Системные промпты для AI | name, content, messenger, active |
| `bot_messages` | История всех сообщений | user_id, messenger, direction, content, timestamp |
| `bot_states` | Состояния диалогов | user_id, messenger, state, data, expires_at |
| `leads` | Лиды (потенциальные клиенты) | user_id, phone, name, messenger, first_contact_date, last_contact_date, status |

---

## 🎯 Типичные задачи и файлы для работы

### 1️⃣ Добавить новую коллекцию в Directus

**Файлы для работы:**
- `directus-simple/data.db` - база данных SQLite
- `wa_tg_bot/src/integrations/directus.py` - добавить методы для работы с коллекцией

**Пример задачи:**
```
ЗАДАЧА: Создать коллекцию "scooters" в Directus

ТРЕБОВАНИЯ:
1. Создать таблицу в directus-simple/data.db с полями:
   - id (integer, primary key)
   - model (string) - модель скутера
   - brand (string) - бренд
   - price_per_day (integer) - цена за день в батах
   - available (boolean) - доступен ли сейчас
   - image_url (string) - ссылка на фото
   
2. Добавить права для Administrator policy

3. Добавить методы в DirectusClient (wa_tg_bot/src/integrations/directus.py):
   - get_scooters() - получить все скутеры
   - get_scooter_by_model(model: str) - найти скутер по модели
   - update_scooter_availability(scooter_id: int, available: bool) - обновить доступность

ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
- Коллекция создана и видна в Directus UI (http://localhost:8055)
- Методы работают корректно
- Есть тесты для новых методов
```

### 2️⃣ Изменить логику обработки сообщений

**Файлы для работы:**
- `wa_tg_bot/src/core/message_processor.py` - **ГЛАВНЫЙ ФАЙЛ**
- `wa_tg_bot/src/integrations/directus.py` - если нужны данные из БД
- `wa_tg_bot/src/integrations/ai.py` - если нужно изменить AI

**Пример задачи:**
```
ЗАДАЧА: Добавить команду /start для приветствия новых пользователей

КОНТЕКСТ:
- Файл: wa_tg_bot/src/core/message_processor.py
- Метод: process_incoming()

ТРЕБОВАНИЯ:
1. Если сообщение == "/start", отправить приветственное сообщение:
   "Привет! Я бот компании по аренде скутеров на Пхукете. Чем могу помочь?"
   
2. Не использовать AI для команды /start (экономия токенов)

3. Сохранить команду в bot_messages как обычное сообщение

ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
- Команда /start работает в WhatsApp и Telegram
- Ответ приходит мгновенно (без AI)
- Логи показывают обработку команды
```

### 3️⃣ Добавить доступ бота к новым данным из БД

**Файлы для работы:**
- `wa_tg_bot/src/integrations/directus.py` - добавить методы
- `wa_tg_bot/src/core/message_processor.py` - использовать методы
- `wa_tg_bot/src/integrations/ai.py` - передать данные в промпт

**Пример задачи:**
```
ЗАДАЧА: Бот должен знать актуальные цены на скутеры из БД

КОНТЕКСТ:
- Коллекция: scooters (уже создана)
- Файл интеграции: wa_tg_bot/src/integrations/directus.py
- Файл обработки: wa_tg_bot/src/core/message_processor.py

ТРЕБОВАНИЯ:
1. В DirectusClient добавить метод get_scooter_prices() -> List[Dict]
   Возвращает: [{"model": "Honda PCX", "price": 300}, ...]

2. В MessageProcessor.process_incoming():
   - Перед генерацией AI ответа получить цены: prices = await self.directus.get_scooter_prices()
   - Добавить цены в контекст для AI: "Актуальные цены: {prices}"

3. AI должен использовать эти данные при ответе на вопросы о ценах

ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
- Когда пользователь спрашивает "Сколько стоит Honda PCX?", бот отвечает актуальной ценой из БД
- Если цена меняется в БД, бот сразу отвечает новой ценой
- Логи показывают, что данные получены из БД
```

---

## 🔍 Как найти нужный код

### Поиск по функциональности:

| Что нужно найти | Где искать | Команда поиска |
|-----------------|-----------|----------------|
| Обработка входящих сообщений | `message_processor.py` | Метод `process_incoming()` |
| Отправка сообщений | `whatsapp/bot.py`, `telegram/bot.py` | Метод `send_message()` |
| Работа с БД | `integrations/directus.py` | Класс `DirectusClient` |
| Генерация AI ответов | `integrations/ai.py` | Метод `generate_response()` |
| Логирование | `utils/logger.py` | Функция `setup_logger()` |
| Конфигурация | `config.py` | Класс `Settings` |

---

## 📝 Шаблон для новой задачи

```markdown
ЗАДАЧА: [Краткое описание]

КОНТЕКСТ:
- Файлы для работы: [список файлов]
- Коллекции Directus: [если нужны]
- Зависимости: [если нужны новые библиотеки]

ТРЕБОВАНИЯ:
1. [Конкретное требование 1]
2. [Конкретное требование 2]
3. [Конкретное требование 3]

ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
- [Что должно работать]
- [Как проверить]
- [Какие логи должны быть]

ТЕСТИРОВАНИЕ:
- [Как протестировать функцию]
- [Ожидаемый результат теста]
```

---

## 🚀 Быстрый старт для типичных задач

### Задача: "Добавить новую команду боту"

1. Открыть `wa_tg_bot/src/core/message_processor.py`
2. Найти метод `process_incoming()`
3. Добавить проверку команды:
   ```python
   if message.text.startswith("/mycommand"):
       return "Ответ на команду"
   ```

### Задача: "Получить данные из новой таблицы БД"

1. Открыть `wa_tg_bot/src/integrations/directus.py`
2. Добавить метод в класс `DirectusClient`:
   ```python
   async def get_my_data(self) -> List[Dict]:
       response = await self.client.get(
           f"{self.url}/items/my_collection",
           headers=self._get_headers()
       )
       return response.json()["data"]
   ```

### Задача: "Изменить промпт для AI"

1. Открыть Directus UI: http://localhost:8055
2. Перейти в коллекцию `bot_prompts`
3. Отредактировать поле `content`
4. Бот сразу начнёт использовать новый промпт

---

## 📞 Поддержка

Если возникли вопросы:
1. Проверьте логи: `wa_tg_bot/logs/bot.log`
2. Проверьте Directus UI: http://localhost:8055
3. Проверьте статус ботов: логи в консоли

**Основные файлы для 90% задач:**
- `wa_tg_bot/src/core/message_processor.py` - бизнес-логика
- `wa_tg_bot/src/integrations/directus.py` - работа с данными
- `wa_tg_bot/src/integrations/ai.py` - AI ответы

