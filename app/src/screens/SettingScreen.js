import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Linking, Alert, Share } from 'react-native';
import { NavigationEvents, SafeAreaView } from 'react-navigation';
import { Text, SearchBar, ListItem, Divider } from 'react-native-elements';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase'; 
// custom libraries
import Spacer from '../components/Spacer';
import { Context as AuthContext } from '../context/AuthContext';


const SettingScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();
  // use auth context; state, action, default value
  const { signout } = useContext( AuthContext );
  /*
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  */

  //// initial values
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
  // get user doc
  const { currentUser } = firebase.auth();
  const userId = currentUser.uid;
  const userRef = firebase.firestore().doc(`users/${userId}`);
  
  const START_TIME = moment('01:00', 'HH:mm').format("hh:mm A");
  const END_TIME = moment('08:00', 'HH:mm').format("hh:mm A");

  //// states
  // show do not disturb (DND) time list
  const [showDND, setShowDND] = useState(false); 
  const [startDNDTime, setStartDNDTime] = useState({ show: false, time: START_TIME });
  const [endDNDTime,   setEndDNDTime] = useState({ show: false, time: END_TIME });
  
  // use effect
  useEffect(() => {
    // initialize settings
    initSettings();
  }, []);

  const initSettings = async () => {
    // get dnd time state from storage
    const value = await AsyncStorage.getItem('DNDSetting');
    // parse
    const flag = JSON.parse(value);
    // set the state 
    setShowDND(flag);
    // 
    console.log('[initSettings] dnd storage value', flag);
    // get time
    if (flag) {
      const start = await AsyncStorage.getItem('startDNDTime');
      const end = await AsyncStorage.getItem('endDNDTime');
      console.log('[initSettings] start', start);
      console.log('[initSettings] end', end);
      
      // set the time
      setStartDNDTime(prevState => {
        const newStart = { show: false, time: start }
        return  newStart;
      });  
      setEndDNDTime(prevState => {
        const newStart = { show: false, time: end }
        return  newStart;
      });  
    }
  };

  // convert the timestamp to time
  const convertTime = timestamp => {
    return moment(timestamp).format('hh:mm A');
  };

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
  const onDNDValueChange = async (value) => {
    console.log('[onDNDValueChange] value', value);
    // update the state
    setShowDND(value);
    // save the flag in async storage
    await AsyncStorage.setItem('DNDSetting', JSON.stringify(value));
    // save the current time in async storage
    if (value) {
      await AsyncStorage.setItem('startDNDTime', startDNDTime.time);
      await AsyncStorage.setItem('endDNDTime', endDNDTime.time);
      //// update db
      // concatenate the times
      const times = [startDNDTime.time, endDNDTime.time];
      // update
      userRef.update({
        dndTimes: times
      });
    } else {
      // update db when user unselect dnd time
      userRef.update({
        dndTimes: null
      });
    }
  };

  // show clock when a user clicks the time list item
  const onStartTimePress = () => {
    setStartDNDTime(prevState => {
      const newStart = { show: true, time: prevState.time }
      return  newStart;
    });
  };

  // show clock when a user clicks the time list item
  const onEndTimePress = () => {
    setEndDNDTime(prevState => {
      const newEnd = { show: true, time: prevState.time }
      return newEnd;
    });
  };

  // when a user clicks ok or cancel button on clock
  const onStartClockChange = async (event, date) => {
    // when a user cancels
    if (event.type === 'dismissed') {
      return;
    }
    const time = convertTime(event.nativeEvent.timestamp);
    setStartDNDTime({ show: false, time });
    // save the time in storage
    await AsyncStorage.setItem('startDNDTime', time);
    //// update db
    // concatenate the times
    const times = [time, endDNDTime.time];
    // update
    userRef.update({
      dndTimes: times
    });
  };

  // when a user clicks ok or cancel button on clock
  const onEndClockChange = async (event, date) => {
    // when a user cancels
    if (event.type === 'dismissed') {
      return;
    }
    const time = convertTime(event.nativeEvent.timestamp);
    setEndDNDTime({ show: false, time });
    // save the time in storage
    await AsyncStorage.setItem('endDNDTime', time);
        //// update db
    // concatenate the times
    const times = [startDNDTime.time, time];
    // update
    userRef.update({
      dndTimes: times
    });
  };
  
  // show clock
  const renderStartClock = () => {
    console.log('[renderStartClock]');
    const show = startDNDTime.show;
    return (
      show &&
      <DateTimePicker 
        display="spinner"
        value={ new Date() }
        mode={'time'}
        is24Hour={false}
        display="default"
        onChange={onStartClockChange} />
    );
  }

  // show clock
  const renderEndClock = () => {
    const show = endDNDTime.show;
    return (
      show &&
      <DateTimePicker 
        display="spinner"
        value={ new Date() }
        mode={'time'}
        is24Hour={false}
        display="default"
        onChange={onEndClockChange} />
    );
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
                        title={t('SettingScreen.startDNDTime') + startDNDTime.time}
                        containerStyle={{ backgroundColor: 'orange' }}
                        chevron
                        onPress={() => onStartTimePress(i)}
                      />
                      <ListItem
                        key={i+101}
                        title={t('SettingScreen.endDNDTime') + endDNDTime.time}
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