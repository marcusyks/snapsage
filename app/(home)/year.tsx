import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import ImagesScreen from '@/components/ImagesScreen';

/**
 * React Component that displays all images, categorized by year
 * @returns YearScreen
 */
export default function YearScreen() {
  const content: TypeOfContent = 'year';

  return (
    <View style={styles.container}>
      <ImagesScreen name="Year" type={content}/>
    </View>
  );
}

/**
 * Styles for YearScreen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
