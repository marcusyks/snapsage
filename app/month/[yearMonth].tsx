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

export default function MonthModal() {
  const { yearMonth, assets } = useLocalSearchParams<{ yearMonth: string, assets: string }>(); // Get route parameters
  const parsedAssets = JSON.parse(assets as string); // Convert assets from string back to object
  const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const handleSearchResultsChange = (newSearchedAssets: Asset[], keyword: string) => {
    setSearchedAssets(newSearchedAssets);
    setSearchKeyword(keyword); // Update the keyword state
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomNavBar/>
      <CustomSearchBar assets={parsedAssets as Asset[]}  onSearchResultsChange={handleSearchResultsChange} />
      <View style={styles.galleryContainer}>
        {searchedAssets.length === 0 && searchKeyword ?
        (<Text style={styles.errorMessage}>No results found.</Text>)
        :
        searchedAssets.length > 0 ?
        (<GalleryDisplay assets={searchedAssets}/>)
        :
        (<View><Text style={styles.mainTitle}>{yearMonth}</Text><GalleryDisplay assets={parsedAssets}/></View>)
        }
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container:{
      flex: 1,
      textAlign: 'left',
      marginHorizontal: spaceFromSides,
    },
    mainTitle : {
      fontSize: 50,
      fontWeight: 'bold',
      textAlign: 'left',
      marginLeft: titlePadding,
    },
    galleryContainer : {
      marginTop: spaceFromSides
    },
    errorMessage : {
      textAlign: 'center',
      marginTop: 20,
    }
  });

