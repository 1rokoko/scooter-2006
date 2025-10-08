# 📊 Схема базы данных (Directus)

## 🗄️ Текущие коллекции

### 1. `bot_prompts` - Системные промпты для AI

**Назначение:** Хранение промптов для разных мессенджеров и сценариев

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `id` | integer | Уникальный ID | 1 |
| `name` | string | Название промпта | "greeting", "default" |
| `content` | text | Текст промпта | "Ты - дружелюбный помощник..." |
| `messenger` | string | Мессенджер (whatsapp/telegram/null) | "whatsapp" или null |
| `active` | boolean | Активен ли промпт | true |

**Как использовать:**
```python
# В message_processor.py
prompt = await self.directus.get_prompt("default", messenger="whatsapp")
```

**Примеры промптов:**
- `default` (messenger=null) - универсальный промпт для всех мессенджеров
- `greeting` (messenger=null) - приветственное сообщение
- `booking` (messenger="whatsapp") - промпт для бронирования через WhatsApp

---

### 2. `bot_messages` - История всех сообщений

**Назначение:** Хранение полной истории переписки для контекста AI

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `id` | integer | Уникальный ID | 1 |
| `user_id` | string | ID пользователя | "66921692370@c.us" (WhatsApp) или "1160520247" (Telegram) |
| `messenger` | string | Мессенджер | "whatsapp" или "telegram" |
| `direction` | string | Направление | "incoming" или "outgoing" |
| `content` | text | Текст сообщения | "Привет! Сколько стоит аренда?" |
| `timestamp` | datetime | Время сообщения | "2025-10-09T01:50:33Z" |

**Как использовать:**
```python
# Получить историю для контекста
history = await self.directus.get_message_history(
    user_id="66921692370@c.us",
    messenger="whatsapp",
    limit=10
)
```

**Важно:**
- `user_id` для WhatsApp: `{phone}@c.us` (например, "66921692370@c.us")
- `user_id` для Telegram: числовой ID (например, "1160520247")
- История используется для контекстного общения AI

---

### 3. `bot_states` - Состояния диалогов

**Назначение:** Хранение состояния пользователя в диалоге (для сложных сценариев)

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `id` | integer | Уникальный ID | 1 |
| `user_id` | string | ID пользователя | "66921692370@c.us" |
| `messenger` | string | Мессенджер | "whatsapp" |
| `state` | string | Текущее состояние | "awaiting_payment", "selecting_scooter" |
| `data` | json | Дополнительные данные | {"scooter_id": 5, "days": 3} |
| `expires_at` | datetime | Когда истекает | "2025-10-10T00:00:00Z" |

**Как использовать:**
```python
# Сохранить состояние
await self.directus.save_state(
    user_id="66921692370@c.us",
    messenger="whatsapp",
    state="awaiting_payment",
    data={"scooter_id": 5, "amount": 900}
)

# Получить состояние
state = await self.directus.get_state(
    user_id="66921692370@c.us",
    messenger="whatsapp"
)
```

**Примеры состояний:**
- `awaiting_payment` - ожидает оплаты
- `selecting_scooter` - выбирает скутер
- `confirming_booking` - подтверждает бронирование

---

### 4. `leads` - Лиды (потенциальные клиенты)

**Назначение:** Автоматическое сохранение всех пользователей, написавших боту

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `id` | integer | Уникальный ID | 1 |
| `user_id` | string | ID пользователя | "66921692370@c.us" |
| `phone` | string | Номер телефона | "+66921692370" |
| `name` | string | Имя пользователя | "Arik K" |
| `messenger` | string | Мессенджер | "whatsapp" |
| `first_contact_date` | datetime | Первое сообщение | "2025-10-09T01:43:02Z" |
| `last_contact_date` | datetime | Последнее сообщение | "2025-10-09T02:00:29Z" |
| `status` | string | Статус лида | "new", "contacted", "converted" |

**Как использовать:**
```python
# Создаётся автоматически при первом сообщении
# В message_processor.py:
await self.directus.create_or_update_lead(
    user_id=message.user.id,
    phone=message.user.phone,
    name=message.user.name,
    messenger=message.messenger.value
)
```

**Статусы лидов:**
- `new` - новый лид (только написал)
- `contacted` - с ним общались
- `converted` - стал клиентом (забронировал)
- `lost` - потерян (не ответил)

---

## 🔧 Как добавить новую коллекцию

### Пример: Добавить коллекцию "scooters"

**Шаг 1: Создать таблицу в SQLite**

```python
# Создать файл: wa_tg_bot/create_scooters_collection.py

import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "..", "directus-simple", "data.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Создать таблицу
cursor.execute("""
    CREATE TABLE IF NOT EXISTS scooters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        price_per_day INTEGER NOT NULL,
        available BOOLEAN DEFAULT 1,
        image_url TEXT,
        description TEXT
    )
""")

# Добавить в directus_collections
cursor.execute("""
    INSERT INTO directus_collections (collection, icon, note)
    VALUES ('scooters', 'directions_bike', 'Scooters available for rent')
""")

# Добавить права для Administrator
cursor.execute("SELECT id FROM directus_policies WHERE name = 'Administrator'")
policy_id = cursor.fetchone()[0]

for action in ['create', 'read', 'update', 'delete']:
    cursor.execute("""
        INSERT INTO directus_permissions (policy, collection, action, permissions, fields)
        VALUES (?, 'scooters', ?, '{}', '*')
    """, (policy_id, action))

conn.commit()
conn.close()
print("✅ Collection 'scooters' created!")
```

**Шаг 2: Добавить методы в DirectusClient**

```python
# В wa_tg_bot/src/integrations/directus.py

class DirectusClient:
    # ... существующие методы ...
    
    async def get_scooters(self, available_only: bool = False) -> List[Dict]:
        """Get all scooters from database."""
        try:
            params = {}
            if available_only:
                params["filter"] = json.dumps({"available": {"_eq": True}})
            
            response = await self.client.get(
                f"{self.url}/items/scooters",
                headers=self._get_headers(),
                params=params
            )
            response.raise_for_status()
            return response.json()["data"]
        except Exception as e:
            logger.error(f"Failed to get scooters: {e}")
            return []
    
    async def get_scooter_by_model(self, model: str) -> Optional[Dict]:
        """Find scooter by model name."""
        try:
            filter_params = {"model": {"_eq": model}}
            response = await self.client.get(
                f"{self.url}/items/scooters",
                headers=self._get_headers(),
                params={"filter": json.dumps(filter_params), "limit": 1}
            )
            response.raise_for_status()
            data = response.json()["data"]
            return data[0] if data else None
        except Exception as e:
            logger.error(f"Failed to find scooter: {e}")
            return None
```

**Шаг 3: Использовать в message_processor.py**

```python
# В wa_tg_bot/src/core/message_processor.py

async def process_incoming(self, message: BaseMessage) -> Optional[str]:
    # ... существующий код ...
    
    # Добавить данные о скутерах в контекст для AI
    scooters = await self.directus.get_scooters(available_only=True)
    scooter_info = "\n".join([
        f"- {s['brand']} {s['model']}: {s['price_per_day']} бат/день"
        for s in scooters
    ])
    
    # Добавить в промпт
    enhanced_prompt = f"{system_prompt}\n\nДоступные скутеры:\n{scooter_info}"
    
    # Генерировать ответ с учётом данных
    response = await self.ai.generate_response(
        messages=history,
        system_prompt=enhanced_prompt
    )
```

---

## 📈 Расширение функционала: Примеры

### Пример 1: Добавить бронирования

**Новая коллекция: `bookings`**

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | integer | ID бронирования |
| `user_id` | string | ID пользователя |
| `scooter_id` | integer | ID скутера |
| `start_date` | date | Дата начала |
| `end_date` | date | Дата окончания |
| `total_price` | integer | Общая стоимость |
| `status` | string | "pending", "confirmed", "completed" |
| `created_at` | datetime | Когда создано |

### Пример 2: Добавить отзывы

**Новая коллекция: `reviews`**

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | integer | ID отзыва |
| `user_id` | string | ID пользователя |
| `scooter_id` | integer | ID скутера |
| `rating` | integer | Оценка (1-5) |
| `comment` | text | Текст отзыва |
| `created_at` | datetime | Когда создан |

### Пример 3: Добавить локации

**Новая коллекция: `locations`**

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | integer | ID локации |
| `name` | string | Название (Patong, Kata, Karon) |
| `address` | text | Адрес |
| `latitude` | float | Широта |
| `longitude` | float | Долгота |
| `working_hours` | string | Часы работы |

---

## 🔗 Связи между коллекциями

```
leads (пользователи)
  └─> bot_messages (история переписки)
  └─> bot_states (текущее состояние)
  └─> bookings (бронирования)
      └─> scooters (скутеры)
          └─> reviews (отзывы)
          └─> locations (где находится)
```

---

## 📝 Чеклист для добавления новой коллекции

- [ ] Создать таблицу в SQLite (`directus-simple/data.db`)
- [ ] Добавить запись в `directus_collections`
- [ ] Добавить права в `directus_permissions` для Administrator
- [ ] Перезапустить Directus
- [ ] Добавить методы в `DirectusClient` (`src/integrations/directus.py`)
- [ ] Использовать методы в `MessageProcessor` (`src/core/message_processor.py`)
- [ ] Протестировать через Directus UI (http://localhost:8055)
- [ ] Протестировать через бота
- [ ] Обновить документацию

---

## 🎯 Быстрый доступ к данным

**Directus UI:** http://localhost:8055
- Email: seocos@gmail.com
- Password: directus2024!

**SQLite Database:** `directus-simple/data.db`

**Логи бота:** `wa_tg_bot/logs/bot.log`

