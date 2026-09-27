# AuthFlow — Signup & Login

A GitHub-ready full-stack authentication website built with **HTML, CSS, JavaScript, Node.js, Express, bcryptjs and sessions**.

## Project structure

```text
signup_login_app/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/
│   └── users.json
├── server.js
├── package.json
├── render.yaml
├── .gitignore
└── README.md
```

## Run from GitHub locally

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd signup_login_app
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## GitHub

Create a new GitHub repository, then upload all project files.

Or from the project folder:

```bash
git init
git add .
git commit -m "Add signup and login authentication app"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Important: GitHub Pages

GitHub Pages can host the static frontend, but it **cannot run the Node.js/Express backend**.

For the complete signup/login system, deploy this repository to a Node.js hosting service such as Render. The included `render.yaml` provides the basic deployment configuration.

## Authentication flow

1. User signs up.
2. Password is hashed with bcrypt.
3. User information is stored in `data/users.json`.
4. Express creates a session.
5. Protected API requests require the session.
6. User can refresh the page while the session remains active.
7. Logout destroys the session.

## Production note

This is a learning/demo project. For production, use a real database and persistent session store, HTTPS, secure cookies, environment variables, rate limiting, CSRF protection, and stronger validation.
