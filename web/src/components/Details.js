import React, { useEffect, useState, useCallback } from 'react';
import { withRouter } from 'react-router-dom';
import SmartContract from '../SmartContract';
const smartContract = SmartContract.getInstance();

const Details = ({ match, history }) => {
    const [post, setPost] = useState();
    const params = match.params;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                await smartContract.getPost(params.id).then(setPost);
            } catch (err) {
                console.log(err);
                history.push('/');
            }
        };
        fetchPost();
    }, [params, history]);

    const onPayClick = useCallback(async (event) => {
        await smartContract.payPost(post.id, post.price);
    }, [post]);

    if (!post) {
        return <h3>loading...</h3>;
    }
    return (
        <>
            <h1>{post.title}</h1>
            <p>
                {post.public_text}
            </p>
            {post.show_private ? (
                <p>
                    {post.private_text}
                </p>
            ) : (
                    <button onClick={onPayClick}>Pay to see</button>
                )}
        </>
    );
};

export default withRouter(Details);