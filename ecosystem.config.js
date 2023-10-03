module.exports = {
    apps: [
        {
            name: 'API Gateway',
            script: './gateway/dist/main.js',
            env_file: './.env',
        },
        {
            name: 'Live Service',
            script: './live/dist/main.js',
            env_file: './.env',
        },
        {
            name: 'Media Service',
            script: './media/dist/main.js',
            env_file: './.env',
        },
        {
            name: 'Token Service',
            script: './token/dist/main.js',
            env_file: './.env',
        },
        {
            name: 'User Service',
            script: './user/dist/main.js',
            env_file: './.env',
        },
    ],
};