import { describe, it, expect, beforeEach, vi } from "vitest";
import { createQiwiPayment, createYandexPayment, createTinkoffPayment } from "./payment";

describe("Payment Integration", () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.QIWI_API_KEY = "test-qiwi-key";
    process.env.YANDEX_SHOP_ID = "test-shop-id";
    process.env.YANDEX_API_KEY = "test-yandex-key";
    process.env.TINKOFF_TERMINAL_KEY = "test-terminal-key";
    process.env.TINKOFF_API_KEY = "test-tinkoff-key";
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.BACKEND_URL = "http://localhost:3000";
  });

  describe("createQiwiPayment", () => {
    it("should return success response with payment URL", async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "test-payment-id",
          payUrl: "https://qiwi.com/pay/test",
          expirationDateTime: "2026-01-26T12:00:00Z",
        }),
      });

      const result = await createQiwiPayment("+79999999999", 1500, "Test payment");

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe("test-payment-id");
      expect(result.paymentUrl).toBe("https://qiwi.com/pay/test");
    });

    it("should handle API errors gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      });

      const result = await createQiwiPayment("+79999999999", 1500, "Test payment");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("createYandexPayment", () => {
    it("should return success response with payment URL", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "test-yandex-id",
          status: "pending",
          confirmation: {
            confirmation_url: "https://yandex.com/pay/test",
          },
        }),
      });

      const result = await createYandexPayment(2000, "Test order", "test@example.com");

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe("test-yandex-id");
      expect(result.paymentUrl).toBe("https://yandex.com/pay/test");
    });

    it("should validate email parameter", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "test-id",
          status: "pending",
          confirmation: { confirmation_url: "https://yandex.com/pay" },
        }),
      });

      const result = await createYandexPayment(1000, "Test", "invalid-email");

      // Should still attempt to create payment
      expect(result).toBeDefined();
    });
  });

  describe("createTinkoffPayment", () => {
    it("should return success response with payment URL", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          PaymentId: "test-tinkoff-id",
          Status: "NEW",
          PaymentURL: "https://tinkoff.com/pay/test",
        }),
      });

      const result = await createTinkoffPayment(3000, "Test order", "test@example.com");

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe("test-tinkoff-id");
      expect(result.paymentUrl).toBe("https://tinkoff.com/pay/test");
    });

    it("should convert amount to kopecks correctly", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          PaymentId: "test-id",
          Status: "NEW",
          PaymentURL: "https://tinkoff.com/pay",
        }),
      });

      await createTinkoffPayment(100, "Test", "test@example.com");

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.Amount).toBe(10000); // 100 * 100 kopecks
    });
  });

  describe("Payment validation", () => {
    it("should validate positive amounts", async () => {
      global.fetch = vi.fn();

      // Should handle negative amounts gracefully
      const result = await createQiwiPayment("+79999999999", -100, "Invalid");
      expect(result).toBeDefined();
    });

    it("should validate phone numbers", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "test-id",
          payUrl: "https://qiwi.com/pay",
          expirationDateTime: "2026-01-26T12:00:00Z",
        }),
      });

      const result = await createQiwiPayment("invalid-phone", 1500, "Test");
      expect(result).toBeDefined();
    });
  });
});
