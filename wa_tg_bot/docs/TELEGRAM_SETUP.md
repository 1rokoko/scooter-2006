# 💬 Настройка Telegram Userbot

Это руководство поможет вам настроить подключение личного аккаунта Telegram к боту через Telethon.

## ⚠️ Важное отличие

**Мы НЕ создаем Telegram бота!**

Мы подключаем ваш **личный аккаунт Telegram** как userbot. Это позволяет:
- Отвечать от вашего имени
- Работать в личных чатах
- Не требовать добавления бота в контакты
- Выглядеть как обычный пользователь

## Что такое Telethon?

Telethon - это Python библиотека для работы с Telegram API. Она позволяет:
- Подключаться к Telegram через личный аккаунт
- Отправлять и получать сообщения
- Работать с группами и каналами
- Автоматизировать действия

## Шаг 1: Получение API credentials

### 1.1. Перейдите на my.telegram.org

1. Откройте [https://my.telegram.org/apps](https://my.telegram.org/apps)
2. Войдите с помощью вашего номера телефона
3. Введите код подтверждения из Telegram

### 1.2. Создайте приложение

1. Нажмите "Create new application"
2. Заполните форму:
   - **App title:** `My Bot` (любое название)
   - **Short name:** `mybot` (латиница, без пробелов)
   - **Platform:** `Other`
   - **Description:** `Personal userbot` (опционально)
3. Нажмите "Create application"

### 1.3. Сохраните credentials

Вы получите:

**API ID** (число)
```
12345678
```

**API Hash** (строка)
```
0123456789abcdef0123456789abcdef
```

**⚠️ ВАЖНО:** Сохраните эти данные в безопасном месте!

## Шаг 2: Настройка .env файла

Добавьте полученные credentials в `.env` файл:

```bash
# Telegram Configuration
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=0123456789abcdef0123456789abcdef
TELEGRAM_PHONE=+79001234567
TELEGRAM_SESSION_NAME=userbot_session
```

**Замените:**
- `12345678` на ваш API ID
- `0123456789abcdef...` на ваш API Hash
- `+79001234567` на ваш номер телефона (с кодом страны)

## Шаг 3: Первый запуск и авторизация

### 3.1. Запустите бота

```bash
python src/main.py
```

### 3.2. Процесс авторизации

При первом запуске Telethon попросит:

1. **Номер телефона:**
   ```
   Please enter your phone (or bot token): +79001234567
   ```
   Введите ваш номер (уже указан в .env, просто нажмите Enter)

2. **Код подтверждения:**
   ```
   Please enter the code you received: 12345
   ```
   Введите код из Telegram (придет в "Telegram" от "Telegram")

3. **Пароль (если включена 2FA):**
   ```
   Please enter your password: 
   ```
   Введите пароль от двухфакторной аутентификации

### 3.3. Сохранение сессии

После успешной авторизации:
- Создастся файл `sessions/userbot_session.session`
- При следующих запусках авторизация не потребуется
- Сессия зашифрована и безопасна

## Шаг 4: Проверка подключения

### 4.1. Тестовый скрипт

Создайте файл `test_telegram.py`:

```python
from telethon import TelegramClient
import os
from dotenv import load_dotenv

load_dotenv()

api_id = int(os.getenv('TELEGRAM_API_ID'))
api_hash = os.getenv('TELEGRAM_API_HASH')
phone = os.getenv('TELEGRAM_PHONE')

async def main():
    client = TelegramClient('sessions/test_session', api_id, api_hash)
    await client.start(phone=phone)
    
    # Получить информацию о себе
    me = await client.get_me()
    print(f"✅ Подключен как: {me.first_name} (@{me.username})")
    
    await client.disconnect()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
```

Запустите:
```bash
python test_telegram.py
```

Ожидаемый вывод:
```
✅ Подключен как: Ваше Имя (@your_username)
```

### 4.2. Отправка тестового сообщения

```python
from telethon import TelegramClient
import os
from dotenv import load_dotenv

load_dotenv()

api_id = int(os.getenv('TELEGRAM_API_ID'))
api_hash = os.getenv('TELEGRAM_API_HASH')

async def main():
    client = TelegramClient('sessions/test_session', api_id, api_hash)
    await client.start()
    
    # Отправить сообщение себе (Saved Messages)
    await client.send_message('me', '🤖 Тестовое сообщение от бота!')
    print("✅ Сообщение отправлено в Saved Messages")
    
    await client.disconnect()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
```

## Шаг 5: Настройка обработчиков

### 5.1. Базовый обработчик входящих сообщений

```python
from telethon import TelegramClient, events

client = TelegramClient('sessions/userbot_session', api_id, api_hash)

@client.on(events.NewMessage(incoming=True))
async def handler(event):
    # Получить текст сообщения
    message = event.message.text
    
    # Получить отправителя
    sender = await event.get_sender()
    
    print(f"Получено сообщение от {sender.first_name}: {message}")
    
    # Отправить ответ
    await event.respond("Получил ваше сообщение!")

client.start()
client.run_until_disconnected()
```

## Безопасность

### ⚠️ Важные правила:

1. **Никогда не публикуйте API ID и API Hash**
2. **Не делитесь файлом сессии (.session)**
3. **Используйте .env для хранения credentials**
4. **Добавьте sessions/ в .gitignore**
5. **Включите 2FA в Telegram для дополнительной защиты**

### Защита аккаунта

1. **Включите двухфакторную аутентификацию:**
   - Telegram → Settings → Privacy and Security → Two-Step Verification
   - Установите пароль

2. **Проверяйте активные сессии:**
   - Telegram → Settings → Privacy and Security → Active Sessions
   - Завершите подозрительные сессии

3. **Ограничьте доступ к серверу:**
   - Используйте firewall
   - Ограничьте SSH доступ
   - Регулярно обновляйте систему

## Ограничения Telegram API

### Rate Limits

Telegram имеет ограничения на количество запросов:

- **Отправка сообщений:** ~30 сообщений в секунду
- **Получение сообщений:** без ограничений
- **Flood wait:** при превышении лимита - временная блокировка

### Рекомендации

1. Добавьте задержки между сообщениями:
   ```python
   import asyncio
   await asyncio.sleep(1)  # 1 секунда
   ```

2. Обрабатывайте FloodWaitError:
   ```python
   from telethon.errors import FloodWaitError
   
   try:
       await client.send_message(user, text)
   except FloodWaitError as e:
       print(f"Нужно подождать {e.seconds} секунд")
       await asyncio.sleep(e.seconds)
   ```

## Troubleshooting

### Проблема: "Phone number is invalid"

**Решение:**
- Убедитесь, что номер в международном формате: `+79001234567`
- Проверьте, что номер зарегистрирован в Telegram

### Проблема: "Code is invalid"

**Решение:**
- Проверьте код в Telegram (сообщение от "Telegram")
- Код действителен 5 минут
- Запросите новый код

### Проблема: "Session file is corrupted"

**Решение:**
1. Удалите файл сессии:
   ```bash
   rm sessions/userbot_session.session
   ```
2. Запустите бота заново
3. Пройдите авторизацию снова

### Проблема: "Two-step verification is enabled"

**Решение:**
- Введите пароль от 2FA при запросе
- Или временно отключите 2FA в настройках Telegram

### Проблема: "Account is banned"

**Решение:**
- Обратитесь в поддержку Telegram: @SpamBot
- Не используйте userbot для спама
- Соблюдайте правила Telegram

## Отличия от Bot API

| Функция | Userbot (Telethon) | Bot API |
|---------|-------------------|---------|
| Авторизация | Личный аккаунт | Bot Token |
| Доступ к личным чатам | ✅ Да | ❌ Нет |
| Команды /start | ❌ Нет | ✅ Да |
| Inline режим | ❌ Нет | ✅ Да |
| Выглядит как | Обычный пользователь | Бот |
| Rate limits | Строже | Мягче |

## Полезные ссылки

- [Telethon Documentation](https://docs.telethon.dev/)
- [Telegram API Documentation](https://core.telegram.org/api)
- [my.telegram.org](https://my.telegram.org/apps)
- [Telethon GitHub](https://github.com/LonamiWebs/Telethon)
- [Примеры кода](https://docs.telethon.dev/en/stable/quick-references/client-reference.html)

## Следующие шаги

После успешной настройки Telegram:

1. ✅ Проверьте подключение
2. ✅ Отправьте тестовое сообщение
3. ✅ Настройте обработчики
4. ✅ Запустите бота: `python src/main.py`
5. ✅ Протестируйте отправку сообщения боту

---

**Готово!** Теперь ваш Telegram аккаунт подключен к боту через Telethon.

Следующий шаг: [Настройка Directus](DIRECTUS_SETUP.md)

