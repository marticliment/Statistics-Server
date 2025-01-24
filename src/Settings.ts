export class Settings
{
    static ParseAndReadArguments()
    {
        const args = process.argv.slice(2);
        for (let i = 0; i < args.length; i++) 
        {
            switch (args[i]) 
            {
                case '--port':
                    this.PORT = parseInt(args[i + 1], 10);
                    i++;
                    break;
                case '--hostname':
                    this.HOSTNAME = args[i + 1];
                    i++;
                    break;
                case '--data-folder':
                    this.DATA_FOLDER = args[i + 1];
                    i++;
                    break;
            }
        }
    }

    static IS_DEBUG = false;

    
    static PORT = 3000;
    static HOSTNAME = "127.0.0.1";
    static DATA_FOLDER = "./data"

    static REDIRECT_URL_WHEN_INVALID_ENDPOINT = "https://www.marticliment.com/unigetui"

    // The interval of time in which current state is stored on disk
    static SAVE_ON_DISK_INTERVAL = 2;

    // The interval of time in which installed programs get cached
    static INSTALL_PROGRAMS_CACHE_CLEAN_INTERVAL = 3600 * 24 * 10;

    // An active user is a user who has pinged the API in the last USER_ACTIVITY_PERIOD seconds
    static USER_ACTIVITY_PERIOD = 3600 * 24 * 10;

    // The interval of time in which inactive users are purged
    static INACTIVE_USER_PURGE_INTERVAL = 3600;

    // A random salt
    static SALT = "2a0v4ole8ix5z"
    // Testing API KEY is "HelloWorld"

    // The SHA256 of: API_KEY + SALT (must be manually calculated and set here)
    static API_KEY_HASH = "befee34aa7e73da3381e2ceaded8b893c1a269b664ef1160ff616c3e0f06a9ef"
}