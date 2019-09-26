import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { SearchBar } from 'react-native-elements';
import MapView from 'react-native-maps';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';


// custom libraries
import FeedItem from '../components/FeedItem';

const FeedScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  // state
  const [search, setSearch] = useState('');
  // @test
  console.log('FeedScreen');
  return (
    <View>
      <SearchBar
        placeholder={t('FeedScreen.search')}
        value={search}
        onChangeText={setSearch}
      />
    </View>
  );
};

FeedScreen.navigationOptions = () => {
  return {
    title: i18next.t('FeedScreen.header'),
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

export default FeedScreen;