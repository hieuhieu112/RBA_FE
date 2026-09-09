FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .


RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY runtime-config.template.js /usr/share/nginx/html/runtime-config.template.js
COPY docker-entrypoint.sh /docker-entrypoint.d/40-runtime-config.sh

RUN sed -i 's/\r$//' /docker-entrypoint.d/40-runtime-config.sh \
  && chmod +x /docker-entrypoint.d/40-runtime-config.sh
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]