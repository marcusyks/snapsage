import * as SQLite from 'expo-sqlite';

const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

// Load assets based on the search keyword
export const loadAssetsByKeyword = async (searchKeyword: string) => {
    const db = await SQLite.openDatabaseAsync(DB_KEY);

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
