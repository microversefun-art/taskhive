import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getActiveUsers,
  getUserStatus,
  getChatParticipants,
  messageSchema,
  chatJoinSchema,
  typingSchema,
} from "./realtime";

describe("Realtime Chat System", () => {
  describe("Message Validation", () => {
    it("should validate correct message", () => {
      const validMessage = {
        chatId: 1,
        content: "Hello, world!",
        type: "text",
      };

      const result = messageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it("should reject empty content", () => {
      const invalidMessage = {
        chatId: 1,
        content: "",
        type: "text",
      };

      const result = messageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it("should reject message exceeding max length", () => {
      const invalidMessage = {
        chatId: 1,
        content: "a".repeat(5001),
        type: "text",
      };

      const result = messageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it("should validate message with default type", () => {
      const message = {
        chatId: 1,
        content: "Hello",
      };

      const result = messageSchema.safeParse(message);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("text");
      }
    });
  });

  describe("Chat Join Validation", () => {
    it("should validate correct chat join", () => {
      const validJoin = {
        chatId: 1,
      };

      const result = chatJoinSchema.safeParse(validJoin);
      expect(result.success).toBe(true);
    });

    it("should reject negative chat ID", () => {
      const invalidJoin = {
        chatId: -1,
      };

      const result = chatJoinSchema.safeParse(invalidJoin);
      expect(result.success).toBe(false);
    });

    it("should reject zero chat ID", () => {
      const invalidJoin = {
        chatId: 0,
      };

      const result = chatJoinSchema.safeParse(invalidJoin);
      expect(result.success).toBe(false);
    });
  });

  describe("Typing Validation", () => {
    it("should validate correct typing event", () => {
      const validTyping = {
        chatId: 1,
        isTyping: true,
      };

      const result = typingSchema.safeParse(validTyping);
      expect(result.success).toBe(true);
    });

    it("should validate typing false", () => {
      const validTyping = {
        chatId: 1,
        isTyping: false,
      };

      const result = typingSchema.safeParse(validTyping);
      expect(result.success).toBe(true);
    });

    it("should reject invalid chat ID", () => {
      const invalidTyping = {
        chatId: "invalid",
        isTyping: true,
      };

      const result = typingSchema.safeParse(invalidTyping);
      expect(result.success).toBe(false);
    });
  });

  describe("User Management", () => {
    it("should get empty active users initially", () => {
      const users = getActiveUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it("should get user status", () => {
      const status = getUserStatus(999);
      expect(status).toBeUndefined();
    });

    it("should get chat participants", () => {
      const participants = getChatParticipants(1);
      expect(Array.isArray(participants)).toBe(true);
      expect(participants.length).toBe(0);
    });
  });

  describe("Message Types", () => {
    it("should accept text message type", () => {
      const message = {
        chatId: 1,
        content: "Hello",
        type: "text",
      };

      const result = messageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    it("should accept image message type", () => {
      const message = {
        chatId: 1,
        content: "https://example.com/image.jpg",
        type: "image",
      };

      const result = messageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    it("should accept file message type", () => {
      const message = {
        chatId: 1,
        content: "https://example.com/file.pdf",
        type: "file",
      };

      const result = messageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    it("should accept system message type", () => {
      const message = {
        chatId: 1,
        content: "User joined the chat",
        type: "system",
      };

      const result = messageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });
  });
});
