import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import SmartContract from '../SmartContract';
import LoadingSpinner from './common/LoadingSpinner';
import styled from 'styled-components';

const ContractBox = styled.div`
    padding: 20px;
    margin: 0 0 40px;
    border: solid 1px #ced4da;
    border-radius: 5px;
    width: auto;
    background: #fafafa;
`;
const ProtectedRoutes = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const smartContract = useContext(SmartContract);
    const [contractId, setContractId] = useState(smartContract.contractId);
    

    useEffect(() => {
        const initSmartContract = async () => {
            try {
                await smartContract.login();
                await smartContract.init();
            } catch (err) {
                console.warn(err.message);
            }
            setLoading(false);
        };
        initSmartContract();
    }, [smartContract]);

    const onContractChange = useCallback((event) => {
        setContractId(event.target.value);
    }, []);

    const changeContract = useCallback(async (event) => {
        event.preventDefault();
        smartContract.contractId = contractId;
        window.location.reload();
    }, [smartContract, contractId]);

    if (loading) {
        return <LoadingSpinner />;
    }
    if (!smartContract.privateKey || !smartContract.contractId) {
        return <Redirect to="/login" />;
    }

    return <>
        
        <ContractBox>
            <label>Loaded Contract</label>
            <form className="d-flex">
                <input type="text" className="form-control mr-3" defaultValue={contractId} onChange={onContractChange} />
                <button type="submit" className="btn btn-primary" onClick={changeContract}>Reload</button>
            </form>
        </ContractBox>
        
        {children}
    </>;
}

export default withRouter(ProtectedRoutes);