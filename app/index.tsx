import { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function RootIndex() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return (
      <View style={styles.splashContainer}>
        {/* Verify this path matches where your logo is stored! */}
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Once the timer ends, move automatically to the login page
  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', 
  },
  splashLogo: {
    width: '80%', 
    height: 150,  
  },
});