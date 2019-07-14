import React, { useCallback, useState, useEffect, useContext } from 'react';
import SmartContract from '../SmartContract';
import { withRouter, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import * as nacl from 'tweetnacl';

const Login = ({ history }) => {
    const smartContract = useContext(SmartContract);
    const [privateKey, setPrivateKey] = useState();
    const [contractId, setContractId] = useState();

    useEffect(() => {
        const generatedKeys = nacl.sign.keyPair();
        const secretKey = Buffer.from(generatedKeys.secretKey).toString("hex");
        setPrivateKey(secretKey);
    }, []);

    const onSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (privateKey && contractId) {
            smartContract.updatedKeys(privateKey, contractId);
            await smartContract.init();
            history.push('/');
        }
    }, [smartContract, privateKey, contractId, history]);

    const onKeyChange = useCallback((event) => {
        setPrivateKey(event.target.value);
    }, []);

    const onContractChange = useCallback((event) => {
        setContractId(event.target.value);
    }, []);

    if (smartContract.hasKeys()) {
        return <Redirect to="/" />;
    }

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Smart Contract</label>
                    <textarea className="form-control large-textarea" rows="1" onChange={onContractChange} />
                </div>
                <div className="form-group">
                    <label>Private Key</label>
                    <textarea className="form-control large-textarea" rows="10" value={privateKey} onChange={onKeyChange} />
                </div>

                <button className="btn btn-primary" disabled={!privateKey || !contractId} type="submit">Login</button>
            </form>
        </>
    );
};

export default withRouter(observer(Login));