use std::error::Error;

extern crate array_tool;

use array_tool::vec::Union;
// use smart_contract::debug;
use smart_contract::log;
use smart_contract::payload::Parameters;
use smart_contract::transaction::{Transaction, Transfer};
use smart_contract_macros::smart_contract;

use serde::Serialize;
use std::collections::HashMap;

static mut COUNTER: u32 = 0;
static CREATE_POST_FEE: u64 = 500000;

fn generate_id() -> String {
    unsafe {
        COUNTER = COUNTER + 1;
        COUNTER.to_string()
    }
}

// fn to_hex_string(bytes: [u8; 32]) -> String {
//     let strs: Vec<String> = bytes.iter()
//         .map(|b| format!("{:02x}", b))
//         .collect();
//     strs.join("")
// }


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

#[derive(Debug, Clone, Serialize)]
struct Post {
    id: String,
    title: String,
    tags: String,
    excerpt: String,
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
    tags: String,
    excerpt: String,
    owner: [u8; 32],
    created_at: u32,
    rating: i32,
    score: f32,
}

#[derive(Debug, Serialize)]
struct PostDetails {
    id: String,
    title: String,
    tags: String,
    public_text: String,
    private_text: String,
    show_private: bool,
    price: u64,
    owner: [u8; 32],
    created_at: u32,
    rating: i32,
    score: f32,
    voted: i8,
}



#[derive(Debug)]
struct Blog {
    posts: Vec<Post>,
    blog_owner: [u8; 32],
    balances: HashMap<[u8; 32], u64>,
}

#[smart_contract]
impl Blog {
    fn init(params: &mut Parameters) -> Self {
        Self {
            posts: Vec::new(),
            blog_owner: params.sender,
            balances: HashMap::new()
        }
    }

    fn create_post(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        if params.amount < CREATE_POST_FEE {
            return Err(format!("{} PERLs are needed to Create a Post", CREATE_POST_FEE).into());
        }
        
        let blog_owner_balance = match self.balances.get(&self.blog_owner) {
            Some(balance) => *balance,
            None => 0,
        };

        self.balances.insert(self.blog_owner, blog_owner_balance + params.amount);

        let id = generate_id();
        
        let title: String = params.read();
        let tags: String = params.read();
        let excerpt: String = params.read();
        let public_text: String = params.read();
        let private_text: String = params.read();
        let price: u64 = params.read();
        let created_at: u32 = params.read();

        let post = Post {
            id,
            title,
            tags,
            excerpt,
            public_text,
            private_text,
            price,
            owner: params.sender,
            paid_viewers: vec![params.sender],
            created_at,
            votes: HashMap::new(),
        };

        self.posts.push(post);

        Ok(())
    }

    fn get_balance(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let sender_balance = match self.balances.get(&params.sender) {
            Some(balance) => *balance,
            None => 0,
        };

        log(&sender_balance.to_string());

        Ok(())
    }

    fn get_tags(&mut self, _params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let output: Vec<String> = vec![];
        let tags: Vec<String> = self.posts
            .iter()
            .fold(output, |acc, post| -> Vec<String> {
                let tags =  post.tags.split("|").map(String::from).collect();
                acc.union(tags)
            });

        let tags_json = serde_json::to_string(&tags).unwrap();
        log(&tags_json);

        Ok(())
    }
    fn cash_out(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let sender_balance = match self.balances.get(&params.sender) {
            Some(balance) => *balance,
            None => 0,
        };
        if sender_balance == 0 {
            return Err("Sender has no PERLS".into());
        }
        Transfer {
            destination: params.sender,
            amount: sender_balance,
            func_name: vec![],
            func_params: vec![],
        }
        .send_transaction();

        self.balances.insert(params.sender, 0);

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

        let post_owner_balance = match self.balances.get(&post.owner) {
            Some(balance) => *balance,
            None => 0,
        };

        self.balances.insert(post.owner, post_owner_balance + params.amount);

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
                    tags: post.tags.clone(),
                    excerpt: post.excerpt.clone(),
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


    fn get_post_details(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let post_id: String = params.read();

        let post = self
            .posts
            .iter_mut()
            .find(|post| post.id == *post_id)
            .unwrap();
        let rating = calculate_rating(post);

        let mut show_private = false;

        let voted = match post.votes.get(&params.sender) {
            Some(vote) => *vote,
            None => 0,
        };

        if post.paid_viewers.contains(&params.sender) {
            show_private = true;
        }

        let mut post_result = PostDetails {
            id: post.id.clone(),
            title: post.title.clone(),
            tags: post.tags.clone(),
            public_text: post.public_text.clone(),
            private_text: "".to_string(),
            show_private,
            price: post.price,
            owner: post.owner,
            created_at: post.created_at,
            rating,
            score: calculate_score(rating, post.created_at),
            voted
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
            return Err(format!("{:?} isn't allowed to upvote", params.sender).into());
        }

        post.votes.insert(params.sender, 1);

        Ok(())
    }

    fn vote_post(&mut self, params: &mut Parameters) -> Result<(), Box<dyn Error>> {
        let post_id: String = params.read();
        let vote: u8 = params.read();

        let post = self
            .posts
            .iter_mut()
            .find(|post| post.id == *post_id)
            .unwrap();

        if post.paid_viewers.contains(&params.sender) == false {
            return Err(format!("{:?} isn't allowed to downvote", params.sender).into());
        }

        match vote {
            1 => post.votes.insert(params.sender, 1),
            0 => post.votes.insert(params.sender, -1),
            _ => panic!(),
        };

        Ok(())
    }
}
