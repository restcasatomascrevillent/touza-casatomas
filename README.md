# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

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

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
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

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Despliegue

Vercel, equipo **Casa tomas**, proyecto `touza-casatomas` (repo
`restcasatomascrevillent/touza-casatomas`):

| Rama | Entorno | URL | Supabase |
|---|---|---|---|
| `main` | Production | https://touza.restaurantecasatomascrevillente.es (`touza-casatomas.vercel.app` redirige ahí con 308) | `haqmmdfdzzatdnrrcgez` (prod) |
| `staging` | Preview | https://touza-casatomas-git-staging-casa-tomas.vercel.app (con login de Vercel) | `sfonaclosuafvlhutkon` (demo) |

Variables de entorno en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y
`VITE_SITE_URL`.

La carta se prerenderiza al compilar. Cuando se guarda la carta en el panel,
la función `rebuild-webs` de Supabase lanza el *deploy hook* de su rama
(secret `VERCEL_DEPLOY_HOOK_TOUZA`: el de `main` en prod, el de `staging` en
la demo). Vercel compila el último commit de la rama, y en el plan Hobby
bloquea los commits cuyo autor tiene cuenta de Vercel pero no es del equipo.
