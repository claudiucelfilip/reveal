import React, { useRef, useContext, useEffect } from 'react';
import SmartContract from '../../../SmartContract';
import { observer } from 'mobx-react-lite';
import ReactNotification from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import './notification.scss';



const notificationTitles = {
    success: 'Success',
    danger: 'Error',
    warning: 'Warning'
};

const Notification = () => {
    const smartContract = useContext(SmartContract);
    const notificationRef = useRef(null);
    useEffect(() => {
        const notification = smartContract.notification;
        if (!notification) {
            return;
        }

        const title = notification.title || notificationTitles[notification.type];

        notificationRef.current.addNotification({
            insert: 'top',
            container: 'top-right',
            animationIn: ['animated', 'fadeIn'],
            animationOut: ['animated', 'fadeOut'],
            dismiss: { duration: 0 },
            dismissable: { click: true },
            ...notification,
            title
        });
    }, [smartContract.notification]);

    return <ReactNotification ref={notificationRef} />;
};

export default observer(Notification);
