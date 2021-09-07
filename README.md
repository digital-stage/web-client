# Digital Stage Web Client
React and next.js based webclient for the Digital Stage platform.

## Setup development environment

To setup the whole server architecture including the web frontend, you have to install or use a working MongoDB and SMTP instance first.
Then checkout the necessary services:
```
git clone https://github.com/digital-stage/auth-server.git &&
git clone https://github.com/digital-stage/api-server.git &&
git clone https://github.com/digital-stage/router.git &&
git clone https://github.com/digital-stage/web-client.git
```

For each repository you have to install the dependencies and build using your favorite package manager (npm, yarn, etc.):
```
yarn --cwd auth-server install && yarn --cwd auth-server build
yarn --cwd api-server install && yarn --cwd api-server build
yarn --cwd router install && yarn --cwd router build
yarn --cwd web-client install && yarn --cwd web-client build
```
Feel free to specify the environment variables inside the single projects - or just use our preconfigured environment settings.
For these your *Mongo DB server* has to respond on port *27017*.
The default .env provides:
* Authentication server (auth-server) on *localhost:5000*
* API server (api-server) on *localhost:4000*
* Router (router) on *localhost:4100*
* Web-frontend (web-client) on *localhost:3000*

The authentication service requires a working SMTP server.
Configure it inside *auth-server/.env*:
```
# SMTP settings for sending mails
SMTP_HOST=mail.yourdomain.com
SMTP_FROM=noreply@yourdomain.com
SMTP_SSL=false
SMTP_PORT=587
SMTP_USER=yourusername
SMTP_PASSWORD=password
```

Then just start all the services and enjoy the current development state:
```
cd auth-server && yarn start
```
```
cd api-server && yarn start
```
```
cd router && yarn start
```
```
cd web-client && yarn start
```

When you are currently working inside one of the given repositories you can also use live-update instead of just starting the built services:
```
cd auth-server && yarn dev
```
```
cd api-server && yarn dev
```
```
cd router && yarn dev
```
```
cd web-client && yarn dev
```