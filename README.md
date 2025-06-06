# Веб-приложение "Чат"

Приложение для общения в режиме реального времени, созданное на основе Django, TypeScript и PostgreSQL.
Выполнено в рамках курсовой работы по дисциплине "Бекенд-разработка".

## Функции

- Аутентификация и авторизация пользователей
- Групповые чаты по интересам
- Анонимное общение
- Обмен сообщениями в режиме реального времени
- Профили пользователей и управление чатом

## Технический стек

- Серверная часть:
  - Django (основной веб-фреймворк)
  - DRF
- Клиентская часть:
  - TypeScript
  - React
  - Material-UI
- База данных:
  - PostgreSQL

## Инструкции по настройке

1. Создайте и активируйте виртуальную среду:
```
python -m venv venv
source venv\Scripts\activate
```

2. Установите зависимости Python:
```
pip install -r requirements.txt
```

3. Установите зависимости внешнего интерфейса:
```
cd frontend
npm install
```

4. Настройте базу данных PostgreSQL и обновите настройки в файлах `.env`:

backend/backend/.env
```
DB_NAME=chat_db
DB_USER='your-user'
DB_PASSWORD='your-password'
DB_HOST=localhost
DB_PORT='your-port'
DEBUG=FALSE
DJANGO_SECRET_KEY='your-key'
```

frontend/.env
```
REACT_APP_API_URL=http://localhost:8000
```

6. Запустите миграцию:
```
python manage.py migrate
```

6. Запустите серверы разработки:
```
python manage.py runserver
```

```
cd frontend
npm start
```
