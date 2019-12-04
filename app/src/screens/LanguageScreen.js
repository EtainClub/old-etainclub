import React, { useContext, useState } from 'react';
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
// custom libraries
import Spacer from '../components/Spacer';
import { Context as AuthContext } from '../context/AuthContext';


const LanguageScreen = ({ navigation }) => {
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
    t('LanguageScreen.korean'),
    t('LanguageScreen.english'),
  ];

  
  const onLanguageChange = async (lang) => {
    console.log('onLanguageChange', lang);
    // save this into storage
    await AsyncStorage.setItem('language', lang);
    i18next.changeLanguage(lang);
  };

  const onLanguagePress = (index) => {
    console.log('index', index);
  };

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
          {index+1} {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.listHeaderText}>{t('LanguageScreen.primary')}</Text>
      <View style={{ height: 100 }}>
      <DraggableFlatList
        data={languageData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        scrollPercent={5}
        onMoveEnd={ ({ data }) => setLanguageData(data)}
      />
      </View>
      <Button
        type="solid"
        buttonStyle={{ height: 50, margin: 20 }}
        titleStyle={{ fontSize: 24, fontWeight: 'bold' }}     
        title={t('LanguageScreen.add')}
        onPress={() => navigation.navigate('LanguageAdd')}
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
  /*
  return (
    <SafeAreaView>
      <ScrollView>
      <Spacer>
        <Text style={styles.listHeaderText}>{t('LanguageScreen.primary')}</Text>
        <ListItem
          title={primaryLang}
          bottomDivider
        />
        <Spacer>
        <Text style={styles.listHeaderText}>{t('LanguageScreen.all')}</Text>
        {
          languageList.map((item, i) => (
            <ListItem
              key={i}
              title={item}
              onPress={() => onLanguagePress(i)}
              rightIcon={
                <Icon name='check' size={16} color='black' 
                />
              }        
            />
          ))
        }
        </Spacer>
      </Spacer>  
      </ScrollView>
    </SafeAreaView>
  );
  */
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