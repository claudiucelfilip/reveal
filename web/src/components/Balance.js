import React, { useCallback, useState, useEffect, useContext } from 'react';
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
            console.error(err);
        }
        setLoading(false);
    }, [smartContract, fetchBalance]);

    if (loading) {
        return <h3>loading...</h3>;
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