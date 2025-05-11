import { OpenDatabase } from '@/controllers/databaseManager';
import * as SQLite from 'expo-sqlite';

/**
 * Manages all embedding related operations
 */

/**
 * Creates LSH implementation and indexing component
 * @param db - Database object
 */
export const CreateEmbeddingIndexTable = async (db: SQLite.SQLiteDatabase) => {
    console.log('Creating embedding index table');
    try{
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS embedding_index (
                filepath TEXT PRIMARY KEY,
                hash TEXT NOT NULL,
                embeddings TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_hash ON embedding_index (hash);
        `);
        await loadIndex(db);
        await cleanUpIndex(db);
    } catch (e){
        console.log(`Failed to create embedding index: ${e}`);
    }
};

/**
 * Get similar assets based on the queried image
 * @param filepathA - Unique URI of a queried image
 * @param assets - all images in Database
 * @returns - Returns an array of similar images
 */
export const FindSimilarAssets = async (filepathA: string, assets: Asset[]) => {
    const db = await OpenDatabase();


    // Retrieve the embedding for the query asset
    const assetAEmbeddingRow : IndexRow | null = await db.getFirstAsync('SELECT * FROM embedding_index WHERE filepath = ?', [filepathA]);
    if (!assetAEmbeddingRow) {
        console.log(`Asset not found for filepath: ${filepathA}`);
        return [];
    }

    const queryEmbedding = JSON.parse(assetAEmbeddingRow.embeddings);
    const queryHash = assetAEmbeddingRow.hash;
    console.log(`Query hash: ${queryHash}`);

    // Find candidates using SQLite index on hash
    const candidateRows : IndexRow[] = await db.getAllAsync('SELECT * FROM embedding_index WHERE hash = ?', [queryHash]);

    // Compute similarity only for candidates with the same hash
    const candidateFP = candidateRows
        .filter(row => row.filepath !== filepathA)
        .map(row => ({ uri: row.filepath, similarity: cosineSimilarity(queryEmbedding, JSON.parse(row.embeddings)) }))
        .filter(item => item.similarity >= 0.7)
        .map(item => item.uri);

    console.log(`Found ${candidateFP.length} candidates`);
    return candidateFP.map(uri => assets.find(asset => asset.uri === uri) as Asset);
};

/**
 * Performs tuple insertion to "embedding_index" table
 * @param db - Database object
 */
const loadIndex = async (db: SQLite.SQLiteDatabase) => {
    const rows : Row[] = await db.getAllAsync('SELECT * FROM images');
    for (const row of rows) {
        await db.runAsync(
            `INSERT OR IGNORE INTO embedding_index (filepath, hash, embeddings) VALUES (?, ?, ?)`,
            [
                row.filepath,
                hashEmbedding(JSON.parse(row.embeddings), rows.length),
                row.embeddings
            ]
        );
    }
};

/**
 * Deletes tuple from "embedding_index" table
 * @param filepath - Unique URI of the image to be deleted
 * @param db - Database object
 */
const deleteIndexRow = async(filepath: string, db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM embedding_index WHERE filepath = ?', [filepath]);
}

/**
 * Cleans up the "embedding_index" table by comparing the images in the "images" table with the images in the "embedding_index" table
 * @param db - Database object
 */
const cleanUpIndex = async(db: SQLite.SQLiteDatabase) => {
    const currentResults : Row[] = await db.getAllAsync('SELECT filepath FROM images');
    const currentFP : string[] = currentResults.map(row => row.filepath);
    const indexResults : IndexRow[] = await db.getAllAsync('SELECT filepath FROM embedding_index');
    const indexFP : string[] = indexResults.map(row => row.filepath);

    // Compare images and remove extra images
    const toDelete = indexFP.filter((path) => !currentFP.includes(path));
    for (const path of toDelete) {
        console.log(`Deleting index row for ${path}`);
        await deleteIndexRow(path, db);
    }
}

/**
 * Generates a hash for the embedding
 * @param embedding - 512-D vector representing the image
 * @param dbSize - Number of processed images in the "images" table
 * @returns log10(dbSize) length hash of the embedding
 */
const hashEmbedding = (embedding: number[], dbSize : number): string => {
    const numBits : number = Math.log10(dbSize);
    return embedding.slice(0, numBits).map(val => (val > 0 ? '1' : '0')).join('');
};

/**
 * Calculates the cosine similarity between two vectors
 * @param a - 512-D vector representing an image
 * @param b - 512-D vector representing another image
 * @returns Cosine similarity between the two vectors
 */
const cosineSimilarity = (a: number[], b: number[]): number => {
    let dotProduct = 0, sumA = 0, sumB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        sumA += a[i] * a[i];
        sumB += b[i] * b[i];
    }
    const magnitudeA = Math.sqrt(sumA);
    const magnitudeB = Math.sqrt(sumB);
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};
