export interface DBEntry
{
    LoadFromDisk(): void;
    SaveToDisk(): void;
}