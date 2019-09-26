/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

 // react, react-native
import React, {useEffect} from 'react';
import {StyleSheet, AsyncStorage, YellowBox, Alert} from 'react-native';
import firebase from 'react-native-firebase';
//import {NavigationActions} from 'react-navigation';
import i18n from './src/i18n';
import {useTranslation} from 'react-i18next';
// contexts
import {Provider as AuthProvider} from './src/context/AuthContext';
import {Provider as AskProvider} from './src/context/AskContext';
import {Provider as HelpProvider} from './src/context/HelpContext';
import {Provider as ProfileProvider} from './src/context/ProfileContext';
import {Provider as ChatProvider} from './src/context/ChatContext';
import Navigator from './src/Navigator';
import NavigationService from './src/NavigationService';
YellowBox.ignoreWarnings(['Require cycle:']);

const AppContainer = Navigator;

export default () => {

  // setup language
  const {t} = useTranslation();

  // use effect
  useEffect(() => {

    // notification displayed (triggered when a particular notificaiton has been displayed)
    const notificationDisplayedListener = firebase
      .notifications()
      .onNotificationDisplayed(notification => {
        console.log('onNotificationDisplayed', notification);
      });

    // notification listener (triggered when a particular notification has been received)
    // if the app is foreground, we need to navigate the screen
    const listenerFG = firebase.notifications().onNotification(notification => {
      console.log('onNotification', notification);
      Alert.alert(
        t('AppScreen.title'),
        t('AppScreen.message'),
        [
          {text: t('yes'), onPress: () => NavigationService.navigate('Help', {notificationBody: notification})},
        ],
        {cancelable: true},
      );
    });

    // notification opened (listen for notification is clicked/ tapped/ opened in foreground and backgroud)
    // when we open the notification, handle here
    const listenerBG = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        console.log('onNotificationOpened', notificationOpen);
        // navigate to Help screen
        NavigationService.navigate('Help', {notificationBody: notificationOpen.notification});
      });

    listenerForAppClosed();

    // componentWillUnmout
    return () => {
      console.log('unsubscribe notification listener');
      notificationDisplayedListener();
      listenerFG();
      listenerBG();
    };
  }, []);

  // listen the notification being opened or clicked when the app is closed
  const listenerForAppClosed = async () => {
    // app closed
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      // app was opened by a notification
      console.log('getInitialNotification', notificationOpen);
      // get information about the notification that was opened
      const notification = notificationOpen.notification;
      //// ignore the same notification id since the same notification is received again, don't know why.
      // get noti id from storage
      const notiId = await AsyncStorage.getItem('notiId');
      // set noti id to storage
      await AsyncStorage.setItem('notiId', notification.notificationId);
      if (notification.notificationId === notiId) {
        console.log('notification id is the same');
      } else {
        console.log('navigating to helpscreen...');
        // navigate to Help screen
        NavigationService.navigate('Help', {notificationBody: notification});
      }
    }
  };

  return (
    <ChatProvider>
      <ProfileProvider>
        <HelpProvider>
          <AskProvider>
            <AuthProvider>
              <AppContainer
                ref={navigationRef => {NavigationService.setTopLevelNavigator(navigationRef);}}
              />
            </AuthProvider>
          </AskProvider>
        </HelpProvider>
      </ProfileProvider>
    </ChatProvider>
  );
}


 /*
import React, {Fragment} from 'react';
import {View, Text, StyleSheet, AsyncStorage, YellowBox, Alert} from 'react-native';

import firebase from 'react-native-firebase';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import NavigationService from './src/NavigationService';
import {navigate, setNavigator} from './src/navigationRef';

import ResolveAuthScreen from './src/screens/ResolveAuthScreen';
import SigninScreen from './src/screens/SigninScreen';
import SignupScreen from './src/screens/SignupScreen';
import AskScreen from './src/screens/AskScreen';
import AskWaitScreen from './src/screens/AskWaitScreen';
import HelpScreen from './src/screens/HelpScreen';
import AccountScreen from './src/screens/AccountScreen';
import AccountEditScreen from './src/screens/AccountEditScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import ChatListScreen from './src/screens/ChatListScreen';

//import {NavigationActions} from 'react-navigation';
import i18n from './src/i18n';
import {useTranslation} from 'react-i18next';
// contexts
import {Provider as AuthProvider} from './src/context/AuthContext';
import {Provider as AskProvider} from './src/context/AskContext';
import {Provider as HelpProvider} from './src/context/HelpContext';
import {Provider as ProfileProvider} from './src/context/ProfileContext';
import {Provider as ChatProvider} from './src/context/ChatContext';


const TopLevelNavigator = createStackNavigator({
  Ask: AskScreen,
  AskWait: AskWaitScreen,
  Help: HelpScreen,
  Signin: SigninScreen,
});

const AppContainer = createAppContainer(TopLevelNavigator);

export default class App extends React.Component {
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log('permission rejected');
    }
  }

  async createNotificationListeners() {
    firebase.notifications().onNotification(notification => {
      console.log('Notification', notification);
      // naviate to the screen
      NavigationService.navigate('Help', {notificationBody: notification});

      notification.android.setChannelId('insider').setSound('default');
      firebase.notifications().displayNotification(notification);
    });
  }

  componentDidMount() {
    const channel = new firebase.notifications.Android.Channel('insider', 'insider channel', firebase.notifications.Android.Importance.Max)
    firebase.notifications().android.createChannel(channel);
    this.checkPermission();
    this.createNotificationListeners();
  }

  render() {
    return (
      <ChatProvider>
        <ProfileProvider>
          <HelpProvider>
            <AskProvider>
              <AuthProvider>
                <AppContainer
                  ref={navigationRef => {NavigationService.setTopLevelNavigator(navigationRef);}}
                />
              </AuthProvider>
            </AskProvider>
          </HelpProvider>
        </ProfileProvider>
      </ChatProvider>
    );
  }
}
*/

/*
// react, react-native
//import React, {useEffect} from 'react';
import React from 'react';
import {StyleSheet, AsyncStorage, YellowBox, Alert} from 'react-native';
import firebase from 'react-native-firebase';
//import {NavigationActions} from 'react-navigation';
import i18n from './src/i18n';
import {useTranslation} from 'react-i18next';
// contexts
import {Provider as AuthProvider} from './src/context/AuthContext';
import {Provider as AskProvider} from './src/context/AskContext';
import {Provider as HelpProvider} from './src/context/HelpContext';
import {Provider as ProfileProvider} from './src/context/ProfileContext';
import {Provider as ChatProvider} from './src/context/ChatContext';
import Navigator from './src/Navigator';
import {navigate, setNavigator} from './src/navigationRef';

YellowBox.ignoreWarnings(['Require cycle:']);

const AppContainer = Navigator;

export default class App extends React.Component {
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log('permission rejected');
    }
  }

  async createNotificationListeners() {
    firebase.notifications().onNotification(notification => {
      console.log('Notification', notification);
      // naviate to the screen
      navigate('Help', {notificationBody: notification});

      notification.android.setChannelId('insider').setSound('default');
      firebase.notifications().displayNotification(notification);
    });
  }

  componentDidMount() {
    const channel = new firebase.notifications.Android.Channel('insider', 'insider channel', firebase.notifications.Android.Importance.Max)
    firebase.notifications().android.createChannel(channel);
    this.checkPermission();
    this.createNotificationListeners();
  }

  render() {
    return (
      <ChatProvider>
        <ProfileProvider>
          <HelpProvider>
            <AskProvider>
              <AuthProvider>
                <AppContainer
                  ref={navigator => {
                    setNavigator(navigator);
                  }}
                />
              </AuthProvider>
            </AskProvider>
          </HelpProvider>
        </ProfileProvider>
      </ChatProvider>
    );
  }
}
*/
/*
const App = Navigator;

export default () => {

  // setup language
  const {t} = useTranslation();

  // use effect
  useEffect(() => {
    console.log('App navigator', App);

    // notification displayed (triggered when a particular notificaiton has been displayed)
    const notificationDisplayedListener = firebase
      .notifications()
      .onNotificationDisplayed(notification => {
        console.log('onNotificationDisplayed', notification);
      });

    // notification listener (triggered when a particular notification has been received)
    // if the app is foreground, we need to navigate the screen
    const listenerFG = firebase.notifications().onNotification(notification => {
      console.log('onNotification', notification);
      Alert.alert(
        t('AppScreen.title'),
        t('AppScreen.message'),
        [
          {text: t('yes'), onPress: () => navigate('Help', {notificationBody: notification})},
        ],
        {cancelable: true},
      );
    });

    // notification opened (listen for notification is clicked/ tapped/ opened in foreground and backgroud)
    // when we open the notification, handle here
    const listenerBG = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        console.log('onNotificationOpened', notificationOpen);
        // navigate to Help screen
        navigate('Help', {notificationBody: notificationOpen.notification});
      });

    listenerForAppClosed();

    // componentWillUnmout
    return () => {
      console.log('unsubscribe notification listener');
      notificationDisplayedListener();
      listenerFG();
      listenerBG();
    };
  }, []);

  // listen the notification being opened or clicked when the app is closed
  const listenerForAppClosed = async () => {
    // app closed
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      // app was opened by a notification
      console.log('getInitialNotification', notificationOpen);
      // get information about the notification that was opened
      const notification = notificationOpen.notification;
      //// ignore the same notification id since the same notification is received again, don't know why.
      // get noti id from storage
      const notiId = await AsyncStorage.getItem('notiId');
      // set noti id to storage
      await AsyncStorage.setItem('notiId', notification.notificationId);
      if (notification.notificationId === notiId) {
        console.log('notification id is the same');
      } else {
        console.log('navigating to helpscreen...');
        // navigate to Help screen
        navigate('Help', {notificationBody: notification});
      }
    }
  };

  return (
    <ChatProvider>
      <ProfileProvider>
        <HelpProvider>
          <AskProvider>
            <AuthProvider>
              <App
                ref={navigator => {
                  setNavigator(navigator);
                }}
              />
            </AuthProvider>
          </AskProvider>
        </HelpProvider>
      </ProfileProvider>
    </ChatProvider>
  );
}
*/
