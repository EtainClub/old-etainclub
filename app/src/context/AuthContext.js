import React from 'react';
import { AsyncStorage } from 'react-native';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import firebase from 'react-native-firebase'; 
import createDataContext from './createDataContext';
import NavigationService from '../NavigationService';

// reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'start_auth':
      console.log('start_auth reducer');
      return { ...state, loading: true };
    case 'add_error':
      return { ...state, errorMessage: action.payload, loading: false };
    case 'signup':
      console.log('sigup reducer');
      return { token: action.payload.token, errorMessage: '', loading: false };
    case 'signin':
      console.log('signin reducer');
      return { 
        errorMessage: '', 
        token: action.payload.token, pushToken: action.payload.pushToken, 
        loading: false 
      };
    case 'clear_error':
      return { ...state, errorMessage: '', loading: false };
    case 'signout':
      console.log('signout reducer');
      return { token: null, errorMessage: '', loading: false };
    default:
      return state;
  }
};

//// actions
// local login
const trySigninWithToken = dispatch => {
  return async () => {
    let token = await AsyncStorage.getItem('token');
//    console.log('trySinginWithToken token', token);
    if (token) {
      // dispatch signin action
      dispatch({ type: 'signin', payload: token });
      // navigate to landing screen
      NavigationService.navigate('mainFlow');
      // @test
//      navigate('ProfileContract');
    } else {
      NavigationService.navigate('loginFlow');
    }
  };
};

// clear error
const clearError = dispatch => () => {
  console.log('clear error dispatch');
  // dispatch clear action
  dispatch({type: 'clear_error'});
};

// signup
const signup = dispatch => {
  // use language
  const {t} = useTranslation();

  return async ({email, password, confirm_password, navigation}) => {
    // start auth action
    dispatch({
      type: 'start_auth',
    });

    // check password
    if (password !== confirm_password) {
      console.log('signup password is not matched');
      dispatch({
        type: 'add_error',
        payload: t('AuthContext.PasswordError'),
      });
      return;
    }
    // create an account using firebase
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(user => {
        console.log('firebase signup', user);
        // get the ID token
        firebase
          .auth()
          .currentUser.getIdToken(/* forceRefresh */ true)
          .then(async token => {
            console.log('signup firebase id token', token);
            await AsyncStorage.setItem('token', token);
            // signup action
            dispatch({
              type: 'signup',
              payload: token,
            });
            // navigate
            navigation.navigate('Signin');
          })
          .catch(error => {
            console.log(error);
            dispatch({
              type: 'add_error',
              payload: t('AuthContext.SignupError') + '. ' + error,
            });
          });
      })
      .catch(error => {
        console.log(error);
        dispatch({
          type: 'add_error',
          payload: t('AuthContext.SignupError') + '. ' + error,
        });
      });
  };
};

// sign in
const signin = dispatch => {
  // use language
  const {t} = useTranslation();

  return async ({email, password, navigation}) => {
    // start auth action
    dispatch({
      type: 'start_auth',
    });
    // login using firebase
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(res => {
        // get the ID token
        const {currentUser} = firebase.auth();
        currentUser.getIdToken(/* forceRefresh */ true)
          .then(async token => {
            console.log('sigin firebase id token', token);
            await AsyncStorage.setItem('token', token);
            //// get message push token
            // request permission
            firebase.messaging().requestPermission();
            // get the device push token
            firebase
              .messaging()
              .getToken()
              .then(pushToken => {
                console.log('push token', pushToken);
                //// create a new user doc or update token if the user exists
                const userRef = firebase.firestore().collection('users').doc(currentUser.uid);
                userRef.get()
                .then(docSnapshot => {
                  console.log('[signin] doc snapshot', docSnapshot);
                  if (docSnapshot.exists) {
                    console.log('[signin] doc exist');
                    userRef.update({pushToken});
                  } else {
                    console.log('[signin] doc does not exist');
                    userRef.set({ 
                      pushToken,
                      name: '',
                      avatarUrl: '',
                      askCount: 0,
                      helpCount: 0,
                      votes: 0
                    });
                  }
                  // update the state with
                  dispatch({
                    type: 'signin',
                    payload: {token, pushToken},
                  });
                  // navigate to the main flow
                  navigation.navigate('mainFlow'); 
                })
                .catch(error => {
                  console.log('[signin] cannot get user doc', error);
                });
              }) // end of pushToken
              .catch(error => {
                console.log('getPushToken', error);
                dispatch({
                  type: 'add_error',
                  payload: t('AuthContext.getPushTokenError') + '. ' + error,
                });
              });
          }) // end of token
          .catch(error => {
            console.log('getToken', error);
            dispatch({
              type: 'add_error',
              payload: t('AuthContext.SigninTokenError') + '. ' + error,
            });
          });
      }) // end of signin
      .catch(error => {
        console.log('signin', error);
        dispatch({
          type: 'add_error',
          payload: t('AuthContext.SigninError') + '. ' + error,
        });
      });
  };
};

// sign out
const signout = dispatch => {
  return async ({ navigation }) => {
    // remove the token in the storage
    await AsyncStorage.removeItem('token');
    // dispatch signout action
    dispatch({ type: 'signout' });
    // navigate to loginFlow
    navigation.navigate('loginFlow');
  };
}

export const { Provider, Context } = createDataContext(
  authReducer,
  { signin, signup, signout, clearError, trySigninWithToken },
  { token: null, pushToken: null, errorMessage: '', loading: false }
);


