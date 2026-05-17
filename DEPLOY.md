# Деплой на aihubb.site

## Что нужно
- VPS с Ubuntu 22.04 (минимум 2GB RAM) — Hetzner CX22 ~400₽/мес, TimeWeb, REG.RU
- Домен aihubb.site уже есть ✓

---

## Шаг 1 — DNS (на сайте регистратора домена)

Добавь A-запись:
```
Тип:  A
Имя:  @  (или aihubb.site)
IP:   ВАШ_IP_СЕРВЕРА
TTL:  300
```

И для www:
```
Тип:  A
Имя:  www
IP:   ВАШ_IP_СЕРВЕРА
TTL:  300
```

---

## Шаг 2 — Установка на сервер (Ubuntu)

```bash
# Подключись к серверу
ssh root@ВАШ_IP

# Установи Docker
apt update && apt install -y docker.io docker-compose git certbot
systemctl enable docker && systemctl start docker

# Скачай проект
git clone https://github.com/ТВОЙ_РЕП/aihub.git /app
cd /app

# Или загрузи через scp:
# scp -r "c:\Users\curti\ГПТ Аналог  =" root@ВАШ_IP:/app
```

---

## Шаг 3 — SSL сертификат (бесплатный Let's Encrypt)

```bash
# Получи сертификат (порт 80 должен быть свободен)
certbot certonly --standalone -d aihubb.site -d www.aihubb.site

# Сертификаты сохранятся в:
# /etc/letsencrypt/live/aihubb.site/fullchain.pem
# /etc/letsencrypt/live/aihubb.site/privkey.pem
```

---

## Шаг 4 — Настройка переменных

```bash
cd /app
cp .env.production .env.local

# Отредактируй .env.local:
nano .env.local
```

Заполни:
```env
NEXT_PUBLIC_APP_URL=https://aihubb.site
NEXTAUTH_URL=https://aihubb.site
AUTH_URL=https://aihubb.site
AUTH_SECRET=сгенерируй_случайную_строку_32_символа
NEXTAUTH_SECRET=та_же_строка
DATABASE_URL=postgresql://postgres:ПАРОЛЬ@postgres:5432/aihub
OPENROUTER_API_KEY=sk-or-v1-...твой_ключ
ENCRYPTION_KEY=ровно_32_символа_здесь!!!!!
```

Сгенерировать секрет:
```bash
openssl rand -base64 32
```

---

## Шаг 5 — docker-compose.prod.yml

Создай файл `/app/docker-compose.prod.yml`:
```yaml
version: "3.9"
services:
  app:
    build: .
    expose:
      - "3000"
    env_file: .env.local
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: aihub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt/live/aihubb.site/fullchain.pem:/etc/nginx/ssl/fullchain.pem:ro
      - /etc/letsencrypt/live/aihubb.site/privkey.pem:/etc/nginx/ssl/privkey.pem:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Шаг 6 — Запуск

```bash
cd /app

# Собери и запусти
docker-compose -f docker-compose.prod.yml up -d --build

# Примени миграции БД
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Засейди начальные данные (планы, шаблоны)
docker-compose -f docker-compose.prod.yml exec app npx prisma db seed

# Проверь логи
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## Обновление сайта (после изменений)

```bash
cd /app
git pull  # или загрузи новые файлы
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Автообновление SSL (cron)

```bash
crontab -e
# Добавь строку:
0 3 * * * certbot renew --quiet && docker-compose -f /app/docker-compose.prod.yml restart nginx
```
