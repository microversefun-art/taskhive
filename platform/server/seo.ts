/**
 * Модуль для SEO оптимизации
 */

export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  canonical?: string;
  robots?: string;
}

/**
 * Генерирует мета-теги для страницы вакансии
 */
export function generateJobPageMeta(
  jobTitle: string,
  jobDescription: string,
  salary: number,
  category: string
): SEOMetaTags {
  const description = jobDescription.substring(0, 155);

  return {
    title: `${jobTitle} - TaskHive | Платформа для поиска подработок`,
    description: `${description}... Зарплата: ${salary.toLocaleString("ru-RU")} руб. Категория: ${category}`,
    keywords: [jobTitle, category, "подработка", "работа", "вакансия", salary.toString()],
    ogTitle: jobTitle,
    ogDescription: description,
    canonical: `/jobs/${jobTitle.toLowerCase().replace(/\s+/g, "-")}`,
    robots: "index, follow",
  };
}

/**
 * Генерирует мета-теги для главной страницы
 */
export function generateHomepageMeta(): SEOMetaTags {
  return {
    title: "TaskHive - Платформа для поиска подработок в России и СНГ",
    description:
      "Найдите подработку своей мечты на TaskHive. Тысячи вакансий: курьер, склад, доставка, разработка и многое другое. Быстрые деньги, безопасность, рейтинги.",
    keywords: [
      "подработка",
      "работа",
      "вакансии",
      "курьер",
      "склад",
      "доставка",
      "разработчик",
      "фриланс",
      "заработок",
    ],
    ogTitle: "TaskHive - Платформа для поиска подработок",
    ogDescription:
      "Найдите подработку своей мечты на TaskHive. Тысячи вакансий в России и СНГ.",
    canonical: "/",
    robots: "index, follow",
  };
}

/**
 * Генерирует структурированные данные (Schema.org)
 */
export function generateJobSchema(
  jobTitle: string,
  jobDescription: string,
  salary: number,
  category: string,
  companyName: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: jobTitle,
    description: jobDescription,
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
    },
    baseSalary: {
      "@type": "PriceSpecification",
      currency: "RUB",
      value: {
        "@type": "QuantitativeValue",
        value: salary,
      },
    },
    jobLocationType: "TELECOMMUTE",
    employmentType: "TEMPORARY",
  };
}

/**
 * Генерирует карту сайта (Sitemap)
 */
export function generateSitemapEntry(
  url: string,
  lastmod?: Date,
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never",
  priority?: number
): string {
  const entry = `
  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>` : ""}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    ${priority ? `<priority>${priority}</priority>` : ""}
  </url>`;

  return entry;
}

/**
 * Генерирует robots.txt
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Allow: /jobs
Allow: /search
Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /profile/edit

Sitemap: https://taskhive.ru/sitemap.xml

User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Yandexbot
Allow: /
Crawl-delay: 0`;
}

/**
 * Оптимизирует текст для SEO
 */
export function optimizeTextForSEO(text: string, keyword: string): string {
  // Убедитесь, что ключевое слово присутствует в начале
  if (!text.toLowerCase().includes(keyword.toLowerCase())) {
    return `${keyword}. ${text}`;
  }
  return text;
}

/**
 * Генерирует URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Проверяет SEO оптимизацию страницы
 */
export function checkSEOOptimization(meta: SEOMetaTags): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Проверка заголовка
  if (!meta.title || meta.title.length < 30) {
    issues.push("Заголовок слишком короткий (минимум 30 символов)");
    score -= 10;
  }
  if (meta.title.length > 60) {
    suggestions.push("Заголовок может быть обрезан в результатах поиска");
  }

  // Проверка описания
  if (!meta.description || meta.description.length < 120) {
    issues.push("Описание слишком короткое (минимум 120 символов)");
    score -= 10;
  }
  if (meta.description.length > 160) {
    suggestions.push("Описание может быть обрезано в результатах поиска");
  }

  // Проверка ключевых слов
  if (!meta.keywords || meta.keywords.length === 0) {
    issues.push("Ключевые слова не указаны");
    score -= 5;
  }

  // Проверка canonical
  if (!meta.canonical) {
    suggestions.push("Рекомендуется добавить canonical URL");
  }

  // Проверка og-тегов
  if (!meta.ogTitle || !meta.ogDescription) {
    suggestions.push("Добавьте Open Graph теги для лучшего отображения в соцсетях");
  }

  return { score: Math.max(0, score), issues, suggestions };
}

/**
 * Генерирует хлебные крошки (Breadcrumbs)
 */
export function generateBreadcrumbs(
  path: string
): Array<{ name: string; url: string }> {
  const parts = path.split("/").filter(Boolean);
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: "Главная", url: "/" },
  ];

  let currentPath = "";
  parts.forEach((part) => {
    currentPath += `/${part}`;
    breadcrumbs.push({
      name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      url: currentPath,
    });
  });

  return breadcrumbs;
}
