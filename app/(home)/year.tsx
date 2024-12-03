import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import ImagesScreen from '@/components/ImagesScreen';

export default function YearScreen() {
  const content: TypeOfContent = 'year';

  return (
    <View style={styles.container}>
      <ImagesScreen name="Year" type={content}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
