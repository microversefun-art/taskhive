import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверить, принял ли пользователь cookies
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);

    // Инициализировать аналитику и трекеры
    if ((window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">🍪 Использование cookies</h3>
          <p className="text-sm text-muted-foreground">
            Мы используем cookies для улучшения вашего опыта. Нажимая "Принять", вы соглашаетесь с нашей{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Политикой конфиденциальности
            </a>{" "}
            и{" "}
            <a href="/terms" className="underline hover:text-foreground">
              Пользовательским соглашением
            </a>
            .
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="whitespace-nowrap"
          >
            Отклонить
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="whitespace-nowrap"
          >
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
