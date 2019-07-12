import React, {useCallback, useState} from 'react';
import SmartContract from '../SmartContract';
const smartContract = SmartContract.getInstance();

const Create = () => {
    const [loading, setLoading] = useState(false);
    const onSubmit = useCallback(async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            switch(key) {
                case 'price': 
                    data[key] = parseInt(value);
                    break;
                default:
                    data[key] = value
            }
        });
        setLoading(true);
        try {
            const response = await smartContract.createPost(data);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }, []);
    if (loading) {
        return <h3>loading...</h3>;
    }
    return (
        <>
        <h1>Create</h1>
        <form onSubmit={onSubmit}>
            <div>
                <label>Title</label>
                <input type="text" name="title"/>
            </div>
            <div>
                <label>Public Text</label>
                <textarea  name="publicText" />
            </div>
            <div>
                <label>Private Text</label>
                <textarea  name="privateText" />
            </div>
            <div>
                <label>Price</label>
                <input type="text" name="price" defaultValue={200}/>
            </div>
            <div>
                <button type="submit">Create</button>
            </div>
        </form>
        </>
    );
};

export default Create;