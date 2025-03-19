import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from './Themed';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';

const numberToPreview = 8;
const marginBetweenImages = 4;
const imageDimensionAdjust = marginBetweenImages * 4;
const { width } = Dimensions.get('window');

/**
 * Renders YearList object and creates container display for it
 * @param item - YearList object containing the year and related images
 * @returns Containers for each year with 8 preview images
 */
const RenderImages = (({ item }: { item: YearList }) => {
  const imagesToDisplay = item.assets.slice(0, numberToPreview); // Get the first 4 images

  return (
    <View style={styles.yearContainer}>
      <Link
        href={{
          pathname: '/year/[year]', // Navigate to the modal
          params: {
            year  : `${item.year}`, // Pass assets as a route param
            assets: JSON.stringify(item.assets), // Pass assets as a JSON string
          },
        }}
      >
      <Text style={styles.yearTitle}>{item.year}</Text>
      </Link>
      <FlatList
        data={imagesToDisplay}
        renderItem={({ item }: { item: Asset }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        horizontal // Display images in a horizontal row
        showsHorizontalScrollIndicator={false}
        style={styles.imagesList}
      />
    </View>
  );
});

/**
 * React Component that displays a list of year containers with preview images
 * @param assets - Array of images to display
 * @returns YearDisplay
 */
export const YearDisplay: React.FC<YearDisplayProps> = ({ assets = [] }) => {
  const [currentYearAssets, setCurrentYearAssets] = useState<YearList[]>([]);

  useEffect(() => {
    if (assets) {
      setCurrentYearAssets(assets as YearList[]);
    }
  }, [assets]);

  const renderItem = useCallback(({ item }: { item: YearList }) => <RenderImages item={item} />, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={currentYearAssets}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.year}`}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

/**
 * Styles for YearDisplay
 */
const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  yearContainer: {
    marginBottom: 12, // Space between year boxes
    backgroundColor: Colors.imageContainer.color,
    padding: 10,
    width: '100%',
    borderRadius: 10,
  },
  yearTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8, // Space below the title
  },
  imagesList: {
    flexDirection: 'row', // Layout images in a row
    marginVertical: 15,
  },
  imageContainer: {
    marginRight: marginBetweenImages, // Minimal gaps between images
  },
  image: {
    width: (width / 3) - (imageDimensionAdjust), // Adjust for margin
    height: (width / 3) - (imageDimensionAdjust), // Keep the images square
  },
  listContainer: {
    paddingBottom: 70,
  }
});
