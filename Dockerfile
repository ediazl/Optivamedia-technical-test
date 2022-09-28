FROM node:16-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV NODE_ENV=dev
ENV PORT=3000
ENV MONGO_URI=mongodb://mongodb:27017/OptivaMediaBank
CMD ["npm", "run", "docker"]