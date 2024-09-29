import firebaseConfig from './firebaseConfig.js';
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

export { db };