# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d62ff8b6-367a-408d-8ae2-4e439ebe909b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d62ff8b6-367a-408d-8ae2-4e439ebe909b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install frontend dependencies.
npm i

# Step 4: Install backend dependencies.
cd backend
npm i
cd ..

# Step 5: Start the backend server (in one terminal).
cd backend
npm run dev

# Step 6: Start the frontend development server (in another terminal).
npm run dev
```

The frontend will be available at `http://localhost:8080` and the backend API at `http://localhost:80`.

## Backend API

The backend receives GPS data from IoT devices via REST API. See [backend/README.md](backend/README.md) for complete API documentation.

**Quick Start:**
1. Navigate to `backend/` directory
2. Run `npm install`
3. Run `npm run dev` to start the server
4. Send GPS data to `POST http://localhost:80/api/gps`

**Example GPS data format:**
```json
{
  "deviceId": "DEV-001-A1",
  "deviceName": "Sensor Hub A1",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Leaflet (OpenStreetMap integration)

**Backend:**
- Node.js
- Express
- RESTful API for GPS data reception

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d62ff8b6-367a-408d-8ae2-4e439ebe909b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
