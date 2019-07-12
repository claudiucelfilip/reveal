import React, { useEffect, useState, useCallback } from 'react';
import { withRouter } from 'react-router-dom';
import SmartContract from '../SmartContract';
import Html from './Html';

const smartContract = SmartContract.getInstance();

const Details = ({ match, history }) => {
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState();
    const [liked, setLiked] = useState(null);
    const params = match.params;

    const fetchPost = useCallback(async () => {
        setLoading(true);
        try {
            const post = await smartContract.getPost(params.id).then();
            if (post.voted) {
                const postLiked = post.voted === 1 ? true: false;
                setLiked(postLiked);
            }
            setPost(post);
        } catch (err) {
            console.err(err);
            history.push('/');
        }
        setLoading(false);
    }, [params, history]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const onPayClick = useCallback(async (event) => {
        setLoading(true);
        await smartContract.payPost(post.id, post.price);
        fetchPost();
    }, [post, fetchPost]);

    const votePost = useCallback(async (vote) => {
        setLoading(true);
        await smartContract.votePost(post.id, vote);
        setLiked(true);
        setLoading(false);
    }, [post]);

    const likeClick = useCallback((event) => {
        event.preventDefault();
        votePost(true);
    }, [votePost]);

    const unlikeClick = useCallback(async (event) => {
        event.preventDefault();
        votePost(false);
    }, [votePost]);

    if (loading) {
        return <h3>loading...</h3>;
    }
    return (
        <>
            <h1>{post.title}</h1>
            <Html content={post.public_text} />
            {post.show_private ? (
                <>
                <Html content={post.private_text} />
                <h4>Did you like it?</h4>
                {liked === null && (
                    <>
                        <button onClick={likeClick}>Like</button>
                        <button onClick={unlikeClick}>Unlike</button>
                    </>
                )}
                {liked === true && <h5>Liked</h5>}
                {liked === false && <h5>Didn't Like</h5>}
                </>
            ) : (
                    <button onClick={onPayClick}>Pay to see</button>
                )}
            
        </>
    );
};

export default withRouter(Details);