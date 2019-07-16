import React, { useCallback, useContext } from 'react';
import { NavLink, withRouter } from "react-router-dom";
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';


const Header = ({ history }) => {
    const smartContract = useContext(SmartContract);

    const logOut = useCallback((event) => {
        event.preventDefault();
        smartContract.logout();
        history.push('/');
    }, [smartContract, history]);

    const account = smartContract.account;
    if (!smartContract.privateKey || !account) {
        return <></>;
    }
    return (
        <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarsExampleDefault"
                aria-controls="navbarsExampleDefault"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarsExampleDefault">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                        <NavLink className="nav-link" exact={true} to="/">Home</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/create">Create</NavLink>
                    </li>
                    <li className="nav-item">
                    <NavLink className="nav-link" to="/balance">Balance</NavLink>
                    </li>

                    <li className="nav-item">
                        <span className="nav-link" onClick={logOut}>Logout</span>
                    </li>
                </ul>
            </div>
            <div>
                {account.public_key} - {account.balance} PERL(s)
            </div>
        </nav>
    );
}

export default withRouter(observer(Header))