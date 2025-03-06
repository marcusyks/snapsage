import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-media-library';
import { Linking } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { CleanUpDeletedAssets, InitializeDatabase, OpenDatabase } from '@/controllers/databaseManager';
import { ProcessImages } from '@/controllers/imageManager';
import { CreateEmbeddingIndexTable } from '@/controllers/embeddingManager';

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
        const db = await OpenDatabase();
        await InitializeDatabase(db);
        await fetchAndProcessAssets(db);

        setProgress(100);
        setIsComplete(true); // Mark the process as complete
      }

      setIsLoading(false); // End loading
    };

    fetchAssets();
  }, [permissionResponse]);

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

    await ProcessImages(fetchedAssets, db);

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

      await ProcessImages(nextFetch.assets, db);

      console.log(`Processed: ${fetchedAssets.length}, Total: ${totalCount}`)

      setProgress((fetchedAssets.length / totalCount) * 100);
    }
    await CleanUpDeletedAssets(fetchedAssets, db);
    await CreateEmbeddingIndexTable(db);
  };

  return { progress, isComplete, isLoading };
};
