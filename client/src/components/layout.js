
import React, { useEffect, useContext, useCallback, useState, memo } from 'react';
import PropTypes from "prop-types";
import Notification from './common/notification/Notification';
import SmartContract from '../SmartContract';
import Header from './Header';
import LoadingSpinner from './common/LoadingSpinner';
import styled from 'styled-components';
import { Location } from '@reach/router';

const ContractBox = styled.div`
    padding: 20px;
    margin: 0 0 40px;
    border: solid 1px #ced4da;
    border-radius: 5px;
    width: auto;
    background: #fafafa;
`;
const Layout = (props) => {
  const { children } = props;
  // const data = useStaticQuery(graphql`
  //   query SiteTitleQuery {
  //     site {
  //       siteMetadata {
  //         title
  //       }
  //     }
  //   }
  // `)
  const smartContract = useContext(SmartContract);
  const [loading, setLoading] = useState(false);
  const [contractId, setContractId] = useState();


  useEffect(() => {
    setContractId(smartContract.contractId);
    const initSmartContract = async () => {
      setLoading(true);
      try {
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
  
  return (
    <>
      <Location>
        {props => <Header route={props} />}
      </Location>
      <main role="main">

        <div className="container">
          <ContractBox>
            <label>Loaded Contract</label>
            <form className="d-flex">
              <input type="text" className="form-control mr-3" defaultValue={contractId} onChange={onContractChange} />
              <button type="submit" className="btn btn-primary" onClick={changeContract}>Reload</button>
            </form>
          </ContractBox>
          {children}
        </div>
        <Notification />
      </main>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout;
