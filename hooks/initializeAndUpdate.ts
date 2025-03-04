import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-media-library';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { ImageExtraction } from '@/functions/imageExtraction';

const ASSETS_CACHE_KEY = process.env.EXPO_PUBLIC_ASSETS_CACHE_KEY as string;
const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

export const initializeAndUpdate = () => {
  const [progress, setProgress] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true); // Start loading

      if (!permissionResponse || permissionResponse.status !== 'granted') {
        const response = await requestPermission();

        if (!response || response.status !== 'granted') {
          console.log("Permission denied by user.");
          Linking.openSettings();
          return;
        }
      }

      if (permissionResponse?.status === 'granted') {
        console.log("Permission granted by user.");
        const db = await SQLite.openDatabaseAsync(DB_KEY);
        await initializeDatabase(db);
        await fetchAndProcessAssets(db);

        setProgress(100);
        setIsComplete(true); // Mark the process as complete
      }

      setIsLoading(false); // End loading
    };

    fetchAssets();
  }, [permissionResponse]);

  const initializeDatabase = async (db: SQLite.SQLiteDatabase) => {
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

  const fetchAndProcessAssets = async (db: SQLite.SQLiteDatabase) => {
    let fetchedAssets: Asset[] = [];

    const {totalCount} = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
    });

    // Block has 10 pages, each page has 16 assets
    const blockSize = 160;

    const firstFetch = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: blockSize,
    });

    fetchedAssets = firstFetch.assets as Asset[];
    setAssets(fetchedAssets);

    await processImages(fetchedAssets, db);

    setProgress((fetchedAssets.length / totalCount) * 100);
    console.log(`Processed: ${fetchedAssets.length}, Total: ${totalCount}`)

    let block = 0;
    while (fetchedAssets.length < totalCount) {
      block += 1;
      const nextFetch = await MediaLibrary.getAssetsAsync({
          mediaType: 'photo',
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          first: blockSize,
          after: fetchedAssets[fetchedAssets.length - 1].id,
      });

      fetchedAssets = [...fetchedAssets, ...nextFetch.assets];
      setAssets(fetchedAssets);

      await processImages(nextFetch.assets, db);

      console.log(`Processed: ${fetchedAssets.length}, Total: ${totalCount}`)

      setProgress((fetchedAssets.length / totalCount) * 100);
    }
    await cleanUpDeletedAssets(fetchedAssets, db);
  };

  const processImages = async (assets: Asset[], db: SQLite.SQLiteDatabase) => {
    // Helper function to split array into chunks
    const chunkArray = (array: Asset[], size: number) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
      }
      return result;
    };

    // 128 assets each block
    const checkResults = await Promise.all(
        assets.map(async (asset) => {
            const exists = await checkInDatabase(asset, db);
            return exists ? null : asset; // Keep only unprocessed assets
        })
    );

    // Filter out null values (processed assets)
    const newAssets = checkResults.filter(Boolean) as Asset[];

    if (newAssets.length === 0) {
        return;
    }

    // Process in batches of 16
    const batchSize = 16;
    const batchedAssets = chunkArray(newAssets, batchSize);

    try {
      for (const batch of batchedAssets) {

        // Perform parallel processing of batch
        const [keywordsArray, embeddingsArray] = await ImageExtraction(batch);

        // Insert new assets into the database
        for (let i = 0; i < batch.length; i++) {
            const asset = batch[i];
            const keywords = keywordsArray[i];
            const embeddings = embeddingsArray[i];
            await insertAsset(asset, keywords, embeddings, db);
        }
      }
    } catch (error) {
        console.log("Error happened while processing images: ", error);
    }
};

  const checkInDatabase = async (asset: Asset, db: SQLite.SQLiteDatabase) => {
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


  const insertAsset = async (asset: Asset, keywords: string[], embeddings: number[], db: SQLite.SQLiteDatabase) => {
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

  const deleteAsset = async (filepath: string, db: SQLite.SQLiteDatabase) => {
    try {
      await db.runAsync(`DELETE FROM images WHERE filepath = ?`, [filepath]);
    } catch {
      console.log("Failed to delete asset!");
    }
  };


  const cleanUpDeletedAssets = async (currentAssets: Asset[], db: SQLite.SQLiteDatabase) => {
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

  return { progress, isComplete, isLoading };
};
