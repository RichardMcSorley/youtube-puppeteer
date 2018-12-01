FROM node:8-slim
# update and get all required packages
RUN apt-get update && \
    apt-get install -yq gconf-service git libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
    ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils && \
    apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
# Set language to UTF8
ENV LANG="C.UTF-8"
# Working dir /app
WORKDIR /app
# copy over everything
COPY . .
# prepare hooks
RUN chmod +x hooks.sh
# install latest packages
RUN npm i
# 3000 index.js 6000 hooks.js 5000 inpsector
EXPOSE 3000 6000 5000
# Run this script, when we compose up
CMD ["npm", "start"]
# docker build -t puppeteer:0.2 . or docker-compose build
# docker run -d -p 3000:3000 -p 5000:5000 puppeteer:0.2 or docker-compose up -d
# http://192.168.99.100:3000 DockerTools VM IP