use std::error::Error;

use smart_contract::log;
use smart_contract::debug;
use smart_contract::payload::Parameters;
use smart_contract::transaction::{Transaction, Transfer};
use smart_contract_macros::smart_contract;

use serde::Serialize;
use std::collections::HashMap;

extern crate nanoid;

#[derive(Debug, Clone, Serialize)]
struct Post {
    id: String,
    title: String,
    public_text: String,
    private_text: String,
    price: u64,
    owner: [u8; 32],
    paid_viewers: Vec<[u8; 32]>,
    created_at: u32,
    votes: HashMap<[u8; 32], i8>,
}

#[derive(Debug, Serialize)]
struct PostExcerpt {
    id: String,
    title: String,
    public_text: String,
    owner: [u8; 32],
    created_at: u32,
    rating: i32,
    score: f32,
}

#[derive(Debug, Serialize)]
struct PostDetails {
    id: String,
    title: String,
    public_text: String,
    private_text: String,
    show_private: bool,
    price: u64,
    owner: [u8; 32],
    created_at: u32,
    rating: i32,
    score: f32,
}

fn calculate_rating(post: &Post) -> i32 {
    let mut rating: i32 = 0;
    for (_, vote) in &post.votes {
        rating = rating + *vote as i32;
    }
    rating
}

fn calculate_score(rating: i32, created_at: u32) -> f32 {
    (rating as f32 / (created_at as f32 + 2.0)).powf(1.8)
}

#[derive(Debug)]
struct Blog {
    posts: Vec<Post>,
    blog_owner: [u8; 32],
}

#[smart_contract]
impl Blog {
    fn init(params: &mut Parameters) -> Self {
        Self {
            posts: Vec::new(),
            blog_owner: params.sender,
        }
    }
    fn create_post(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let id: String = nanoid::simple();
        let title: String = params.read();
        let public_text: String = params.read();
        let private_text: String = params.read();
        let price: u64 = params.read();
        let amount: u64 = params.read();
        let created_at: u32 = params.read();

        debug!(&title, &public_text, &private_text, price, amount);
        if amount < 2 {
            return Err("Creator must contribute 2 PERLs to Blog Owner".into());
        }

        Transfer {
            destination: self.blog_owner,
            amount,
            func_name: vec![],
            func_params: vec![],
        }
        .send_transaction();

        let post = Post {
            id,
            title,
            public_text,
            private_text,
            price,
            owner: params.sender,
            paid_viewers: vec![params.sender],
            created_at,
            votes: HashMap::new(),
        };

        debug!(&post);
        self.posts.push(post);

        Ok(())
    }

    fn add_private_viewer(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let post_id: String = params.read();
        let post = self
            .posts
            .iter_mut()
            .find(|post| post.id == *post_id)
            .unwrap();

        if post.paid_viewers.contains(&params.sender) {
            return Err(format!("{:?} already paid", params.sender).into());
        }

        Transfer {
            destination: post.owner,
            amount: post.price,
            func_name: vec![],
            func_params: vec![],
        }
        .send_transaction();

        post.paid_viewers.push(params.sender);

        Ok(())
    }

    fn get_posts(&mut self, _params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let posts: Vec<PostExcerpt> = self
            .posts
            .iter()
            .map(|post| -> PostExcerpt {
                let rating = calculate_rating(&post);
                PostExcerpt {
                    id: post.id.clone(),
                    title: post.title.clone(),
                    public_text: post.public_text.clone(),
                    owner: post.owner,
                    created_at: post.created_at,
                    rating,
                    score: calculate_score(rating, post.created_at),
                }
            })
            .collect();

        let posts_json = serde_json::to_string(&posts).unwrap();
        log(&posts_json);
        Ok(())
    }

    fn get_post(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let post_id: String = params.read();
        let post = self
            .posts
            .iter_mut()
            .find(|post| post.id == *post_id)
            .unwrap();
        let rating = calculate_rating(post);

        let post_excerpt = PostExcerpt {
            id: post.id.clone(),
            title: post.title.clone(),
            public_text: post.public_text.clone(),
            owner: post.owner,
            created_at: post.created_at,
            rating,
            score: calculate_score(rating, post.created_at),
        };

        let post_json = serde_json::to_string(&post_excerpt).unwrap();
        log(&post_json);

        Ok(())
    }

    fn get_post_details(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let post_id: String = params.read();

        let post = self
            .posts
            .iter_mut()
            .find(|post| post.id == *post_id)
            .unwrap();
        let rating = calculate_rating(post);

        let mut post_result = PostDetails {
            id: post.id.clone(),
            title: post.title.clone(),
            public_text: post.public_text.clone(),
            private_text: "".to_string(),
            show_private: false,
            price: post.price,
            owner: post.owner,
            created_at: post.created_at,
            rating,
            score: calculate_score(rating, post.created_at),
        };

        if post.paid_viewers.contains(&params.sender) == true {
            post_result.show_private = true;
            post_result.private_text = post.private_text.clone();
        }
        let post_result_json = serde_json::to_string(&post_result).unwrap();
        log(&post_result_json);

        Ok(())
    }

    fn upvote_post(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let post_id: String = params.read();
        let post = self
            .posts
            .iter_mut()
            .find(|post| post.id == *post_id)
            .unwrap();

        if post.paid_viewers.contains(&params.sender) == false {
            return Err(format!("{:?} isn't allow to upvote", params.sender).into());
        }

        post.votes.insert(params.sender, 1);

        Ok(())
    }

    fn downvote_post(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let post_id: String = params.read();
        let post = self
            .posts
            .iter_mut()
            .find(|post| post.id == *post_id)
            .unwrap();

        if post.paid_viewers.contains(&params.sender) == false {
            return Err(format!("{:?} isn't allow to downvote", params.sender).into());
        }

        post.votes.insert(params.sender, -1);

        Ok(())
    }
}
