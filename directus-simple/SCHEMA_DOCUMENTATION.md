# Directus Schema Documentation - Scooter Rental Business

## 📋 Overview

This Directus instance is configured for managing a motorcycle/scooter rental and service business. The data model consists of 5 main collections with comprehensive field sets and relationships.

## 🌐 Access Information

- **URL**: http://localhost:8055
- **Email**: seocos@gmail.com
- **Password**: directus2024!

## 📊 Collections Structure

### 1. **Clients** Collection
**Icon**: 👥 people_alt  
**Purpose**: Manage customer database and contact information

#### Fields:
- **status** (dropdown): Активный / Неактивный / Архив
- **first_name** (text): Имя клиента
- **last_name** (text): Фамилия клиента
- **email** (text): Email address
- **phone_primary** (text): Основной телефон
- **phone_secondary** (text): Дополнительный телефон
- **date_of_birth** (date): Дата рождения
- **address_street** (text): Адрес
- **address_city** (text): Город
- **address_postal_code** (text): Индекс
- **drivers_license_number** (text): Номер водительских прав
- **drivers_license_expiry** (date): Срок действия прав
- **emergency_contact_name** (text): Контакт для экстренной связи
- **emergency_contact_phone** (text): Телефон экстренного контакта
- **notes** (rich text): Заметки

#### Relationships:
- **communications** (O2M): История коммуникаций с клиентом
- **rental_history** (O2M): История аренд клиента

---

### 2. **Scooters** Collection
**Icon**: 🛵 two_wheeler  
**Purpose**: Motorcycle/scooter inventory with technical specifications, maintenance tracking, and pricing

#### Field Groups:

##### Basic Info
- **status** (dropdown): Доступен / В аренде / На обслуживании / Списан
- **power** (text): Мощность (e.g., "125cc")
- **model** (text): Модель (required)
- **year** (integer): Год выпуска (required)
- **color** (text): Цвет
- **scooter_number_old** (text): Номер скутера (старый) (required)
- **sticker** (text): Наклейка
- **rental_sticker** (text): Наклейка о аренде

##### Current Rental
- **client_name** (text): Имя клиента (текущая аренда)
- **client_phone** (text): Номер клиента
- **rental_start** (date): Начало аренды
- **rental_end** (date): Конец аренды

##### Maintenance - Engine
- **oil_change_date** (date): Дата замены масла двигателя
- **oil_change_km** (integer): Масло движ км
- **gear_oil_date** (date): Дата замены gear oil
- **gear_oil_km** (integer): Gear oil км
- **radiator_water_date** (date): Вода радиатор дата
- **radiator_water_km** (integer): Вода радиатор км
- **air_filter_date** (date): Воздушный фильтр дата
- **air_filter_km** (integer): Воздушный фильтр км
- **spark_plugs_date** (date): Свечи дата
- **spark_plugs_km** (integer): Свечи км

##### Maintenance - Brakes
- **front_brakes_date** (date): Тормоза передние дата
- **front_brakes_km** (integer): Тормоза передние км
- **rear_brakes_date** (date): Тормоза задние дата
- **rear_brakes_km** (integer): Тормоза задние км
- **rear_disc_note** (text): Задний диск (заметка)

##### Documents
- **tech_passport_date** (date): Тех талон дата
- **insurance_date** (date): Страховка дата

##### Components
- **cigarette_lighter** (boolean): Прикуриватель
- **front_bearing** (text): Передний подшипник
- **rear_bearing** (text): Задний подшипник
- **front_tire** (text): Резина передняя
- **rear_tire** (text): Резина задняя
- **battery** (text): Батарея
- **belt** (text): Ремень
- **starter** (text): Стартер
- **gasket** (text): Прокладка
- **water** (text): Вода
- **sinotrack_gps** (text): Sinotrack GPS

##### Photos
- **main_photo** (file): Главное фото
- **photo_link** (text): Ссылка на фото
- **photos** (files): Дополнительные фото

##### Pricing - Basic
- **price** (decimal): Базовая цена
- **price_1_year_rent** (decimal): 1 year rent
- **price_6_month_high_season** (decimal): 6 month high season
- **price_6_month_low_season** (decimal): 6 month low season

##### Pricing - Daily
- **price_1_3_days** (decimal): 1-3 days
- **price_4_7_days** (decimal): 4-7 days
- **price_7_14_days** (decimal): 7-14 days
- **price_15_25_days** (decimal): 15-25 days

##### Pricing - Monthly
- **price_december** (decimal): December
- **price_january** (decimal): January
- **price_february** (decimal): February
- **price_march** (decimal): March
- **price_april** (decimal): April
- **price_may** (decimal): May
- **price_summer** (decimal): Summer
- **price_september** (decimal): September
- **price_october** (decimal): October
- **price_november** (decimal): November

#### Relationships:
- **rental_history** (O2M): История аренд скутера
- **maintenance_history** (O2M): История обслуживания

---

### 3. **Communications** Collection
**Icon**: 💬 chat  
**Purpose**: Track all client interactions and communications

#### Fields:
- **client** (M2O): Клиент (required, links to Clients)
- **communication_type** (dropdown): Телефон / Email / SMS / Лично / WhatsApp / Другое
- **direction** (dropdown): Входящий / Исходящий
- **subject** (text): Тема
- **content** (rich text): Содержание (required)
- **communication_date** (timestamp): Дата коммуникации (required)
- **follow_up_required** (boolean): Требуется последующий контакт
- **follow_up_date** (date): Дата последующего контакта

---

### 4. **Rentals** Collection
**Icon**: 🧾 receipt_long  
**Purpose**: Track rental transactions and history

#### Fields:
- **status** (dropdown): Забронирован / Активный / Завершен / Отменен
- **rental_number** (text): Номер аренды (required)
- **client** (M2O): Клиент (required, links to Clients)
- **scooter** (M2O): Скутер (required, links to Scooters)
- **start_date** (timestamp): Дата начала (required)
- **end_date** (timestamp): Дата окончания (required)
- **actual_return_date** (timestamp): Фактическая дата возврата
- **rental_rate** (decimal): Ставка аренды (required)
- **total_amount** (decimal): Общая сумма (required)
- **deposit_paid** (decimal): Депозит (required)
- **payment_status** (dropdown): Ожидает оплаты / Частично оплачен / Оплачен / Возвращен
- **payment_method** (dropdown): Наличные / Карта / Банковский перевод / Другое
- **notes** (rich text): Заметки

---

### 5. **Maintenance Records** Collection
**Icon**: 🔧 build  
**Purpose**: Track all maintenance and service history for scooters

#### Fields:
- **scooter** (M2O): Скутер (required, links to Scooters)
- **maintenance_type** (dropdown): Замена масла / Замена шин / Обслуживание тормозов / Общее обслуживание / Ремонт / Инспекция / Другое
- **maintenance_date** (date): Дата обслуживания (required)
- **mileage_at_service** (integer): Пробег при обслуживании (км)
- **description** (text): Описание работ (required)
- **parts_replaced** (text): Замененные детали
- **cost_parts** (decimal): Стоимость деталей
- **cost_labor** (decimal): Стоимость работы
- **cost_total** (decimal): Общая стоимость
- **service_provider** (text): Поставщик услуг
- **notes** (rich text): Заметки

---

## 🔗 Relationship Diagram

```
Clients
  ├─→ Communications (O2M)
  └─→ Rentals (O2M)

Scooters
  ├─→ Rentals (O2M)
  └─→ Maintenance Records (O2M)

Rentals
  ├─→ Client (M2O)
  └─→ Scooter (M2O)

Communications
  └─→ Client (M2O)

Maintenance Records
  └─→ Scooter (M2O)
```

---

## 🚀 Setup Scripts

All setup scripts are located in the `directus-simple` directory:

1. **create-full-schema.js** - Creates all collections and basic fields
2. **create-relationships.js** - Creates rental and maintenance fields with relationships
3. **fix-relationships.js** - Fixes O2M relationship configurations
4. **add-sample-data.js** - Adds sample data for testing

To run any script:
```bash
cd directus-simple
node <script-name>.js
```

---

## 📝 Sample Data Included

The system includes sample data:
- 2 clients (Иван Петров, Anna Schmidt)
- 2 scooters (Honda PCX 2022, Yamaha Aerox 2023)
- 1 communication record
- 1 active rental
- 1 maintenance record

---

## 💡 Usage Tips

1. **Scooter Status Management**: When creating a rental, update the scooter's status to "В аренде" and fill in current rental fields
2. **Pricing**: Each scooter has flexible pricing for different rental periods and seasons
3. **Maintenance Tracking**: Use both the maintenance_records collection for detailed history AND the scooter's maintenance fields for quick reference
4. **Client Communications**: Log all interactions in the communications collection for complete CRM functionality

---

## 🎯 Next Steps

Consider implementing:
1. **Directus Flows** for automation (rental reminders, maintenance alerts)
2. **Insights Dashboards** for analytics (revenue, utilization rates)
3. **Custom endpoints** for rental calculations
4. **Email notifications** for rental confirmations
5. **File uploads** for scooter photos and client documents

