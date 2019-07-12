import React, { useCallback, useState } from 'react';
import SmartContract from '../SmartContract';
import { withRouter } from 'react-router-dom';
const smartContract = SmartContract.getInstance();

const Login = ({history}) => {
    const [privateKey, setPrivateKey] = useState();

    const onSubmit = useCallback(() => {
        smartContract.savePrivateKey(privateKey);
        if (privateKey) {
            history.push('/');
        }
    }, [privateKey, history]);

    const onKeyChange = useCallback((event) => {
        setPrivateKey(event.target.value);
    }, []);

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <textarea onChange={onKeyChange} />
                <button type="submit">Login</button>
            </form>
        </>
    );
};

export default withRouter(Login);