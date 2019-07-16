import styled from 'styled-components';
import ThumbsUpIcon from '../../assets/svg/thumbs-o-up.svg';
import ThumbsDownIcon from '../../assets/svg/thumbs-o-down.svg';

export const Like = styled.img.attrs({
    src: ThumbsUpIcon
})`
    width: 20px;
    margin-right: 5px;
`;

export const Unlike = styled.img.attrs({
    src: ThumbsDownIcon
})`
    width: 20px;
    margin-right: 5px;
`;

export const CenterBox = styled.div`
    padding: 30px 0 20px;
    margin: 30px 0;
    border-radius: 5px;
    border: solid 1px #a9a9a9;
    text-align: center;

    .pay-box-title {
        margin-bottom: 20px;
    }
`;