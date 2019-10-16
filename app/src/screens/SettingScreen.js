import React, { useContext, useState } from 'react';
import { View, StyleSheet, Linking, Alert, Share } from 'react-native';
import { NavigationEvents, SafeAreaView } from 'react-navigation';
import { Text, SearchBar, ListItem, Divider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

// custom libraries
import Spacer from '../components/Spacer';

const SettingScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  // item list
  const linkList = [
    {
      title: t('SettingScreen.howto'),
      url: 'http://etain.club',
      icon: 'thumb-up',
      icon_url: 'https://cdn4.iconfinder.com/data/icons/common-toolbar/36/Help-2-48.png',
    },
    {
      title: t('SettingScreen.facebookGroup'),
      url: 'https://www.facebook.com/groups/497453057500529/',
      icon: 'facebook-official',
      icon_url: 'https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-48.png',
    },
    {
      title: t('SettingScreen.naverCafe'),
      url: 'https://cafe.naver.com/etainclub',
      icon: 'naver',
      icon_url: 'https://cdn3.iconfinder.com/data/icons/address-book-providers-in-black-white/512/naver-48.png',
    },
    {
      title: t('SettingScreen.github'),
      url: 'https://github.com/EtainClub/etainclub',
      icon: 'github',
      icon_url: 'https://cdn0.iconfinder.com/data/icons/typicons-2/24/social-github-circular-48.png',
    },
  ];

  const settingList = [
    {
      title: t('SettingScreen.app'),
      icon: 'howto'
    },
    {
      title: t('SettingScreen.language'),
      icon: 'notification'
    },
    {
      title: t('SettingScreen.share'),
      icon: 'home',
      icon_url: 'https://cdn4.iconfinder.com/data/icons/43-social-media-line-icons/24/Share-48.png',
    },
    {
      title: t('SettingScreen.deleteAccount'),
      icon: 'delete'
    },
  ];

  const onLinkPress = url => {
    Linking.openURL(url);  
  };

  const onSettingPress = async (id) => {
    console.log('onItemPress id', id);
    switch (id) {
      // app setting
      case 0:
        Linking.openSettings();
        break;
      // lanungae
      case 1:
          Alert.alert(
            t('SettingScreen.languageTitle'),
            t('SettingScreen.languageText'),
            [
              {text: t('confirm')}
            ],
            {cancelable: true},
          );  
        break;
      // share 
      case 2:
        await Share.share({
          message: '친구 초대하기',
        });
        break;
      case 3:
          Alert.alert(
            t('SettingScreen.deleteTitle'),
            t('SettingScreen.deleteText'),
            [
              {text: t('confirm')}
            ],
            {cancelable: true},
          );  
      default:
    }
  };

  return (
    <SafeAreaView forceInset={{top: 'always'}}>
      <Spacer>  
        <Text style={styles.listHeaderText}>{t('SettingScreen.links')}</Text>
        {
          linkList.map((item, i) => (
            <ListItem
              key={i}
              title={item.title}
/*              leftIcon={{ name: item.icon}} */
/*              leftAvatar={{ placeholderStyle: {backgroundColor: 'white'}, rounded: false, source: { uri: item.icon_url } }} */
              chevron
              onPress={() => onLinkPress(item.url)}
            />
          ))
        }
      </Spacer>
      <Divider />
      <Spacer>
        <Text style={styles.listHeaderText}>{t('SettingScreen.setting')}</Text>
        {
          settingList.map((item, i) => (
            <ListItem
              key={i}
              title={item.title}
              chevron
              onPress={() => onSettingPress(i)}
            />
          ))
        }
      </Spacer>  
    </SafeAreaView>
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
  listHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'blue',
    marginLeft: 10,
  },
});

export default SettingScreen;