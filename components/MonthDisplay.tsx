import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from './Themed';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors'

const numberToPreview = 8;
const marginBetweenImages = 6;
const imageDimensionAdjust = marginBetweenImages * 4;

const { width } = Dimensions.get('window'); // Get screen width for layout

const RenderImages = (({ item }: { item: MonthList }) => {
  const imagesToDisplay = item.assets.slice(0, numberToPreview); // Get the first 4 images

  return (
    <View style={styles.monthContainer}>
        <Link
          href={{
            pathname: '/month/[yearMonth]', // Navigate to the modal
            params: {
              yearMonth  : `${item.year} ${item.month}`, // Pass assets as a route param
              assets: JSON.stringify(item.assets), // Pass assets as a JSON string
            },
          }}
        >
          <Text style={styles.monthTitle}>
            {item.year} {item.month}
          </Text>
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
        showsHorizontalScrollIndicator={true}
        style={styles.imagesList}
      />
    </View>
  );
});

export const MonthDisplay: React.FC<MonthDisplayProps> = ({ assets = [] }) => {
  const [currentMonthAssets, setCurrentMonthAssets] = useState<MonthList[]>([]);

  useEffect(() => {
    if (assets) {
      setCurrentMonthAssets(assets as MonthList[]);
    }
  }, [assets]);

  // Memoize the renderImages to prevent unnecessary re-renders
  const renderItem = useCallback(({ item }: { item: MonthList }) => <RenderImages item={item}/>, []);

  return (
    <View style={styles.container}>
        <FlatList
          data={currentMonthAssets}
          renderItem={renderItem} // Use memoized renderItem function
          keyExtractor={(item) => `${item.year} ${item.month}`} // Unique key for each month
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  monthContainer: {
    marginBottom: 12, // Space between month boxes
    backgroundColor: Colors.imageContainer.color,
    padding: 10,
    width: '100%',
    borderRadius: 10,
  },
  monthTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingBottom: 8, // Space below the title
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
