import React from "react";
import { Card } from "@/components/ui/card";

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Политика конфиденциальности</h1>
        <p className="text-slate-600 mb-8">Последнее обновление: 25 января 2026 г.</p>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Введение</h2>
            <p className="text-slate-700 leading-relaxed">
              TaskHive (далее "Платформа", "мы", "наша") уважает вашу конфиденциальность и обязана защищать ваши персональные данные. Эта Политика конфиденциальности объясняет, как мы собираем, используем, раскрываем и иным образом обрабатываем информацию о вас в соответствии с Федеральным законом "О защите персональных данных" (№ 152-ФЗ), GDPR и другими применимыми законами о защите данных.
            </p>
          </Card>

          {/* Data Collection */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Какие данные мы собираем</h2>
            <div className="space-y-4 text-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">2.1 Информация, которую вы предоставляете</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Имя, фамилия, отчество</li>
                  <li>Адрес электронной почты</li>
                  <li>Номер телефона</li>
                  <li>Адрес проживания</li>
                  <li>Информация о банковском счёте или платёжных системах</li>
                  <li>Информация о профессиональных навыках и опыте</li>
                  <li>Фотография профиля</li>
                  <li>Документы (паспорт, ИНН, СНИЛС для верификации)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">2.2 Информация, собираемая автоматически</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>IP-адрес</li>
                  <li>Тип браузера и операционной системы</li>
                  <li>Страницы, которые вы посещаете</li>
                  <li>Время и продолжительность посещения</li>
                  <li>Геолокация (с вашего согласия)</li>
                  <li>Cookies и аналогичные технологии отслеживания</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Data Usage */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Как мы используем ваши данные</h2>
            <div className="space-y-2 text-slate-700">
              <p>Мы используем собранные данные для следующих целей:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Предоставление услуг Платформы</li>
                <li>Обработка платежей и выплат</li>
                <li>Верификация личности и предотвращение мошенничества</li>
                <li>Улучшение качества услуг</li>
                <li>Отправка уведомлений и обновлений</li>
                <li>Соответствие юридическим обязательствам</li>
                <li>Маркетинг и аналитика (с вашего согласия)</li>
                <li>Разрешение споров и обеспечение безопасности</li>
              </ul>
            </div>
          </Card>

          {/* Data Sharing */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Обмен данными</h2>
            <div className="space-y-4 text-slate-700">
              <p>Мы можем делиться вашими данными с:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Партнёрами платформы (SocUspeh и другие интегрированные сервисы)</li>
                <li>Поставщиками платёжных услуг</li>
                <li>Органами власти (по требованию закона)</li>
                <li>Поставщиками облачных услуг</li>
                <li>Аналитическими сервисами</li>
              </ul>
              <p className="mt-4">
                <strong>Мы не продаём ваши персональные данные третьим лицам.</strong>
              </p>
            </div>
          </Card>

          {/* Your Rights */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Ваши права</h2>
            <div className="space-y-2 text-slate-700">
              <p>В соответствии с законодательством РФ и GDPR вы имеете право:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Доступа к вашим персональным данным</li>
                <li>Исправления неточных данных</li>
                <li>Удаления данных (право быть забытым)</li>
                <li>Ограничения обработки данных</li>
                <li>Портативности данных</li>
                <li>Возражения против обработки</li>
                <li>Отзыва согласия на обработку</li>
              </ul>
              <p className="mt-4">
                Для реализации этих прав свяжитесь с нами по адресу: <strong>support@taskhive.com</strong>
              </p>
            </div>
          </Card>

          {/* Data Security */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Безопасность данных</h2>
            <p className="text-slate-700">
              Мы используем современные технологии шифрования (SSL/TLS) и административные, физические и технические меры для защиты ваших данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Однако ни один метод передачи через Интернет не является полностью безопасным.
            </p>
          </Card>

          {/* Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies и аналогичные технологии</h2>
            <p className="text-slate-700 mb-4">
              Мы используем cookies для улучшения вашего опыта. Вы можете управлять настройками cookies в вашем браузере. Отключение cookies может повлиять на функциональность Платформы.
            </p>
            <p className="text-slate-700">
              Типы используемых cookies:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              <li>Необходимые (для функционирования сайта)</li>
              <li>Функциональные (для сохранения предпочтений)</li>
              <li>Аналитические (для улучшения услуг)</li>
              <li>Маркетинговые (для персонализированной рекламы)</li>
            </ul>
          </Card>

          {/* Data Retention */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Сохранение данных</h2>
            <p className="text-slate-700">
              Мы сохраняем ваши персональные данные столько времени, сколько необходимо для предоставления услуг и соответствия юридическим обязательствам. Обычно это 3-7 лет после завершения отношений с вами, в зависимости от типа данных и применимого законодательства.
            </p>
          </Card>

          {/* International Transfers */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Трансграничные передачи данных</h2>
            <p className="text-slate-700">
              Ваши данные могут быть переданы и обработаны в странах, отличных от вашей страны проживания. Мы обеспечиваем надлежащий уровень защиты при таких передачах в соответствии с применимым законодательством.
            </p>
          </Card>

          {/* Contact Us */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Свяжитесь с нами</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                <strong>Email:</strong> <a href="mailto:support@taskhive.com" className="text-purple-600 hover:underline">support@taskhive.com</a>
              </p>
              <p>
                <strong>Телефон:</strong> <a href="tel:+79999999999" className="text-purple-600 hover:underline">+7 (999) XXX-XX-XX</a>
              </p>
              <p>
                <strong>Адрес:</strong> Москва, Россия
              </p>
              <p className="mt-4 text-sm">
                Если у вас есть вопросы о нашей Политике конфиденциальности, пожалуйста, свяжитесь с нами по указанным выше контактам.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
