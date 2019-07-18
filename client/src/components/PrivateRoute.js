import React, { useContext } from "react"
import PropTypes from "prop-types"
import { navigate } from "gatsby"
import SmartContract from '../SmartContract';

const PrivateRoute = ({ component: Component, location, ...rest }) => {
    const smartContract = useContext(SmartContract);
    if (!smartContract.privateKey && location.pathname !== `/login`) {
        // If we’re not logged in, redirect to the home page.
        navigate(`/login`);
        return null
    }

    return <Component {...rest} />
}

PrivateRoute.propTypes = {
    component: PropTypes.any.isRequired,
}

export default PrivateRoute