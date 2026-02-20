import { describe, it, expect } from "vitest";
import {
  getAllBusinessBoxes,
  getUserBoxes,
  getUserSelfEmploymentStatus,
  startBusinessBox,
  completeBoxTask,
  getRecommendedBoxes,
} from "./business-boxes";

describe("Business Boxes Module", () => {
  describe("getAllBusinessBoxes", () => {
    it("should return all available business boxes", async () => {
      const boxes = await getAllBusinessBoxes();
      expect(boxes).toBeDefined();
      expect(boxes.length).toBeGreaterThan(0);
      expect(boxes[0]).toHaveProperty("id");
      expect(boxes[0]).toHaveProperty("name");
      expect(boxes[0]).toHaveProperty("tasks");
    });

    it("should have valid box structure", async () => {
      const boxes = await getAllBusinessBoxes();
      boxes.forEach((box) => {
        expect(box).toHaveProperty("id");
        expect(box).toHaveProperty("name");
        expect(box).toHaveProperty("description");
        expect(box).toHaveProperty("icon");
        expect(box).toHaveProperty("color");
        expect(box).toHaveProperty("price");
        expect(box).toHaveProperty("difficulty");
        expect(box).toHaveProperty("estimatedTime");
        expect(box).toHaveProperty("category");
        expect(box).toHaveProperty("tasks");
        expect(box.tasks.length).toBeGreaterThan(0);
      });
    });

    it("should have different categories", async () => {
      const boxes = await getAllBusinessBoxes();
      const categories = new Set(boxes.map((b) => b.category));
      expect(categories.size).toBeGreaterThan(1);
    });
  });

  describe("getUserBoxes", () => {
    it("should return user boxes", async () => {
      const userId = 1;
      const userBoxes = await getUserBoxes(userId);
      expect(userBoxes).toBeDefined();
      expect(Array.isArray(userBoxes)).toBe(true);
    });

    it("should have valid user box structure", async () => {
      const userId = 1;
      const userBoxes = await getUserBoxes(userId);
      if (userBoxes.length > 0) {
        const box = userBoxes[0];
        expect(box).toHaveProperty("userId");
        expect(box).toHaveProperty("boxId");
        expect(box).toHaveProperty("progress");
        expect(box).toHaveProperty("status");
        expect(box.progress).toBeGreaterThanOrEqual(0);
        expect(box.progress).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("getUserSelfEmploymentStatus", () => {
    it("should return user self-employment status", async () => {
      const userId = 1;
      const status = await getUserSelfEmploymentStatus(userId);
      expect(status).toBeDefined();
      expect(status).toHaveProperty("userId");
      expect(status).toHaveProperty("level");
      expect(status).toHaveProperty("monthlyEarnings");
      expect(status).toHaveProperty("completedBoxes");
      expect(status).toHaveProperty("status");
    });

    it("should have valid status values", async () => {
      const userId = 1;
      const status = await getUserSelfEmploymentStatus(userId);
      expect(status.level).toBeGreaterThan(0);
      expect(status.level).toBeLessThanOrEqual(5);
      expect(["employee", "freelancer", "entrepreneur", "business_owner"]).toContain(
        status.status
      );
    });
  });

  describe("startBusinessBox", () => {
    it("should start a new business box", async () => {
      const userId = 1;
      const boxId = "delivery_starter";
      const result = await startBusinessBox(userId, boxId);
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.boxId).toBe(boxId);
      expect(result.status).toBe("in_progress");
    });
  });

  describe("completeBoxTask", () => {
    it("should complete a box task", async () => {
      const userId = 1;
      const boxId = "delivery_starter";
      const taskId = "delivery_1";
      const reward = 150;
      const result = await completeBoxTask(userId, boxId, taskId, reward);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.totalEarnings).toBe(reward);
    });
  });

  describe("getRecommendedBoxes", () => {
    it("should return recommended boxes for user", async () => {
      const userId = 1;
      const boxes = await getRecommendedBoxes(userId);
      expect(boxes).toBeDefined();
      expect(Array.isArray(boxes)).toBe(true);
      expect(boxes.length).toBeGreaterThan(0);
    });
  });
});
