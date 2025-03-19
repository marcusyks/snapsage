import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import ImagesScreen from '@/components/ImagesScreen';

/**
 * React Component that displays all images, categorized by month
 * @returns MonthScreen
 */
export default function MonthScreen() {
  const content: TypeOfContent = 'month';

  return (
    <View style={styles.container}>
      <ImagesScreen name="Month" type={content}/>
    </View>
  );
}

/**
 * Styles for MonthScreen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
