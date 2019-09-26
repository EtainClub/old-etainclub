const functions = require('firebase-functions');
const admin = require('firebase-admin');
const i18n = require('i18next');

// initialize app
admin.initializeApp();

// send push notification
exports.sendMessage = functions.firestore
  .document('/cases/{caseId}').onCreate( async (snap, context) => {
    const promise = new Promise((resolve, reject) => {  
      i18n.init({
        lng: 'en', 
        fallbackLng: 'en',
        debug: true, 
        resources: {
            ko: {
              translation: {
                header: '이타인클럽 도움요청',
              },
            },
            en: {
              translation: {
                header: 'Etainclub Help!',
              },
            },
          },
        },
        (error, t) => {
          if (error == null) {
            resolve(t);
          } else {
            console.error(error);
            reject(error);
          }
        });
      });
    await promise;

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

    // get users collection
    const users = admin.firestore().collection('users');
    // build push notification
    const payload = {
      notification: {
        title: i18n.t('header'),
        body: docData.message
      },
      data:{
        title: i18n.t('header'),
        body: docData.message,
        senderId: sender,
        caseId: caseId,
      },
    };

    await users.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        // do not send notification to the sender
        if (doc.id !== sender) {
          // get the push token of a user
          pushToken = doc.data().pushToken;
          console.log('token, sending message', pushToken, payload);
          // send notification trhough firebase cloud messaging (fcm)
          admin.messaging().sendToDevice(pushToken, payload);
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