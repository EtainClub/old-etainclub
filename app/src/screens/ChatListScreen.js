import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList} from 'react-native';
import {NavigationEvents, SafeAreaView} from 'react-navigation';
import {ListItem} from 'react-native-elements';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import firebase from 'react-native-firebase';
import moment from 'moment';

const ChatListScreen = ({navigation}) => {
  console.log('chatlist screen');
  // setup language
  const {t} = useTranslation();
  // state
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState([]);

  useEffect(() => {
    // get chat list of sender
    getCaseList('senderId');
    // get chat list of heper
    getCaseList('helperId');
  }, []);

  const getCaseList = async userIdType => {
    console.log('getting chat list');
    // get user id
    const {currentUser} = firebase.auth();
    // cases ref
    const casesRef = firebase.firestore().collection('cases');
    console.log('casesRef', casesRef);
    // query
    let matchedCases = [];
    // get chat list of sender
    await casesRef
      .where(userIdType, '==', currentUser.uid)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching docs');
          return;
        }
        console.log('snapshot', snapshot);
        snapshot.forEach(doc => {
          let docItem = doc.data();
          // check sanity, acceptance
          if (!docItem.accepted) {
            console.log('Warning the case is not accepted!!!');
          } else {
            console.log('[ChatListScreen] docItem', docItem);
            docItem.docId = doc.id;
            docItem.createdAt = moment(docItem.createdAt.toDate()).format('ll');
            matchedCases.push(docItem);
            console.log(doc.id, '=>', docItem);
          }
        });
        // update state
        setCases(matchedCases);
        console.log('matchedCases', matchedCases);
      })
      .catch(error => {
        console.log('cannot query cases', error);
      });
  };

  const onItemPress = ({caseId, helperId}) => {
    // navigate to chatting with case id
    navigation.navigate('Chatting', {caseId, helperId});
  };

  const renderItem = ({item}) => (
    <ListItem
      title={item.message}
      subtitle={item.createdAt}
      leftIcon={ item.voted ? { name: 'thumb-up' } : {} } 
      bottomDivider
      chevron
      onPress={() => onItemPress({caseId: item.docId, helperId: item.helperId})}
    />
  );

  const renderChatList = () => {
    return (
      <FlatList
        keyExtractor={item => item.docId}
        data={cases}
        renderItem={renderItem}
      />
    );
  };

  return (
    <SafeAreaView forceInset={{ top: 'always' }}>
      {renderChatList()}
    </SafeAreaView>
  );
};

ChatListScreen.navigationOptions = () => {
  return {
    title: i18next.t('ChatListScreen.header'),
    headerStyle: {
      backgroundColor: '#07a5f3',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };
};

export default ChatListScreen;
