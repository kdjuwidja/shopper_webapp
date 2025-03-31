# AI Shopper Depot Web Application

## Overview
This web application is built using:
- VITE
- React Router v7

## Environment Setup
To run the application, you need to create a `.env` file in the root directory with the following environment variables:

### Google Maps Configuration (Deprecated for now, until we introduce google map features)
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `VITE_MAP_ID`: Your Google Maps ID
- `VITE_DEFAULT_ADDRESS`: Your default location

### OAuth2 Configuration
- `VITE_CORE_API_URL`: Core API URL (default: `http://localhost:8080`)
- `VITE_TOKEN_URL`: OAuth2 token claim URL (default: `http://localhost:9096/token`)
- `VITE_AUTH_URL`: OAuth2 authorization URL (default: `http://localhost:9096/authorize`)
- `VITE_CLIENT_ID`: OAuth2 client ID (default: `82ce1a881b304775ad288e57e41387f3`)
- `VITE_CLIENT_SECRET`: OAuth2 client secret (default: `my_secret`)
