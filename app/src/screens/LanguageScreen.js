import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Alert, Share, TouchableOpacity } from 'react-native';
import { NavigationEvents, SafeAreaView } from 'react-navigation';
import { Text, Button, SearchBar, ListItem, Divider } from 'react-native-elements';
import DraggableFlatList from 'react-native-draggable-flatlist'
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase'; 
// custom libraries
import Spacer from '../components/Spacer';

const LanguageScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  // primary language
  const language = i18next.language;
  // get user doc
  const { currentUser } = firebase.auth();
  const userId = currentUser.uid;
  const userRef = firebase.firestore().doc(`users/${userId}`);

  // use state
  const [languageData, setLanguageData] = useState([]); 
  const [codeData, setCodeData] = useState([]); 

  // handling component mount 
  useEffect(() => {
    getLanguages();
  }, []);

  // handling language data change
  useEffect(() => {
    updateDB();
  }, [codeData]);

  // update language on db
  const updateDB = () => {
    console.log('[updateDB]');
    // update only the language field
    if (codeData.length > 0) {
      console.log('[updateDB] codeData', codeData);
      userRef.update({
        languages: codeData
      });
    }
  };

  // get language data from db
  const getLanguages = async () => {
    console.log('[getLanguages]');
    let langList = [];
    let codeList = [];
    userRef.get()
    .then(async snapshot => {
      if (snapshot.exists) {
        const languages = snapshot.data().languages;
        console.log('[getLanguages] data', languages);
        // build lists
        for (let i=0; i<languages.length; i++) {
          langList.push({
            key: `item-${i}`,
            code: languages[i] 
          });
          codeList.push(languages[i]);
        }
        // update language data state
        setLanguageData(langList);   
        // update code data state
        setCodeData(codeList);
      }
      else {
        langList.push({
          key: 'item-0',
          code: language
        });
        codeList.push(language);
        // save the primary language in asyncstorage
        await AsyncStorage.setItem('language', language);
        // update language data state
        setLanguageData(langList);   
        // update code data state
        setCodeData(codeList);
      }
    })
    .catch(error => console.log(error));  
  };

  const onWillFocus = () => {
    console.log('[onWillFocus]');
    // get navigation params
    const selectedCode = navigation.getParam('selectedLang');
    if (selectedCode) {
      console.log('[onWillFocus] selectedCode', selectedCode);
      // get length of current list
      const len = languageData.length;
      console.log('language length', len);
      // append language
      const newLang = {
        key: `item-${len+1}`,
        code: selectedCode
      };  
      // append an item to the list
      setLanguageData(prevList => {
        const newList = [...prevList, newLang];
        return newList;
      });       
      // append only code 
      setCodeData(prevState => {
        const newList = [...prevState, selectedCode];
        return newList;
      });
    }
  };

  // update language list when move finishes
  const onLanguageMoved = async ({ data, rowNumber }) => {
    console.log('[updateLanguageData] before updating languagedata', languageData);
    setLanguageData(data);
    // update primary language in asyncstorage
    if (rowNumber === 0) {
      console.log('[updateLanguageData] update primary lang', data.code);
      await AsyncStorage.setItem('language', data.code);
    }
  };

  // render language item
  const renderItem = ({ item, index, move, moveEnd, isActive }) => {
    return (
      <TouchableOpacity
        style={{
          height: 30,
          backgroundColor: isActive ? 'grey' : 'white',
        }}
        onLongPress={move}
        onPressOut={moveEnd}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', paddingHorizontal: 10 }}>
          {index+1} {t(item.code)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationEvents
        onWillFocus={onWillFocus}
      />
      <Text style={styles.listHeaderText}>{t('LanguageScreen.primary')}</Text>
      <View style={{ height: 100 }}>
      <DraggableFlatList
        data={languageData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        scrollPercent={5}
        onMoveEnd={({ data, to }) => onLanguageMoved( data, to )}
      />
      </View>
      <Button
        type="solid"
        buttonStyle={{ height: 50, margin: 20 }}
        titleStyle={{ fontSize: 24, fontWeight: 'bold' }}     
        title={t('LanguageScreen.add')}
        onPress={() => navigation.navigate('LanguageAdd', { codeData })}
        icon={
          <Icon
            style={{ marginHorizontal: 5 }}
            name="add"
            size={30}
            color='white'
          />
        }
      />
    </SafeAreaView>
  );
};

LanguageScreen.navigationOptions = () => {
  return {
    title: i18next.t('LanguageScreen.header'),
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

export default LanguageScreen;