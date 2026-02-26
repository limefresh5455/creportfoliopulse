import { useDispatch, useSelector } from "react-redux";

import { useEffect } from "react";
import { Form } from "react-bootstrap";
import { getNotificationStatusAPI, toggleNotificationStatusAPI } from "../Networking/User/APIs/Notification/notificationApi";

export const NotificationToggle = () => {
    const dispatch = useDispatch();
    const { enabled, loading } = useSelector(
        (state) => state.notificationSlice
    );

    useEffect(() => {
        dispatch(getNotificationStatusAPI());
    }, [dispatch]);

    const handleToggle = () => {
        dispatch(toggleNotificationStatusAPI(!enabled));
    };

    return (
        <>
            <div className="text-primary mx-1">Notification Toggle</div>
            <Form.Check
                type="switch"
                checked={enabled}
                disabled={loading}
                onChange={handleToggle}
            />
        </>
    );
};