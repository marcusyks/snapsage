import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-media-library';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { ImageExtraction } from '@/functions/imageExtraction';

export interface Row {
  embeddings: string;
  filepath: string;
  keywords: string;
}

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
        await requestPermission();
      } else if (!permissionResponse.canAskAgain) {
        Linking.openSettings();
      }

      if (permissionResponse?.status === 'granted') {
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
    } catch {
      console.log("Failed to load database!");
    }
  };

  const fetchAndProcessAssets = async (db: SQLite.SQLiteDatabase) => {
    let fetchedAssets: Asset[] = [];

    const {totalCount} = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
    });

    // Dynamic paging
    const maxPageSize = 50;
    const calculatedPageSize = Math.max(Math.ceil(totalCount * 0.1), 1); // Use 10% of total assets or at least 1
    const pageSize = Math.min(calculatedPageSize, maxPageSize); // Ensure it doesn't exceed maxPageSize

    const firstFetch = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: pageSize,
    });

    fetchedAssets = firstFetch.assets as Asset[];
    setAssets(fetchedAssets);

    await processImages(fetchedAssets, db);

    setProgress((fetchedAssets.length / totalCount) * 100);

    let page = 0;
    while (fetchedAssets.length < totalCount) {
      page += 1;
      const nextFetch = await MediaLibrary.getAssetsAsync({
          mediaType: 'photo',
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          first: pageSize,
          after: fetchedAssets[fetchedAssets.length - 1].id,
      });

      fetchedAssets = [...fetchedAssets, ...nextFetch.assets];
      setAssets(fetchedAssets);

      await processImages(nextFetch.assets, db);

      setProgress((fetchedAssets.length / totalCount) * 100);
    }

    await AsyncStorage.setItem(ASSETS_CACHE_KEY, JSON.stringify(fetchedAssets));
  };

  const processImages = async (assets: Asset[], db: SQLite.SQLiteDatabase) => {
    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const [keywords, embeddings] = await extractKeywordEmbedding(asset);
        await insertOrUpdateAsset(asset, keywords, embeddings, db);
    }
  };


  const insertOrUpdateAsset = async (asset: Asset, keywords: string[], embeddings: number[], db: SQLite.SQLiteDatabase) => {
    const { uri: fileUri } = asset;
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO images (filepath, keywords, embeddings) VALUES (?, ?, ?)`,
        [fileUri, keywords? JSON.stringify(keywords) : null, embeddings? JSON.stringify(embeddings) : null]
      );
    } catch {
      console.log("Failed to insert/update asset!");
    }
  };

  const deleteAsset = async (filepath: string, db: SQLite.SQLiteDatabase) => {
    try {
      await db.runAsync(`DELETE FROM images WHERE filepath = ?`, [filepath]);
    } catch {
      console.log("Failed to delete asset!");
    }
  };

  const extractKeywordEmbedding = async (asset: Asset): Promise<[string[], number[]]> => {
    return await ImageExtraction(asset);
  };

  return { progress, isComplete, isLoading };
};
