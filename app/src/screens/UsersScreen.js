import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Platform, FlatList, Alert, PermissionsAndroid } from 'react-native';
import firebase from 'react-native-firebase'; 
import { Button, Text, ListItem, Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { GEOCODING_API_KEY } from 'react-native-dotenv';
import { ScrollView } from 'react-native-gesture-handler';

import { Context as ProfileContext } from '../context/ProfileContext';
const UsersScreen = ({ navigation }) => {
  // get navigation params
  const locationId = navigation.getParam('id');
  console.log('locationId', locationId);

  // setup language
  const { t } = useTranslation();
  const language = i18next.language;
  // use context
  const { state, findUsers } = useContext(ProfileContext);
  // use state

  const INIT_REGION = {
    latitude: 37.25949,
    latitudeDelta: 0.01,
    longitude: 127.046638,
    longitudeDelta: 0.01
  };

  const [region, setRegion] = useState(INIT_REGION);
  const [mapMargin, setMapMargin] = useState(1);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [latitudeDelta, setLatitudeDelta] = useState(0);
  const [longitudeDelta, setLongitudeDelta] = useState(0);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  // position delta constants
//  const latitudeDelta = 0.01;
//  const longitudeDelta = 0.01;



  // use effect
  useEffect(() => {
    console.log('UserScreen');
    // get current location
    const watchId = Geolocation.watchPosition(
      pos => {
        const newRegion = {
          latitude: pos.coords.latitude,
          latitudeDelta: INIT_REGION.latitudeDelta,
          longitude: pos.coords.longitude,
          longitudeDelta: INIT_REGION.longitudeDelta
        }
        setRegion(newRegion);
      },
      error => setError(error.message)
    );
    // init geocoding
    initGeocoding();

    // unsubscribe geolocation
    return () => Geolocation.clearWatch(watchId);
  }, []);

  // get current latitude and longitude
  const getCurrentLocation = () => {
  };

  const initGeocoding = () => {
    Geocoder.init(GEOCODING_API_KEY, { language: language }); 
    console.log('[initGeocoding] region', region);
    // get intial address
    Geocoder.from(region.latitude, region.longitude)
      .then(json => {
        const addrComponent = json.results[0].address_components[1];
        console.log('addr json', json);
        console.log('addr', addrComponent);
      })
      .catch(error => console.warn(error));
  };

  // convert the location to address using geocoding
  const onRegionChange = (regionEvent) => {
    // @todo consider use set timer to make updated less
    console.log('on region change event', regionEvent);
    setRegion(regionEvent)
  };

  const onRegionChangeComplete = (event) => {
    // get intial address
    Geocoder.from(region.latitude, region.longitude)
    .then(json => {
      console.log('[onRegionChangeComplete] json', json);
      const name = json.results[0].address_components[1].short_name;
      const district = json.results[0].address_components[2].short_name;
      const city = json.results[0].address_components[3].short_name;
      const state = json.results[0].address_components[4].short_name;
      const country = json.results[0].address_components[5].short_name;
      // for address display
      let display = district;
      const addr = {
        name: name,
        district: district,
        city: city,
        state: state,
        country: country,
        display: display
      };
      setAddress(addr);
      //// find the users in the same district
      // get reference to the current user
      const { currentUser } = firebase.auth();
      const userId = currentUser.uid;
      findUsers({ district: addr.district, userId });
    })
    .catch(error => console.warn(error));  
  };

  const onMapPress = ({ nativeEvent }) => {
    console.log('map press coordinate', nativeEvent.coordinate);

    // update lat, long
    const newLat = nativeEvent.coordinate.latitude;
    const newLong = nativeEvent.coordinate.longitude;
    setRegion(prevState => {
      return { ...prevState, latitude: newLat, longitude: newLong }
    });

    // get address
    Geocoder.from(newLat, newLong)
    .then(json => {
      const name = json.results[0].address_components[1].short_name;
      const district = json.results[0].address_components[2].short_name;
      const city = json.results[0].address_components[3].short_name;
      const state = json.results[0].address_components[4].short_name;
      const country = json.results[0].address_components[5].short_name;
      // for address display
      let display = district;
      const addr = {
        name: name,
        district: district,
        city: city,
        state: state,
        country: country,
        display: display
      };
      setAddress(addr);
    })
    .catch(error => console.warn(error)); 
  }
  
  const showMap = () => {
    if (Platform.OS === 'android') {
      return (
        <View>
          <MapView
            style={{ height: 280, margin: mapMargin }}
            provider={PROVIDER_GOOGLE}
            showsMyLocationButton
            mapType="standard"
            loadingEnabled
            showsUserLocation
            initialRegion={region}
            onRegionChange={onRegionChange}
            onRegionChangeComplete={onRegionChangeComplete}
            onPress={e => onMapPress(e)}
            onMapReady={() => PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(granted => {
              alert(granted) // just to ensure that permissions were granted
            })}
          >
            <Marker
              coordinate={{ latitude: region.latitude, longitude: region.longitude }}
            />
          </MapView>
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 20 }}>
              <Text style={{ paddingLeft: 5, fontSize: 20 }}>{t('LocationScreen.currentAddress')}</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{address.display}</Text>
            </View>
          </View>
        </View>  
      );
    } else if (Platform.OS === 'ios') {
      return (
        <View>
          <MapView
            style={styles.mapContainer}
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
            onRegionChangeComplete={onRegionChangeComplete}
            onPress={e => onMapPress(e)}
          >
            <Marker
              coordinate={{ latitude, longitude }}
            />
          </MapView>
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 20 }}>
              <Text style={{ fontSize: 20 }}>{t('LocationScreen.currentAddress')}</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{address.display}</Text>
            </View>
          </View>
        </View>
      );
    }
  };
  
  const userList = [
    {
      name: 'Chris Jackson',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
      subtitle: 'Vice Chairman'
    },
    {
      name: 'Chris Jackson',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
      subtitle: 'Vice Chairman'
    },
    {
      name: 'Chris Jackson',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
      subtitle: 'Vice Chairman'
    },
    {
      name: 'Chris Jackson',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
      subtitle: 'Vice Chairman'
    },
  ];


  const renderItem = ({item}) => (
    <ListItem
      title="skill"
      subtitle={
        <View>
          <Icon name='hand-o-left' size={20} color={'#353535'}/>
          <Icon name='hand-o-right' size={20} color={'#353535'}/>
          <Icon name='thumbs-o-up' size={20} color={'#353535'}/>
          <Icon name="map-marker" size={20} color={'#353535'}/>
        </View>
      }      
      leftAvatar={
        <View>
          <Avatar size="large" rounded
            source={{
              uri: state.userInfo.avatarUrl,
            }} 
          />
          <Text>username</Text>
        </View>
      }
      bottomDivider
      chevron
    />
  );

  const renderUserList = () => {
    return (
      <ScrollView style={{ height: 280 }}>
        <FlatList
          keyExtractor={this.keyExtractor}
          data={userList}
          renderItem={renderItem}
        />
      </ScrollView>
    );
  };

  return (
    <View>
      {showMap()}
      {renderUserList()}
    </View>
  );
}

UsersScreen.navigationOptions = () => {
  return {
    title: i18next.t('UsersScreen.header'),
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
    height: 280,
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    top: '65%',
    right: '3%'
  }
});

export default UsersScreen;