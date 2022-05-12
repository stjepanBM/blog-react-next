// import firebase from 'firebase/compat/app'
// import 'firebase/compat/auth'
// import 'firebase/compat/firestore'
// import 'firebase/compat/storage'

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, where, getDocs, query, limit } from "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
    apiKey: "AIzaSyAcUmHPxDAuhYmbhdDxc1m9Ds2qoO9TJMA",
    authDomain: "blog-513a5.firebaseapp.com",
    projectId: "blog-513a5",
    storageBucket: "blog-513a5.appspot.com",
    messagingSenderId: "31598133537",
    appId: "1:31598133537:web:6fe12866b831f22ca9be60"
}


// if (!firebase.apps.length)
// {
//     firebase.initializeApp(firebaseConfig)
// }

function createFirebaseApp(config)
{
    try
    {
        return getApp();
    } catch {
        return initializeApp(config);
    }
}


const firebaseApp = createFirebaseApp(firebaseConfig);

// export const auth = firebase.auth();
// export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

// export const firestore = firebase.firestore();

export const firestore = getFirestore(firebaseApp);
// export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// export const storage = firebase.storage();
export const storage = getStorage(firebaseApp);
export const STATE_CHANGED = 'state_changed';


/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */

export async function getUserWithUsername(username)
{
    // const usersRef = firestore.collection('users');
    // const query = usersRef.where('username', '==', username).limit(1);

    // const userDoc = (await query.get()).docs[0];
    // return userDoc;


    const q = query(
        collection(firestore, 'users'),
        where('username', '==', username),
        limit(1)
    )
    const userDoc = (await getDocs(q)).docs[0];
    return userDoc;
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc)
{
    const data = doc.data();
    return {
        ...data,
        createdAt: data?.createdAt.toMillis() || 0,
        updatedAt: data?.updatedAt.toMillis() || 0,
    }
}