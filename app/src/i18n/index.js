// languages
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import DeviceInfo from 'react-native-device-info';

// import custom libraries
import ko from './ko.json';
import en from './en.json';

// multi-languages
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: cb => {
//    cb(DeviceInfo.getDeviceLocale().split('-')[0])
    cb('ko');
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
    resources: { ko, en },
  });