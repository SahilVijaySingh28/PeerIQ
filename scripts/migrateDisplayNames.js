/**
 * Migration script to ensure all users have displayName set in Firestore
 * Run this once to update all existing user documents
 * 
 * Usage: node scripts/migrateDisplayNames.js
 */

const {
  initializeApp,
  applicationDefault,
  cert,
} = require('firebase-admin/app');
const {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID || 'peeriq-project',
});

const db = getFirestore(app);

async function migrateDisplayNames() {
  console.log('Starting migration of displayName fields...');

  try {
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Check if displayName is missing or empty
      if (!userData.displayName || userData.displayName.trim() === '') {
        // Use name as fallback, or email if name is also missing
        const displayName = userData.name || userData.email || 'Unknown User';

        try {
          await updateDoc(doc(db, 'users', userId), {
            displayName: displayName,
            updatedAt: new Date().toISOString(),
          });

          console.log(`✓ Updated user ${userId}: displayName = "${displayName}"`);
          updatedCount++;
        } catch (error) {
          console.error(`✗ Failed to update user ${userId}:`, error.message);
        }
      } else {
        console.log(`⊘ Skipped user ${userId}: displayName already set to "${userData.displayName}"`);
        skippedCount++;
      }
    }

    console.log('\n✓ Migration complete!');
    console.log(`  Updated: ${updatedCount} users`);
    console.log(`  Skipped: ${skippedCount} users`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDisplayNames();
