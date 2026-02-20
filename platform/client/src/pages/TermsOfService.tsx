import React from "react";
import { Card } from "@/components/ui/card";

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Условия использования</h1>
        <p className="text-slate-600 mb-8">Последнее обновление: 25 января 2026 г.</p>

        <div className="space-y-8">
          {/* Agreement */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Соглашение</h2>
            <p className="text-slate-700 leading-relaxed">
              Используя платформу TaskHive, вы соглашаетесь с этими Условиями использования. Если вы не согласны с любой частью этих условий, пожалуйста, не используйте Платформу.
            </p>
          </Card>

          {/* User Eligibility */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Право на использование</h2>
            <div className="space-y-2 text-slate-700">
              <p>Вы можете использовать Платформу только если:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Вы достигли 18 лет</li>
                <li>Вы имеете право заключать юридические контракты</li>
                <li>Вы не являетесь запрещённым пользователем в соответствии с законодательством</li>
                <li>Вы согласны соблюдать эти Условия</li>
              </ul>
            </div>
          </Card>

          {/* Account */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Учётная запись</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                <strong>Регистрация:</strong> Вы несёте ответственность за точность информации, предоставляемой при регистрации.
              </p>
              <p>
                <strong>Безопасность:</strong> Вы несёте ответственность за сохранение конфиденциальности пароля и учётной записи.
              </p>
              <p>
                <strong>Активность:</strong> Вы несёте ответственность за всю активность, происходящую под вашей учётной записью.
              </p>
            </div>
          </Card>

          {/* User Responsibilities */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Ответственность пользователя</h2>
            <p className="text-slate-700 mb-4">Вы соглашаетесь не:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              <li>Нарушать законодательство Российской Федерации</li>
              <li>Использовать Платформу для мошенничества или обмана</li>
              <li>Публиковать оскорбительный, неприличный или незаконный контент</li>
              <li>Нарушать права интеллектуальной собственности других лиц</li>
              <li>Использовать автоматизированные средства для доступа к Платформе</li>
              <li>Пытаться получить несанкционированный доступ к системам</li>
              <li>Преследовать, запугивать или угрожать другим пользователям</li>
              <li>Спамить или отправлять нежелательные сообщения</li>
            </ul>
          </Card>

          {/* Services */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Услуги</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                TaskHive предоставляет платформу для соединения исполнителей и заказчиков. Мы не являемся работодателем и не контролируем отношения между пользователями.
              </p>
              <p>
                <strong>Независимые подрядчики:</strong> Исполнители и заказчики являются независимыми подрядчиками, а не сотрудниками TaskHive.
              </p>
            </div>
          </Card>

          {/* Payments */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Платежи</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                <strong>Комиссия:</strong> TaskHive взимает комиссию за услуги. Размер комиссии указан при создании задачи.
              </p>
              <p>
                <strong>Налоги:</strong> Вы несёте ответственность за уплату всех применимых налогов.
              </p>
              <p>
                <strong>Возвраты:</strong> Возвраты обрабатываются в соответствии с политикой возвратов Платформы.
              </p>
            </div>
          </Card>

          {/* Disputes */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Разрешение споров</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                В случае спора между пользователями, мы предоставляем механизм разрешения споров. Обе стороны должны попытаться разрешить спор мирным путём.
              </p>
              <p>
                Если спор не может быть разрешён, он может быть передан в арбитраж или суд в соответствии с применимым законодательством.
              </p>
            </div>
          </Card>

          {/* Intellectual Property */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Интеллектуальная собственность</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                Все содержимое Платформы (дизайн, логотипы, текст, графика) является собственностью TaskHive или её лицензиаров.
              </p>
              <p>
                Вы предоставляете TaskHive лицензию на использование любого контента, который вы загружаете на Платформу.
              </p>
            </div>
          </Card>

          {/* Disclaimers */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Отказ от ответственности</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                Платформа предоставляется "как есть" без каких-либо гарантий. Мы не гарантируем, что Платформа будет безошибочной или непрерывной.
              </p>
              <p>
                Мы не несём ответственность за убытки, вызванные использованием или невозможностью использования Платформы.
              </p>
            </div>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Ограничение ответственности</h2>
            <p className="text-slate-700">
              В максимальной степени, разрешённой законом, TaskHive не несёт ответственность за косвенные, случайные, специальные или штрафные убытки, включая потерю прибыли или данных.
            </p>
          </Card>

          {/* Termination */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Прекращение</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                Мы можем прекратить вашу учётную запись в любое время без уведомления, если вы нарушаете эти Условия.
              </p>
              <p>
                Вы можете удалить свою учётную запись в любое время через настройки профиля.
              </p>
            </div>
          </Card>

          {/* Changes */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Изменения условий</h2>
            <p className="text-slate-700">
              Мы можем изменять эти Условия в любое время. Продолжение использования Платформы означает согласие с изменениями.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Свяжитесь с нами</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                <strong>Email:</strong> <a href="mailto:support@taskhive.com" className="text-purple-600 hover:underline">support@taskhive.com</a>
              </p>
              <p>
                <strong>Телефон:</strong> <a href="tel:+79999999999" className="text-purple-600 hover:underline">+7 (999) XXX-XX-XX</a>
              </p>
              <p>
                Если у вас есть вопросы об этих Условиях использования, пожалуйста, свяжитесь с нами.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
