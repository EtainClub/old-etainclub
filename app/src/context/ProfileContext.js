import React from 'react';
import { Alert } from 'react-native';
import firebase from 'react-native-firebase'; 
// cumstom libraries
import createDataContext from './createDataContext';

// initial skill state
const INIT_SKILL = {
  id: null,
  name: '',
  main: false,
  votes: 0,
  needToUpdate: false
}
// populate array with the initial state
const INIT_SKILLS = new Array(5).fill(INIT_SKILL).map((item) => ({ 
  ...item, id: Math.random().toString()
}));

// initial location state
const INIT_LOCATION = {
  id: null,
  name: '',
  main: false,
  votes: 0,
  needToUpdate: false
}
// populate array with the initial state
const INIT_LOCATIONS = new Array(2).fill(INIT_LOCATION).map((item) => ({ 
  ...item, id: Math.random().toString()
}));


//// reducer
const profileReducer = (state, action) => {
  switch (action.type) {
    case 'update_profile':
      return { ...state, skills: action.payload.skills, locations: action.payload.locations };
    case 'update_skills':
      return { ...state, skills: action.payload };
    case 'update_locations':
      return { ...state, locations: action.payload };
    case 'update_skill':
      return {
        ...state,
        // update specific skill
        skills: state.skills.map((skill, i) => 
          i === action.payload.id ? 
          { ...skill, name: action.payload.name, needToUpdate: true } 
          : skill
        ),
        // set flag to need to update the db or contract
        needUpdateContract: true
      };
    case 'update_location':
      return {
        ...state,
        locations: state.locations.map((location, i) => 
          i === action.payload.id ? 
          { ...location, name: action.payload.name, needToUpdate: true } 
          : location
        ),
        // set flag to need to update the db or contract
        needUpdateContract: true
      };
    case 'update_user_state':
      return { ...state, userInfo: action.payload };
    case 'update_avatar':
      return { ...state, 
        userInfo: { ...state.userInfo, avatarUrl: action.payload }
      };
    case 'update_contract':
      return { ...state, loading: true };
    case 'update_contract_success':
      return { ...state, loading: false, needUpdateContract: false };
    default:
      return state;
  }
}

//// actions
// update skill with id
const updateSkill = dispatch => {
  return ({ id, skillName }) => {
    console.log('dispatch update skill');
    dispatch({
      type: 'update_skill',
      payload: { id, name: skillName }
    });
  }
};

// update location with id
const updateLocation = dispatch => {
  return ({ id, locationName, userId }) => {
    console.log('dispatch update location', id, locationName, userId);
    dispatch({
      type: 'update_location',
      payload: { id, name: locationName }
    });

    if (!userId) return;
    // update db, add new doc under the id
    // @todo for location, use number of verification instead of votes
    const userRef = firebase.firestore().doc(`users/${userId}`);
    userRef.collection('locations').doc(`${id}`).update({
      name: locationName,
      votes: 1
    });
  }
};

// update avatar url
const updateAvatarState = dispatch => {
  return async ({ userId, avatarUrl }) => {

    // reference to user info
    const userRef = firebase.firestore().doc(`users/${userId}`);
    // update name and avatar url
    await userRef.update({
      avatarUrl
    });     
    dispatch({
      type: 'update_avatar',
      payload: avatarUrl
    });
  }
};

// update user account
const updateAccount = dispatch => {
  return async ({ userId, name, avatarUrl, navigation }) => {
    const userInfo = { userId, name, avatarUrl };
    console.log('[updateUserInfo]', userInfo);
    //// update db
    // reference to user info
    const userRef = firebase.firestore().doc(`users/${userId}`);
    // update name and avatar url
    await userRef.update({
      name, avatarUrl
    }); 
    // update user state
    dispatch({
      type: 'update_user_state',
      payload: userInfo
    });
    // navigate
    navigation.navigate('Account');
  }
};

// update user info state
const updateUserInfoState = dispatch => {
  return ( userInfo ) => {
    console.log('[updateUserInfoState]', userInfo);
    // update state
    const userState = { 
      userId: userInfo.userId, 
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      votes: userInfo.votes,
      askCount: userInfo.askCount,
      helpCount: userInfo.helpCount 
    };
    dispatch({
      type: 'update_user_state',
      payload: userState
    });
  }
};

// update proifle state
const updateProfileInfo = dispatch => {
  return ({ skills, locations }) => {
    dispatch({ 
      type: 'update_profile',
      payload: {
        skills,
        locations
      }
  })
  };
}

// update skills state
const updateSkills = dispatch => {
  return ({ skills }) => {
    dispatch({ 
      type: 'update_skills',
      payload: skills,
    });
  }
}

// update locations state
const updateLocations = dispatch => {
  return ({ locations }) => {
    console.log('[updateLocations] locations', locations);
    dispatch({ 
      type: 'update_locations',
      payload: locations,
    });
  }
}

/*
// create initial profile and upload on firebase
const createInitialProfile = dispatch => {
  return async ({ userId }) => {
    // get the firebase doc ref
    const userRef = firebase.firestore().doc(`users/${userId}`);
    console.log('[createInitialProfile] userRef', userRef );
    // map over the skills and override the current skills
    skills.map(async (skill, id) => {
      console.log('[createInitialProfile] skill, id', skill.name, id);
      // add new doc under the id
      userRef.collection('skills').doc(`${id}`).set({
        name: skill.name,
        votes: skill.votes
      });
    });

    // map over the locations and override current locations
    locations.map(async (location, id) => {
      console.log('[createInitialProfile] location, id', location.name, id);
      // add new doc under the id
      userRef.collection('locations').doc(`${id}`).set({
        name: location.name,
        votes: location.votes
      });
    });
  };
};
*/

// update smart contract
const updateContract = dispatch => {
  return async ({ userId, skills, locations }) => {
    console.log('[updateContract]');
    dispatch({ type: 'update_contract' });
    //// put skills and locations on firestore
    // get the firebase doc ref
    const userRef = firebase.firestore().doc(`users/${userId}`);
    console.log('[updateContract] userRef', userRef );
    // map over the skills and override the current skills
    // @todo update only the ones that need to be updated
    skills.map(async (skill, id) => {
      console.log('[updateContract] skill, id', skill.name, id);
      // add new doc under the id
      userRef.collection('skills').doc(`${id}`).set({
        name: skill.name,
        votes: skill.votes
      });
    });

    // map over the locations and override current locations
    // @todo update only the ones that need to be updated
    locations.map(async (location, id) => {
      console.log('[updateContract] location, id', location.name, id);
      // add new doc under the id
      userRef.collection('locations').doc(`${id}`).set({
        name: location.name,
        votes: location.votes
      });
    });

    dispatch({ type: 'update_contract_success' });
  };
};

//// reduer, actions, state
export const { Provider, Context } = createDataContext(
  profileReducer,
  { updateContract,
    updateUserInfoState, updateAccount, updateAvatarState,
    updateSkill, updateLocation, updateProfileInfo,
    updateSkills, updateLocations,
  },
  { 
    userInfo: {}, 
    skills: INIT_SKILLS, skill: '', locations: INIT_LOCATIONS, location: '', 
    needUpdateContract: false, loading: false 
  }
);

    /*
    // first remove the current existing skill documents
    await userRef.collection('skills').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
//        console.log('skill doc', doc);
        doc.ref.delete();
      });
    })
    .catch(error => {
      console.log('error! cannot delete the skills collection', error);
    })

    // remove the current existing locations documents
    await userRef.collection('locations').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
//        console.log('location doc', doc);
        doc.ref.delete();
      });
    })
    .catch(error => {
      console.log('error! cannot delete the locations collection', error);
    })
    */
