import React, { useCallback, useState, useEffect, useContext } from 'react';
import LoadingSpinner  from './common/LoadingSpinner';
import SmartContract from '../SmartContract';
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
            <p>Your posts earned you: {balance} PERL(s)</p>
            <button className="btn btn-primary" onClick={onCashOut}>Cash Out</button>
        </>
    );
};

export default observer(Balance);