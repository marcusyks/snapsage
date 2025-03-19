import Colors from '@/constants/Colors';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';


/**
 * React Component that displays all keywords for a given image
 * @param props Title of the keyword list and the list of keywords
 * @returns Keywords
 */
export default function Keywords(props: KeywordList) {
  const { title, keywords } = props;

  if (keywords === undefined) {
    return (
      <View style={styles.button}>
        <ActivityIndicator size="small" color={Colors['dark'].tint} />
      </View>
    );
  }

  return (
    <View style={styles.button}>
      <Text style={styles.text}>{title}</Text>

      {/* Conditionally render keywords when loaded */}
      <View style={styles.keywordContainer}>
        {
          keywords && keywords.length > 0 ? (
            keywords.map((keyword,index)=>(
              <Text key={index} style={styles.keyword}>
                {keyword}
              </Text>
            ))
          ) :
          (
            <Text style={[{color: Colors['dark'].text, padding: 8}]}>No keywords found...</Text>
          )
        }
      </View>
    </View>
  );
}

/**
 *  Styles for Keywords
 */
const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors['dark'].tint,
    marginVertical: 20,
    padding: 14,
    borderRadius: 32,
    alignItems: 'center',
  },
  text: {
    color: Colors['dark'].text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  keyword: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors['dark'].background,
    boxShadow: `2px 2px 8px ${Colors['dark'].text}`,
    borderRadius: 32,
    fontSize: 14,
    textAlign: 'center',
    color: Colors['dark'].text,
  },
  keywordContainer: {
    padding: 16,
  },
});
