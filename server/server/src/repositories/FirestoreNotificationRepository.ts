import type { INotificationRepository } from "../interfaces/INotificationRepository.js";
import type { Notification } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const notificationsCollection = db.collection("notifications");

export class FirestoreNotificationRepository implements INotificationRepository {
  async list(orgId: string, userId: string): Promise<Notification[]> {
    try {
      const snapshot = await notificationsCollection
        .where("orgId", "==", orgId)
        .where("userId", "==", userId)
        .get();
      const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
      notifications.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return notifications;
    } catch (error) {
      console.error("[FirestoreNotificationRepository] Error listing notifications:", error);
      throw error;
    }
  }

  async create(
    orgId: string,
    input: Omit<Notification, "id" | "createdAt" | "read">
  ): Promise<Notification> {
    try {
      const now = new Date().toISOString();
      const notificationData = {
        ...input,
        orgId,
        read: false,
        createdAt: now,
      };
      const docRef = await notificationsCollection.add(notificationData);
      return { id: docRef.id, ...notificationData } as Notification;
    } catch (error) {
      console.error("[FirestoreNotificationRepository] Error creating notification:", error);
      throw error;
    }
  }

  async markAsRead(orgId: string, userId: string, id: string): Promise<Notification | null> {
    try {
      const docRef = notificationsCollection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      const notification = { id: doc.id, ...doc.data() } as Notification;
      if (notification.orgId !== orgId || notification.userId !== userId) return null;

      await docRef.update({ read: true });
      return { ...notification, read: true };
    } catch (error) {
      console.error("[FirestoreNotificationRepository] Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(orgId: string, userId: string): Promise<boolean> {
    try {
      const snapshot = await notificationsCollection
        .where("orgId", "==", orgId)
        .where("userId", "==", userId)
        .where("read", "==", false)
        .get();

      if (snapshot.empty) return true;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
      console.log(`[FirestoreNotificationRepository] Marked ${snapshot.size} notifications as read`);
      return true;
    } catch (error) {
      console.error("[FirestoreNotificationRepository] Error marking all notifications as read:", error);
      throw error;
    }
  }

  async countUnread(orgId: string, userId: string): Promise<number> {
    const snapshot = await notificationsCollection
      .where("orgId", "==", orgId)
      .where("userId", "==", userId)
      .where("read", "==", false)
      .count()
      .get();
    return snapshot.data().count;
  }
}
