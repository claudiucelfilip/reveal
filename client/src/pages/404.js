import React from "react"
import Details from "../templates/details";

const NotFoundPage = (props) => { 
  return (
    <Details {...props} data={{}} pageContext={{slug: props.location.pathname.replace(/\//g, '')}}/>
  )
};

export default NotFoundPage;
