import * as SQLite from 'expo-sqlite';
import { OpenDatabase } from './databaseManager';


export const loadAssetsByKeyword = async (searchKeyword: string) => {
    const db = await OpenDatabase();

    const query = `SELECT * FROM images WHERE keywords LIKE ?`;
    const params = [`%"${searchKeyword.toLowerCase()}"%`];
    // console.log('Executing query:', query, 'with params:', params);

    try {
        const allRows = await db.getAllAsync(query, params);
        // console.log('Query results:', allRows.length);
        const matchedAssets: string[] = allRows.map((row: any) => row.filepath);
        return matchedAssets;
    } catch (error) {
        console.error('Error executing query:', error);
        return []; // Return an empty array on error
    }
};

// Load keywords for a specific asset
export const loadKeywordsByAsset = async (filepath: string) => {
    const db = await OpenDatabase();

    const query = `SELECT keywords FROM images WHERE filepath = ?`;
    const params = [filepath];

    try {
        const result : Row[] | null  = await db.getAllAsync(query, params);

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
