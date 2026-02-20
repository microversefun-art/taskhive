import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CreditCard, AlertCircle } from "lucide-react";

interface PaymentSelectorProps {
  amount: number;
  description: string;
  onSuccess?: (paymentId: string) => void;
}

export default function PaymentSelector({ amount, description, onSuccess }: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");

  const { data: paymentMethods } = trpc.payment.getPaymentMethods.useQuery();

  const { mutate: createQiwiPayment, isPending: isQiwiPending } =
    trpc.payment.createQiwiPayment.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          window.location.href = data.paymentUrl;
          onSuccess?.(data.paymentId);
        }
      },
    });

  const { mutate: createYandexPayment, isPending: isYandexPending } =
    trpc.payment.createYandexPayment.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          window.location.href = data.paymentUrl;
          onSuccess?.(data.paymentId);
        }
      },
    });

  const { mutate: createTinkoffPayment, isPending: isTinkoffPending } =
    trpc.payment.createTinkoffPayment.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          window.location.href = data.paymentUrl;
          onSuccess?.(data.paymentId);
        }
      },
    });

  const handlePayment = () => {
    if (!selectedMethod) return;

    switch (selectedMethod) {
      case "qiwi":
        createQiwiPayment({
          phone: "+79999999999",
          amount,
          comment: description,
        });
        break;
      case "yandex":
        createYandexPayment({
          amount,
          description,
          email: email || "user@example.com",
        });
        break;
      case "tinkoff":
        createTinkoffPayment({
          amount,
          description,
          email: email || "user@example.com",
        });
        break;
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <CreditCard className="w-5 h-5" />
        Выберите способ оплаты
      </div>

      {paymentMethods && paymentMethods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods
            .filter((method) => method.enabled)
            .map((method) => (
              <Card
                key={method.id}
                className={`cursor-pointer transition ${
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{method.name}</p>
                      <p className="text-xs text-slate-600">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <Badge className="bg-blue-600">Выбрано</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900">Методы оплаты недоступны</p>
            <p className="text-sm text-yellow-700 mt-1">
              Пожалуйста, свяжитесь с поддержкой для активации платежных методов
            </p>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button
          className="w-full"
          onClick={() => setIsDialogOpen(true)}
          disabled={!selectedMethod}
        >
          Оплатить {amount} ₽
        </Button>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение платежа</DialogTitle>
            <DialogDescription>
              Сумма: <strong>{amount} ₽</strong> · Метод:{" "}
              <strong>{paymentMethods?.find((m) => m.id === selectedMethod)?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {["yandex", "tinkoff"].includes(selectedMethod || "") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email для уведомлений
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              ✓ Платеж защищен и безопасен
              <br />✓ Данные не сохраняются на сервере
              <br />✓ Вы будете перенаправлены на сайт платежной системы
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handlePayment}
                disabled={
                  isQiwiPending || isYandexPending || isTinkoffPending || !selectedMethod
                }
              >
                {isQiwiPending || isYandexPending || isTinkoffPending
                  ? "Обработка..."
                  : "Перейти к оплате"}
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
