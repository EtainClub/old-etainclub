/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

 // issue with gesture??
import 'react-native-gesture-handler'
 // react, react-native
import React, {useEffect} from 'react';
import {AsyncStorage, YellowBox, Alert} from 'react-native';
import firebase from 'react-native-firebase';
// this is necessary even though it does not use directly
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
    // check permission
    checkPermission();
    // notification displayed (triggered when a particular notificaiton has been displayed)
    const notificationDisplayedListener = firebase
      .notifications()
      .onNotificationDisplayed( async notification => {
        alert('displayed');
        if (__DEV__) console.log('onNotificationDisplayed', notification);
        // @test
        NavigationService.navigate('Help', {notificationBody: notification});
      });

    // notification listener (triggered when a particular notification has been received)
    // if the app is foreground, we need to navigate the screen
    const listenerFG = firebase.notifications().onNotification(async notification => {
      if (__DEV__) console.log('onNotification', notification);
      alert('onNotification');
      // check sanity: senderId exists?
      if (notification.data.senderId) {
        Alert.alert(
          t('AppScreen.title'),
          t('AppScreen.message'),
          [
            {text: t('yes'), onPress: () => NavigationService.navigate('Help', {notificationBody: notification})},
          ],
          {cancelable: true},
        );
      }
    });

    // notification opened (listen for notification is clicked/ tapped/ opened in foreground and backgroud)
    // when we open the notification, handle here
    const listenerBG = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        alert('onNotificationOpened');
        if (__DEV__) console.log('onNotificationOpened', notificationOpen);
        // check sanity: senderId exists?
        if (notificationOpen.notification.data.senderId) {
          // navigate to Help screen
          NavigationService.navigate('Help', {notificationBody: notificationOpen.notification});
        }
      });

    listenerForAppClosed();


    // Triggered for data only payload in foreground
    const messageListener = firebase.messaging().onMessage((message) => {
      // 
      alert('onMessage');
      //process data message
      console.log(JSON.stringify(message));
    });

    // componentWillUnmout
    return () => {
      if (__DEV__) console.log('unsubscribe notification listener');
      notificationDisplayedListener();
      listenerFG();
      listenerBG();
    };
  }, []);

  const checkPermission = () => {
    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          firebase.messaging().getToken().then(token => {
            if (__DEV__) console.log("permission enabled. token: ", token);
          })
          // user has permissions
        } else {
          firebase.messaging().requestPermission()
            .then(() => {
              if (__DEV__ ) console.log("User Now Has Permission");
            })
            .catch(error => {
              if (__DEV__) console.log("messaging permission error", error);
              Alert.alert(
                t('App.permissionErrorTitle'),
                t('App.permissionErrorText'),
                [
                  {text: t('confirm')}
                ],
                {cancelable: true},
              );
              // User has rejected permissions  
            });
        }
      });
  }

  // listen the notification being opened or clicked when the app is closed
  const listenerForAppClosed = async () => {
    // app closed
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      alert('getInitialNotification');
      // app was opened by a notification
      if (__DEV__) console.log('getInitialNotification', notificationOpen);

      // get information about the notification that was opened
      const notification = notificationOpen.notification;
      //// ignore the same notification id since the same notification is received again, don't know why.
      // get noti id from storage
      // @todo use then
      const notiId = await AsyncStorage.getItem('notiId');
      // set noti id to storage
      await AsyncStorage.setItem('notiId', notification.notificationId);
      if (notification.notificationId === notiId) {
        if (__DEV__) console.log('notification id is the same');
      } else {
        if (__DEV__) console.log('navigating to helpscreen...');
        // check sanity: senderId exists?
        if (notification.data.senderId) {
          // navigate to Help screen
          NavigationService.navigate('Help', {notificationBody: notification});
        }
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
