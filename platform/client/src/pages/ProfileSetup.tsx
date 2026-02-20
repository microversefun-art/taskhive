import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CheckCircle, AlertCircle, Phone, Mail, Globe, User } from "lucide-react";

interface VerificationStatus {
  phone: boolean;
  email: boolean;
  social: boolean;
  name: boolean;
}

export default function ProfileSetup() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    phone: "",
    email: user?.email || "",
    bio: "",
    skills: "",
    vkProfile: "",
    telegramHandle: "",
    instagramHandle: "",
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    phone: false,
    email: !!user?.email,
    social: false,
    name: !!user?.name,
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyingField, setVerifyingField] = useState<string | null>(null);

  const { mutate: updateProfile, isPending } = trpc.profile.create.useMutation({
    onSuccess: () => {
      alert("Профиль успешно обновлен!");
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVerifyPhone = () => {
    setVerifyingField("phone");
    setShowVerificationModal(true);
    // В production отправьте код на телефон
    console.log("Отправка кода на номер:", formData.phone);
  };

  const handleVerifyEmail = () => {
    setVerifyingField("email");
    setShowVerificationModal(true);
    // В production отправьте код на email
    console.log("Отправка кода на email:", formData.email);
  };

  const handleVerifyCode = () => {
    if (verificationCode === "123456") {
      // Простая проверка для демо
      if (verifyingField === "phone") {
        setVerificationStatus((prev) => ({ ...prev, phone: true }));
      } else if (verifyingField === "email") {
        setVerificationStatus((prev) => ({ ...prev, email: true }));
      }
      setShowVerificationModal(false);
      setVerificationCode("");
    } else {
      alert("Неверный код. Попробуйте еще раз.");
    }
  };

  const handleAddSocial = (platform: string, handle: string) => {
    if (handle.trim()) {
      setVerificationStatus((prev) => ({ ...prev, social: true }));
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      userType: "worker",
      bio: formData.bio,
      phone: formData.phone,
      skills: formData.skills,
    });
  };

  const verificationProgress = Object.values(verificationStatus).filter(Boolean).length;
  const totalFields = Object.keys(verificationStatus).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Настройка профиля</h1>
          <p className="text-slate-600">
            Заполните информацию для улучшения рекомендаций и верификации
          </p>
        </div>

        {/* Verification Progress */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Верификация профиля</span>
                <span className="text-sm text-slate-600">
                  {verificationProgress} из {totalFields} завершено
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(verificationProgress / totalFields) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Личные данные</TabsTrigger>
            <TabsTrigger value="professional">Профессиональные</TabsTrigger>
            <TabsTrigger value="social">Социальные сети</TabsTrigger>
          </TabsList>

          {/* Personal Data Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Личные данные
                </CardTitle>
                <CardDescription>
                  Основная информация для верификации профиля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Ваше имя"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Ваша фамилия"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Телефон
                    </Label>
                    {verificationStatus.phone && (
                      <Badge className="bg-green-600">Верифицирован</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+7 (999) 999-99-99"
                      className="mt-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleVerifyPhone}
                      disabled={!formData.phone || verificationStatus.phone}
                      className="mt-1"
                    >
                      {verificationStatus.phone ? "✓" : "Верифицировать"}
                    </Button>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    {verificationStatus.email && (
                      <Badge className="bg-green-600">Верифицирован</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleVerifyEmail}
                      disabled={!formData.email || verificationStatus.email}
                      className="mt-1"
                    >
                      {verificationStatus.email ? "✓" : "Верифицировать"}
                    </Button>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Расскажите о себе, своих интересах и опыте..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Профессиональная информация</CardTitle>
                <CardDescription>
                  Информация о вашем опыте и навыках
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skills">Навыки и умения</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                    placeholder="Перечислите ваши навыки через запятую (например: JavaScript, React, Python, Водитель)"
                    className="mt-1"
                    rows={4}
                  />
                  <p className="text-xs text-slate-600 mt-2">
                    Это поможет нам подобрать более точные рекомендации вакансий
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Networks Tab */}
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-4" />
                  Социальные сети
                </CardTitle>
                <CardDescription>
                  Добавьте ссылки на ваши социальные профили (опционально)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* VK */}
                <div>
                  <Label htmlFor="vk">VK профиль</Label>
                  <Input
                    id="vk"
                    value={formData.vkProfile}
                    onChange={(e) => handleInputChange("vkProfile", e.target.value)}
                    placeholder="https://vk.com/username"
                    className="mt-1"
                  />
                </div>

                {/* Telegram */}
                <div>
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={formData.telegramHandle}
                    onChange={(e) => handleInputChange("telegramHandle", e.target.value)}
                    placeholder="@username"
                    className="mt-1"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagramHandle}
                    onChange={(e) => handleInputChange("instagramHandle", e.target.value)}
                    placeholder="@username"
                    className="mt-1"
                  />
                </div>

                {verificationStatus.social && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">
                      Социальные сети добавлены
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex gap-3">
          <Button
            onClick={handleSaveProfile}
            disabled={isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-base"
          >
            {isPending ? "Сохранение..." : "Сохранить профиль"}
          </Button>
          <Button variant="outline" className="h-12">
            Отмена
          </Button>
        </div>

        {/* Verification Code Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Подтверждение</CardTitle>
                <CardDescription>
                  Введите код подтверждения, отправленный на {verifyingField === "phone" ? formData.phone : formData.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="code">Код подтверждения</Label>
                  <Input
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    className="mt-1 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-slate-600 mt-2">
                    Для демо используйте код: 123456
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={verificationCode.length !== 6}
                    className="flex-1"
                  >
                    Подтвердить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowVerificationModal(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
