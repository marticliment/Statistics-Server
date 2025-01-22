export class Settings
{
    static IS_DEBUG = true;

    
    static PORT = 3000;
    static HOSTNAME = "127.0.0.1";

    // The interval of time in which current state is stored on disk
    static SAVE_ON_DISK_INTERVAL = 10;

    // The interval of time in which installed programs get cached
    static INSTALL_PROGRAMS_CACHE_CLEAN_INTERVAL = 3600 * 24 * 10;

}