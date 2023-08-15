# Utilisation d'une image basée sur Node.js avec Alpine pour réduire la taille de l'image
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /var/www/front

# Copier les fichiers package.json et package-lock.json (ou yarn.lock si vous utilisez Yarn)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application dans le conteneur
COPY . .

# Si vous avez besoin de construire le projet pour la production, décommentez la ligne ci-dessous
# RUN npm run build

# Lancer le serveur de développement Vite
CMD [ "npm", "run", "dev" ]
