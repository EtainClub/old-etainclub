const functions = require('firebase-functions');
const admin = require('firebase-admin');
const i18n = require('i18next');

/*
var serviceAccount = require("path/to/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://etainclub-896c9.firebaseio.com"
});
*/

// initialize app
admin.initializeApp();

// send push notification
exports.sendMessage = functions.firestore
  .document('/cases/{caseId}').onCreate( async (snap, context) => {
    // change includes changed data in firestore
    console.log('snap: ', snap );
    // context includes params
    console.log('context: ', context );
    // get the created document data
    const docData = snap.data();
    console.log('created document data', docData);
    // get user id from the context params
    const sender = docData.senderId;
    // get the case id
    const caseId = context.params.caseId;
    // get primary language
    const language = docData.language;
    console.log('user language', language);
    /*
    // setup language
    i18n.init({
      fallbackLng: language,
      debug: true, 
      resources: {
          ko: {
            "translation": {
              "header": '[helpus] 도움 요청',
            },
          },
          en: {
            "translation": {
              "header": '[helpus] help wanted',
            },
          },
        },
    });
    */
    // get users collection
    const users = admin.firestore().collection('users');
    // build push notification
    const payload = {
      notification: {
//        title: i18n.t('header'),
        title: "helpus",
        body: docData.message
      },
      data:{
//        title: i18n.t('header'),
        title: "helpus",
        body: docData.message,
        senderId: sender,
        caseId: caseId,
      },
    };

    // send message to users who prefer the language of the message
    // users.where('languages', 'array-contains', language).get()
    await users.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log('doc id', doc.id);
        console.log('doc languages', doc.data().languages);
        // do not send if the user does not prefer the language
        if (!doc.data().languages.includes(language)) {
          console.log('user does not incude the language', doc.data().languages);
          return;
        }
        // do not send notification to the sender
        if (doc.id !== sender) {
          // get the push token of a user
          pushToken = doc.data().pushToken;
          console.log('token, sending message', pushToken, payload);
          // send if push token exists
          if (pushToken) {
            // send notification trhough firebase cloud messaging (fcm)
            admin.messaging().sendToDevice(pushToken, payload);
          }
        } else {
          console.log( 'the sender is the same', doc.id, sender);
        }
      });
      return 'sent message to all users';
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
});