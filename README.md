# Notes SPA (backend)

This is the Notes SPA (server side) developed as the part of the lessons.

## Contribution

1. Run `npm install` inside of the `notes-backend-lesson` folder.
2. Launch `npm run dev` to start developing the backend code.
3. Run `npm install` inside of the `../notes-frontend-lesson` folder.
4. To develop the React frontend run `npm start` in `../notes-frontend-lesson`

## How to deploy

1. Commit all your changes
2. Run script `npm run deploy:full`. This will build the React frontend for
   production and replace the static files in `notes-backend-lesson/build`.
   After that the changes will be committed and pushed to the Heroku Git repo,
   triggering the build and deployment process there.
