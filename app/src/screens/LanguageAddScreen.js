import React, { useContext, useState } from 'react';
import { View, StyleSheet, Linking, Alert, Share, TouchableOpacity } from 'react-native';
import { NavigationEvents, SafeAreaView } from 'react-navigation';
import { Text, SearchBar, ListItem, Divider } from 'react-native-elements';
import DraggableFlatList from 'react-native-draggable-flatlist'
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
// custom libraries
import Spacer from '../components/Spacer';
import { Context as AuthContext } from '../context/AuthContext';


const LanguageAddScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  // primary language
  const language = i18next.language;
  // primary language data
  let primaryData;
  switch (language) {
    case 'ko':
      primaryData = [{
        key: 'item-0',
        label: '한글',
      }];
      break;
    case 'en':
      primaryData = [{
        key: 'item-0',
        label: 'English',
      }]; 
      break;
    default:
      primaryData = [{
        key: 'item-0',
        label: 'English',
      }];    
      break;
  }

  // use state
  const [languageData, setLanguageData] = useState(primaryData); 
  // others language list
  let othersList = [];
  // all language list
  const languageList = [
    t('LanguageAddScreen.korean'),
    t('LanguageAddScreen.english'),
  ];

  
  const onLanguageChange = async (lang) => {
    console.log('onLanguageChange', lang);
    // save this into storage
    await AsyncStorage.setItem('language', lang);
    i18next.changeLanguage(lang);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Spacer>
          <Text style={styles.listHeaderText}>{t('LanguageAddScreen.all')}</Text>
          {
            languageList.map((item, i) => (
              <ListItem
                key={i}
                title={item}
                onPress={() => onLanguagePress(i)} 
              />
            ))
          }
        </Spacer>  
      </ScrollView>
    </SafeAreaView>
  );
};

LanguageAddScreen.navigationOptions = () => {
  return {
    title: i18next.t('LanguageAddScreen.header'),
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
  listHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'blue',
    marginLeft: 10,
  },
});

export default LanguageAddScreen;