import { StyleSheet } from 'react-native';

import ImagesScreen from '@/components/ImagesScreen';
import { Text, View } from '@/components/Themed';
import { TypeOfContent } from '@/components/ImagesScreen';


export default function AllScreen() {
  const content: TypeOfContent = 'all';

  return (
    <View style={styles.container}>
      <ImagesScreen name="All Images" type={content}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
