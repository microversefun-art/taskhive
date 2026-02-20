import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Info() {
  const [location, setLocation] = useLocation();
  const page = location.split("/").pop();

  const renderContent = () => {
    switch (page) {
      case "about":
        return (
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">О нас</h1>
            <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
              <p>
                TaskHive — это инновационная платформа для поиска подработок и краткосрочных вакансий, разработанная специально для рынка России и стран СНГ.
              </p>
              <p>
                Наша миссия — создать удобное и безопасное пространство для взаимодействия между работниками и работодателями, где каждый может найти подходящую работу или нужного сотрудника.
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">Наши ценности</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Безопасность</strong> — защита данных пользователей и проверка всех участников</li>
                <li><strong>Прозрачность</strong> — честные условия и четкие правила</li>
                <li><strong>Инновация</strong> — использование современных технологий и AI</li>
                <li><strong>Локальность</strong> — ориентация на российский и СНГ рынки</li>
              </ul>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">Почему TaskHive?</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Более 50,000 активных вакансий</li>
                <li>100,000+ работников и 10,000+ работодателей</li>
                <li>Система рейтинга и скоринга для надежности</li>
                <li>Интеграция с популярными платежными системами</li>
                <li>Поддержка уведомлений через мессенджеры</li>
                <li>Все данные хранятся в России</li>
              </ul>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Политика конфиденциальности</h1>
            <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
              <p>
                Последнее обновление: январь 2026 года
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">1. Введение</h2>
              <p>
                TaskHive (далее — "Платформа") уважает вашу приватность и стремится обеспечить безопасность ваших персональных данных. Данная политика объясняет, как мы собираем, используем и защищаем вашу информацию.
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">2. Какие данные мы собираем</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Информация профиля (имя, email, телефон)</li>
                <li>Данные о вакансиях и откликах</li>
                <li>История чатов и сообщений</li>
                <li>Информация о платежах</li>
                <li>Данные об использовании платформы (IP, браузер, устройство)</li>
              </ul>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">3. Как мы используем данные</h2>
              <p>
                Ваши данные используются для:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Предоставления услуг платформы</li>
                <li>Улучшения качества сервиса</li>
                <li>Отправки уведомлений</li>
                <li>Предотвращения мошенничества</li>
                <li>Соответствия законодательству РФ</li>
              </ul>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">4. Защита данных</h2>
              <p>
                Все данные передаются по защищенному протоколу SSL/TLS и хранятся на серверах в России в соответствии с требованиями законодательства РФ о защите персональных данных.
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">5. Ваши права</h2>
              <p>
                Вы имеете право на доступ, исправление, удаление и портативность ваших данных. Для реализации этих прав свяжитесь с нами по email.
              </p>
            </div>
          </div>
        );

      case "cookies":
        return (
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Использование Cookies</h1>
            <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
              <p>
                TaskHive использует cookies для улучшения пользовательского опыта. Данная страница объясняет, какие cookies мы используем и как вы можете их контролировать.
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">1. Что такое cookies?</h2>
              <p>
                Cookies — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении веб-сайта. Они помогают сайту запомнить информацию о вас.
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">2. Типы cookies, которые мы используем</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Необходимые cookies</strong> — для функционирования платформы (аутентификация, безопасность)</li>
                <li><strong>Аналитические cookies</strong> — для анализа использования платформы</li>
                <li><strong>Функциональные cookies</strong> — для сохранения ваших предпочтений</li>
                <li><strong>Маркетинговые cookies</strong> — для показа релевантной информации</li>
              </ul>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">3. Как управлять cookies</h2>
              <p>
                Вы можете контролировать cookies через настройки вашего браузера. Однако отключение некоторых cookies может повлиять на функциональность сайта.
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8">4. Согласие</h2>
              <p>
                Продолжая использовать TaskHive, вы соглашаетесь с использованием cookies в соответствии с этой политикой.
              </p>
            </div>
          </div>
        );

      default:
        return <p>Страница не найдена</p>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
