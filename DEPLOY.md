# Deploying the frontend

The pipeline (`.github/workflows/deploy.yml`) checks the code, builds it with `VITE_API_BASE_URL=https://api.sales.rw`, uploads
it to `/var/www/sales.rw.next`, swaps it in place of `/var/www/sales.rw` and reloads nginx. The previous version stays in
`/var/www/sales.rw.previous`; to roll back: `mv /var/www/sales.rw /var/www/sales.rw.bad && mv /var/www/sales.rw.previous /var/www/sales.rw`.

GitHub secrets (Settings, Environments, `production`): `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, optional `SERVER_SSH_PORT`.

nginx must send every page to `index.html`, because the app has its own routes (`/auth/login`, `/dashboard`, ...):

```nginx
server {
    server_name sales.rw www.sales.rw;
    root /var/www/sales.rw;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```
