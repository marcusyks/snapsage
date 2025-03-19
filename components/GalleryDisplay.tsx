import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

const numberToRender = 50;
const marginBetweenImages = 4;
const imageDimensionAdjust = marginBetweenImages * 4;
const { width } = Dimensions.get('window');


/**
 * React Component that displays a gallery of images
 * @param assets - Array of images to display
 * @returns GalleryDisplay
 */
export const GalleryDisplay: React.FC<GalleryDisplayProps> = ({ assets = [], onImagePress }) => {
  const [currentAssets, setCurrentAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setCurrentAssets(assets.slice(0, numberToRender)); // Load initial images
  }, [assets]);

  const loadMoreAssets = () => {
    if (currentAssets.length < assets.length) {
      setCurrentAssets((prevAssets) => [
        ...prevAssets,
        ...assets.slice(prevAssets.length, prevAssets.length + numberToRender),
      ]);
    }
  };

  const addPlaceholders = (data: Asset[]) => {
    const mod = data.length % 3;
    if (mod === 0) return data;
    return [...data, ...new Array(3 - mod).fill({ id: `placeholder-${mod}`, uri: '' })];
  };

  const RenderItem = React.memo(({ item }: { item: Asset }) => {
    if (!item.uri) return <View style={styles.imageContainer} />;

    return (
      <View style={styles.imageContainer}>
        <Link
          href={{
            pathname: '/image/[asset]',
            params: { asset: JSON.stringify(item) },
          }}
          onPress={onImagePress}
        >
          <Image source={{ uri: item.uri }} style={styles.image} />
        </Link>
      </View>
    );
  });

  const renderItem = useCallback(({ item }: { item: Asset }) => <RenderItem item={item} />, []);

  return (
    <FlatList
      data={addPlaceholders(currentAssets)}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMoreAssets}
      onEndReachedThreshold={0.5}
      initialNumToRender={numberToRender}
      updateCellsBatchingPeriod={20}
      windowSize={5}
      removeClippedSubviews={true}
      contentContainerStyle={styles.listContainer}
    />
  );
};

/**
 * Styles for GalleryDisplay
 */
const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    margin: marginBetweenImages,
  },
  image: {
    width: width / 3 - imageDimensionAdjust,
    height: width / 3 - imageDimensionAdjust,
  },
  listContainer: {
    paddingBottom: 400,
  },
});
