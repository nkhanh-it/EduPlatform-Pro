import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';

const DEFAULT_ADMIN = {
    email: 'admin@edusmart.com',
    password: 'admin123',
    name: 'Admin EduSmart',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0d7ff2&color=fff&bold=true',
};

export async function seedDefaultAdmin(): Promise<void> {
    try {
        // Check if any admin account already exists in Firestore
        const q = query(collection(db, 'users'), where('role', '==', 'admin'));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log('[Seed] Admin account already exists, skipping.');
            return;
        }

        console.log('[Seed] No admin found. Creating default admin account...');

        // Save reference to the current user before creating admin
        const currentUser = auth.currentUser;

        // Create admin account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            DEFAULT_ADMIN.email,
            DEFAULT_ADMIN.password
        );

        // Save admin info to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: DEFAULT_ADMIN.name,
            email: DEFAULT_ADMIN.email,
            role: DEFAULT_ADMIN.role,
            avatar: DEFAULT_ADMIN.avatar,
            createdAt: new Date(),
        });

        console.log('[Seed] Default admin created successfully!');
        console.log(`[Seed] Email: ${DEFAULT_ADMIN.email}`);
        console.log(`[Seed] Password: ${DEFAULT_ADMIN.password}`);

        // Sign out the newly created admin so user isn't auto-logged in
        await signOut(auth);

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('[Seed] Admin email already registered in Auth.');
        } else {
            console.error('[Seed] Error creating default admin:', error);
        }
    }
}
