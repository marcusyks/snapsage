import React, { useState, useEffect } from 'react';
import { Text, View, Image, Dimensions } from 'react-native';
import {
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { initializeAndUpdate } from '@/hooks/initializeAndUpdate';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

const { height } = Dimensions.get('window'); // Get screen height for layout
const logoSize = height * 0.3


/**
 * Start up screen for the app
 * @returns App
 */
export default function App() {
  const {progress, isComplete} = initializeAndUpdate();
  const colorScheme = useColorScheme();

  useEffect(()=>{
    if(isComplete){
      router.replace('/(home)/all');
    }
  },[isComplete])

  const renderProgressBar = () => {
    return (
      <View style={styles.circularProgressContainer}>
        <AnimatedCircularProgress
          size={200}
          width={30}
          fill={progress}
          backgroundColor={Colors[colorScheme ?? 'light'].tint}
          tintColor={Colors[colorScheme ?? 'light'].background}
          rotation={0}
        />
        <Text style={styles.circularProgressText}>{progress.toFixed(0)}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/snapsage_name.png')} style={styles.image}/>
      {renderProgressBar()}
    </View>
  );
}

/**
 * Styles for App
 */
const styles = StyleSheet.create({
  image: {
    height: logoSize,
    width: logoSize,
    padding: 0,
  },
  container: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: "white",
    alignItems: 'center',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 30,
    fontWeight: 'bold',
  },
  circularProgressContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 25,
  },
  circularProgressText: {
    position: 'absolute',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
