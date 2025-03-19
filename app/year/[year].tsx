import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GalleryDisplay } from '@/components/GalleryDisplay';
import { useLocalSearchParams } from 'expo-router';
import { CustomNavBar } from '@/components/CustomNavBar';
import { CustomSearchBar } from '@/components/SearchBar';
import { Asset } from 'expo-media-library';
import { useState } from 'react';

const spaceFromSides = 10;
const titlePadding = spaceFromSides/1.5;


/**
 * React Component that displays a screen with a gallery of images from a specified year
 * @returns YearModal
 */
export default function YearModal() {
  const { year, assets } = useLocalSearchParams<{ year: string, assets: string }>(); // Get route parameters
  const parsedAssets = JSON.parse(assets as string); // Convert assets from string back to object
  const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const handleSearchResultsChange = (newSearchedAssets: Asset[], keyword: string) => {
    setSearchedAssets(newSearchedAssets);
    setSearchKeyword(keyword); // Update the keyword state
  };


  return (
    <View style={styles.container}>
      <CustomNavBar/>
      <CustomSearchBar assets={parsedAssets as Asset[]}  onSearchResultsChange={handleSearchResultsChange} />
      <View style={styles.galleryContainer}>
        {searchedAssets.length === 0 && searchKeyword ?
        (<Text style={styles.errorMessage}>No results found.</Text>)
        :
        (<View><Text style={styles.mainTitle}>{year}</Text><GalleryDisplay assets={searchedAssets.length > 0 ? searchedAssets : parsedAssets}/></View>)
        }
      </View>
    </View>
  );
}

/**
 * Styles for YearModal
 */
const styles = StyleSheet.create({
    container:{
      flex: 1,
      textAlign: 'left',
      paddingHorizontal: spaceFromSides,
    },
    mainTitle : {
      fontSize: 50,
      fontWeight: 'bold',
      textAlign: 'left',
      paddingLeft: titlePadding,
    },
    galleryContainer : {
      paddingTop: spaceFromSides
    },
    errorMessage : {
      textAlign: 'center',
      paddingTop: 20,
    }
  });

