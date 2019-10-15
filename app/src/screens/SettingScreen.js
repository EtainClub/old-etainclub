import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { SearchBar } from 'react-native-elements';
import MapView from 'react-native-maps';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';


const SettingScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  // state
  const [search, setSearch] = useState('');
  return (
    <View>
        <Text>
            Links
        </Text>
    </View>
  );
};

SettingScreen.navigationOptions = () => {
  return {
    title: i18next.t('SettingScreen.header'),
    headerStyle: {
      backgroundColor: '#07a5f3',
      alignText: 'center'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };
};

// styles
const styles = StyleSheet.create({
});

export default SettingScreen;