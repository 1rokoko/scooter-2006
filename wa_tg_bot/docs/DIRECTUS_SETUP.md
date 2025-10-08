# 🗄️ Настройка Directus для бота

Это руководство поможет вам настроить необходимые коллекции в Directus для работы бота.

## Необходимые коллекции

Боту требуются 3 коллекции в Directus:

1. **bot_prompts** - хранение промптов для AI
2. **bot_messages** - история сообщений
3. **bot_states** - состояния пользователей

## Создание коллекций

### Способ 1: Через Directus UI

#### 1. Коллекция `bot_prompts`

1. Откройте Directus Admin Panel
2. Перейдите в Settings → Data Model
3. Нажмите "Create Collection"
4. Название: `bot_prompts`
5. Добавьте поля:

| Поле | Тип | Настройки |
|------|-----|-----------|
| `id` | UUID | Primary Key, Auto-generate |
| `name` | String | Required, Unique |
| `content` | Text | Required |
| `messenger` | String | Optional (whatsapp, telegram, null) |
| `active` | Boolean | Default: true |
| `created_at` | Timestamp | Auto-generate on create |
| `updated_at` | Timestamp | Auto-update |

#### 2. Коллекция `bot_messages`

1. Создайте новую коллекцию: `bot_messages`
2. Добавьте поля:

| Поле | Тип | Настройки |
|------|-----|-----------|
| `id` | UUID | Primary Key, Auto-generate |
| `user_id` | String | Required, Indexed |
| `messenger` | String | Required (whatsapp, telegram) |
| `direction` | String | Required (incoming, outgoing) |
| `content` | Text | Required |
| `created_at` | Timestamp | Auto-generate on create |

#### 3. Коллекция `bot_states`

1. Создайте новую коллекцию: `bot_states`
2. Добавьте поля:

| Поле | Тип | Настройки |
|------|-----|-----------|
| `id` | UUID | Primary Key, Auto-generate |
| `user_id` | String | Required, Indexed |
| `messenger` | String | Required (whatsapp, telegram) |
| `state` | String | Required |
| `data` | JSON | Optional |
| `created_at` | Timestamp | Auto-generate on create |
| `expires_at` | Timestamp | Required |

### Способ 2: Через SQL (для PostgreSQL)

Если вы используете PostgreSQL, можете выполнить этот SQL скрипт:

```sql
-- Создание коллекции bot_prompts
CREATE TABLE bot_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    messenger VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание коллекции bot_messages
CREATE TABLE bot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    messenger VARCHAR(50) NOT NULL,
    direction VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для bot_messages
CREATE INDEX idx_bot_messages_user_id ON bot_messages(user_id);
CREATE INDEX idx_bot_messages_messenger ON bot_messages(messenger);
CREATE INDEX idx_bot_messages_created_at ON bot_messages(created_at);

-- Создание коллекции bot_states
CREATE TABLE bot_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    messenger VARCHAR(50) NOT NULL,
    state VARCHAR(255) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Индексы для bot_states
CREATE INDEX idx_bot_states_user_messenger ON bot_states(user_id, messenger);
CREATE INDEX idx_bot_states_expires_at ON bot_states(expires_at);

-- Уникальный индекс для предотвращения дублирования состояний
CREATE UNIQUE INDEX idx_bot_states_unique ON bot_states(user_id, messenger);
```

## Настройка прав доступа

### Создание роли для бота

1. Перейдите в Settings → Roles & Permissions
2. Создайте новую роль: `Bot`
3. Настройте права:

#### bot_prompts
- ✅ Read (все записи)
- ❌ Create
- ❌ Update
- ❌ Delete

#### bot_messages
- ✅ Create
- ✅ Read (только свои)
- ❌ Update
- ❌ Delete

#### bot_states
- ✅ Create
- ✅ Read (только свои)
- ✅ Update (только свои)
- ✅ Delete (только свои)

### Создание пользователя для бота

1. Перейдите в User Directory
2. Создайте нового пользователя:
   - Email: `bot@yourdomain.com`
   - Password: (сгенерируйте надежный пароль)
   - Role: `Bot`
3. Сохраните credentials в `.env` файл

## Добавление тестовых данных

### Создание промпта по умолчанию

1. Откройте коллекцию `bot_prompts`
2. Создайте новую запись:

```json
{
  "name": "default",
  "content": "Ты - дружелюбный помощник компании по аренде самокатов. Отвечай кратко и по делу. Помогай клиентам с вопросами об аренде, ценах и условиях.",
  "messenger": null,
  "active": true
}
```

### Создание промпта для WhatsApp

```json
{
  "name": "default",
  "content": "Ты - помощник компании по аренде самокатов в WhatsApp. Будь дружелюбным и используй эмодзи. Помогай клиентам быстро найти нужную информацию.",
  "messenger": "whatsapp",
  "active": true
}
```

### Создание промпта для Telegram

```json
{
  "name": "default",
  "content": "Ты - помощник компании по аренде самокатов в Telegram. Отвечай структурированно, используй форматирование Markdown. Будь профессиональным и информативным.",
  "messenger": "telegram",
  "active": true
}
```

## Проверка настройки

### Тест подключения

Создайте файл `test_directus.py`:

```python
import asyncio
from src.integrations.directus import DirectusClient

async def test():
    client = DirectusClient(
        url="http://localhost:8055",
        email="bot@yourdomain.com",
        password="your_password"
    )
    
    # Аутентификация
    if await client.authenticate():
        print("✅ Аутентификация успешна")
        
        # Получение промпта
        prompt = await client.get_prompt("default")
        if prompt:
            print(f"✅ Промпт получен: {prompt[:50]}...")
        else:
            print("❌ Промпт не найден")
        
        # Сохранение тестового сообщения
        if await client.save_message(
            user_id="test_user",
            messenger="whatsapp",
            direction="incoming",
            content="Тестовое сообщение"
        ):
            print("✅ Сообщение сохранено")
        else:
            print("❌ Ошибка сохранения сообщения")
        
        await client.close()
    else:
        print("❌ Ошибка аутентификации")

asyncio.run(test())
```

Запустите:
```bash
python test_directus.py
```

## Мониторинг

### Просмотр истории сообщений

1. Откройте Directus Admin Panel
2. Перейдите в коллекцию `bot_messages`
3. Используйте фильтры:
   - По пользователю: `user_id`
   - По мессенджеру: `messenger`
   - По дате: `created_at`

### Просмотр активных состояний

1. Откройте коллекцию `bot_states`
2. Фильтр: `expires_at` > текущее время
3. Сортировка: по `created_at` (DESC)

## Очистка данных

### Удаление устаревших состояний

Создайте Flow в Directus:

1. Trigger: Schedule (каждый час)
2. Operation: Run Script

```javascript
module.exports = async function(data) {
    const { database } = data;
    
    // Удалить устаревшие состояния
    await database('bot_states')
        .where('expires_at', '<', new Date())
        .delete();
    
    return { deleted: true };
};
```

### Архивация старых сообщений

Для архивации сообщений старше 30 дней:

```sql
-- Создать таблицу архива
CREATE TABLE bot_messages_archive AS 
SELECT * FROM bot_messages WHERE 1=0;

-- Переместить старые сообщения
INSERT INTO bot_messages_archive
SELECT * FROM bot_messages
WHERE created_at < NOW() - INTERVAL '30 days';

-- Удалить из основной таблицы
DELETE FROM bot_messages
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

**Готово!** Directus настроен для работы с ботом.

Следующий шаг: [Запуск бота](../README.md#🚀-быстрый-старт)

