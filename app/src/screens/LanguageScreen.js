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
  const [removeFlag, setRemoveFlag] = useState(false);

  // handling component mount 
  useEffect(() => {
    getLanguages();
  }, []);

  // handling language data change
  useEffect(() => {
    // build codeData from languageData
    let codeList = [];
    for (let i=0; i<languageData.length; i++) {
      codeList.push(languageData[i].code);
    }
    // update code data state
    setCodeData(codeList);
    // update db
    updateDB(codeList);
  }, [languageData]);

  // update language on db
  const updateDB = (codeList) => {
    console.log('[updateDB]');
    // update only the language field
    if (codeList.length > 0) {
      console.log('[updateDB] codeData', codeList);
      userRef.update({
        languages: codeList
      });
    }
  };

  // get language data from db
  const getLanguages = async () => {
    console.log('[getLanguages]');
    let langList = [];
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
        }
        // update language data state
        setLanguageData(langList);   
      }
      else {
        langList.push({
          key: 'item-0',
          code: language
        });
        // save the primary language in asyncstorage
        await AsyncStorage.setItem('language', language);
        // update language data state
        setLanguageData(langList);   
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
  const onLanguageMoved = async ({ data }) => {
    console.log('[onLanguageMoved] before updating languagedata', data);
    setLanguageData(data);
    // change display language
    i18next.changeLanguage(data[0].code);
    // update primary language in asyncstorage
    console.log('[onLanguageMoved] update primary lang', data[0].code);
    await AsyncStorage.setItem('language', data[0].code);
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
        {
          removeFlag ? 
            <View>          
              <Icon></Icon>
              <Text>{t(item.code)}</Text>          
            </View>  
          :
            <Text style={{ fontSize: 20, fontWeight: 'bold', paddingHorizontal: 10 }}>
            {index+1} {t(item.code)}
            </Text>
        }
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationEvents
        onWillFocus={onWillFocus}
      />
      <Text style={styles.listHeaderText}>{t('LanguageScreen.use')}</Text>
      <View style={{ height: 100 }}>
      <DraggableFlatList
        data={languageData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        scrollPercent={5}
        onMoveEnd={({ data }) => onLanguageMoved({ data })}
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

const onRemovePress = () => {
//  setRemoveFlag(true);
};

LanguageScreen.navigationOptions = ({ navigation }) => {
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
    headerRight: (
      <TouchableOpacity
        onPress={() => onRemovePress()}
      >
      <Text style={{ marginRight: 25, fontSize: 20, color: 'black' }}>
        {i18next.t('remove')}
      </Text>
      </TouchableOpacity>
    ),
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