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

export const ImageExtraction = async (asset: Asset): Promise<any> => {
    const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP as string;

    try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        const localUri = assetInfo.localUri;
        if (!localUri) {
            console.error("No local URI found for the asset.");
            return null;
        }

        const blob = await createBlobFromUri(localUri);

        if (blob) {
            const formData = new FormData();
            formData.append('image', {
                uri: localUri,
                name: asset.filename,
                type: blob.type,
            });

            const response = await fetch(`${SERVER_IP}/extract-image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return [data.keywords, data.embeddings];
        } else {
            console.error("Blob creation failed.");
            return [null, null];
        }
    } catch (error) {
        console.error("Error sending asset for feature extraction:", error);
        return [null, null];
    }
};
