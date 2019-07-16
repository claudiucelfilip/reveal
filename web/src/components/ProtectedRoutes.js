import React, { useState, useContext, useEffect } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import SmartContract from '../SmartContract';
import LoadingSpinner  from './common/LoadingSpinner';

const ProtectedRoutes = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const smartContract = useContext(SmartContract);

    useEffect(() => {
        const initSmartContract = async () => {
            try {
                await smartContract.login();
                await smartContract.init();
            } catch (err) {
                console.warn(err.message);
            }
            setLoading(false);
        };
        initSmartContract();
    }, [smartContract]);

    if (loading) {
        return <LoadingSpinner />;
    }
    if (!smartContract.privateKey || !smartContract.contractId) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
}

export default withRouter(ProtectedRoutes);