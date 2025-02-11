import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-media-library';

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

export const ImageExtraction = async (assets: Asset[]): Promise<any> => {
    const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP as string;

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

        return data.map(item => [item.keywords, item.embeddings]);

    } catch (error) {
        console.error("Error sending asset for feature extraction:", error);
        return [null, null];
    }
};
