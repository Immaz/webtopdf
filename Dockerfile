# ✅ Use Puppeteer base image (includes Node + fonts)
FROM ghcr.io/puppeteer/puppeteer:24.23.0

# ✅ Install Google Chrome inside the container
RUN apt-get update && apt-get install -y wget gnupg2 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# ✅ Prevent Puppeteer from downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Copy only dependency files first (better cache)
COPY package*.json ./

# ✅ Install NPM dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port and run server
EXPOSE 3000
CMD ["node", "server.js"]
