import React, { useCallback, useState, useEffect, useContext } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import SmartContract from '../SmartContract';
import { CenterBox } from './common/core';
import { observer } from 'mobx-react-lite';

const Balance = ({ history }) => {
    const smartContract = useContext(SmartContract);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState();

    const fetchBalance = useCallback(async () => {
        setLoading(true);
        const amount = await smartContract.getBalance();
        setBalance(amount);
        setLoading(false);
    }, [smartContract]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const onCashOut = useCallback(async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await smartContract.cashOut();
            smartContract.notify('success', 'Your balance has been withdrawn')
            fetchBalance();
        } catch (err) {
            smartContract.notify('danger', err.message);
        }
        setLoading(false);
    }, [smartContract, fetchBalance]);

    if (loading) {
        return <LoadingSpinner />;
    }
    return (
        <>
            <h1>Balance</h1>
            <CenterBox>
                <h4 className="box-title">Your posts earned you: {balance} PERL(s)</h4>
                <button className="btn btn-primary btn-lg" onClick={onCashOut}>Withdraw</button>
            </CenterBox>
        </>
    );
};

export default observer(Balance);