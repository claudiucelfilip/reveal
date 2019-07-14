import React, { useCallback, useContext } from 'react';
import { Link, withRouter } from "react-router-dom";
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';


const Header = ({ history }) => {
    const smartContract = useContext(SmartContract);

    const logOut = useCallback((event) => {
        event.preventDefault();
        smartContract.logout();
        history.push('/');
    }, [smartContract, history]);

    const cashOut = useCallback(async (event) => {
        event.preventDefault();
        try {
            await smartContract.cashOut();
        } catch (err) {
            console.error(err);
        }
    }, [smartContract]);
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
                        <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/create">Create</Link>
                    </li>
                    <li className="nav-item">

                        <a className="nav-link disabled" onClick={cashOut}>Cash Out</a>
                    </li>

                    <li className="nav-item">
                        <a className="nav-link" onClick={logOut}>Logout</a>
                    </li>
                </ul>
            </div>
            <div>
                {account.public_key} - {account.balance}
            </div>
        </nav>
    );
}

export default withRouter(observer(Header))