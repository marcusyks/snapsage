import React, { useState, useEffect } from 'react';
import { Text, View } from '../components/Themed'
import {
  SafeAreaView,
  StyleSheet,
  Linking,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { initializeAndUpdate } from '@/hooks/initializeAndUpdate';
import { router } from 'expo-router';


export default function App() {
  const {progress, isComplete} = initializeAndUpdate();

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
          fill={progress} // Use the current progress value
          tintColor="gray"
          backgroundColor="white"
          rotation={0}
        />
        <Text style={styles.circularProgressText}>{progress.toFixed(0)}%</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {progress < 100 ?
        ( <Text style={styles.progressText}>
            Loading
          </Text>) :
        (
          <Text style={styles.progressText}>
            Finishing up...
          </Text>
        )
      }
      {renderProgressBar()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 10,
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
