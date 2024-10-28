import { StyleSheet } from 'react-native';

import EditScreenInfo, { TypeOfContent } from '@/components/ImagesScreen';
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
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
