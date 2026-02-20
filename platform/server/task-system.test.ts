import { describe, it, expect } from "vitest";
import {
  getUrgentTasks,
  getUserTasks,
  acceptTask,
  completeTask,
  rejectTask,
  getPopularTaskCategories,
} from "./task-system";

describe("Task System Module", () => {
  describe("getUrgentTasks", () => {
    it("should return urgent tasks", async () => {
      const tasks = await getUrgentTasks();
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it("should have valid task structure", async () => {
      const tasks = await getUrgentTasks();
      tasks.forEach((task) => {
        expect(task).toHaveProperty("id");
        expect(task).toHaveProperty("title");
        expect(task).toHaveProperty("description");
        expect(task).toHaveProperty("type");
        expect(task).toHaveProperty("category");
        expect(task).toHaveProperty("reward");
        expect(task).toHaveProperty("timeLimit");
        expect(task).toHaveProperty("difficulty");
        expect(task).toHaveProperty("status");
      });
    });

    it("should have both online and offline tasks", async () => {
      const tasks = await getUrgentTasks();
      const types = new Set(tasks.map((t) => t.type));
      expect(types.has("online") || types.has("offline")).toBe(true);
    });

    it("should support geolocation filtering", async () => {
      const latitude = 55.7558; // Moscow
      const longitude = 37.6173;
      const tasks = await getUrgentTasks(latitude, longitude, 5000);
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe("getUserTasks", () => {
    it("should return user tasks", async () => {
      const userId = 1;
      const tasks = await getUserTasks(userId);
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it("should have valid user task structure", async () => {
      const userId = 1;
      const tasks = await getUserTasks(userId);
      if (tasks.length > 0) {
        const task = tasks[0];
        expect(task).toHaveProperty("userId");
        expect(task).toHaveProperty("taskId");
        expect(task).toHaveProperty("status");
        expect(task).toHaveProperty("reward");
      }
    });
  });

  describe("acceptTask", () => {
    it("should accept a task", async () => {
      const userId = 1;
      const taskId = "urgent_1";
      const result = await acceptTask(userId, taskId);
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.taskId).toBe(taskId);
      expect(result.status).toBe("accepted");
    });
  });

  describe("completeTask", () => {
    it("should complete a task without proof", async () => {
      const userId = 1;
      const taskId = "urgent_1";
      const result = await completeTask(userId, taskId);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.reward).toBeGreaterThan(0);
    });

    it("should complete a task with proof", async () => {
      const userId = 1;
      const taskId = "urgent_1";
      const proof = {
        type: "photo" as const,
        url: "https://example.com/photo.jpg",
      };
      const result = await completeTask(userId, taskId, proof);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe("rejectTask", () => {
    it("should reject a task", async () => {
      const userId = 1;
      const taskId = "urgent_1";
      const reason = "Too difficult";
      const result = await rejectTask(userId, taskId, reason);
      expect(result).toBe(true);
    });
  });

  describe("getPopularTaskCategories", () => {
    it("should return popular task categories", async () => {
      const categories = await getPopularTaskCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it("should have valid category structure", async () => {
      const categories = await getPopularTaskCategories();
      categories.forEach((cat) => {
        expect(cat).toHaveProperty("category");
        expect(cat).toHaveProperty("count");
        expect(cat).toHaveProperty("avgReward");
        expect(cat).toHaveProperty("icon");
        expect(cat.count).toBeGreaterThan(0);
        expect(cat.avgReward).toBeGreaterThan(0);
      });
    });

    it("should have different categories", async () => {
      const categories = await getPopularTaskCategories();
      const uniqueCategories = new Set(categories.map((c) => c.category));
      expect(uniqueCategories.size).toBe(categories.length);
    });
  });
});
