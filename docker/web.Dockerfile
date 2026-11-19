FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/validation/package.json packages/validation/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/config/package.json packages/config/package.json

RUN npm install

COPY . .

RUN npm run build --workspace=@cwad/web

FROM nginx:alpine

COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]