import React, { useEffect, useCallback, useState } from 'react';
import { Link, withRouter } from "react-router-dom";
import SmartContract from '../SmartContract';

const smartContract = SmartContract.getInstance();

const Header = ({ history }) => {
    const logOut = useCallback((event) => {
        event.preventDefault();
        smartContract.logOut();
        history.push('/');
    }, [history]);

    const cashOut = useCallback(async (event) => {
        event.preventDefault();
        try {
            await smartContract.cashOut();
        } catch (err) {
            console.error(err);
        }
    }, []);
    const account = smartContract.account;
    return (
        <header className="flex">
            <div>
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/create">Create</Link>
                <a href="" onClick={cashOut}>Cash Out</a>
                <a href="" onClick={logOut}>Logout</a>
            </div>
            <div>
                {account.public_key} - {account.balance}
            </div>
        </header>
    );
}

export default withRouter(Header);