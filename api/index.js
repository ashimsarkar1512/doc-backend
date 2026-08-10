const path = require('path');
const moduleAlias = require('module-alias');

// Register aliases dynamically to point to the compiled dist folder
moduleAlias.addAliases({
  '@type': path.join(__dirname, '../dist/@types'),
  '@metadata': path.join(__dirname, '../dist/metadata'),
  '@common': path.join(__dirname, '../dist/common'),
  '@config': path.join(__dirname, '../dist/configs'),
  '@constant': path.join(__dirname, '../dist/constants'),
  '@global': path.join(__dirname, '../dist/global'),
  '@lib': path.join(__dirname, '../dist/libs'),
  '@main': path.join(__dirname, '../dist/main'),
  '@script': path.join(__dirname, '../dist/scripts'),
  '@service': path.join(__dirname, '../dist/services'),
  '@util': path.join(__dirname, '../dist/utils'),
  '@s3': path.join(__dirname, '../dist/s3')
});

const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { ValidationPipe } = require('@nestjs/common');
const cookieParser = require('cookie-parser');

// Now we can safely require the app module because aliases are registered
const { AppModule } = require('../dist/app.module');

let cachedServer;

module.exports = async (req, res) => {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    app.enableCors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "https://client.weightlossmdcherrycreek.com",
            "https://doc-frontend-omega.vercel.app",
            "https://doc-dashboard-delta.vercel.app",
            "https://dashboard.weightlossmdcherrycreek.com",
            "https://impracticably-sclerometric-niki.ngrok-free.dev",
            "http://127.0.0.1:5500",
            "https://doc-frontend-pied.vercel.app",
            "https://localhost:3000",
            "https://doc-frontend-psi.vercel.app",
            "https://doc-dashboard-smoky.vercel.app",
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
    });
    app.use(cookieParser());
    app.use(express.json({ limit: "512mb" }));
    app.use(express.urlencoded({ limit: "512mb", extended: true }));
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.setGlobalPrefix("/api/v1");

    await app.init();
    cachedServer = expressApp;
  }
  
  return cachedServer(req, res);
};
