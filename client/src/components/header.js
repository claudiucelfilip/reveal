import React, { useCallback, useContext } from 'react';
import { Link } from '@reach/router';
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';
import { navigate } from "gatsby";

const NavLink = props => (
    <Link
        {...props}
        getProps={({ isCurrent }) => {
            return {
                className: isCurrent ? `${props.className} active`: props.className
            };
        }}
    />
);

const Header = ({ route }) => {
    const smartContract = useContext(SmartContract);

    const logOut = useCallback((event) => {
        event.preventDefault();
        smartContract.logout();
        navigate(`/login`);
    }, [smartContract]);

    const account = smartContract.account;
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
                        <NavLink className="nav-link" to="/">Home</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/app/create">Create</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/app/balance">Balance</NavLink>
                    </li>

                    {route.location.pathname !== '/login' && <li className="nav-item">
                        <span className="nav-link" onClick={logOut}>{smartContract.account ? 'Logout' : 'Login'}</span>
                    </li>}
                </ul>
            </div>
            {account && (
                <div>
                    {account.public_key} - {account.balance} PERL(s)
                </div>
            )}
        </nav>
    );
}

export default observer(Header);