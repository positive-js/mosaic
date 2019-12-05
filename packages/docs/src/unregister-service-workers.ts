/**
 * Unregisters all currently registered service workers and returns a boolean that indicates
 * whether there were service workers registered or not.
 */
export async function unregisterServiceWorkers(): Promise<boolean> {
    if (!navigator.serviceWorker) {
        return false;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();

    // Walk through every currently registered Service Worker and unregister it.
    registrations.forEach((registration) => registration.unregister());

    return registrations.length > 0;
}
