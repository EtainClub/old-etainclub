import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid, Alert, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-elements';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';

const LocationScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  const language = i18next.language;
  // use state
//  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [error, setError] = useState('');
  const [address, setAdress] = useState('');
  // position delta constants
  const latitudeDelta = 0.01;
  const longitudeDelta = 0.01;

  // use effect
  useEffect(() => {
    // get permission for android device
    if (Platform.OS === 'android') {
      getLocationPermission();
    }

    console.log('LocationScreen');
    // get current latitude and longitude
    const watchId = Geolocation.watchPosition(pos => {
      const newPos = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
//      setPosition(newPos);
      console.log('newPos lat', newPos.latitude);
      console.log('newPos long', newPos.longitude);
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      error => setError(error.message)
    );

    // init geocoding
    initGeocoding();

    // unsubscribe geolocation
    return () => Geolocation.clearWatch(watchId);
  }, []);

  const getLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'ReactNativeCode Location Permission',
          'message': 'ReactNativeCode App needs access to your location '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) { 
        Alert.alert("Location Permission Granted.");
      }
      else {
        Alert.alert("Location Permission Not Granted");
      }
    } catch (err) {
      console.warn(err)
    }
  };

  const initGeocoding = () => {
    Geocoder.init('AIzaSyANv7a3x3BD8k2LYd35pT03d43KYx9sv5w', { language: language }); 
    // get intial address
    Geocoder.from(latitude, longitude)
      .then(json => {
        const addrComponent = json.results[0].address_components[0];
        console.log('addr json', json);
        console.log('addr', addrComponent);
      })
      .catch(error => console.warn(error));
  };

  // convert the location to address using geocoding
  const onRegionChange = () => {
    console.log('lat', latitude);
    console.log('long', longitude);
  };

  const onMapPress = (event) => {
    console.log('map press coordinate', event.nativeEvent.coordinate);
    console.log('language', language);
    // get intial address
    Geocoder.from(latitude, longitude)
    .then(json => {
      const addrComponent = json.results[0].address_components[1];
      console.log('addr json', json);
      console.log('addr', addrComponent);
    })
    .catch(error => console.warn(error));  
  }
  
  return (
    <View>
      <MapView
        style={styles.mapContainer}
        provider={PROVIDER_GOOGLE}
        showsMyLocationButton
        mapType="standard"
        loadingEnabled
        showsUserLocation
        region={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta
        }}
        onRegionChange={onRegionChange}
        onPress={e => onMapPress(e)}
      >
        <Marker
          coordinate={{ latitude, longitude }}
        />
      </MapView>
      <View style={styles.buttonContainer}>
        <Button 
          buttonStyle={{ backgroundColor: 'grey' }}
          titleStyle={{ color: 'white' }}
          title="현재 위치 받아오기"
          type="solid"
        />
      </View>
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
    height: 250,
    alignItems: 'center'
  },
  buttonContainer: {
    position: 'absolute',
    top: '65%',
    right: '3%'
  }
});

export default LocationScreen;