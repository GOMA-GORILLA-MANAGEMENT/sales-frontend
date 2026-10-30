#!/bin/bash

# Called by GitHub Actions after SCP uploads dist/ to /var/www/sales
# This script just fixes permissions and reloads nginx

set -e

echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/sales
chmod -R 755 /var/www/sales

echo "🔄 Reloading nginx..."
nginx -t && systemctl reload nginx

echo "✅ Frontend live at https://sales.rw"
