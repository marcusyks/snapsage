import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import ImagesScreen from '@/components/ImagesScreen';

export default function MonthScreen() {
  const content: TypeOfContent = 'month';

  return (
    <View style={styles.container}>
      <ImagesScreen name="Month" type={content}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
