import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const ASSETS_CACHE_KEY = process.env.EXPO_PUBLIC_ASSETS_CACHE_KEY as string;
const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

export const OpenDatabase = async() =>{
    const db = await SQLite.openDatabaseAsync(DB_KEY);
    return db;
}

export const InitializeDatabase = async (db: SQLite.SQLiteDatabase) => {
    try {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS images (filepath TEXT PRIMARY KEY NOT NULL, keywords TEXT, embeddings TEXT);
      `);
      // await db.execAsync(`DROP TABLE images`)
    } catch {
      console.log("Failed to load database!");
    }
};

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

export const CleanUpDeletedAssets = async (currentAssets: Asset[], db: SQLite.SQLiteDatabase) => {
    try {
        const currentFilePaths = currentAssets.map((asset) => asset.uri);
        const dbResults = await db.getAllAsync(`SELECT filepath FROM images`);
        const dbFilePaths = dbResults.map((row: any) => row.filepath);

        // Find and delete assets that are in the database but not in current assets
        const toDelete = dbFilePaths.filter((path) => !currentFilePaths.includes(path));
        for (const path of toDelete) {
        await deleteAsset(path, db);
    }
        await AsyncStorage.setItem(ASSETS_CACHE_KEY, JSON.stringify(currentAssets));
    } catch (error) {
        console.log("Failed to clean up deleted assets!", error);
    }
};

const deleteAsset = async (filepath: string, db: SQLite.SQLiteDatabase) => {
    try {
        await db.runAsync(`DELETE FROM images WHERE filepath = ?`, [filepath]);
    } catch {
        console.log("Failed to delete asset!");
    }
};
