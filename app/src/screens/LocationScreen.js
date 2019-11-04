import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-elements';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import MapView from 'react-native-maps';

const LocationScreen = ({ navigation }) => {

  const { t } = useTranslation();

  // convert the location to address using geocoding
  
  return (
    <View>
      <MapView
        style={styles.mapContainer}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
      <Text>Address 2 level</Text>
      <Button 
       title="인증하기"
       type="solid"
      />
    </View>
  );
}

LocationScreen.navigationOptions = () => {
  return {
    title: i18next.t('LocationScreen.header'),
    headerStyle: {
      backgroundColor: '#07a5f3',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }
};


const styles = StyleSheet.create({
  mapContainer: {
    height: 400,
    width: 400,
    alignItems: 'center'
  }
});

export default LocationScreen;