import React, { useEffect, useState, useCallback, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';
import Html from './common/Html';
import { Like, Unlike, CenterBox, Meta } from './common/core';
import TagList from './common/TagList';
import LoadingSpinner from './common/LoadingSpinner';
import moment from 'moment';
import styled from 'styled-components';

const Wrapper = styled.article`
    font-size: 18px;
    line-height: 1.8;

    ${Meta} {
        line-height: 1.6;
        font-size: 16px;
    }
`;

const Vote = styled.span`
    display: inline-block;
    margin: 0 15px;
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.2s ease;

    &:hover {
        opacity: 1;
    }
`;
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
                const postLiked = post.voted === 1 ? true : false;
                setLiked(postLiked);
            }
            setPost(post);
        } catch (err) {
            smartContract.notify('danger', err.message);
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
            smartContract.notify('danger', err.message);
        }
        setLoading(false);

    }, [post, fetchPost, smartContract]);

    const votePost = useCallback(async (vote) => {
        setLoading(true);
        try {
            await smartContract.votePost(post.id, vote);
            setLiked(true);
        } catch (err) {
            smartContract.notify('danger', err.message);
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
        return <LoadingSpinner />;
    }
    return (
        <Wrapper>
            <h1 className="title">{post.title}</h1>
            
            <div className="row">
                <div className="col col-md-8">
                    <Meta>
                        {post.rating} points by <span title={post.owner}>{post.owner}</span>
                        {' '} - {moment.unix(post.created_at).fromNow()}
                    </Meta>
                    <p>{post.excerpt}</p>
                    <Html content={post.public_text} />
                    {post.show_private ? (
                        <>
                            <Html content={post.private_text} />
                            <CenterBox>
                                {liked === null && (
                                    <>
                                        <h4 className="pay-box-title">Did you like it?</h4>
                                        <Vote onClick={likeClick}>
                                            <Like /> Like
                                </Vote>
                                        <Vote onClick={unlikeClick}>
                                            <Unlike /> Unlike
                                </Vote>
                                    </>
                                )}
                                {liked === true && <h5><Like /> Liked</h5>}
                                {liked === false && <h5><Unlike /> Didn't Like</h5>}
                            </CenterBox>

                        </>
                    ) : (
                            <CenterBox>
                                <h4 className="pay-box-title">Costs {post.price} PERL(s) for the rest of the post</h4>
                                <button className="btn btn-primary btn-lg" onClick={onPayClick}>Send</button>
                            </CenterBox>
                        )}
                </div>
                <div className="col col-md-4">
                    <h5 className="mt-0">Tags</h5>
                    <TagList tags={post.tags} />
                </div>
            </div>
        </Wrapper>
    );
};

export default withRouter(observer(Details));