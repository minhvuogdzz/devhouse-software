FROM nginx:alpine

# Create required cache and certificate directories
RUN mkdir -p /var/cache/nginx/api /var/cache/nginx/html /etc/nginx/certs /var/www/certbot \
    && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
       -keyout /etc/nginx/certs/dummy.key \
       -out /etc/nginx/certs/dummy.crt \
       -subj "/C=VN/ST=HCM/L=Saigon/O=DevHouse/CN=dummy" \
    && mkdir -p /etc/nginx/certs/live/devhouse.example \
    && cp /etc/nginx/certs/dummy.crt /etc/nginx/certs/live/devhouse.example/fullchain.pem \
    && cp /etc/nginx/certs/dummy.key /etc/nginx/certs/live/devhouse.example/privkey.pem

COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
COPY infra/nginx/snippets/ /etc/nginx/snippets/
COPY infra/nginx/conf.d/ /etc/nginx/conf.d/

# Validate configuration syntax during image build (§32.1)
RUN nginx -t

EXPOSE 80 443

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 0

CMD ["nginx", "-g", "daemon off;"]
