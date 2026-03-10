import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const addTestUser = async () => {
  const docRef = await addDoc(collection(db, 'users'), {
    name: 'Man',
    email: 'man@test.com',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const fetchUsersFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Firestore Users:", users);
    return users;
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
    return [];
  }
};
