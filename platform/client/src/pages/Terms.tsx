import React from "react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Пользовательское соглашение</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Общие положения</h2>
            <p>
              Настоящее Пользовательское соглашение (далее – «Соглашение») является договором между
              вами и компанией TaskHive и регулирует использование Платформы. Используя Платформу, вы
              соглашаетесь с условиями настоящего Соглашения.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Определения</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Платформа</strong> – веб-сайт и мобильное приложение TaskHive
              </li>
              <li>
                <strong>Пользователь</strong> – физическое лицо, использующее Платформу
              </li>
              <li>
                <strong>Исполнитель</strong> – Пользователь, выполняющий работу
              </li>
              <li>
                <strong>Работодатель</strong> – Пользователь, размещающий задачи
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Регистрация и аккаунт</h2>
            <p>
              Для использования Платформы вы должны зарегистрироваться и создать аккаунт. Вы
              обязуетесь:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Предоставлять точную и полную информацию</li>
              <li>Сохранять конфиденциальность пароля</li>
              <li>Отвечать за все действия под вашим аккаунтом</li>
              <li>Немедленно уведомлять об несанкционированном доступе</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Правила поведения</h2>
            <p>Вы не должны:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Нарушать законы Российской Федерации</li>
              <li>Размещать оскорбительное или дискриминационное содержимое</li>
              <li>Заниматься мошенничеством или обманом</li>
              <li>Нарушать права интеллектуальной собственности</li>
              <li>Использовать боты или автоматизацию без разрешения</li>
              <li>Спамить или преследовать других пользователей</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Платежи и комиссии</h2>
            <p>
              TaskHive взимает комиссию за использование Платформы. Размер комиссии зависит от типа
              подписки:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free План: 20% комиссия</li>
              <li>Starter План: 15% комиссия</li>
              <li>Pro План: 10% комиссия</li>
              <li>Enterprise План: договорная комиссия</li>
            </ul>
            <p>
              Все платежи обрабатываются через защищённые платёжные системы. Возврат средств
              осуществляется в соответствии с политикой возврата.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Ответственность</h2>
            <p>
              TaskHive не несёт ответственность за:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Качество выполненной работы</li>
              <li>Споры между Пользователями</li>
              <li>Убытки, вызванные использованием Платформы</li>
              <li>Перерывы в обслуживании</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Разрешение споров</h2>
            <p>
              В случае спора между Пользователями, TaskHive предоставляет механизм разрешения
              конфликтов. Если спор не разрешён, он может быть передан в суд в соответствии с
              законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Прекращение аккаунта</h2>
            <p>
              TaskHive оставляет право удалить аккаунт Пользователя, если:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Нарушены условия Соглашения</li>
              <li>Аккаунт неактивен более 12 месяцев</li>
              <li>Обнаружена мошеннической деятельность</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Интеллектуальная собственность</h2>
            <p>
              Все содержимое Платформы (текст, изображения, логотипы) является собственностью TaskHive
              и защищено авторским правом. Вы не можете копировать или распространять содержимое без
              разрешения.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Изменения Соглашения</h2>
            <p>
              TaskHive оставляет право изменять Соглашение в любое время. Об изменениях мы уведомим
              вас по электронной почте. Продолжение использования Платформы означает принятие новых
              условий.
            </p>
            <p className="text-sm">
              <strong>Дата последнего обновления:</strong> 27 января 2026
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Контактная информация</h2>
            <p>
              Если у вас есть вопросы, свяжитесь с нами:
            </p>
            <ul className="space-y-2">
              <li>Email: support@taskhive.ru</li>
              <li>Адрес: Москва, Россия</li>
              <li>Телефон: +7 (495) XXX-XX-XX</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
