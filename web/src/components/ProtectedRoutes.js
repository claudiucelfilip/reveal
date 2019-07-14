import React, { useState, useContext, useEffect } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import SmartContract from '../SmartContract';

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
        return <h3>loading...</h3>;
    }
    if (!smartContract.privateKey || !smartContract.contractId) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
}

export default withRouter(ProtectedRoutes);