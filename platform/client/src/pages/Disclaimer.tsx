import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Важная информация</h1>
          <p className="text-muted-foreground">TaskHive - информационная платформа</p>
        </div>

        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            TaskHive является информационной платформой и не является работодателем. Мы не заключаем трудовые договоры и не несем ответственность за трудовые отношения между работниками и работодателями.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Статус информационного партнера</CardTitle>
            <CardDescription>Наша роль на рынке</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              TaskHive функционирует как информационная платформа, которая помогает соединить работников и работодателей. Мы предоставляем технологическую инфраструктуру для размещения вакансий и поиска работы, но не являемся сторону трудовых отношений.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Мы не нанимаем работников</li>
              <li>Мы не выплачиваем зарплату напрямую</li>
              <li>Мы не заключаем трудовые договоры</li>
              <li>Мы не несем ответственность за условия работы</li>
              <li>Все договоренности между работником и работодателем - их личное дело</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ответственность пользователей</CardTitle>
            <CardDescription>Что вы должны знать</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Используя TaskHive, вы принимаете на себя полную ответственность за:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Проверку информации о работодателе перед принятием работы</li>
              <li>Согласование условий работы напрямую с работодателем</li>
              <li>Заключение необходимых договоров и соглашений</li>
              <li>Защиту своих личных данных и финансовой информации</li>
              <li>Соблюдение законодательства РФ и СНГ</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Защита данных</CardTitle>
            <CardDescription>Как мы обрабатываем вашу информацию</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              TaskHive собирает и обрабатывает персональные данные в соответствии с Федеральным законом "О защите персональных данных" (№ 152-ФЗ) и GDPR.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Ваши данные защищены с помощью шифрования SSL</li>
              <li>Мы не передаем данные третьим лицам без вашего согласия</li>
              <li>Вы можете запросить удаление своих данных в любой момент</li>
              <li>Мы соблюдаем все требования по защите персональных данных</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ограничение ответственности</CardTitle>
            <CardDescription>Что мы не гарантируем</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              TaskHive не несет ответственность за:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Качество работы, предоставляемой работодателями</li>
              <li>Своевременность и полноту выплаты заработной платы</li>
              <li>Безопасность на рабочем месте</li>
              <li>Соблюдение трудового законодательства работодателями</li>
              <li>Точность информации, размещенной пользователями</li>
              <li>Убытки, возникшие в результате использования платформы</li>
            </ul>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Если вы столкнулись с мошенничеством или нарушением прав, пожалуйста, свяжитесь с нами через форму обратной связи или сообщите в соответствующие органы власти.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Email: support@taskhive.ru<br />
              Telegram: @taskhive_support<br />
              VK: vk.com/taskhive
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
