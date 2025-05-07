# Frontend of the shopper app

## Overview
This web application is built using:
- VITE
- React Router v7
- Tailwind CSS

## Environment Setup
To run the application, you need to create a `.env` file in the root directory with the following environment variables:

### General configuration
- `VITE_CORE_API_URL`: The base url to the core api service. (e.g. http://localhost:8080)
- `VITE_AUTH_API_URL`: The base url to the auth api service. (e.g. http://localhost:9096)
- `VITE_FRONTEND_URL`: The base url of this service, mainly used to construct the callback URL for OAuth2. (e.g. http://localhost:3000)
- `VITE_BASE_PATH`: the base path of this app. (e.g. /shopper)

### Oauth2 configuration
- `VITE_CLIENT_ID`: The Oauth2 api client ID used for authentication and authorization.
- `VITE_CLIENT_SECRET`: the Oauth2 api client secret used for authentication and authorization.
