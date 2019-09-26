// languages
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

// import custom libraries
import ko from './ko.json';
import en from './en.json';

// multi-languages
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: cb => {
    console.log('lang', RNLocalize.getLocales()[0].languageCode);
    cb(RNLocalize.getLocales()[0].languageCode);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko',
    debug: true,
    resources: {ko, en},
  });
