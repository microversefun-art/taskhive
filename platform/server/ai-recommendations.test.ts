import { describe, it, expect } from "vitest";
import { calculateJobMatch, getSimpleRecommendations } from "./ai-recommendations";

describe("AI Recommendations System", () => {
  const mockUserProfile = {
    userId: 1,
    skills: ["JavaScript", "React", "Node.js"],
    experience: 3,
    preferredCategories: ["Разработка", "Доставка"],
    salaryExpectation: 50000,
    bio: "Опытный разработчик",
  };

  const mockJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      category: "Разработка",
      salary: 80000,
      salaryMin: 70000,
      salaryMax: 100000,
      requirements: "3+ лет опыта с React, JavaScript, TypeScript",
      description: "Ищем опытного React разработчика",
      status: "active",
    },
    {
      id: 2,
      title: "Курьер",
      category: "Доставка",
      salary: 30000,
      salaryMin: 25000,
      salaryMax: 35000,
      requirements: "Водительское удостоверение",
      description: "Доставка посылок по городу",
      status: "active",
    },
    {
      id: 3,
      title: "Junior Python Developer",
      category: "Разработка",
      salary: 40000,
      salaryMin: 35000,
      salaryMax: 45000,
      requirements: "1+ год опыта с Python",
      description: "Ищем молодого разработчика",
      status: "active",
    },
  ];

  describe("Job Match Calculation", () => {
    it("should calculate match for perfect job", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      expect(match.jobId).toBe(1);
      expect(match.jobTitle).toBe("Senior React Developer");
      expect(match.matchScore).toBeGreaterThan(50);
      expect(match.reasons.length).toBeGreaterThan(0);
    });

    it("should calculate match for partial job", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[1]);

      expect(match.jobId).toBe(2);
      expect(match.jobTitle).toBe("Курьер");
      expect(match.matchScore).toBeGreaterThanOrEqual(0);
    });

    it("should identify category match", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      expect(match.reasons.some((r) => r.includes("категория") || r.includes("Вакансия"))).toBe(true);
    });

    it("should identify salary match", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      // Проверяем что есть причина о зарплате в рекомендациях
      expect(
        match.reasons.some((r) => r.toLowerCase().includes("зарплата"))
      ).toBe(true);
    });

    it("should identify experience match", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      expect(match.experienceMatch).toBe(true);
    });

    it("should identify skills match", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      expect(match.skillsMatch).toBe(true);
    });
  });

  describe("Simple Recommendations", () => {
    it("should return recommendations sorted by score", async () => {
      const recommendations = await getSimpleRecommendations(
        mockUserProfile,
        mockJobs,
        3
      );

      expect(recommendations.length).toBeLessThanOrEqual(3);
      expect(recommendations.length).toBeGreaterThan(0);

      // Check if sorted in descending order
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].matchScore).toBeGreaterThanOrEqual(
          recommendations[i + 1].matchScore
        );
      }
    });

    it("should respect limit parameter", async () => {
      const recommendations = await getSimpleRecommendations(
        mockUserProfile,
        mockJobs,
        2
      );

      expect(recommendations.length).toBeLessThanOrEqual(2);
    });

    it("should return all jobs if limit exceeds available", async () => {
      const recommendations = await getSimpleRecommendations(
        mockUserProfile,
        mockJobs,
        100
      );

      expect(recommendations.length).toBeLessThanOrEqual(mockJobs.length);
    });

    it("should include job titles in recommendations", async () => {
      const recommendations = await getSimpleRecommendations(
        mockUserProfile,
        mockJobs,
        3
      );

      recommendations.forEach((rec) => {
        expect(rec.jobTitle).toBeDefined();
        expect(rec.jobTitle.length).toBeGreaterThan(0);
      });
    });

    it("should include reasons for recommendations", async () => {
      const recommendations = await getSimpleRecommendations(
        mockUserProfile,
        mockJobs,
        3
      );

      recommendations.forEach((rec) => {
        expect(Array.isArray(rec.reasons)).toBe(true);
      });
    });
  });

  describe("Match Score Range", () => {
    it("should keep match score between 0 and 100", async () => {
      const recommendations = await getSimpleRecommendations(
        mockUserProfile,
        mockJobs,
        10
      );

      recommendations.forEach((rec) => {
        expect(rec.matchScore).toBeGreaterThanOrEqual(0);
        expect(rec.matchScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("User Profile Matching", () => {
    it("should match user with preferred category", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      expect(match.reasons.some((r) => r.includes("категория") || r.includes("Вакансия"))).toBe(true);
    });

    it("should consider user experience", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      expect(match.experienceMatch).toBeDefined();
    });

    it("should evaluate salary expectations", async () => {
      const match = await calculateJobMatch(mockUserProfile, mockJobs[0]);

      expect(match.salaryMatch).toBeDefined();
    });
  });
});
