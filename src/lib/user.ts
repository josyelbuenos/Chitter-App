import { db } from '@/lib/firebase';
import { ref, get, set, update } from 'firebase/database';

export const generateUniqueNumber = async (): Promise<string> => {
    let isUnique = false;
    let newNumber = '';
    while (!isUnique) {
      // 7 digit number
      newNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
      const numberRef = ref(db, `numbers/${newNumber}`);
      const snapshot = await get(numberRef);
      if (!snapshot.exists()) {
        isUnique = true;
      }
    }
    return newNumber;
};

export const createNewUserProfile = async (uid: string, username:string): Promise<void> => {
    const userRef = ref(db, `users/${uid}`);
    const userSnapshot = await get(userRef);

    // If the profile already exists with a number, do nothing. This prevents the loop.
    if (userSnapshot.exists() && userSnapshot.val().number) {
        return;
    }

    const newNumber = await generateUniqueNumber();

    const newUserProfileData = {
        username: username.trim(),
        displayName: username.trim(),
        bio: 'Bem-vindo(a) ao Chitter!',
        photoURL: '',
        number: newNumber,
        contacts: {},
        groups: {}
    };

    // Use a multi-location update to ensure atomicity
    const updates: { [key: string]: any } = {};
    updates[`/users/${uid}`] = newUserProfileData;
    updates[`/numbers/${newNumber}`] = { uid: uid, username: username.trim() };

    await update(ref(db), updates);
};
