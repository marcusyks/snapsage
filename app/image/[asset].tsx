import { StyleSheet, Dimensions, FlatList, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { CustomNavBar } from '@/components/CustomNavBar';
import { Image } from 'expo-image';
import { GalleryDisplay } from '@/components/GalleryDisplay';
import { GetSimilarAssets } from '@/hooks/getSimilarAsset';
import CustomButton from '@/components/CustomButton';
import Colors from '@/constants/Colors';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');
const estimatedNavBarHeight = 100;
const spaceFromSides = 10;

export default function ImageModal() {
  const { asset } = useLocalSearchParams<{ asset: string }>(); // Get route parameters
  const parsedAsset = JSON.parse(asset as string); // Convert assets from string back to object
  const { similarAssets, loading, error, refetch } = GetSimilarAssets(parsedAsset.uri);

  useEffect(() => {
    refetch();
  }, [parsedAsset.uri]);

  const getRatio = (w: number, h: number) => {
    const ratio = w / h;

    if (ratio > 1) {    //width longer than height
      return [width, width / ratio];
    } else {
      return [width * ratio, width];
    }
  };
  const [imageWidth, imageHeight] = getRatio(parsedAsset.width, parsedAsset.height);

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'image') {
      return (
        <View style={[styles.imageContainer, { height: height - estimatedNavBarHeight }]}>
          <Image
            source={{ uri: parsedAsset.uri }}
            style={{
              width: imageWidth,
              height: imageHeight,
              alignSelf: 'center',
            }}
          />
          <CustomButton>Info</CustomButton>
        </View>
      );
    } else {
      return (
        <View style={styles.similarSection}>
          <Text style={styles.similarText}>Similar Images</Text>
          {loading && <Text style={styles.loadingText}>Loading...</Text>}
          {!loading && error && <Text style={styles.loadingText}>Error loading similar images...</Text>}
          {!loading && !error && similarAssets.length === 0 ? (
            <Text style={styles.loadingText}>No similar images found...</Text>
          ) : (
            !loading && !error && similarAssets.length > 0 && (
              <GalleryDisplay assets={similarAssets} />
            )
          )}
        </View>
      );
    }
  };

  const data = [
    { type: 'image' }, // For the Image and Keywords section
    { type: 'similarImages' }, // For the Similar Images section
  ];

  return (
    <View style={styles.container}>
      {/* Navbar Fixed at the Top */}
      <CustomNavBar/>

      {/* FlatList for snap scrolling */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={height} // Snaps to the height of the screen
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    backgroundColor: Colors['dark'].background,
    paddingHorizontal: spaceFromSides
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarSection: {
    marginTop: estimatedNavBarHeight,
    height: height,
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
