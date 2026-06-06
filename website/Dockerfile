# Sitio publico (diseno standalone React UMD + Babel-en-navegador).
# No requiere build: se sirve tal cual con nginx. Es la entrada publica (:80)
# y hace de reverse-proxy hacia el admin (/admin), la API (/api) y uploads.
FROM nginx:alpine

ARG ASSET_VERSION

# Copiar el sitio estatico. .dockerignore evita meter export/ y otros sobrantes.
COPY . /usr/share/nginx/html
RUN if [ -z "$ASSET_VERSION" ]; then ASSET_VERSION="$(date +%Y%m%d%H%M%S)"; fi \
    && sed -i "s/__ASSET_VERSION__/${ASSET_VERSION}/g" /usr/share/nginx/html/index.html
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/README.md

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
