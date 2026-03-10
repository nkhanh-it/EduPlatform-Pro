import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from './apiTypes';

const USERS_COLLECTION = 'users';

export const firestoreService = {
    // --- User Operations ---

    // Get all users
    getUsers: async (): Promise<User[]> => {
        const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id // use string id from firebase or numeric id if mapped
        } as unknown as User));
    },

    // Get a single user by ID
    getUserById: async (id: string): Promise<User | null> => {
        const userDocRef = doc(db, USERS_COLLECTION, id);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return null;
        }
        return { ...userDoc.data(), id: userDoc.id } as unknown as User;
    },

    // Add a new user
    addUser: async (userData: Omit<User, 'id'>): Promise<string> => {
        const docRef = await addDoc(collection(db, USERS_COLLECTION), userData);
        return docRef.id;
    },

    // Update an existing user
    updateUser: async (id: string, updateData: Partial<User>): Promise<void> => {
        const userDocRef = doc(db, USERS_COLLECTION, id);
        // Remove id from updateData if it exists to avoid overwriting the document ID
        const { id: _, ...dataToUpdate } = updateData as any;
        await updateDoc(userDocRef, dataToUpdate);
    },

    // Delete a user
    deleteUser: async (id: string): Promise<void> => {
        const userDocRef = doc(db, USERS_COLLECTION, id);
        await deleteDoc(userDocRef);
    }
};
