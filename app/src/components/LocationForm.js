import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

const LocationForm = (props) => {
  // to check the main item
  const [checked, setCheck] = useState(false);
  const [location, setLocation] = useState(props.item);
  // id to show at front
  const id = props.id + 1;

  updateLocation = (value) => {
    console.log('[LocationForm] value', value);
    setLocation(value);
    props.handleStateChange(props.id, value);
  }

  showLocationWithPlaceholder = (id) => {
    return (
        <Input
          placeholder={props.placeholder}
          containerStyle={{ flex: 1 }}
          value={location}
          disabled
          onChangeText={updateLocation}
          autoCapitalize="none"
          autoCorrect={false}
          rightIcon={
            <Icon name='search' size={20} color='black' 
              onPress={() => props.navigation.navigate('LocationVerify', { id: props.id })} 
            />
          }
        />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.id}>{id}</Text>
      {showLocationWithPlaceholder(id)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  id: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
  }
});

export default LocationForm;