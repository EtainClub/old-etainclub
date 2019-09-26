import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList } from 'react-native';
import { NavigationEvents, SafeAreaView } from 'react-navigation';
import { Text, Button, Input, Card, SearchBar, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import firebase from 'react-native-firebase'; 
import moment from 'moment';


const ChatListScreen = ({ navigation }) => {
  console.log('chatlist screen');
  // setup language
  const { t } = useTranslation();
  // state
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState([]);

  useEffect(() => {
    // get chat list
    getCaseList();
  }, []);

  getCaseList = async () => {
    console.log('getting chat list');
    // get user id
    const { currentUser } = firebase.auth();
    // cases ref
    const casesRef = firebase.firestore().collection('cases');
    console.log('casesRef', casesRef);
    // query
    let matchedCases = [];
    await casesRef.where('senderId', '==', currentUser.uid).get()
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
  /*        matchedCases2.push({
            key: doc.id,
            doc,
          });*/
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
  } 

  onItemPress = ({ caseId, helperId }) => {
    // navigate to chatting with case id
    navigation.navigate('Chatting', { caseId, helperId });
  }

  renderItem = ({ item }) => (
    <ListItem
      title={item.message}
      subtitle={item.createdAt}
      leftIcon={ item.voted ? { name: 'thumb-up' } : {} } 
      bottomDivider
      chevron
      onPress={() => onItemPress({ caseId: item.docId, helperId: item.helperId })}
    />
  )

  renderChatList = () => {
    return ( 
      <FlatList
        keyExtractor={item => item.docId}
        data={cases}
        renderItem={renderItem}
      />
    );
  }

  return (    
    <SafeAreaView forceInset={{ top: 'always' }}>
      {renderChatList()}
    </SafeAreaView>
  );
}

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

const styles = StyleSheet.create({

});

export default ChatListScreen;
