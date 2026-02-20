import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Upload, CheckCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TaskExecutionModalProps {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  reward: number;
  timeLimit: number;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskExecutionModal({
  taskId,
  taskTitle,
  taskDescription,
  reward,
  timeLimit,
  isOpen,
  onClose,
}: TaskExecutionModalProps) {
  const [step, setStep] = useState<"accept" | "execute" | "submit" | "completed">("accept");
  const [proof, setProof] = useState<string>("");
  const [proofType, setProofType] = useState<"photo" | "video" | "text" | "screenshot">("text");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);

  const acceptMutation = trpc.tasks.accept.useMutation();
  const completeMutation = trpc.tasks.complete.useMutation();

  // Timer
  useEffect(() => {
    if (step !== "execute" || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        setStep("submit");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, startTime, timeLimit]);

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync({ taskId });
      setStep("execute");
      setStartTime(new Date());
    } catch (error) {
      console.error("Failed to accept task:", error);
    }
  };

  const handleSubmit = async () => {
    if (!proof.trim()) {
      alert("Пожалуйста, заполните поле доказательства");
      return;
    }

    try {
      await completeMutation.mutateAsync({
        taskId,
        proof: {
          type: proofType,
          url: proof,
        },
      });
      setStep("completed");
    } catch (error) {
      console.error("Failed to submit task:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{taskTitle}</DialogTitle>
          <DialogDescription>{taskDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Accept */}
          {step === "accept" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">📋 Условия задачи</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Награда:</span>
                    <span className="font-bold text-green-600">{reward}₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Время на выполнение:</span>
                    <span className="font-bold">{timeLimit} минут</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Статус:</span>
                    <Badge>Доступна</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900 mb-1">Важно</p>
                    <p className="text-amber-800">
                      После принятия задачи у вас будет {timeLimit} минут на её выполнение. Убедитесь, что вы готовы начать прямо сейчас.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Отмена
                </Button>
                <Button onClick={handleAccept} disabled={acceptMutation.isPending} className="flex-1">
                  {acceptMutation.isPending ? "Загрузка..." : "Принять задачу"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Execute */}
          {step === "execute" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">⏱️ Время выполнения</h3>
                  <div className={`text-2xl font-bold ${timeLeft < 5 ? "text-red-600" : "text-green-600"}`}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                  </div>
                </div>
                <p className="text-sm text-green-800">Задача принята, начните выполнение</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📝 Инструкции</h4>
                <p className="text-sm text-slate-600">{taskDescription}</p>
              </div>

              <Button onClick={() => setStep("submit")} className="w-full">
                Я выполнил задачу →
              </Button>
            </div>
          )}

          {/* Step 3: Submit Proof */}
          {step === "submit" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">📸 Загрузите доказательство</h3>
                <p className="text-sm text-slate-600">
                  Загрузите фото, видео, скриншот или текст, подтверждающий выполнение задачи
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Тип доказательства</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["photo", "video", "text", "screenshot"] as const).map((type) => (
                    <Button
                      key={type}
                      variant={proofType === type ? "default" : "outline"}
                      onClick={() => setProofType(type)}
                      size="sm"
                      className="capitalize"
                    >
                      {type === "photo" && "📷"}
                      {type === "video" && "🎥"}
                      {type === "text" && "📝"}
                      {type === "screenshot" && "🖼️"}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {proofType === "text" ? "Описание выполнения" : "URL доказательства"}
                </label>
                <Textarea
                  placeholder={
                    proofType === "text"
                      ? "Опишите, как вы выполнили задачу..."
                      : "Вставьте ссылку на файл..."
                  }
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("execute")} className="flex-1">
                  Вернуться
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={completeMutation.isPending || !proof.trim()}
                  className="flex-1"
                >
                  {completeMutation.isPending ? "Отправка..." : "Отправить"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Completed */}
          {step === "completed" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">✅ Задача завершена!</h3>
                <p className="text-muted-foreground mb-4">
                  Спасибо за выполнение задачи. Ваше доказательство отправлено на проверку.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">+{reward}₽</div>
                  <p className="text-sm text-green-800">Деньги поступят в течение 5 минут</p>
                </div>
              </div>

              <Button onClick={onClose} className="w-full">
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
