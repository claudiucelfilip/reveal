import React, { useCallback, useState, useContext } from 'react';
import SmartContract from '../SmartContract';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

const Login = ({history}) => {
    const smartContract = useContext(SmartContract);
    const [privateKey, setPrivateKey] = useState();
    const [contractId, setContractId] = useState();
    
    const onSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (privateKey && contractId) {
            smartContract.login(privateKey, contractId);
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
                    <textarea className="form-control large-textarea" rows="10" onChange={onKeyChange} />
                </div>
                
                <button className="btn btn-primary" disabled={!privateKey || !contractId} type="submit">Login</button>
            </form>
        </>
    );
};

export default withRouter(observer(Login));