import React, { useEffect, useState, useCallback, useContext } from 'react';
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';
import Html from '../components/common/Html';
import { Like, Unlike, CenterBox, Meta } from '../components/common/core';
import TagList from '../components/common/TagList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import moment from 'moment';
import styled from 'styled-components';
import { graphql, Link } from 'gatsby';

const Wrapper = styled.article`
    font-size: 18px;
    line-height: 1.8;

    ${Meta} {
        line-height: 1.6;
        font-size: 16px;
        margin-bottom: 20px;
    }
`;

const Excerpt = styled.p`
    font-size: 20px;
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
const Details = (props) => {
    const smartContract = useContext(SmartContract);
    const [post, setPost] = useState(props.data.revealPost);
    const [loading, setLoading] = useState(typeof window !== 'undefined' ? true : false);

    const [liked, setLiked] = useState(null);
    const slug = props.pageContext.slug;

    const fetchPost = useCallback(async () => {

        setLoading(true);
        try {
            const post = await smartContract.getPost(slug);
            if (post.voted) {
                const postLiked = post.voted === 1 ? true : false;
                setLiked(postLiked);
            }
            setPost(post);
        } catch (err) {
            smartContract.notify('danger', err.message);
            // navigate('/');
        }
        setLoading(false);
    }, [smartContract, slug]);

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
            smartContract.notify('success', 'Thank you for voting!');
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

    if (loading || !post) {
        return <LoadingSpinner />;
    }
    return (

        <Wrapper>
            <h1 className="title">{post.title}</h1>
            <Meta>
                {post.rating} points by <span title={post.owner}>{post.owner}</span>
                {' '} - {moment.unix(post.created_at).fromNow()}
            </Meta>
            <div className="row">
                <div className="col col-md-8">

                    <Excerpt>{post.excerpt}</Excerpt>
                    <Html content={post.public_text} />
                    {post.show_private ? (
                        <>
                            <Html content={post.private_text} />
                            <CenterBox>
                                {liked === null && (
                                    <>
                                        <h4 className="box-title">Did you like it?</h4>
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
                    ) : smartContract.account ? (
                        <CenterBox>
                            <h4 className="box-title">Costs {post.price} PERL(s) for the rest of the content</h4>
                            <button className="btn btn-primary btn-lg" onClick={onPayClick}>Send</button>
                        </CenterBox>
                    ) : (
                                <CenterBox>
                                    <h4 className="box-title">You must login to view the rest of the content</h4>
                                    <Link className="btn btn-primary btn-lg" to="/login">Login</Link>
                                </CenterBox>
                            )}
                </div>
                {post.tags && (
                    <div className="col col-md-4">
                        <h5 className="mt-4">Tags</h5>
                        <TagList tags={post.tags} />
                    </div>
                )}
            </div>
        </Wrapper>

    );
};

export default observer(Details);

export const query = graphql`
query PostQuery($slug: String!) {
    revealPost(id: {eq: $slug}) {
        title,
        excerpt,
        owner,
        created_at,
        rating,
        tags
      }
}`;