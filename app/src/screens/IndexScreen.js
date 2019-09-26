import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { Context as AuthContext } from '../context/AuthContext';


const IndexScreen = (props) => {
  const { signout } = useContext(AuthContext);

  console.log('indexScreen', props);
  
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={() => props.navigation.navigate('Signup')}>
      <View>
        <Text>{t('IndexScreen.title')}</Text>
        <Text>{t('IndexScreen.test')}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

});

export default IndexScreen;