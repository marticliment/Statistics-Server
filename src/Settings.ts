export class Settings
{
    static IS_DEBUG = true;

    
    static PORT = 3000;
    static HOSTNAME = "127.0.0.1";
    static DATA_FOLDER = "./data"

    // The interval of time in which current state is stored on disk
    static SAVE_ON_DISK_INTERVAL = 10;

    // The interval of time in which installed programs get cached
    static INSTALL_PROGRAMS_CACHE_CLEAN_INTERVAL = 3600 * 24 * 10;

    // An active user is a user who has pinged the API in the last USER_ACTIVITY_PERIOD seconds
    static USER_ACTIVITY_PERIOD = 3600 * 24 * 10;

    // The interval of time in which inactive users are purged
    static INACTIVE_USER_PURGE_INTERVAL = 3600;

    // A random salt
    static SALT = "2a0v4ole8ix5z"
    // Testing API KEY is "HelloWorld"

    // The SHA256 of: API_KEY + SALT
    static API_KEY_HASH = "befee34aa7e73da3381e2ceaded8b893c1a269b664ef1160ff616c3e0f06a9ef"
}