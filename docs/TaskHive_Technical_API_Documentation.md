# TaskHive Technical API Documentation
## Полное руководство по интеграции и разработке

**Версия:** 1.0  
**Дата:** Февраль 2026  
**Автор:** Manus AI  
**Статус:** Ready for Developers

---

## СОДЕРЖАНИЕ

1. Введение и обзор API
2. Аутентификация и авторизация
3. REST API endpoints
4. tRPC procedures
5. Webhook система
6. Интеграции с популярными системами
7. Примеры кода
8. Обработка ошибок
9. Rate limiting и квоты
10. Troubleshooting и FAQ

---

## 1. ВВЕДЕНИЕ И ОБЗОР API

### Что такое TaskHive API?

TaskHive API предоставляет полный доступ к функциям платформы для разработчиков и интеграторов. Вы можете создавать пользовательские приложения, интегрировать TaskHive с другими системами и автоматизировать процессы найма.

### Основные возможности

**1. Управление вакансиями**
- Создание, обновление, удаление вакансий
- Поиск и фильтрация вакансий
- Публикация на внешних сайтах

**2. Управление кандидатами**
- Создание, обновление, удаление кандидатов
- Поиск и фильтрация кандидатов
- Оценка и рейтинг кандидатов

**3. Управление интервью**
- Создание и планирование интервью
- Запись и анализ интервью
- Отправка результатов

**4. Управление предложениями**
- Создание и отправка предложений
- Отслеживание статуса предложения
- Подписание и архивирование

**5. Аналитика и отчёты**
- Получение метрик и статистики
- Экспорт данных
- Создание пользовательских отчётов

### Типы API

**REST API** - Традиционный REST API для простых операций

**tRPC API** - Type-safe RPC API для сложных операций

**Webhook API** - Получение событий в реальном времени

---

## 2. АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ

### Типы аутентификации

**OAuth 2.0** - Для пользовательских приложений

```
Authorization: Bearer {access_token}
```

**API Key** - Для серверных приложений

```
Authorization: Bearer {api_key}
```

**JWT Token** - Для долгосрочных сессий

```
Authorization: Bearer {jwt_token}
```

### Получение токена доступа

**Шаг 1: Создать приложение**

Перейдите в Settings → API → Create Application

**Шаг 2: Получить Client ID и Secret**

```
Client ID: app_1234567890
Client Secret: secret_abcdefghij
```

**Шаг 3: Запросить токен доступа**

```bash
curl -X POST https://api.taskhive.ru/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "app_1234567890",
    "client_secret": "secret_abcdefghij"
  }'
```

**Ответ:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_..."
}
```

### Уровни доступа

**Уровень 1: Чтение (read)**

- Получение данных
- Просмотр аналитики
- Экспорт отчётов

**Уровень 2: Запись (write)**

- Создание новых данных
- Обновление существующих данных
- Удаление данных

**Уровень 3: Администратор (admin)**

- Все операции
- Управление пользователями
- Управление интеграциями

---

## 3. REST API ENDPOINTS

### Вакансии (Jobs)

**GET /api/jobs** - Получить список вакансий

```bash
curl -X GET https://api.taskhive.ru/api/jobs \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json"
```

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|---------|
| limit | integer | Количество результатов (по умолчанию 20) |
| offset | integer | Смещение для пагинации |
| status | string | Фильтр по статусу (active, closed, draft) |
| department | string | Фильтр по отделу |
| sort | string | Сортировка (created_at, updated_at, salary) |

**Ответ:**

```json
{
  "data": [
    {
      "id": "job_123",
      "title": "Senior Developer",
      "description": "We are looking for...",
      "department": "Engineering",
      "salary_min": 150000,
      "salary_max": 250000,
      "status": "active",
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-06T15:30:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

**POST /api/jobs** - Создать новую вакансию

```bash
curl -X POST https://api.taskhive.ru/api/jobs \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "description": "We are looking for...",
    "department": "Engineering",
    "salary_min": 150000,
    "salary_max": 250000,
    "requirements": ["5+ years experience", "React", "Node.js"]
  }'
```

**Ответ:**

```json
{
  "id": "job_123",
  "title": "Senior Developer",
  "status": "draft",
  "created_at": "2026-02-06T16:00:00Z"
}
```

**GET /api/jobs/{id}** - Получить информацию о вакансии

```bash
curl -X GET https://api.taskhive.ru/api/jobs/job_123 \
  -H "Authorization: Bearer {access_token}"
```

**PUT /api/jobs/{id}** - Обновить вакансию

```bash
curl -X PUT https://api.taskhive.ru/api/jobs/job_123 \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer (Updated)",
    "salary_max": 300000
  }'
```

**DELETE /api/jobs/{id}** - Удалить вакансию

```bash
curl -X DELETE https://api.taskhive.ru/api/jobs/job_123 \
  -H "Authorization: Bearer {access_token}"
```

### Кандидаты (Candidates)

**GET /api/candidates** - Получить список кандидатов

```bash
curl -X GET https://api.taskhive.ru/api/candidates \
  -H "Authorization: Bearer {access_token}"
```

**POST /api/candidates** - Создать нового кандидата

```bash
curl -X POST https://api.taskhive.ru/api/candidates \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+7 (999) 123-45-67",
    "resume_url": "https://example.com/resume.pdf",
    "job_id": "job_123"
  }'
```

**GET /api/candidates/{id}** - Получить информацию о кандидате

```bash
curl -X GET https://api.taskhive.ru/api/candidates/candidate_123 \
  -H "Authorization: Bearer {access_token}"
```

**PUT /api/candidates/{id}** - Обновить кандидата

```bash
curl -X PUT https://api.taskhive.ru/api/candidates/candidate_123 \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "interview",
    "rating": 4.5
  }'
```

### Интервью (Interviews)

**POST /api/interviews** - Создать интервью

```bash
curl -X POST https://api.taskhive.ru/api/interviews \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "candidate_123",
    "job_id": "job_123",
    "scheduled_at": "2026-02-10T14:00:00Z",
    "interviewer": "john@company.com",
    "type": "technical"
  }'
```

**GET /api/interviews/{id}** - Получить информацию об интервью

```bash
curl -X GET https://api.taskhive.ru/api/interviews/interview_123 \
  -H "Authorization: Bearer {access_token}"
```

**PUT /api/interviews/{id}** - Обновить интервью

```bash
curl -X PUT https://api.taskhive.ru/api/interviews/interview_123 \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "feedback": "Great candidate, very technical",
    "rating": 5
  }'
```

### Предложения (Offers)

**POST /api/offers** - Создать предложение

```bash
curl -X POST https://api.taskhive.ru/api/offers \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "candidate_123",
    "job_id": "job_123",
    "salary": 200000,
    "start_date": "2026-03-01",
    "benefits": ["Health insurance", "Remote work", "Stock options"]
  }'
```

**GET /api/offers/{id}** - Получить информацию о предложении

```bash
curl -X GET https://api.taskhive.ru/api/offers/offer_123 \
  -H "Authorization: Bearer {access_token}"
```

**PUT /api/offers/{id}** - Обновить предложение

```bash
curl -X PUT https://api.taskhive.ru/api/offers/offer_123 \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

### Аналитика (Analytics)

**GET /api/analytics/dashboard** - Получить данные дашборда

```bash
curl -X GET https://api.taskhive.ru/api/analytics/dashboard \
  -H "Authorization: Bearer {access_token}"
```

**Ответ:**

```json
{
  "total_jobs": 45,
  "active_jobs": 35,
  "total_candidates": 1250,
  "interviews_scheduled": 120,
  "offers_sent": 50,
  "offers_accepted": 35,
  "average_time_to_hire": 25,
  "average_cost_per_hire": 150000
}
```

**GET /api/analytics/metrics** - Получить детальные метрики

```bash
curl -X GET https://api.taskhive.ru/api/analytics/metrics \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-01-01",
    "end_date": "2026-02-06",
    "metrics": ["jobs_created", "candidates_applied", "interviews_completed", "offers_accepted"]
  }'
```

---

## 4. tRPC PROCEDURES

### Что такое tRPC?

tRPC - это type-safe RPC framework, который обеспечивает полную типизацию между клиентом и сервером. Все процедуры имеют полную TypeScript поддержку.

### Примеры tRPC процедур

**jobs.list** - Получить список вакансий

```typescript
const jobs = await trpc.jobs.list.query({
  limit: 20,
  offset: 0,
  status: 'active'
});
```

**jobs.create** - Создать новую вакансию

```typescript
const job = await trpc.jobs.create.mutate({
  title: 'Senior Developer',
  description: 'We are looking for...',
  department: 'Engineering',
  salary_min: 150000,
  salary_max: 250000
});
```

**jobs.update** - Обновить вакансию

```typescript
const job = await trpc.jobs.update.mutate({
  id: 'job_123',
  title: 'Senior Developer (Updated)',
  salary_max: 300000
});
```

**jobs.delete** - Удалить вакансию

```typescript
await trpc.jobs.delete.mutate({
  id: 'job_123'
});
```

**candidates.list** - Получить список кандидатов

```typescript
const candidates = await trpc.candidates.list.query({
  job_id: 'job_123',
  status: 'applied'
});
```

**candidates.create** - Создать нового кандидата

```typescript
const candidate = await trpc.candidates.create.mutate({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  job_id: 'job_123'
});
```

**interviews.schedule** - Запланировать интервью

```typescript
const interview = await trpc.interviews.schedule.mutate({
  candidate_id: 'candidate_123',
  job_id: 'job_123',
  scheduled_at: new Date('2026-02-10T14:00:00Z'),
  interviewer: 'john@company.com'
});
```

**offers.create** - Создать предложение

```typescript
const offer = await trpc.offers.create.mutate({
  candidate_id: 'candidate_123',
  job_id: 'job_123',
  salary: 200000,
  start_date: new Date('2026-03-01')
});
```

---

## 5. WEBHOOK СИСТЕМА

### Что такое Webhook?

Webhook позволяет получать уведомления о событиях в реальном времени. Когда происходит событие (например, новый кандидат), TaskHive отправляет HTTP POST запрос на ваш URL.

### Типы событий

| Событие | Описание |
|---------|---------|
| job.created | Новая вакансия создана |
| job.updated | Вакансия обновлена |
| job.deleted | Вакансия удалена |
| candidate.applied | Кандидат подал заявку |
| candidate.updated | Кандидат обновлён |
| interview.scheduled | Интервью запланировано |
| interview.completed | Интервью завершено |
| offer.created | Предложение создано |
| offer.accepted | Предложение принято |
| offer.rejected | Предложение отклонено |

### Регистрация Webhook

**Создать Webhook:**

```bash
curl -X POST https://api.taskhive.ru/api/webhooks \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhooks/taskhive",
    "events": ["candidate.applied", "interview.completed", "offer.accepted"],
    "active": true
  }'
```

**Ответ:**

```json
{
  "id": "webhook_123",
  "url": "https://example.com/webhooks/taskhive",
  "events": ["candidate.applied", "interview.completed", "offer.accepted"],
  "active": true,
  "created_at": "2026-02-06T16:00:00Z"
}
```

### Получение Webhook событий

Когда происходит событие, TaskHive отправляет POST запрос:

```bash
POST https://example.com/webhooks/taskhive
Content-Type: application/json
X-TaskHive-Signature: sha256=...

{
  "id": "event_123",
  "type": "candidate.applied",
  "timestamp": "2026-02-06T16:05:00Z",
  "data": {
    "candidate_id": "candidate_123",
    "job_id": "job_123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

### Обработка Webhook

**Node.js пример:**

```javascript
const express = require('express');
const crypto = require('crypto');

app.post('/webhooks/taskhive', (req, res) => {
  // Проверить подпись
  const signature = req.headers['x-taskhive-signature'];
  const body = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  if (signature !== `sha256=${hash}`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Обработать событие
  const event = req.body;
  
  switch (event.type) {
    case 'candidate.applied':
      handleCandidateApplied(event.data);
      break;
    case 'interview.completed':
      handleInterviewCompleted(event.data);
      break;
    case 'offer.accepted':
      handleOfferAccepted(event.data);
      break;
  }
  
  res.json({ success: true });
});
```

---

## 6. ИНТЕГРАЦИИ С ПОПУЛЯРНЫМИ СИСТЕМАМИ

### Интеграция с ATS системами

**Интеграция с Greenhouse**

```javascript
// Синхронизировать вакансии из Greenhouse
const greenhouse = require('greenhouse-api');

const jobs = await greenhouse.jobs.list();

for (const job of jobs) {
  await trpc.jobs.create.mutate({
    title: job.name,
    description: job.description,
    department: job.department.name,
    external_id: job.id
  });
}
```

**Интеграция с Lever**

```javascript
// Синхронизировать кандидатов из Lever
const lever = require('lever-api');

const opportunities = await lever.opportunities.list();

for (const opp of opportunities) {
  await trpc.candidates.create.mutate({
    first_name: opp.contact.name.split(' ')[0],
    last_name: opp.contact.name.split(' ')[1],
    email: opp.contact.emails[0].value,
    external_id: opp.id
  });
}
```

### Интеграция с HR системами

**Интеграция с BambooHR**

```javascript
// Синхронизировать новых сотрудников
const bamboo = require('bamboohr-api');

const employees = await bamboo.employees.list();

for (const emp of employees) {
  if (emp.hireDate === today) {
    await notifyManager({
      employee: emp.firstName + ' ' + emp.lastName,
      position: emp.jobTitle,
      startDate: emp.hireDate
    });
  }
}
```

### Интеграция с CRM системами

**Интеграция с Salesforce**

```javascript
// Синхронизировать кандидатов в Salesforce
const salesforce = require('jsforce');

const conn = new salesforce.Connection();

for (const candidate of candidates) {
  await conn.sobject('Contact').create({
    FirstName: candidate.first_name,
    LastName: candidate.last_name,
    Email: candidate.email,
    Phone: candidate.phone
  });
}
```

### Интеграция с коммуникационными системами

**Интеграция с Slack**

```javascript
// Отправить уведомление в Slack
const slack = require('@slack/web-api');

const client = new slack.WebClient(process.env.SLACK_TOKEN);

await client.chat.postMessage({
  channel: '#hiring',
  text: `New candidate applied: ${candidate.name}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*New Candidate*\n${candidate.name}\n${candidate.email}`
      }
    }
  ]
});
```

**Интеграция с Email**

```javascript
// Отправить email кандидату
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

await transporter.sendMail({
  from: 'hiring@company.com',
  to: candidate.email,
  subject: 'Interview scheduled',
  html: `<p>Your interview is scheduled for ${interview.scheduled_at}</p>`
});
```

---

## 7. ПРИМЕРЫ КОДА

### Python пример

```python
import requests
import json

# Получить токен доступа
response = requests.post('https://api.taskhive.ru/oauth/token', json={
    'grant_type': 'client_credentials',
    'client_id': 'app_1234567890',
    'client_secret': 'secret_abcdefghij'
})

token = response.json()['access_token']

# Создать вакансию
headers = {'Authorization': f'Bearer {token}'}

job_data = {
    'title': 'Senior Developer',
    'description': 'We are looking for...',
    'department': 'Engineering',
    'salary_min': 150000,
    'salary_max': 250000
}

response = requests.post('https://api.taskhive.ru/api/jobs', 
                        json=job_data, 
                        headers=headers)

job = response.json()
print(f"Job created: {job['id']}")

# Получить список кандидатов
response = requests.get('https://api.taskhive.ru/api/candidates',
                       params={'job_id': job['id']},
                       headers=headers)

candidates = response.json()['data']
print(f"Found {len(candidates)} candidates")
```

### JavaScript пример

```javascript
// Получить токен доступа
const response = await fetch('https://api.taskhive.ru/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: 'app_1234567890',
    client_secret: 'secret_abcdefghij'
  })
});

const { access_token } = await response.json();

// Создать вакансию
const jobResponse = await fetch('https://api.taskhive.ru/api/jobs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Senior Developer',
    description: 'We are looking for...',
    department: 'Engineering',
    salary_min: 150000,
    salary_max: 250000
  })
});

const job = await jobResponse.json();
console.log(`Job created: ${job.id}`);

// Получить список кандидатов
const candidatesResponse = await fetch(
  `https://api.taskhive.ru/api/candidates?job_id=${job.id}`,
  { headers: { 'Authorization': `Bearer ${access_token}` } }
);

const { data: candidates } = await candidatesResponse.json();
console.log(`Found ${candidates.length} candidates`);
```

---

## 8. ОБРАБОТКА ОШИБОК

### Типы ошибок

| Код | Описание |
|-----|---------|
| 400 | Bad Request - Неверный запрос |
| 401 | Unauthorized - Не авторизирован |
| 403 | Forbidden - Доступ запрещен |
| 404 | Not Found - Ресурс не найден |
| 429 | Too Many Requests - Превышен лимит запросов |
| 500 | Internal Server Error - Ошибка сервера |

### Обработка ошибок

```javascript
try {
  const response = await fetch('https://api.taskhive.ru/api/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jobData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }

  const job = await response.json();
  return job;
} catch (error) {
  console.error('Error creating job:', error);
  throw error;
}
```

---

## 9. RATE LIMITING И КВОТЫ

### Rate Limits

| План | Запросов в минуту | Запросов в день |
|------|-------------------|-----------------|
| Базовый | 60 | 10,000 |
| Профессиональный | 300 | 100,000 |
| Корпоративный | 1,000 | 1,000,000 |

### Проверка лимитов

Каждый ответ содержит заголовки:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1644162000
```

### Обработка Rate Limiting

```javascript
async function makeRequest(url, options) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
    const waitTime = (resetTime * 1000) - Date.now();
    
    console.log(`Rate limited. Waiting ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    return makeRequest(url, options);
  }
  
  return response;
}
```

---

## 10. TROUBLESHOOTING И FAQ

### Частые проблемы

**Проблема: 401 Unauthorized**

Решение: Проверьте, что токен доступа правильный и не истёк.

```javascript
// Обновить токен
const refreshResponse = await fetch('https://api.taskhive.ru/oauth/token', {
  method: 'POST',
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  })
});
```

**Проблема: 404 Not Found**

Решение: Проверьте, что ID ресурса правильный и ресурс существует.

```javascript
// Проверить существование ресурса
const response = await fetch(`https://api.taskhive.ru/api/jobs/${jobId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (response.status === 404) {
  console.log('Job not found');
}
```

**Проблема: 429 Too Many Requests**

Решение: Уменьшите количество запросов или используйте batch API.

```javascript
// Batch API для нескольких операций
const batchResponse = await fetch('https://api.taskhive.ru/api/batch', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    requests: [
      { method: 'GET', url: '/api/jobs/job_1' },
      { method: 'GET', url: '/api/jobs/job_2' },
      { method: 'GET', url: '/api/jobs/job_3' }
    ]
  })
});
```

### FAQ

**Q: Как получить список всех вакансий?**

A: Используйте GET /api/jobs с параметром limit для пагинации.

**Q: Как синхронизировать данные в реальном времени?**

A: Используйте Webhook для получения событий в реальном времени.

**Q: Какой максимальный размер файла для загрузки резюме?**

A: Максимум 10 MB для PDF, DOC, DOCX файлов.

**Q: Как удалить все данные клиента?**

A: Используйте DELETE /api/clients/{id} для удаления клиента и всех его данных.

---

**Версия:** 1.0  
**Последнее обновление:** Февраль 2026  
**Статус:** Ready for Developers
