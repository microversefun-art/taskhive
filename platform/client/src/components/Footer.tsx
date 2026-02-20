import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

const CONTACT_EMAIL = "support@taskhive.com";
const CONTACT_PHONE = "+7 (999) XXX-XX-XX";
const CONTACT_ADDRESS = "Москва, Россия";

const SOCIAL_LINKS = [
  { name: "VK", href: "https://vk.com/" },
  { name: "MAX", href: "https://max.ru/" },
  { name: "Dzen", href: "https://dzen.ru/" },
  { name: "OK", href: "https://ok.ru/" },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">TaskHive</h3>
            <p className="text-sm text-slate-400 mb-4">
              Платформа для поиска срочных работ и развития карьеры. Работайте здесь и сейчас, развивайтесь и зарабатывайте.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-700 px-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="text-slate-400 hover:text-white transition-colors">
                  Задачи
                </Link>
              </li>
              <li>
                <Link href="/boxes" className="text-slate-400 hover:text-white transition-colors">
                  Карьерные пути
                </Link>
              </li>
              <li>
                <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                  О нас
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Правовая информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Политика конфиденциальности (152-ФЗ)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link href="/info/cookies" className="text-slate-400 hover:text-white transition-colors">
                  Политика cookies
                </Link>
              </li>
              <li>
                <Link href="/info/data-processing" className="text-slate-400 hover:text-white transition-colors">
                  Обработка персональных данных
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-purple-400" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-400 hover:text-white transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-purple-400" />
                <a href={`tel:${CONTACT_PHONE}`} className="text-slate-400 hover:text-white transition-colors">
                  {CONTACT_PHONE}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-purple-400 mt-0.5" />
                <span className="text-slate-400">{CONTACT_ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>&copy; {currentYear} TaskHive. Все права защищены.</p>
          <p className="text-center md:text-right">
            Разработано с любовью для развития самозанятых в России
          </p>
        </div>
      </div>
    </footer>
  );
};
