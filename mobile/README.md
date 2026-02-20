# TaskHive Mobile App

Мобильное приложение для платформы поиска подработок TaskHive, разработано на React Native.

## 📱 Платформы

- ✅ iOS (через Expo или React Native CLI)
- ✅ Android (через Expo или React Native CLI)
- ✅ Web (через React Native Web)

## 🚀 Быстрый Старт

### Требования

- Node.js 18+
- npm или yarn
- Expo CLI (для Expo): `npm install -g expo-cli`
- Xcode (для iOS)
- Android Studio (для Android)

### Установка

```bash
# Клонировать репозиторий
cd taskhive-mobile

# Установить зависимости
npm install
# или
yarn install

# Запустить приложение
npm start
# или
yarn start
```

### Запуск на Эмуляторе

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npm run web
```

## 📁 Структура Проекта

```
taskhive-mobile/
├── src/
│   ├── screens/          # Экраны приложения
│   │   ├── auth/         # Экран логина
│   │   ├── home/         # Главная страница
│   │   ├── jobs/         # Список вакансий
│   │   ├── chat/         # Чаты
│   │   ├── profile/      # Профиль пользователя
│   │   ├── achievements/ # Достижения
│   │   └── subscriptions/# Подписки
│   ├── components/       # Переиспользуемые компоненты
│   ├── services/         # API сервисы (tRPC)
│   ├── store/            # Zustand хранилище состояния
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript типы
│   ├── utils/            # Утилиты
│   ├── navigation/       # Конфигурация навигации
│   ├── assets/           # Изображения и шрифты
│   └── App.tsx           # Главный компонент
├── index.js              # Точка входа
├── app.json              # Конфигурация Expo
├── package.json          # Зависимости
├── tsconfig.json         # TypeScript конфигурация
└── README.md             # Этот файл
```

## 🎯 Основные Экраны

### 1. Экран Логина (AuthStack)
- Вход через email/пароль
- OAuth интеграция с Manus
- Сохранение токена в AsyncStorage

### 2. Главная Страница (HomeStack)
- Приветствие пользователя
- Статистика (заработки, работы, рейтинг)
- Горячие вакансии
- Достижения пользователя
- Быстрые ссылки на чаты и подписки

### 3. Вакансии (JobsStack)
- Список всех вакансий
- Поиск по названию
- Фильтрация по категориям
- Сортировка (новые, по зарплате, по рейтингу)
- Детальная страница вакансии
- Кнопка "Откликнуться"

### 4. Чаты (ChatStack)
- Список всех чатов
- Просмотр сообщений
- Отправка сообщений
- Real-time обновления

### 5. Профиль (ProfileStack)
- Информация пользователя
- Статистика (заработки, рейтинг)
- Ссылки на достижения и подписки
- Кнопка выхода

### 6. Достижения (AchievementsScreen)
- Список всех достижений
- Статус разблокировки
- Визуальные бейджи

### 7. Подписки (SubscriptionsScreen)
- Список активных подписок
- Управление подписками (пауза, возобновление, отмена)
- Расчет сэкономленных денег

## 🔌 API Интеграция

Приложение использует tRPC для связи с Backend API:

```typescript
// Примеры использования
import { trpcClient } from './services/trpc';

// Получить список вакансий
const jobs = await trpcClient.jobs.list.query({ limit: 50 });

// Получить достижения пользователя
const achievements = await trpcClient.achievements.getUserAchievements.query({
  userId: 'user-id'
});

// Получить подписки
const subscriptions = await trpcClient.recurringOrders.getUserOrders.query({
  userId: 'user-id'
});
```

## 🔐 Аутентификация

Приложение использует Manus OAuth 2.0 для аутентификации:

1. Пользователь вводит email/пароль
2. Приложение отправляет запрос на `/api/oauth/callback`
3. Backend возвращает JWT токен
4. Токен сохраняется в AsyncStorage
5. Токен используется для всех последующих запросов

## 📦 Основные Зависимости

- **React Native 0.74** - Framework
- **React Navigation 6** - Навигация
- **React Query 5** - Управление состоянием
- **tRPC 11** - Type-safe API
- **Zustand 4** - State management
- **React Hook Form 7** - Управление формами
- **Firebase** - Push-уведомления
- **React Native Maps** - Карты
- **Axios** - HTTP клиент

## 🧪 Тестирование

```bash
# Запустить тесты
npm test

# Запустить тесты с покрытием
npm test -- --coverage

# Запустить тесты в режиме watch
npm test -- --watch
```

## 📝 Типизация

Проект полностью типизирован на TypeScript:

```bash
# Проверить типы
npm run type-check
```

## 🎨 Стилизация

Приложение использует React Native StyleSheet для стилей:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // ...
});
```

## 🚀 Сборка для Production

### iOS

```bash
# Подготовить сборку
npm run build:ios

# Загрузить на App Store
# (требуется Apple Developer аккаунт)
```

### Android

```bash
# Подготовить сборку
npm run build:android

# Загрузить на Google Play
# (требуется Google Play Developer аккаунт)
```

## 🔔 Push-Уведомления

Приложение использует Firebase Cloud Messaging для push-уведомлений:

```typescript
import messaging from '@react-native-firebase/messaging';

messaging()
  .getToken()
  .then(token => {
    console.log('FCM Token:', token);
  });

messaging().onMessage(async (remoteMessage) => {
  console.log('Notification:', remoteMessage.notification);
});
```

## 🗺️ Геолокация

Приложение поддерживает геолокацию для офлайн задач:

```typescript
import Geolocation from 'react-native-geolocation-service';

Geolocation.getCurrentPosition(
  (position) => {
    console.log('Latitude:', position.coords.latitude);
    console.log('Longitude:', position.coords.longitude);
  }
);
```

## 📊 Аналитика

Приложение отправляет события в Firebase Analytics:

```typescript
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('job_applied', {
  job_id: 'job-123',
  user_id: 'user-456',
});
```

## 🐛 Отладка

### React Native Debugger

```bash
# Установить React Native Debugger
# https://github.com/jhen0409/react-native-debugger

# Запустить приложение с отладкой
npm start
```

### Логирование

```typescript
console.log('Debug message');
console.warn('Warning message');
console.error('Error message');
```

## 📚 Документация

- [React Native Docs](https://reactnative.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [tRPC Docs](https://trpc.io)
- [Zustand Docs](https://github.com/pmndrs/zustand)

## 🤝 Контрибьютинг

1. Fork репозиторий
2. Создать ветку для фичи (`git checkout -b feature/AmazingFeature`)
3. Коммитить изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Открыть Pull Request

## 📄 Лицензия

MIT

## 📞 Поддержка

- Email: support@taskhive.ru
- Telegram: @taskhive_support
- GitHub Issues: [Создать issue](https://github.com/taskhive/mobile/issues)

---

**Версия:** 1.0.0  
**Последнее обновление:** Февраль 2026
