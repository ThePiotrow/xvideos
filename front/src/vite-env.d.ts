/// <reference types="vite/client" />
interface ImportMeta {
    env: {
        MONGO_DATABASE: string;
        MONGO_USER: string;
        MONGO_PASSWORD: string;
        MONGO_ROOT_USER: string;
        MONGO_ROOT_PASSWORD: string;
        MONGO_DSN: string;

        API_GATEWAY_PORT: string;

        MEDIA_SERVICE_PORT: string;
        MEDIA_SERVICE_HOST: string;

        TOKEN_SERVICE_PORT: string;
        TOKEN_SERVICE_HOST: string;

        USER_SERVICE_PORT: string;
        USER_SERVICE_HOST: string;

        MAILER_SERVICE_PORT: string;
        MAILER_SERVICE_HOST: string;

        PERMISSION_SERVICE_PORT: string;
        PERMISSION_SERVICE_HOST: string;

        FRONT_SERVICE_PORT: string;
        FRONT_SERVICE_HOST: string;

        BASE_URI: string;

        MAILER_DISABLED: string;
        MAILER_FROM: string;
        MAILER_PASSWORD: string;
        MAILER_SERVER: string;
        MAILER_PORT: string;
        MAILER_DSN: string;

        // Ajoutez cette ligne pour n'importe quelle autre variable d'environnement
        // non spécifiée ici.
        [key: string]: unknown;
    };
}
