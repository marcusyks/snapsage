import { OpenDatabase } from './databaseManager';

/**
 * Manages all keyword related operations
*/

/**
 * Fetches all related assets based on a keyword
 * @param searchKeyword - input keyword from search bar
 * @returns array of images that are related to keyword
 */
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

/**
 * Fetches all keywords related to an image
 * @param filepath Unique URI of an image
 * @returns array of keywords that are related to the image
 */
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
