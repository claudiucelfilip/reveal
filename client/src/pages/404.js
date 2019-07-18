import React from "react"
import { Location } from '@reach/router';
import Details from "../templates/Details";

const NotFoundPage = (props) => { 
  return (
    <Details {...props} data={{}} pageContext={{slug: props.location.pathname.replace(/\//g, '')}}/>
  )
};

export default NotFoundPage;
