![image](https://github.com/fhmiibrhimdev/react-vite-inventories/assets/129714988/ff8743aa-7feb-4135-9122-f3407025664f)

# Laravel React Vite Inventories

This project is a web application built with Laravel, ReactJS with Vite, and Stisla Admin Template. The web application is designed to provide a user-friendly interface, and used for inventory purposes in companies and businesses.

## Folder Structure

- backend: Contains the Laravel project
- frontend: Contains the ReactJS project

## Features

- Dashboard
- Category, Locations, Items
- Opening Balance Items, Stock In, Stock Out, Stock Opname
- Stock Card
- Report
- Setting Users (active/non-active)
- Multirole users: admin, users

## Prerequisites

1. PHP >= 8.1 or new
2. Composer
3. Node.js last version
4. NPM last version
5. MySQL or MariaDB last version

## Installation

1. Clone this repository to your local machine:

```
git clone https://github.com/fhmiibrhimdev/react-vite-inventories.git
```

2. Install the dependencies for the Laravel project:

```
cd backend
composer install
```

3. Create a .env file for your Laravel project and configure your database settings:

```
cp .env.example .env
```

4. Generate a new APP_KEY for your Laravel project:

```
php artisan key:generate
```

5. Run database migrations:

```
php artisan migrate:fresh --seed
```

6. Run JWT Secret and Storage Link:

```
php artisan jwt:secret
php artisan storage:link
```

7. Install the dependencies for the ReactJS project:

```
cd ../frontend
npm install
```

8. Start the development server for the ReactJS project:

```
npm run dev
```

9. Start the development server for the Laravel project:

```
cd ../backend
php artisan serve
```

10. Visit [Localhost](http://localhost:5173/) in your web browser to access the web application.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/fhmiibrhimdev/laravel-react-vite-stisla/blob/main/LICENSE) file for more details.
