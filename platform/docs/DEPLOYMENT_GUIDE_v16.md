# TaskHive v16.0 - Deployment Guide

## 📋 Чек-лист перед запуском

### 1. Подготовка окружения
- [ ] Купить домен (например, taskhive.ru)
- [ ] Арендовать VPS (минимум 2GB RAM, 2 CPU)
- [ ] Установить Node.js 22+, PostgreSQL, Redis
- [ ] Настроить SSL сертификат (Let's Encrypt)
- [ ] Настроить firewall и security группы

### 2. Получить API ключи
- [ ] Yandex.Kassa (платежи) — https://kassa.yandex.ru
- [ ] Sberbank API (платежи) — https://developer.sberbank.ru
- [ ] Tinkoff API (платежи) — https://www.tinkoff.ru/business/api/
- [ ] Telegram Bot API — https://t.me/BotFather
- [ ] VK API — https://vk.com/dev
- [ ] Google Maps API (для геолокации)
- [ ] Yandex.GPT API (для AI модерации)
- [ ] GigaChat API (для AI модерации)

### 3. Настроить переменные окружения

Создать `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskhive"

# OAuth
JWT_SECRET="your-super-secret-key-min-32-chars"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"
VITE_APP_ID="your-app-id"

# Payment Systems
YANDEX_KASSA_SHOP_ID="your-shop-id"
YANDEX_KASSA_SECRET_KEY="your-secret-key"

SBERBANK_CLIENT_ID="your-client-id"
SBERBANK_CLIENT_SECRET="your-client-secret"

TINKOFF_TERMINAL_KEY="your-terminal-key"
TINKOFF_PASSWORD="your-password"

# Social Media
TELEGRAM_BOT_TOKEN="your-bot-token"
VK_GROUP_TOKEN="your-group-token"
VK_API_VERSION="5.131"

# AI Services
YANDEX_GPT_API_KEY="your-api-key"
GIGACHAT_API_KEY="your-api-key"
DEEPSEEK_API_KEY="your-api-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Frontend
VITE_APP_TITLE="TaskHive"
VITE_APP_LOGO="https://taskhive.ru/logo.png"
VITE_FRONTEND_FORGE_API_KEY="your-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# Analytics
VITE_ANALYTICS_ENDPOINT="https://analytics.taskhive.ru"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# Redis
REDIS_URL="redis://localhost:6379"

# Node Environment
NODE_ENV="production"
PORT="3000"
```

### 4. Создать и заполнить БД

```bash
# Подключиться к PostgreSQL
psql -U postgres

# Создать БД
CREATE DATABASE taskhive;
CREATE USER taskhive_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE taskhive TO taskhive_user;

# Выйти из psql
\q

# Запустить миграции
pnpm db:push
```

### 5. Запустить production сервер

```bash
# Установить зависимости
pnpm install --prod

# Собрать фронтенд
pnpm build

# Запустить сервер
pnpm start

# Или использовать PM2 для автоматического перезапуска
npm install -g pm2
pm2 start "pnpm start" --name "taskhive"
pm2 save
pm2 startup
```

### 6. Настроить Nginx как reverse proxy

Создать `/etc/nginx/sites-available/taskhive`:

```nginx
server {
    listen 80;
    server_name taskhive.ru www.taskhive.ru;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name taskhive.ru www.taskhive.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/taskhive.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/taskhive.ru/privkey.pem;
    
    # SSL параметры
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    # Proxy к Node.js приложению
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket поддержка
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

Активировать:
```bash
sudo ln -s /etc/nginx/sites-available/taskhive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Настроить SSL сертификат

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d taskhive.ru -d www.taskhive.ru
```

### 8. Запустить Cron задачи

```bash
# Отредактировать crontab
crontab -e

# Добавить:
# Ежедневная резервная копия БД
0 2 * * * pg_dump taskhive > /backups/taskhive-$(date +\%Y\%m\%d).sql

# Еженедельная очистка логов
0 3 * * 0 find /var/log/taskhive -mtime +30 -delete

# Ежемесячное обновление SSL сертификата
0 4 1 * * certbot renew --quiet
```

### 9. Настроить мониторинг и логирование

```bash
# Установить PM2 Plus для мониторинга
pm2 install pm2-auto-pull
pm2 link your-secret-key your-public-key

# Настроить логирование
pm2 logs taskhive
```

### 10. Запустить тесты перед production

```bash
# Полный набор тестов
pnpm test

# Проверить TypeScript
pnpm tsc --noEmit

# Проверить линтинг
pnpm lint
```

---

## 🚀 Процесс запуска (пошагово)

### День 1: Подготовка
```bash
# 1. Распаковать архив на сервер
scp taskhive-platform-v16.0-complete.zip user@server:/home/user/
ssh user@server
unzip taskhive-platform-v16.0-complete.zip
cd taskhive-platform

# 2. Установить зависимости
pnpm install

# 3. Создать .env.production
nano .env.production
# Вставить значения из чек-листа выше

# 4. Создать БД
psql -U postgres -f scripts/init-db.sql
```

### День 2: Тестирование
```bash
# 1. Запустить тесты
pnpm test

# 2. Запустить dev сервер для проверки
pnpm dev

# 3. Проверить в браузере
# http://localhost:3000

# 4. Проверить все основные функции:
# - Регистрация пользователя
# - Создание задачи
# - Поиск задач
# - Чат
# - Платёж
# - Подписка
```

### День 3: Production запуск
```bash
# 1. Собрать фронтенд
pnpm build

# 2. Запустить с PM2
pm2 start "pnpm start" --name "taskhive"

# 3. Настроить Nginx
# (следовать инструкциям выше)

# 4. Проверить в браузере
# https://taskhive.ru

# 5. Включить мониторинг
pm2 logs taskhive
```

---

## 📊 Мониторинг

### Важные метрики для отслеживания:
- CPU usage (должен быть < 70%)
- Memory usage (должен быть < 80%)
- Database connections (максимум 20)
- API response time (должен быть < 500ms)
- Error rate (должен быть < 1%)
- Active users (real-time)
- Transaction success rate (должен быть > 99%)

### Команды для проверки:
```bash
# Проверить статус приложения
pm2 status

# Посмотреть логи
pm2 logs taskhive

# Проверить использование памяти
free -h

# Проверить использование CPU
top

# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Проверить статус Nginx
sudo systemctl status nginx
```

---

## 🔧 Troubleshooting

### Приложение не запускается
```bash
# Проверить логи
pm2 logs taskhive

# Проверить переменные окружения
env | grep DATABASE_URL

# Проверить подключение к БД
psql $DATABASE_URL -c "SELECT 1"
```

### Высокое использование памяти
```bash
# Перезагрузить приложение
pm2 restart taskhive

# Проверить утечки памяти
pm2 monit
```

### Платежи не работают
```bash
# Проверить API ключи в .env.production
grep YANDEX_KASSA .env.production

# Проверить логи платежей
tail -f /var/log/taskhive/payments.log
```

### WebSocket не работает
```bash
# Проверить, что Nginx настроен для WebSocket
grep -A 5 "location /ws" /etc/nginx/sites-available/taskhive

# Перезагрузить Nginx
sudo systemctl reload nginx
```

---

## 📈 Масштабирование

### Когда масштабировать:
- Когда CPU > 70% постоянно
- Когда Memory > 80% постоянно
- Когда API response time > 1000ms
- Когда более 10,000 активных пользователей

### Как масштабировать:
1. **Вертикальное масштабирование** — увеличить RAM и CPU на сервере
2. **Горизонтальное масштабирование** — добавить несколько серверов с load balancer
3. **Кэширование** — использовать Redis для кэша
4. **CDN** — использовать CloudFlare для статических файлов
5. **Database** — использовать read replicas для БД

---

## 🎉 Готово!

Платформа успешно развёрнута на production! 🚀

**Следующие шаги:**
1. Запустить маркетинг кампанию
2. Добавить первых пользователей
3. Мониторить метрики
4. Собирать фидбек
5. Итерировать и улучшать

**Ожидаемый результат:**
- Месяц 1: 10k пользователей, 165k₽ дохода
- Месяц 3: 50k пользователей, 825k₽ дохода
- Месяц 6: 200k пользователей, 3.4M₽ дохода

---

**Версия:** v16.0  
**Дата:** 26 января 2026  
**Статус:** Production Ready ✅
