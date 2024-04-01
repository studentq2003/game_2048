FROM nginx:latest
COPY . /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html