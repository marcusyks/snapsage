import { StyleSheet, Dimensions, FlatList, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { CustomNavBar } from '@/components/CustomNavBar';
import { Image } from 'expo-image';
import { GalleryDisplay } from '@/components/GalleryDisplay';
import { GetSimilarAssets } from '@/hooks/getSimilarAsset';
import Colors from '@/constants/Colors';
import { useEffect, useRef, useState } from 'react';
import { loadKeywordsByAsset } from '@/controllers/keywordManager';
import Keywords from '@/components/Keywords';

const { width, height } = Dimensions.get('window');
const spaceFromSides = 10;
const estimatedNavBarHeight = 240;

/**
 * React Component that displays different sections regarding an image (Image Display, Keywords, Similar Images)
 * @returns ImageModal
 */
export default function ImageModal() {
  const { asset } = useLocalSearchParams<{ asset: string }>();
  const parsedAsset = JSON.parse(asset as string);
  const { similarAssets, loading, error} = GetSimilarAssets(parsedAsset.uri);
  const flatListRef = useRef<FlatList>(null); // Ref for FlatList
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchKeywords = async() => {
      const keywordsList : string[] = await loadKeywordsByAsset(parsedAsset.uri);
      setKeywords(keywordsList);
    }
    fetchKeywords();
  }, [parsedAsset.uri]);

  const getRatio = (w: number, h: number) => {
    const ratio = w / h;

    if (ratio > 1) { // Width longer than height
      return [width, width / ratio];
    } else {
      return [width * ratio, width];
    }
  };
  const [imageWidth, imageHeight] = getRatio(parsedAsset.width, parsedAsset.height);

  const handleSimilarImagePress = () => {
    flatListRef.current?.scrollToIndex({ index: 0, animated: true }); // Scroll to the image section
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'image') {
      return (
        <View style={styles.imageContainer}>
          <Text style={styles.filename}>{parsedAsset.filename}</Text>
          <Image
            source={{ uri: parsedAsset.uri }}
            style={{
              width: imageWidth,
              height: imageHeight,
              alignSelf: 'center',
            }}
          />
        </View>
      );
    }
    else if (item.type === 'keywords'){
      return(
        <View style={styles.keywordSection}>
          <Keywords keywords={keywords} title={'Keywords'}/>
        </View>
      )
    }
    else {
      return (
        <View style={styles.similarSection}>
          <Text style={styles.similarText}>Similar Images</Text>
          {loading && <Text style={styles.loadingText}>Loading...</Text>}
          {!loading && error && <Text style={styles.loadingText}>Error loading similar images...</Text>}
          {!loading && !error && similarAssets.length === 0 ? (
            <Text style={styles.loadingText}>No similar images found...</Text>
          ) : (
            !loading && !error && similarAssets.length > 0 && (
              <GalleryDisplay assets={similarAssets} onImagePress={handleSimilarImagePress} />
            )
          )}
        </View>
      );
    }
  };

  const data = [
    { type: 'image' },
    { type: 'keywords'},
    { type: 'similarImages' },
  ];

  return (
    <View style={styles.container}>
      <CustomNavBar />

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
}

/**
 * Styles for ImageModal
 */
const styles = StyleSheet.create({
  filename: {
    fontSize: 32,
    fontWeight: 'bold',
    padding: 32,
  },
  keywordSection:{
    height: height + estimatedNavBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    height: height,
    backgroundColor: Colors['dark'].background,
    paddingHorizontal: spaceFromSides,
  },
  imageContainer: {
    height: height - estimatedNavBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarSection: {
    minHeight: height,
    marginBottom: 20,
  },
  similarText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 24,
    marginBottom: 20,
  },
  loadingText: {
    flex: 1,
    marginTop: 30,
    textAlign: 'center',
  },
});
