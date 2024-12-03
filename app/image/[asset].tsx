import { StyleSheet, Dimensions, SafeAreaViewBase, Button } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { CustomNavBar } from '@/components/CustomNavBar';
import { Image } from 'expo-image';
import { GalleryDisplay } from '@/components/GalleryDisplay';
import { GetSimilarAssets } from '@/hooks/getSimilarAsset';
import CustomButton from '@/components/CustomButton';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function ImageModal() {
  const { asset } = useLocalSearchParams<{ asset : string }>(); // Get route parameters
  const parsedAsset = JSON.parse(asset as string); // Convert assets from string back to object
  const {similarAssets, loading, error} = GetSimilarAssets(parsedAsset.uri);


  const getRatio = (w: number, h : number)=> {
    const ratio = w/h;

    if (ratio > 1){    //width longer than height
      return [width, width/ratio];
    }
    else{
      return [width*ratio, width];
    }
  }
  const [imageWidth, imageHeight] = getRatio(parsedAsset.width, parsedAsset.height);

  return (
    <View style={styles.container}>
      <CustomNavBar/>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: parsedAsset.uri }}
          style={{
            width: imageWidth,
            height: imageHeight,
            alignSelf: 'center'
          }}
        />
      </View>
      <CustomButton>Info</CustomButton>
      <Text style={styles.similarText}>Similar Images</Text>
      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      {!loading && error && <Text style={styles.loadingText}>Error loading similar images...</Text>}
      {!loading && !error && similarAssets.length === 0 ? (
        <Text style={styles.loadingText}>No similar images found...</Text>
      ) : (
        !loading && !error && similarAssets.length > 0 && (
          <View style={styles.similarImageContainer}>
            <GalleryDisplay assets={similarAssets} />
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container:{
      flex: 1,
      textAlign: 'left',
      paddingHorizontal: 4,
    },
    imageContainer : {
      justifyContent: 'center',
      marginTop: 20,
    },
    similarImageContainer: {
      marginTop: 20,
    },
    loadingText: {
      flex: 1,
      marginTop: 30,
      textAlign: 'center'
    },
    similarText: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingTop: 24,
      borderTopColor: Colors['dark'].tint,
      borderTopWidth: 1,
    }
  });

