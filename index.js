/**
 * @format
 */
import {AppRegistry} from 'react-native';
// code push
import codePush from "react-native-code-push";

import App from './app/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => codePush(App));
