import React, {useContext, useState} from 'react';
import {View, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {NavigationEvents, SafeAreaView} from 'react-navigation';
import {Text, Button, Input, Card} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import SplashScreen from 'react-native-splash-screen';


// custom libraries
import {Context as AskContext} from '../context/AskContext';
import Spacer from '../components/Spacer';

const AskScreen = ({navigation}) => {
  SplashScreen.hide();
  console.log('AskScreen');
  // setup language
  const {t} = useTranslation();
  // use auth context; state, action, default value
  const {state, requestHelp} = useContext(AskContext);
  // state
  const [message, setMessage] = useState('');

  const showRemoveIcon = () => {
//    if (message !== '') {
      return (
        <Icon
          style={{ left: 30, top: 5 }} 
          name='close'
          size={20}
          color={'#353535'}
          onPress={() => {setMessage('')}}
        />
      );
//    }
  }
  return (
    <SafeAreaView forceInset={{top: 'always'}}>
      <Card>
        <Spacer>
          <View style={styles.guide}>
          <Text style={styles.guideText}>{t('AskScreen.guideText')}</Text> 
          {showRemoveIcon()}
          </View>
        </Spacer>
        <TextInput
          style={styles.input}
          multiline
          value={message}
          onChangeText={setMessage}
          placeholder={t('AskScreen.placeholder')}
        />
      </Card>
      <Spacer>
        <Button
          buttonStyle={{height: 100}} 
          titleStyle={{fontSize: 30, fontWeight: 'bold'}}
          title={t('AskScreen.button')}
          loading={state.loading}
          onPress={() => {
            // prohibit the double requesting
            if (!state.loading) {
              requestHelp({message, navigation});
            }
          }}
        />
      </Spacer>
    </SafeAreaView>
  );
};

AskScreen.navigationOptions = () => {
  return {
    title: i18next.t('AskScreen.header'),
    headerStyle: {
      backgroundColor: '#07a5f3',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    tabbarLabel: '도움 요청',
  };
};

// styles
const styles = StyleSheet.create({
  guide: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    height: 150, // 300
    padding: 10,
    fontSize: 18,
    borderColor: 'grey',
    borderWidth: 3,
  },
  guideText: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  }
});

export default AskScreen;