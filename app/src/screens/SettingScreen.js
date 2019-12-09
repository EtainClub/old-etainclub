import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Linking, Alert, Share } from 'react-native';
import { NavigationEvents, SafeAreaView } from 'react-navigation';
import { Text, SearchBar, ListItem, Divider } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
// custom libraries
import Spacer from '../components/Spacer';
import { Context as AuthContext } from '../context/AuthContext';


const SettingScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  // use auth context; state, action, default value
  const { signout } = useContext( AuthContext );
  // item list
  const linkList = [
    {
      title: t('SettingScreen.howto'),
      url: 'http://etain.club',
    },
    {
      title: t('SettingScreen.facebookGroup'),
      url: 'https://www.facebook.com/groups/497453057500529/',
    },
    {
      title: t('SettingScreen.naverCafe'),
      url: 'https://cafe.naver.com/etainclub',
    },
    {
      title: t('SettingScreen.github'),
      url: 'https://github.com/EtainClub/etainclub',
    },
    {
      title: t('SettingScreen.terms'),
      url: 'https://etain.club/terms',
    },
  ];

  const settingList = [
    {
      title: t('SettingScreen.donotdisturb'),
    },
    {
      title: t('SettingScreen.language'),
    },
    {
      title: t('SettingScreen.share'),
    },
    {
      title: t('SettingScreen.app'),
    },
    {
      title: t('SettingScreen.evaluate'),
    },
    {
      title: t('SettingScreen.signout'),
    },
    {
      title: t('SettingScreen.deleteAccount'),
    },
  ];

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  let count = 0;

  //// states
  // show do not disturb (DND) time list
  const [showDND, setShowDND] = useState(false); 
  const [showDNDClock, setShowDNDClock] = useState(false); 
  const [showStartClock, setShowStartClock] = useState(false); 
  const [showEndClock, setShowEndClock] = useState(false); 

  // flag: is it setting the start time? 
  const [startDND, setStartDND] = useState(true);
  const [updateDNDTime, setUpdateDNDTime] = useState(false); 
  const [startDNDTime, setStartDNDTime] = useState(null);
  const [endDNDTime, setEndDNDTime] = useState(null);

  // use effect
  useEffect(() => {
    // 
//    console.log('[useEffect] showDNDClock', showDNDClock);
    // re-render
//    updateState();
  }, [showDNDClock]);
 
  const onLinkPress = url => {
    Linking.openURL(url);  
  };
  
  const onSettingPress = async (id) => {
    console.log('onItemPress id', id);
    switch (id) {
      // do not disturb
      case 0:
        break;        
      // lanungae
      case 1:
          navigation.navigate('Language');
        break;
      // share 
      case 2:
        await Share.share({
          title: t('SettingScreen.shareTitle'),
          message: 'http://etain.club/download',
        });
        break;
      // app version
      case 3:
        Linking.openSettings();
        break;
      // app evaluation
      case 4:
        Alert.alert(
          t('SettingScreen.evaluationTitle'),
          t('SettingScreen.evaluationText'),
          [
            { text: t('no'), style: 'cancel' },
            { text: t('yes') }
          ],
          { cancelable: true },
        );
        break;  
      case 5:
        Alert.alert(
          t('SettingScreen.signoutTitle'),
          t('SettingScreen.signoutText'),
          [
            { text: t('no'), style: 'cancel' },
            { text: t('yes'), onPress: () => signout({ navigation }) }
          ],
          { cancelable: true },
        );
        break;  
      case 6:
          Alert.alert(
            t('SettingScreen.deleteTitle'),
            t('SettingScreen.deleteText'),
            [
              { text: t('confirm') }
            ],
            { cancelable: true },
          );
          break;  
      default:
    }
  };

  // update swith state when a user clicks the DND time switch
  const onDNDValueChange = (value) => {
    console.log('[onDNDValueChange] value', value);
    // update the state
    setShowDND(value);
  };

  // show clock when a user clicks the time list item
  const onStartTimePress = () => {
    setShowStartClock(true);
    setShowEndClock(false);
/*
    // show dialog
    Alert.alert(
      t('SettingScreen.dndTimeTitle'),
      t('SettingScreen.dndTimeText'),
      [
        // show clock
        { text: t('confirm'), onPress: () => { console.log('onPress'); setShowDNDClock(true); } }
      ],
      { cancelable: true },
    );
*/
  };

  // show clock when a user clicks the time list item
  const onEndTimePress = () => {
    setShowStartClock(false);
    setShowEndClock(true);
  };

  // when a user clicks ok or cancel button on clock
  const onClockChange = (event) => {
    console.log('[onClockChange] event', event);
    console.log('[onClockChange] startDND', startDND);
    // when a user cancels
    if (event.type === 'dismissed') {
      // make the clock invisible
      setShowDNDClock(false);
      // reset start flag
      setStartDND(true);
      console.log('[onClockChange] user canceled');
      return;
    }

    setShowDNDClock(false);
    return;
    //// user clicks ok
    // is it start time?
    if (startDND) {
      // save the start time
//      setStartDNDTime(event.nativeEvent.timestamp);
      // set startDND to false
      setStartDND(false);
      // ???
      setShowDNDClock(false);
      console.log('[onClockChange] start time selected');
      return;
    } 
    // save the end time
//    setEndDNDTime(event.nativeEvent.timestamp);
    // set startDND to true
    setStartDND(true);
    // make the clock invisible
    setShowDNDClock(false);
    console.log('[onClockChange] end time selected. showDNDClock', showDNDClock);
  };

  // show clock
  const renderStartClock = () => {
    if (showStartClock) {
      return (
        <DateTimePicker 
          display="spinner"
          value={ new Date() }
          mode={'time'}
          is24Hour={false}
          display="default"
          onChange={(event) => {onClockChange(event)}} />
      );
    }
  }

  // show clock
  const renderEndClock = () => {
    if (showEndClock) {
      return (
        <DateTimePicker 
          display="spinner"
          value={ new Date() }
          mode={'time'}
          is24Hour={false}
          display="default"
          onChange={(event) => {onClockChange(event)}} />
      );
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
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
            i === 0 ? 
              <View key={i}>              
                <ListItem
                  key={i}
                  title={item.title}
                  switch={{ 
                    value: showDND,
                    onValueChange: (value) => onDNDValueChange(value)
                  }}
                />
                {
                    showDND && 
                    <View>
                    <ListItem
                      key={i+100}
                      title={"Start: 11:00 PM"}
                      containerStyle={{ backgroundColor: 'orange' }}
                      chevron
                      onPress={() => onStartTimePress(i)}
                    />
                    <ListItem
                      key={i+101}
                      title={"End: 08:00 AM"}
                      containerStyle={{ backgroundColor: 'orange' }}
                      chevron
                      onPress={() => onEndTimePress(i)}
                    />        
                    </View>
                }
              </View>
              :
              <ListItem
                key={i}
                title={item.title}
                chevron
                onPress={() => onSettingPress(i)}
              />
          ))
        }
      </Spacer>
      {renderStartClock()}
      {renderEndClock()}
      </ScrollView>
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