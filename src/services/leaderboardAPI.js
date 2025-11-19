import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  writeBatch,
  increment,
  updateDoc,
} from 'firebase/firestore';

class LeaderboardAPI {
  /**
   * Calculate points based on user contributions
   * Resources: 10 points each
   * Messages: 1 point each
   * Group memberships: 5 points each
   * Resource ratings: 2 points per rating
   */
  async calculateUserPoints(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return 0;
      }

      const userData = userDoc.data();
      let points = 0;

      // Points for resources uploaded
      const resourcesRef = collection(db, 'resources');
      const userResourcesQuery = query(
        resourcesRef,
        where('ownerId', '==', userId)
      );
      const resourcesSnapshot = await getDocs(userResourcesQuery);
      points += resourcesSnapshot.size * 10;

      // Points for resources ratings received
      resourcesSnapshot.forEach(doc => {
        const resource = doc.data();
        if (resource.ratings && Array.isArray(resource.ratings)) {
          points += resource.ratings.length * 2;
        }
      });

      // Points for group memberships
      const groupsRef = collection(db, 'groups');
      const userGroupsQuery = query(
        groupsRef,
        where('members', 'array-contains', userId)
      );
      const groupsSnapshot = await getDocs(userGroupsQuery);
      points += groupsSnapshot.size * 5;

      // Points for group announcements
      const announcementsRef = collection(db, 'announcements');
      const userAnnouncementsQuery = query(
        announcementsRef,
        where('authorId', '==', userId)
      );
      const announcementsSnapshot = await getDocs(userAnnouncementsQuery);
      points += announcementsSnapshot.size * 8;

      // Bonus points for announcements with likes/comments
      announcementsSnapshot.forEach(doc => {
        const announcement = doc.data();
        const likes = (announcement.likes || []).length;
        const comments = (announcement.comments || []).length;
        points += likes * 1 + comments * 2;
      });

      return points;
    } catch (error) {
      console.error('Error calculating user points:', error);
      return 0;
    }
  }

  /**
   * Get top users for leaderboard
   */
  async getTopUsers(limit_count = 50) {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      if (usersSnapshot.empty) {
        return [];
      }

      // Calculate points for each user
      const usersWithPoints = await Promise.all(
        usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const points = await this.calculateUserPoints(doc.id);
          return {
            id: doc.id,
            ...userData,
            points,
          };
        })
      );

      // Sort by points descending and take top users
      return usersWithPoints
        .sort((a, b) => b.points - a.points)
        .slice(0, limit_count)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
        }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  /**
   * Get leaderboard for a specific time period
   */
  async getLeaderboardByTimePeriod(period = 'all-time', limit_count = 50) {
    try {
      const users = await this.getTopUsers(limit_count);
      
      // For time-based filtering, we'd need to track timestamps
      // This is a simplified version that returns all-time for now
      // Future implementation: track contribution dates and filter accordingly
      return users;
    } catch (error) {
      console.error('Error fetching leaderboard by time period:', error);
      return [];
    }
  }

  /**
   * Get leaderboard filtered by category/department
   */
  async getLeaderboardByCategory(category = 'all', limit_count = 50) {
    try {
      if (category === 'all') {
        return await this.getTopUsers(limit_count);
      }

      const usersRef = collection(db, 'users');
      const categoryQuery = query(
        usersRef,
        where('department', '==', category)
      );
      const usersSnapshot = await getDocs(categoryQuery);

      if (usersSnapshot.empty) {
        return [];
      }

      // Calculate points for each user
      const usersWithPoints = await Promise.all(
        usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const points = await this.calculateUserPoints(doc.id);
          return {
            id: doc.id,
            ...userData,
            points,
          };
        })
      );

      // Sort by points and add rank
      return usersWithPoints
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
        }));
    } catch (error) {
      console.error('Error fetching leaderboard by category:', error);
      return [];
    }
  }

  /**
   * Get user rank and stats
   */
  async getUserRankAndStats(userId) {
    try {
      const allUsers = await this.getTopUsers(500);
      const userRank = allUsers.find(u => u.id === userId);

      if (!userRank) {
        return null;
      }

      // Calculate contributions
      const resourcesRef = collection(db, 'resources');
      const userResourcesQuery = query(
        resourcesRef,
        where('ownerId', '==', userId)
      );
      const resourcesSnapshot = await getDocs(userResourcesQuery);

      const groupsRef = collection(db, 'groups');
      const userGroupsQuery = query(
        groupsRef,
        where('members', 'array-contains', userId)
      );
      const groupsSnapshot = await getDocs(userGroupsQuery);

      const announcementsRef = collection(db, 'announcements');
      const userAnnouncementsQuery = query(
        announcementsRef,
        where('authorId', '==', userId)
      );
      const announcementsSnapshot = await getDocs(userAnnouncementsQuery);

      let totalRatings = 0;
      resourcesSnapshot.forEach(doc => {
        const resource = doc.data();
        if (resource.ratings && Array.isArray(resource.ratings)) {
          totalRatings += resource.ratings.length;
        }
      });

      return {
        ...userRank,
        contributions: {
          resources: resourcesSnapshot.size,
          groups: groupsSnapshot.size,
          announcements: announcementsSnapshot.size,
          ratings: totalRatings,
        },
      };
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  }

  /**
   * Get departments/categories for filtering
   */
  async getDepartments() {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const departments = new Set();
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.department) {
          departments.add(userData.department);
        }
      });

      return Array.from(departments).sort();
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  /**
   * Award badges to users based on achievements
   */
  async awardBadges(userId) {
    try {
      const badges = [];
      const userStats = await this.getUserRankAndStats(userId);

      if (!userStats) return badges;

      // Award badges based on contributions
      if (userStats.points >= 5000) {
        badges.push('Top Contributor');
      }
      if (userStats.contributions.resources >= 50) {
        badges.push('Resource Master');
      }
      if (userStats.contributions.groups >= 10) {
        badges.push('Community Builder');
      }
      if (userStats.contributions.ratings >= 100) {
        badges.push('Mentor');
      }
      if (userStats.rank === 1) {
        badges.push('Champion');
      }
      if (userStats.rank <= 10) {
        badges.push('Rising Star');
      }

      return badges;
    } catch (error) {
      console.error('Error awarding badges:', error);
      return [];
    }
  }

  /**
   * Get top 3 users for this week and award weekly badges
   */
  async getWeeklyTopUsers() {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      if (usersSnapshot.empty) {
        return [];
      }

      // Calculate weekly points for each user
      const usersWithWeeklyPoints = await Promise.all(
        usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          let weeklyPoints = 0;

          // Get resources uploaded this week
          const resourcesRef = collection(db, 'resources');
          const userResourcesQuery = query(
            resourcesRef,
            where('ownerId', '==', doc.id)
          );
          const resourcesSnapshot = await getDocs(userResourcesQuery);
          const weeklyResources = resourcesSnapshot.docs.filter(r => {
            const uploadDate = new Date(r.data().uploadDate);
            return uploadDate >= weekStart;
          });
          weeklyPoints += weeklyResources.length * 10;

          // Get announcements this week
          const announcementsRef = collection(db, 'announcements');
          const userAnnouncementsQuery = query(
            announcementsRef,
            where('authorId', '==', doc.id)
          );
          const announcementsSnapshot = await getDocs(userAnnouncementsQuery);
          const weeklyAnnouncements = announcementsSnapshot.docs.filter(a => {
            const createdDate = new Date(a.data().createdAt);
            return createdDate >= weekStart;
          });
          weeklyPoints += weeklyAnnouncements.length * 8;

          return {
            id: doc.id,
            ...userData,
            weeklyPoints,
          };
        })
      );

      // Sort by weekly points and return top 3
      return usersWithWeeklyPoints
        .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
        .slice(0, 3)
        .map((user, index) => ({
          ...user,
          weeklyRank: index + 1,
          weeklyBadge: index === 0 ? 'Weekly Champion' : index === 1 ? 'Weekly Runner-up' : 'Weekly Third Place',
        }));
    } catch (error) {
      console.error('Error fetching weekly top users:', error);
      return [];
    }
  }

  /**
   * Award weekly badges to top 3 users
   */
  async awardWeeklyBadges() {
    try {
      const topWeeklyUsers = await this.getWeeklyTopUsers();

      for (const user of topWeeklyUsers) {
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const badges = userData.badges || [];
          const weeklyBadges = badges.filter(b =>
            !b.includes('Weekly')
          );

          // Add the new weekly badge
          weeklyBadges.push(user.weeklyBadge);

          // Keep only last 5 weekly badges
          const sortedBadges = weeklyBadges.slice(-5);

          await updateDoc(userRef, {
            badges: sortedBadges,
          });
        }
      }

      return topWeeklyUsers;
    } catch (error) {
      console.error('Error awarding weekly badges:', error);
      return [];
    }
  }
}

const leaderboardAPI = new LeaderboardAPI();
export default leaderboardAPI;
