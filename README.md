# 🌸 Paloma Flowers — Premium Flower Shop

Полнофункциональный интернет-магазин премиального цветочного магазина и кофейни в Новороссийске.

## Технологии

| Категория | Технология |
|-----------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Стили | Tailwind CSS + SCSS |
| CMS | Sanity v3 |
| Анимации | Framer Motion + GSAP |
| Состояние | Zustand |
| Формы | React Hook Form + Zod |
| Иконки | Lucide React |
| Шрифты | Cormorant Garamond + Inter |

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/yourname/paloma-flowers.git
cd paloma-flowers

# 2. Установить зависимости
npm install

# 3. Настроить переменные окружения
cp .env.local.example .env.local
# Заполните переменные в .env.local

# 4. Запустить сервер разработки
npm run dev
```

Сайт: http://localhost:3000  
Sanity Studio: http://localhost:3000/studio

## Структура проекта

```
paloma/
├── app/
│   ├── (site)/           # Основной сайт
│   │   ├── page.tsx      # Главная страница
│   │   ├── catalog/      # Каталог товаров
│   │   ├── coffee/       # Кофейня
│   │   ├── subscription/ # Подписка
│   │   ├── events/       # Мероприятия
│   │   └── ...           # Остальные страницы
│   ├── api/              # API роуты
│   └── studio/           # Sanity Studio
├── components/           # React компоненты
├── lib/                  # Утилиты и сторы
├── data/                 # Mock данные (50 товаров)
├── sanity/               # Схемы CMS
└── styles/               # Глобальные стили
```

## Настройка Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Скопируйте токен в `TELEGRAM_BOT_TOKEN`
4. Для получения `chat_id` напишите [@userinfobot](https://t.me/userinfobot)
5. Скопируйте ID в `TELEGRAM_MANAGER_CHAT_ID`

## Настройка Sanity CMS

```bash
# Создать проект на sanity.io
npm create sanity@latest

# Запустить локальную Studio
npm run sanity:dev

# Деплой Studio
npx sanity deploy
```

После создания проекта заполните `NEXT_PUBLIC_SANITY_PROJECT_ID` в `.env.local`.

## Настройка YooKassa (оплата)

1. Зарегистрируйтесь на [yookassa.ru](https://yookassa.ru)
2. Получите `shopId` и `secretKey`
3. Добавьте в `.env.local`:
   ```
   PAYMENT_PROVIDER=yookassa
   YOOKASSA_SHOP_ID=your_shop_id
   YOOKASSA_SECRET_KEY=your_secret_key
   ```

В режиме разработки (`PAYMENT_PROVIDER=dev`) платежи симулируются.

## Деплой на Vercel

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel

# Добавьте все переменные окружения в Vercel Dashboard
# Settings → Environment Variables
```

## Функциональность

- ✅ Каталог с фильтрами (категория, размер, цена)
- ✅ 50 mock товаров
- ✅ Корзина с Zustand (persist в localStorage)
- ✅ Двухшаговое оформление заказа
- ✅ Telegram уведомления менеджеру и клиенту
- ✅ Абстрактный payment layer (dev/YooKassa)
- ✅ Sanity CMS для управления контентом
- ✅ Preloader с анимацией
- ✅ Кастомный курсор
- ✅ Фоновая музыка
- ✅ Cookie banner (GDPR/152-ФЗ)
- ✅ Свадебная копилка
- ✅ Квиз для мероприятий
- ✅ Цветочная подписка
- ✅ Блог
- ✅ Мобильная нижняя навигация
- ✅ Полная адаптивность (mobile-first)
- ✅ SEO meta tags на каждой странице
- ✅ Юридические страницы (оферта, политика, согласие)

## Производительность

- Next.js Image optimization (WebP/AVIF)
- Lazy loading изображений
- Статическая генерация страниц товаров
- Минимизация JS через tree-shaking
- Шрифты загружаются через Google Fonts с preconnect

## Лицензия

© 2026 Paloma Flowers. Все права защищены.
