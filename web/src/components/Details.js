import React, { useEffect, useState, useCallback, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';
import Html from './common/Html';
import TagList from './common/TagList';
import moment from 'moment';

const Details = ({ match, history }) => {
    const smartContract = useContext(SmartContract);
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
            console.error(err);
            history.push('/');
        }
        setLoading(false);
    }, [smartContract, params, history]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const onPayClick = useCallback(async (event) => {
        setLoading(true);
        try {
            await smartContract.payPost(post.id, post.price);
            fetchPost();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
        
    }, [post, fetchPost, smartContract]);

    const votePost = useCallback(async (vote) => {
        setLoading(true);
        try {
            await smartContract.votePost(post.id, vote);
            setLiked(true);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [post, smartContract]);

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
            <h1 className="title">{post.title}</h1>
            <p>{post.excerpt}</p>
            <p>{moment.unix(post.created_at).format('MMM Do YYYY, h:mm:ss a')}</p>
            <p>{post.owner}</p>
            <TagList tags={post.tags} />
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
                    <div>
                        <h5>Costs {post.price} for the rest of the post</h5>
                        <button className="btn btn-primary" onClick={onPayClick}>Pay</button>
                    </div>
                )}
            
        </>
    );
};

export default withRouter(observer(Details));