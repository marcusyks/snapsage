import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export const CustomNavBar = () => {
  const router = useRouter();

  return (
    <View style={styles.navBar}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
        <FontAwesome name='chevron-left' size={24} style={styles.button}/>
      </TouchableOpacity>

      {/* Home Button */}
      <Link href="/(home)/all" style={styles.navButton}>
        <FontAwesome name='home' size={32} style={styles.button}/>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: '100%',
  },
  navButton: {
    padding: 4,
  },
  button: {
    color: 'white',
  }
});

