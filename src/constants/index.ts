const COLLECTION_SESSION_NAME = 'sessions';
// const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
const COOKIE_MAX_AGE = 1000 * 60 * 60; // 60 minutes
const COOKIE_NAME = 'second-chance-cookie';
const REFRESH_TOKEN_COOKIE_NAME = 'second-chance-refresh-token-cookie';
const __prod__ = process.env.NODE_ENV === 'production';
const roles = {
    ADMIN: 'ADMIN',
    USER: 'USER',
};

export {
    COLLECTION_SESSION_NAME,
    COOKIE_MAX_AGE,
    __prod__,
    COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
    roles,
};
