import React from "react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Политика конфиденциальности</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Введение</h2>
            <p>
              TaskHive (далее – «Платформа») уважает вашу конфиденциальность и обязуется защищать ваши
              персональные данные. Настоящая Политика конфиденциальности описывает, как мы собираем,
              используем и защищаем вашу информацию.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Сбор информации</h2>
            <p>Мы собираем следующие типы информации:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Информация при регистрации:</strong> имя, электронная почта, номер телефона,
                город, профессиональные навыки
              </li>
              <li>
                <strong>Информация о платежах:</strong> реквизиты банковских карт (обрабатываются
                третьими лицами)
              </li>
              <li>
                <strong>Информация об использовании:</strong> логи доступа, IP-адрес, тип браузера,
                время посещения
              </li>
              <li>
                <strong>Информация о геолокации:</strong> город и район (с вашего согласия)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Использование информации</h2>
            <p>Мы используем вашу информацию для:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Предоставления услуг Платформы</li>
              <li>Обработки платежей</li>
              <li>Отправки уведомлений и обновлений</li>
              <li>Улучшения качества услуг</li>
              <li>Соответствия законодательству РФ</li>
              <li>Предотвращения мошенничества и злоупотреблений</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Хранение данных</h2>
            <p>
              В соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О защите персональных
              данных» все персональные данные хранятся на территории Российской Федерации. Мы
              используем современные методы шифрования и защиты данных.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Безопасность</h2>
            <p>
              Мы применяем технические и организационные меры для защиты вашей информации от
              несанкционированного доступа, включая:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL/TLS шифрование</li>
              <li>Двухфакторную аутентификацию</li>
              <li>Регулярные проверки безопасности</li>
              <li>Ограничение доступа сотрудников</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
            <p>
              Платформа использует cookies для улучшения пользовательского опыта. Вы можете отключить
              cookies в настройках браузера, но это может повлиять на функциональность Платформы.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Третьи лица</h2>
            <p>
              Мы не продаём и не передаём вашу информацию третьим лицам, за исключением:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Платёжных систем (для обработки платежей)</li>
              <li>Партнёров Платформы (с вашего согласия)</li>
              <li>Государственных органов (по требованию закона)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Ваши права</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Доступа к своим персональным данным</li>
              <li>Исправления неверной информации</li>
              <li>Удаления своих данных (право на забывчивость)</li>
              <li>Ограничения обработки данных</li>
              <li>Возражения против обработки</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Контактная информация</h2>
            <p>
              Если у вас есть вопросы о Политике конфиденциальности, свяжитесь с нами:
            </p>
            <ul className="space-y-2">
              <li>Email: privacy@taskhive.ru</li>
              <li>Адрес: Москва, Россия</li>
              <li>Телефон: +7 (495) XXX-XX-XX</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Изменения политики</h2>
            <p>
              Мы оставляем право изменять данную Политику конфиденциальности. Об изменениях мы
              уведомим вас по электронной почте или через уведомление на Платформе.
            </p>
            <p className="text-sm">
              <strong>Дата последнего обновления:</strong> 27 января 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
