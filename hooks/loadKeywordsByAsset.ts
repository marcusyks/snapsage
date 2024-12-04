import * as SQLite from 'expo-sqlite';

const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

// Load keywords for a specific asset
export const loadKeywordsByAsset = async (filepath: string) => {
    const db = await SQLite.openDatabaseAsync(DB_KEY);

    const query = `SELECT keywords FROM images WHERE filepath = ?`;
    const params = [filepath];

    try {
        const result  = await db.getAllAsync(query, params);

        if (result) {
            return JSON.parse(result[0].keywords);
        } else {
            console.log('No keywords found for this asset.');
            return []; // Return an empty array if no keywords are found
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return []; // Return an empty array on error
    }
};
