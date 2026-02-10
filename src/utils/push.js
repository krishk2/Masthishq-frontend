import axios from 'axios';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const subscribeToPush = async (apiBase) => {
    if (!('serviceWorker' in navigator)) {
        console.error("Service Worker not supported");
        return false;
    }

    try {
        // 1. Check Permission First
        if (Notification.permission === 'denied') {
            alert("Please enable notification permissions in your browser settings for this site.");
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.error("Permission not granted for Notification");
            return false;
        }

        // 2. Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log("SW Registered:", registration);

        // 2.5 Unsubscribe existing if any (Invalidates old keys)
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
            console.log("Unsubscribing old subscription...");
            await existingSub.unsubscribe();
        }

        // 3. Get VAPID Key from Backend
        const keyRes = await axios.get(`${apiBase}/reminders/vapid-key`);
        const publicKey = keyRes.data.public_key;

        if (!publicKey) {
            console.error("No VAPID key returned from server");
            return false;
        }

        // 4. Subscribe (New)
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // 4. Send Subscription to Backend
        await axios.post(`${apiBase}/reminders/subscribe`, subscription);
        console.log("Push Subscribed!", subscription);
        return true;

    } catch (error) {
        console.error("Push Error:", error);
        return false;
    }
};
