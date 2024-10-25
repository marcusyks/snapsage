import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-media-library';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

// extraction process

interface Row {
  filepath: string;
  keywords: string;
  embedding: string;
}

const ASSETS_CACHE_KEY = process.env.EXPO_PUBLIC_ASSETS_CACHE_KEY as string;
const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

export const initializeAndUpdate = () => {
  const [progress, setProgress] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    const fetchAssets = async () => {
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        await requestPermission();
      } else if (!permissionResponse.canAskAgain) {
        Linking.openSettings();
      }

      // Check if permission is allowed
      if (permissionResponse?.status === 'granted') {
        // Get database and create one if doesn't exist
        const db = await SQLite.openDatabaseAsync(DB_KEY);
        try{
          await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS images (filepath TEXT PRIMARY KEY NOT NULL, keywords TEXT, embeddings TEXT);
          `);
        } catch {
          console.log("Failed to load database!");
        }

        const pageSize = 50;
        let fetchedAssets: Asset[] = [];
        let totalAssets = 0;
        let page = 0;

        // First fetch to determine total asset count
        const firstFetch = await MediaLibrary.getAssetsAsync({
          mediaType: 'photo',
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          first: pageSize,
        });

        totalAssets = firstFetch.totalCount;
        fetchedAssets = firstFetch.assets as Asset[];
        setAssets(fetchedAssets);

        // Process images (e.g., feature extraction)
        await processImages(fetchedAssets,db);

        setProgress((fetchedAssets.length / totalAssets) * 100);

        // Fetch remaining assets in batches
        while (fetchedAssets.length < totalAssets) {
          page += 1;
          const nextFetch = await MediaLibrary.getAssetsAsync({
            mediaType: 'photo',
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            first: pageSize,
            after: fetchedAssets[fetchedAssets.length - 1].id,
          });

          fetchedAssets = [...fetchedAssets, ...nextFetch.assets];
          setAssets(fetchedAssets);

          // Continue processing the images
          await processImages(nextFetch.assets, db);

          setProgress((fetchedAssets.length / totalAssets) * 100);
        }

        // After processing is done, update the database
        await updateDatabase(fetchedAssets, db);
        // Cache the fetched assets in AsyncStorage
        await AsyncStorage.setItem(ASSETS_CACHE_KEY, JSON.stringify(fetchedAssets));
        setIsComplete(true);
      }
    };

    fetchAssets();
  }, [permissionResponse]);

    // Process images and extract keywords and embeddings (dummy function)
    const processImages = async (assets: Asset[], db: SQLite.SQLiteDatabase) => {
      for (const asset of assets) {
        const fileUri = asset.uri;
        const keywords = await extractKeywords(fileUri); // Replace with actual keyword extraction logic
        const embeddings = await extractEmbeddings(fileUri); // Replace with actual embedding logic
        await insertOrUpdateAsset(asset, keywords, embeddings, db);
      }
    };

    // Insert or update image data in the database
    const insertOrUpdateAsset = async (asset: Asset, keywords: string[], embeddings: number[], db: SQLite.SQLiteDatabase) => {
      const { uri: fileUri } = asset;
      try{
        await db.runAsync(
          `INSERT OR REPLACE INTO images (filepath, keywords, embeddings) VALUES (?, ?, ?)`,
          [fileUri, JSON.stringify(keywords), JSON.stringify(embeddings)]
        )
      } catch {
        console.log("Failed to insert/update asset!");
      }
    };

    // Delete image data from the database
    const deleteAsset = async (filepath: string, db: SQLite.SQLiteDatabase) => {
      try{
        await db.runAsync(
          `DELETE FROM images WHERE filepath = ?`,
          [filepath]
        );
      } catch {
        console.log("Failed to delete asset!");
      }
    };

    // Update the database with new assets and remove missing ones
    const updateDatabase = async (fetchedAssets: Asset[], db: SQLite.SQLiteDatabase) => {
      try{
        const dbAssets: Row[] = await db.getAllAsync('SELECT * FROM images');

        const dbFilepaths: string[] = dbAssets.map(row => row.filepath);

        const newAssets = fetchedAssets.filter(asset => !dbFilepaths.includes(asset.uri));

        const deletedAssets = dbFilepaths.filter(filepath => !fetchedAssets.find(asset => asset.uri === filepath));

        if (newAssets.length > 0) {
          await processImages(newAssets, db);
        }

        if (deletedAssets.length > 0) {
          for (const filepath of deletedAssets) {
            await deleteAsset(filepath, db);
          }
        }
      } catch {
        console.log("Failed to update database!");
      }
    };

    // Dummy feature extraction methods
    const extractKeywords = async (fileUri: string): Promise<string[]> => {
      return ['keyword1', 'keyword2'];
    };

    const extractEmbeddings = async (fileUri: string): Promise<number[]> => {
      return [0.1, 0.2, 0.3];
    };

    return {progress, isComplete};
};
