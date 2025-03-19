import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-media-library';
import * as SQLite from 'expo-sqlite';
import { CheckInDatabase, InsertAsset } from './databaseManager';

/**
 * Manages all image related operations
*/

const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP as string;


/**
 * Creates an image blob
 * @param uri - Unique URI of an image
 * @returns Blob object of the image
 */
const createBlobFromUri = async (uri: string): Promise<Blob | null> => {
    try {
        const response = await fetch(uri);
        if (!response.ok) {
            console.error(`Failed to fetch image: ${response.statusText}`);
            return null;
        }
        const blob = await response.blob(); // Convert the response to a Blob
        return blob;
    } catch (error) {
        console.error(`Error while creating Blob from URI: ${error}`);
        return null;
    }
};

/**
 * Performs API call to the server to extract features from images
 * @param assets - Array of 16 images to be processed
 * @returns Array of extracted data (embeddings and keywords) for each image
 */
const imageExtraction = async (assets: Asset[]): Promise<any> => {
    try {
        const blobs = await Promise.all(assets.map(async (asset) => {
            const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
            const localUri = assetInfo.localUri;
            if (!localUri) {
                console.error(`No local URI found for asset: ${asset.filename}`);
                return null;
            }
            const blob = await createBlobFromUri(localUri);
            return { fileName : asset.filename, blob, uri: localUri};
        }));

        // Create a FormData object and append all images
        const formData = new FormData();
        blobs.forEach(blobData => {
            if (blobData?.blob) {
                formData.append('image', {
                    uri: blobData?.uri,
                    name: blobData?.fileName,
                    type: blobData?.blob.type
                });  // 'image' is the key
            }
        });

        // Send batch request to Flask server
        const response = await fetch(`${SERVER_IP}/extract-images`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Expecting an array of results from the server (array of embeddings and keywords)
        const data = await response.json();

        // Ensure the response matches the number of assets sent
        if (!Array.isArray(data) || data.length !== blobs.length) {
            console.error("Mismatch in server response and images sent.");
            return [null, null];
        }


        return data.map(item => ({
            keywords: item.keywords,
            embeddings: item.embeddings
        }));

    } catch (error) {
        console.error("Error sending asset for feature extraction:", error);
        return [null, null];
    }
};

/**
 * Splits a block of images (160) into smaller chunks (16), processes them and inserts into the database
 * @param assets - Array of images to be processed
 * @param db - Database object
 */
export const ProcessImages = async (assets: Asset[], db: SQLite.SQLiteDatabase) => {
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
            const exists = await CheckInDatabase(asset, db);
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
        const extractedData = await imageExtraction(batch);
        for (let i = 0; i < batch.length; i++) {
            const asset = batch[i];
            const { keywords, embeddings } = extractedData[i];
            await InsertAsset(asset, keywords, embeddings, db);
        }
      }
    } catch (error) {
        console.log("Error happened while processing images: ", error);
    }
};
