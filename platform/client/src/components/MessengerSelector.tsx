import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Send } from "lucide-react";

interface MessengerSelectorProps {
  onSuccess?: (messageId: string) => void;
}

export default function MessengerSelector({ onSuccess }: MessengerSelectorProps) {
  const [selectedMessenger, setSelectedMessenger] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");

  const { data: messengers } = trpc.messenger.getAvailableMessengers.useQuery();

  const { mutate: sendTelegram, isPending: isTelegramPending } =
    trpc.messenger.sendTelegramMessage.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          onSuccess?.(String(data.messageId));
          setIsDialogOpen(false);
          setRecipientId("");
          setMessage("");
        }
      },
    });

  const { mutate: sendVK, isPending: isVKPending } = trpc.messenger.sendVKMessage.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        onSuccess?.(String(data.messageId));
        setIsDialogOpen(false);
        setRecipientId("");
        setMessage("");
      }
    },
  });

  const { mutate: sendEmail, isPending: isEmailPending } =
    trpc.messenger.sendEmail.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          onSuccess?.(String(data.messageId));
          setIsDialogOpen(false);
          setRecipientId("");
          setMessage("");
        }
      },
    });

  const handleSend = () => {
    if (!selectedMessenger || !recipientId || !message) return;

    const messenger = selectedMessenger as string;
    switch (messenger) {
      case "telegram":
        sendTelegram({
          chatId: recipientId,
          message,
        });
        break;
      case "vk":
        sendVK({
          userId: parseInt(recipientId),
          message,
        });
        break;
      case "email":
        sendEmail({
          email: recipientId,
          subject: "Сообщение от TaskHive",
          htmlContent: `<p>${message.replace(/\n/g, "<br>")}</p>`,
        });
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Send className="w-5 h-5" />
        Выберите способ связи
      </div>

      {messengers && messengers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {messengers
            .filter((m) => m.enabled)
            .map((messenger) => (
              <Card
                key={messenger.id}
                className={`cursor-pointer transition ${
                  selectedMessenger === messenger.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedMessenger(messenger.id)}
              >
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl mb-2">{messenger.icon}</div>
                  <p className="font-semibold text-slate-900 text-sm">{messenger.name}</p>
                  {selectedMessenger === messenger.id && (
                    <Badge className="mt-2 bg-blue-600">Выбрано</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900">Мессенджеры недоступны</p>
            <p className="text-sm text-yellow-700 mt-1">
              Пожалуйста, свяжитесь с поддержкой для активации мессенджеров
            </p>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button
          className="w-full"
          onClick={() => setIsDialogOpen(true)}
          disabled={!selectedMessenger}
        >
          Отправить сообщение
        </Button>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправить сообщение</DialogTitle>
            <DialogDescription>
              Способ: <strong>{messengers?.find((m) => m.id === selectedMessenger)?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {selectedMessenger === "email" ? "Email адрес" : "ID получателя"}
              </label>
              <Input
                placeholder={
                  selectedMessenger === "email"
                    ? "user@example.com"
                    : selectedMessenger === "vk"
                      ? "123456789"
                      : "987654321"
                }
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Сообщение
              </label>
              <Textarea
                placeholder="Введите ваше сообщение..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                {message.length} символов из 1000
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              ✓ Сообщение будет отправлено безопасно
              <br />✓ Получатель получит уведомление
              <br />✓ История сообщений сохраняется
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleSend}
                disabled={
                  isTelegramPending || isVKPending || isEmailPending || !recipientId || !message
                }
              >
                {isTelegramPending || isVKPending || isEmailPending
                  ? "Отправка..."
                  : "Отправить"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
