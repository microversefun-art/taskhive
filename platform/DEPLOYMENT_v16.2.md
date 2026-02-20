# TaskHive v16.2 - Инструкция по развёртыванию

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
# или
pnpm install
```

### 2. Настройка переменных окружения

Скопируйте файл `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

Необходимые переменные:
- `DATABASE_URL` — строка подключения к БД
- `JWT_SECRET` — секретный ключ для JWT токенов
- Ключи платёжных систем (Яндекс.Касса, Сбер, Тинькофф, Робокасса, Яндекс Pay)
- `TELEGRAM_BOT_TOKEN` — токен Telegram Bot
- Ключи интеграций (VK, MAX)

### 3. Миграция БД

```bash
pnpm db:push
```

### 4. Запуск в режиме разработки

```bash
pnpm dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 🐳 Docker развёртывание

### 1. Создать docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/taskhive
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - .:/app

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=taskhive
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  db_data:
```

### 2. Запустить контейнеры

```bash
docker-compose up -d
```

## 🔑 Необходимые API ключи

### Платежные системы

| Система | Сайт | Что получить |
|---------|------|-------------|
| Яндекс.Касса | https://yookassa.ru | Shop ID, API Key |
| Сбер Pay | https://www.sberbank.ru | Merchant ID, API Key |
| Тинькофф | https://www.tinkoff.ru | Terminal Key, Password |
| Робокасса | https://www.robokassa.ru | Merchant Login, Password1, Password2 |
| Яндекс Pay | https://pay.yandex.ru | API Key, Merchant ID |

### Telegram Bot

1. Открыть @BotFather в Telegram
2. Выполнить `/newbot`
3. Получить токен
4. Установить webhook: `/setwebhook`

### VK Integration

Создать приложение на https://vk.com/dev и получить App ID и App Secret.

### MAX Integration

Зарегистрироваться на https://max.ru и получить API ключ.

## 📊 Структура БД

Основные таблицы: `users`, `jobs`, `applications`, `payments`, `subscriptions`, `telegram_users`, `cities`.

## 🧪 Тестирование

### Запуск тестов

```bash
pnpm test
```

### Запуск тестов с покрытием

```bash
pnpm test:coverage
```

## 📱 Мобильные приложения

### Сборка для Android

```bash
cd mobile
npm run build:android
```

### Выгрузка на Google Play

```bash
npm run submit:android
```

### Выгрузка на RuStore

1. Скачать APK из `build/android`
2. Загрузить в RuStore Console

## 🔒 Безопасность

### SSL сертификат

Для production используйте Let's Encrypt:

```bash
certbot certonly --standalone -d taskhive.com
```

### Firewall правила

Открыть порты 80 и 443, закрыть порты 3000, 3306, 6379.

### Резервная копия БД

```bash
mysqldump -u root -p taskhive > backup.sql
```

## 📈 Масштабирование

### Кеширование с Redis

Redis уже настроен в коде. Убедитесь, что Redis запущен.

### Load Balancing

Используйте Nginx или HAProxy. Примеры конфигов находятся в папке `docs/`.

## 🐛 Отладка

### Логи приложения

```bash
tail -f .manus-logs/devserver.log
tail -f .manus-logs/browserConsole.log
```

### Проверка статуса

```bash
curl http://localhost:3000/health
```

## 📞 Поддержка

- Email: support@taskhive.ru
- Документация: https://docs.taskhive.com
- GitHub Issues: https://github.com/mrseller163-cell/taskhive-platform/issues

## 🎯 Чек-лист перед production

- [ ] Заполнены все переменные окружения
- [ ] БД мигрирована
- [ ] SSL сертификат установлен
- [ ] Redis настроен
- [ ] Резервная копия БД создана
- [ ] Логирование настроено
- [ ] Мониторинг включен
- [ ] Тесты пройдены
- [ ] Приложение протестировано на реальных устройствах
