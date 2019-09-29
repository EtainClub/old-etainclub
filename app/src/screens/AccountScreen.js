import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, Card, Avatar, Divider } from 'react-native-elements';
import { SafeAreaView, NavigationEvents } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import firebase from 'react-native-firebase'; 

// custom libraries
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ProfileContext } from '../context/ProfileContext';
import Spacer from '../components/Spacer';

const AccountScreen = ({ navigation }) => {
  // setup language
  const { t } = useTranslation();

  // use auth context; state, action, default value
  const { signout } = useContext( AuthContext );
  // use profile context
  const { state, updateUserInfoState, updateLocations } = useContext( ProfileContext );

  // use state
  const [userInfo, setUserInfo] = useState('');

  // get reference to the current user
  const { currentUser } = firebase.auth();
  const userId = currentUser.uid;

  // use effect
  useEffect(() => {
    getUserInfo();
  }, []);

  
  getUserInfo = async () => {
    // reference to user info
    const userRef = firebase.firestore().doc(`users/${userId}`);
    await userRef.get()
    .then(doc => {
      // check if the user detailed info exists
      if (typeof doc.data().name == 'undefined') {
        console.log('name is undefined');
      } 
      // get detailed info
      setUserInfo(doc.data());
      // read the ask and help cases
      let askCount = 0;
      // resolve the promise
      countAskCases()
      .then(count => {
        askCount = count;
      });
      let helpCount = 0;
      // resolve the promise
      countHelpCases()
      .then(count => {
        helpCount = count;
      });
      // update user state with initial state
      updateUserInfoState({ 
        userId: currentUser.uid,
        name: doc.data().name || '',
        avatarUrl: doc.data().avatarUrl || '',
        votes: doc.data().votes || 0,
        askCount,
        helpCount
      });
    })
    .catch(error => {
      console.log('Failed to get user info', error);
    });

    // get locations
    let locations = [];
    await userRef.collection('locations').get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching docs');
        return;
      }  
      snapshot.forEach(doc => {
        locations.push(doc.data());
      });
      updateLocations({ locations });
    })
    .catch(error => {
      console.log('cannot get location data', error);
    });
  }

  countAskCases = async () => {
    // reference to cases
    const casesRef = firebase.firestore().collection('cases');
    // query
    let askCount = 0;
    await casesRef.where('senderId', '==', userId).get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching docs');
        return;
      }
      // count but ignore not accepted case
      snapshot.forEach(doc => {
        if (doc.accepted) {
          askCount++;
        }
      });
      console.log('askcount', askCount);
    })
    .catch(error => {
      console.log('cannot query ask cases', error);
    });    
    // @todo update state info
    return askCount;
  }

  countHelpCases = async () => {
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
      console.log('helpcount', helpCount);
    })
    .catch(error => {
      console.log('cannot query help cases', error);
    });    
    // @todo update state info
    return helpCount;
  }

  onProfilePress = () => {
    navigation.navigate('ProfileContract');
  }

  onEditAvatarPress = () => {
    navigation.navigate('AccountEdit', { userId: currentUser.uid });
  }

  return (
    <SafeAreaView forceInset={{ top: 'always' }}>
      <View>
        <Card wrapperStyle={styles.accountContainer}>
          <Avatar 
            size="large"
            rounded
            source={{
              uri: userInfo.avatarUrl,
            }} 
            showEditButton
            onEditPress={onEditAvatarPress}
          />
          <View style={styles.nickContainer}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{state.userInfo.name}</Text>
              <Button
                buttonStyle={{ height: 20, margin: 5 }} 
                type="outline"
                title={t('AccountScreen.signoutButton')}
                onPress={() => {signout({ navigation })}}
              />
            </View>
            <Spacer>
              <View style={{ flexDirection: "row" }}>
              <Icon
                name='map-marker'
                size={20}
              />
              <Text style={{ fontSize: 16, marginLeft: 7 }}>{ state.locations[0].name ? 
                state.locations[0].name 
                : t('AccountScreen.locationPlaceholder')}</Text>
              </View>
            </Spacer>
          </View>
        </Card>

        <Card
          title={t('AccountScreen.profileTitle')}
        >
          <Spacer>
          <View style={styles.accountContainer}>
            <Icon
              name='hand-o-left'
              size={40}
              color={'#353535'}
            />
            <View style={{ marginHorizontal: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{t('AccountScreen.askCases')}</Text>
              <Text style={{ fontSize: 16 }}>{userInfo.askCount? userInfo.askCount : "0"} {t('case')}</Text>
            </View>
          </View>
          </Spacer>
          <Spacer>
          <View style={styles.accountContainer}>
            <Icon
              name='hand-o-right'
              size={40}
              color={'#353535'}
            />
            <View style={{ marginHorizontal: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{t('AccountScreen.helpCases')}</Text>
              <Text style={{ fontSize: 16 }}>{userInfo.helpCount? userInfo.helpCount : "0"} {t('case')}</Text>
            </View>
          </View>
          </Spacer>
          <Spacer>
          <View style={styles.accountContainer}>
            <Icon
              name='thumbs-o-up'
              size={40}
              color={'#353535'}
            />
            <View style={{ marginHorizontal: 25 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{t('AccountScreen.votes')}</Text>
              <Text style={{ fontSize: 16 }}>{userInfo.votes? userInfo.votes : "0"} {t('case')}</Text>
            </View>
          </View>
          </Spacer>
          <Spacer>
          <Button
            buttonStyle={{ height: 50 }}
            titleStyle={{ fontSize: 24, fontWeight: 'bold' }}     
            title={t('AccountScreen.profileButton')}
            onPress={onProfilePress}
          />
          </Spacer>
        </Card>
      </View>
    </SafeAreaView>
  );
};

AccountScreen.navigationOptions = () => {
  return {
    title: i18next.t('AccountScreen.header'),
    headerStyle: {
      backgroundColor: '#07a5f3',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }
};

// styles
const styles = StyleSheet.create({
  accountContainer: {
    flexDirection: "row",
    justifyContent: 'flex-start'
  },
  nickContainer: {
    marginHorizontal: 20
  }
});

export default AccountScreen;