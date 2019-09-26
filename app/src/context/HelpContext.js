import React from 'react';
import { Alert } from 'react-native';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import firebase from 'react-native-firebase'; 
import createDataContext from './createDataContext';

//// reducer
const helpReducer = (state, action) => {
  switch(action.type) {
    case 'accept_request':
      console.log('[helpReducer] state', state);
      return { ...state, askAccepted: true, userId: action.payload };
    case 'ask_received':
      console.log('ask_received payload', action.payload);
      return {
        askAccepted: false,
        senderId: action.payload.senderId,
        caseId: action.payload.caseId,
        notificationBody: action.payload.body,
        notificationTitle: action.payload.title
      };
    default:
      return state;
  }
}

//// actions
// ask request message received
const askReceived = dispatch => {
  return (notification) => {
    console.log('askReceived data', notification.data);
    dispatch({
      type: 'ask_received',
      payload: notification.data
    });
  };
}

// count help cases of the given user
const countHelpCases = async ({ userId }) => {
  // reference to cases
  const casesRef = firebase.firestore().collection('cases');
  // query
  let helpCount = 0;
  await casesRef.where('helperId', '==', userId).get()
  .then(snapshot => {
    if (snapshot.empty) {
      console.log('No matching docs');
      return;
    }
    helpCount = snapshot.size;
    console.log('[HelpContext] helpCount', helpCount);
  })
  .catch(error => {
    console.log('cannot query help cases', error);
  });
  
  return helpCount;
}

const acceptRequest = dispatch => {
  // use multi language
  const { t } = useTranslation();

  return async ({ caseId, navigation }) => {
    console.log('acceptRequest dispatch caseId', caseId);
    // case ref
    const caseRef = firebase.firestore().collection('cases').doc(`${caseId}`)
    // get user id
    const { currentUser } = firebase.auth();
    const userId = currentUser.uid;

    // check if someone else has accepted the request first
    let accepted = false;
    await caseRef.get()
    .then(doc => {
      // check if doc exists
      if (!doc.exists) {
        alert(t('HelpScreen.canceledByClient'));
        accepted = true;
        return;        
      }
      console.log('[acceptRequest] case doc', doc);
      accepted = doc.data().accepted;
      if (accepted) {
        console.log('[acceptRequest] the request has been aleady accepted', doc);
        alert(t('HelpScreen.alreadyAccepted'));
      }      
    })
    .catch((error) => {
      console.log('[acceptRequest]failed to update the document, error:', error);
      alert(t('HelpScreen.canceledByClient'));
    });
    if (accepted ) return;

    // update the cases db with caseId
    // new approach save helperid and time in case doc
    await caseRef.update({ accepted: true, helperId: userId, createdAt: new Date() })
    .then(async () => {
      // update state
      dispatch({
        type: 'accept_request',
        payload: userId
      });

      // update helpcount of this user
      countHelpCases({ userId })
      .then(helpCount => {
        const userRef = firebase.firestore().doc(`users/${userId}`);
        // update the ask count of the current user
        userRef.update({ helpCount });           
      });
      
      console.log('[acceptRequest] updated the document');
      // navigate to chat screen with param to set user as helper
      navigation.navigate('Chatting', { chatUserId: 2, caseId, helperId: userId });
    })
    .catch((error) => {
      console.log('[acceptRequest]failed to update the document, error:', error);
      alert(t('HelpScreen.canceledByClient'));
    });
  }
}


//// export provider and context
export const { Provider, Context } = createDataContext(
  helpReducer,
  { askReceived, acceptRequest },
  { askAccepted: false, notificationBody: '', notificationTitle: '', 
    senderId: null, userId: null, caseId: null, loading: false }
);