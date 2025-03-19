import { useState } from 'react';
import { Text, View } from './Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { getAssets } from '@/hooks/getAssets';
import { GalleryDisplay } from './GalleryDisplay';
import { MonthDisplay } from './MonthDisplay';
import { YearDisplay } from './YearDisplay';
import { CustomSearchBar } from './SearchBar';

const spaceFromSides = 10;
const titlePadding = spaceFromSides/1.5;

/**
 * React Component that displays a screen with a gallery of images for the three main types of content (all images, month, year)
 * @param name - Title of the screen
 * @param type - Type of content to display (all, month, year)
 * @returns ImagesScreen
 */
export default function ImagesScreen({ name, type }: { name: string, type: TypeOfContent }) {
  const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const { assets, monthAssets, yearAssets, loading, error } = getAssets(type);

  const handleSearchResultsChange = (newSearchedAssets: Asset[], keyword: string) => {
    setSearchedAssets(newSearchedAssets);
    setSearchKeyword(keyword);
  };

  return (
    <SafeAreaView style={styles.container}>
      {type === 'all' && (
          <CustomSearchBar assets={assets} onSearchResultsChange={handleSearchResultsChange} />
      )}
      {error ? <Text style={styles.errorMessage}>{error}</Text>:<></>}
      {loading ? <Text style={styles.errorMessage}>loading...</Text>:<></>}
      <View style={styles.galleryContainer}>
        {searchedAssets.length === 0 && searchKeyword ?
        (<Text style={styles.errorMessage}>No results found.</Text>)
        :
        (searchedAssets.length > 0 ?
            (<GalleryDisplay assets={searchedAssets} />)
            :
            (type === 'all' ?
              (<View><Text style={styles.mainTitle}>{name}</Text><GalleryDisplay assets={assets as Asset[]} /></View>)
              :
              type === 'month' ?
              (<View><Text style={styles.mainTitle}>{name}</Text><MonthDisplay assets={monthAssets} /></View>)
              :
              (<View><Text style={styles.mainTitle}>{name}</Text><YearDisplay assets={yearAssets} /></View>)
            )
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * Styles for ImagesScreen
 */
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
    marginBottom: 10,
  },
  galleryContainer : {
    marginTop: spaceFromSides,
  },
  errorMessage : {
    textAlign: 'center',
    marginTop: 20,
  }
});
