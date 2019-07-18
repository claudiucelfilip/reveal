import React, { useCallback, useState, useEffect, useContext } from 'react';
import SmartContract from '../SmartContract';
import Layout from "../components/layout";
import { observer } from 'mobx-react-lite';
import * as nacl from 'tweetnacl';
import { navigate } from "gatsby";

const Login = () => {
    const smartContract = useContext(SmartContract);
    const [privateKey, setPrivateKey] = useState();

    useEffect(() => {
        const generatedKeys = nacl.sign.keyPair();
        const secretKey = Buffer.from(generatedKeys.secretKey).toString("hex");
        setPrivateKey(secretKey);
    }, []);

    const onSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (privateKey) {
            smartContract.privateKey = privateKey;
            await smartContract.init();
            navigate('/')
        }
    }, [smartContract, privateKey]);

    const onKeyChange = useCallback((event) => {
        setPrivateKey(event.target.value);
    }, []);

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Private Key</label>
                    <textarea className="form-control large-textarea" rows="10" value={privateKey} onChange={onKeyChange} />
                </div>

                <button className="btn btn-primary" disabled={!privateKey} type="submit">Login</button>
            </form>
        </>
    );
};

export default observer(Login);