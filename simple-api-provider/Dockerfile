FROM nginx:alpine

# Kopiuj konfigurację nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Utwórz katalogi dla logów
RUN mkdir -p /var/log/nginx

# Expose port
EXPOSE 8090

# Uruchom nginx
CMD ["nginx", "-g", "daemon off;"]
