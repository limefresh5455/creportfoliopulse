import React, { createContext, useContext, useEffect, useState } from "react";
import {
    getNotificationStatusAPI,
    toggleNotificationStatusAPI,
} from "../Networking/User/APIs/Notification/notificationApi";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [enabled, setEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    const token = sessionStorage.getItem("access_token");

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await getNotificationStatusAPI(token);
            setEnabled(data.enabled);
        } catch (err) {
            console.error("Status fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        try {
            const newValue = !enabled;
            await toggleNotificationStatusAPI(newValue, token);
            setEnabled(newValue);
        } catch (err) {
            console.error("Toggle error", err);
        }
    };

    useEffect(() => {
        if (token) fetchStatus();
    }, [token]);

    return (
        <NotificationContext.Provider
            value={{ enabled, toggleStatus, loading, refreshStatus: fetchStatus }}
        >
            {children}
        </NotificationContext.Provider>
    );
};