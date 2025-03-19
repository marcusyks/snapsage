import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

/**
 * Manages all database related operations
 */

const ASSETS_CACHE_KEY = process.env.EXPO_PUBLIC_ASSETS_CACHE_KEY as string;
const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

/**
 * Opens the database and returns the database object
 * @returns {Promise<Asset[]>} - Returns database object
 */
export const OpenDatabase = async() =>{
    const db = await SQLite.openDatabaseAsync(DB_KEY);
    return db;
}

/**
 * Initializes database by creating images table (if not exists)
 * @param db - Database object
 * @returns {Promise<Asset[]>} - Creates images table in the database (if not exists)
 */
export const InitializeDatabase = async (db: SQLite.SQLiteDatabase) => {
    try {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS images (filepath TEXT PRIMARY KEY NOT NULL, keywords TEXT, embeddings TEXT);
      `);
    } catch {
      console.log("Failed to load database!");
    }
};

/**
 * Checks if an image is in the database
 * @param asset Image entity
 * @param db Database object
 * @returns boolean - Returns true if the image is in the database, false otherwise
 */
export const CheckInDatabase = async (asset: Asset, db: SQLite.SQLiteDatabase) => {
    // Try fetching asset
    try {
      const fetchedAsset = await db.getFirstAsync('SELECT filepath FROM images WHERE filepath = ?', asset.uri);
      // If unsuccessful, means it does not exist
      return fetchedAsset !== null;
    }
    catch(error) {
      console.log("Error happened while checking image in database: ", error);
      return false;
    }
}

/**
 * Inserts an tuple into the "images" table
 * @param asset Image Entity
 * @param keywords Array of keywords related to image
 * @param embeddings 512-D vector representing the image
 * @param db Database Object
 */
export const InsertAsset = async (asset: Asset, keywords: string[], embeddings: number[], db: SQLite.SQLiteDatabase) => {
    const { uri: fileUri } = asset;
    try {
        await db.runAsync(
        `INSERT INTO images (filepath, keywords, embeddings) VALUES (?, ?, ?)`,
        [fileUri, keywords? JSON.stringify(keywords) : JSON.stringify([]), embeddings? JSON.stringify(embeddings) : JSON.stringify([])]
        );
    } catch {
        console.log("Failed to insert asset!");
    }
};

/**
 * Cleans up deleted images from the "images" table by comparing the processed images with the images in the table
 * @param currentAssets - Image entities processed by the application
 * @param db - Database Object
 */
export const CleanUpDeletedAssets = async (currentAssets: Asset[], db: SQLite.SQLiteDatabase) => {
    try {
        const currentFilePaths = currentAssets.map((asset) => asset.uri);
        const dbResults : Row[] = await db.getAllAsync(`SELECT filepath FROM images`);
        const dbFP : string[] = dbResults.map(row => row.filepath);

        // Find and delete assets that are in the database but not in current assets
        const toDelete = dbFP.filter((path) => !currentFilePaths.includes(path));
        for (const path of toDelete) {
            console.log("Deleting asset: ", path);
            await deleteAsset(path, db);
        }
        await AsyncStorage.setItem(ASSETS_CACHE_KEY, JSON.stringify(currentAssets));
    } catch (error) {
        console.log("Failed to clean up deleted assets!", error);
    }
};

/**
 * Deletes an image from the "images" table
 * @param filepath Unique URI of an image
 * @param db Database Object
 */
const deleteAsset = async (filepath: string, db: SQLite.SQLiteDatabase) => {
    try {
        await db.runAsync(`DELETE FROM images WHERE filepath = ?`, [filepath]);
    } catch {
        console.log("Failed to delete asset!");
    }
};
