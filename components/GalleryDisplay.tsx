import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

const numberToRender = 30;
const marginBetweenImages = 4;
const imageDimensionAdjust = marginBetweenImages * 4;

const { width } = Dimensions.get('window'); // Get screen width for layout

export const GalleryDisplay: React.FC<GalleryDisplayProps> = (({ assets = [], onImagePress}) => {
  const [currentAssets, setCurrentAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // Initially set the first few assets
    setCurrentAssets(assets.slice(0, numberToRender)); // Load the first 30 items
  }, [assets]);

  const loadMoreAssets = () => {
    if (currentAssets.length < assets.length) {
      // Add more assets to the list when the user scrolls down
      setCurrentAssets((prevAssets) => [
        ...prevAssets,
        ...assets.slice(prevAssets.length, prevAssets.length + numberToRender),
      ]);
    }
  };

  const renderItem = (({ item }: { item: Asset }) => {
    return (
      <View style={styles.imageContainer}>
        <Link href={{
          pathname:'/image/[asset]',
          params:{
            asset : JSON.stringify(item),
          }
        }} onPress={onImagePress}>
          <Image source={{ uri: item.uri }} style={styles.image} />
        </Link>
      </View>
    );
  });

  // Add empty placeholders to maintain the 3-column grid layout
  const addPlaceholders = (data: Asset[]) => {
    const mod = data.length % 3;
    if (mod === 0) return data;

    // Add empty items until the total number is divisible by 3
    const placeholders = new Array(3 - mod).fill({ id: `placeholder-${mod}`, uri: '' });
    return [...data, ...placeholders];
  };

  return (
    <FlatList
      data={addPlaceholders(currentAssets)}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={3} // Display in a grid
      showsVerticalScrollIndicator={false}
      onEndReached={loadMoreAssets} // Load more assets when scrolled to the end
      onEndReachedThreshold={0.5} // Trigger the load more function when halfway through the list
      initialNumToRender={numberToRender} // Number of items to render initially
      contentContainerStyle={styles.listContainer}
    />
  );
});

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    margin: marginBetweenImages, // Minimal gaps between images
  },
  image: {
    width: (width / 3) - (imageDimensionAdjust), // Adjust for margin
    height: (width / 3) - (imageDimensionAdjust), // Keep the images square
  },
  listContainer: {
    paddingBottom: 400
  }
});
