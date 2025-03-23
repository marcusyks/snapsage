# SnapSage

## Overview
SnapSage is an image indexing & search application which provides an efficient way to access, categorize, and search for images using AI. It is used in conjunction with [fyp-models](https://github.com/marcusyks/fyp-models)

## Features
- **Access** to all image on device.
- **Store image embeddings** with a **unique filepath** identifier locally.
- **Efficient search** for similar images using a hash-based index.
- Search for images using **keywords**.
- Extract **keywords** and **embeddings** using AI.

NOTE: The AI model is not provided in this repo.

## Installation
1. Clone the repository:
   ```sh
   git clone git@github.com:marcusyks/snapsage.git
   cd image-search-app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Ensure you have **expo-sqlite** installed:
   ```sh
   npm install expo-sqlite
   ```
4. Create .env file and add parameters:
   - EXPO_PUBLIC_ASSETS_CACHE_KEY
   - EXPO_PUBLIC_DB_KEY
   - EXPO_PUBLIC_SERVER_IP

5. Test application (access through **Expo-Go** mobile application)
    ```sh
    npx expo start
    ```

## Author
- Marcus – [marcusyks](https://github.com/marcusyks)

