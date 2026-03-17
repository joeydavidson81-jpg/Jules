// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the values below with your own Firebase project configuration.
// Find them in: Firebase Console → Project Settings → Your Apps → SDK setup
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCHY0lA-TwHeOhL2eAeiyV6KzvCUwi6OPA',
  authDomain: 'nc-prison-ministry.firebaseapp.com',
  projectId: 'nc-prison-ministry',
  storageBucket: 'nc-prison-ministry.firebasestorage.app',
  messagingSenderId: '64130255239',
  appId: '1:64130255239:web:26be8691e8330ac1d16b22',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
