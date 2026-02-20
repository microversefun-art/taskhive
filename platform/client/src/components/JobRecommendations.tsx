import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Sparkles, ChevronRight, AlertCircle } from "lucide-react";

interface JobRecommendation {
  jobId: number;
  jobTitle: string;
  matchScore: number;
  matchPercentage: number;
  reasons: string[];
  salaryMatch: boolean;
  skillsMatch: boolean;
  experienceMatch: boolean;
}

export default function JobRecommendations() {
  const [selectedJob, setSelectedJob] = useState<JobRecommendation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: recommendations, isLoading, error } = trpc.aiRecommendations.getRecommendations.useQuery({
    limit: 5,
  });

  const { data: explanation } = trpc.aiRecommendations.getRecommendationExplanation.useQuery(
    { jobId: selectedJob?.jobId || 0 },
    { enabled: !!selectedJob }
  );

  const handleJobClick = (job: JobRecommendation) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-blue-50";
    if (score >= 40) return "bg-yellow-50";
    return "bg-red-50";
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-blue-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-5 h-5" />
            Ошибка загрузки рекомендаций
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700">
            Не удалось загрузить AI рекомендации. Попробуйте позже.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            AI Рекомендации вакансий
          </CardTitle>
          <CardDescription>
            Персональные рекомендации на основе вашего профиля и опыта
          </CardDescription>
        </CardHeader>

        <CardContent>
          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((job) => (
                <Card
                  key={job.jobId}
                  className={`cursor-pointer transition hover:shadow-md ${getMatchBgColor(job.matchScore)}`}
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {job.jobTitle}
                        </h4>

                        <div className="mt-2 space-y-2">
                          {/* Match Score */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-600">
                                Совпадение
                              </span>
                              <span className={`text-sm font-bold ${getMatchColor(job.matchScore)}`}>
                                {job.matchPercentage}%
                              </span>
                            </div>
                            <Progress
                              value={job.matchPercentage}
                              className="h-2"
                            />
                          </div>

                          {/* Match Indicators */}
                          <div className="flex gap-2 flex-wrap">
                            {job.skillsMatch && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Навыки
                              </Badge>
                            )}
                            {job.salaryMatch && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Зарплата
                              </Badge>
                            )}
                            {job.experienceMatch && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Опыт
                              </Badge>
                            )}
                          </div>

                          {/* Top Reasons */}
                          {job.reasons.length > 0 && (
                            <div className="text-xs text-slate-600 space-y-1">
                              {job.reasons.slice(0, 2).map((reason, idx) => (
                                <p key={idx} className="line-clamp-1">
                                  • {reason}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">
                Нет рекомендаций. Заполните ваш профиль для получения персональных рекомендаций.
              </p>
              <Button variant="outline" size="sm">
                Заполнить профиль
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedJob?.jobTitle}</DialogTitle>
            <DialogDescription>
              Совпадение: <strong>{selectedJob?.matchPercentage}%</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Match Score */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Оценка совпадения</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Общее совпадение</span>
                    <span className="text-sm font-bold text-blue-600">
                      {selectedJob?.matchPercentage}%
                    </span>
                  </div>
                  <Progress value={selectedJob?.matchPercentage || 0} />
                </div>
              </div>
            </div>

            {/* Reasons */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Почему эта вакансия для вас</h4>
              <ul className="space-y-2">
                {selectedJob?.reasons.map((reason, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Explanation from AI */}
            {explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Объяснение AI</h4>
                <p className="text-sm text-slate-700 mb-3">{explanation.explanation}</p>
                <div className="space-y-1">
                  {explanation.matchFactors.map((factor, idx) => (
                    <p key={idx} className="text-xs text-slate-600">
                      • {factor}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Откликнуться на вакансию
              </Button>
              <Button variant="outline" className="flex-1">
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
