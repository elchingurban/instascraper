const request = require('request-promise');
const cheerio = require('cheerio');

(async () => {
    const USERNAME = 'cristiano';
    const BASE_URL = `https://www.instagram.com/${USERNAME}/`;

    let response = await request(BASE_URL);

    let $ = cheerio.load(response);

    let script = $('script[type="text/javascript"]').eq(3).html();

    let script_regex = /window._sharedData = (.+);/g.exec(script);

    let { entry_data: { ProfilePage: { [0]: { graphql: { user } } } } } = JSON.parse(script_regex[1]);

    let insta_data = {
        fullname: user.full_name,
        followers: user.edge_followed_by.count,
        following: user.edge_follow.count,
        posts: user.edge_owner_to_timeline_media.count,
        profile_pic: user.profile_pic_url_hd
    }

    let { entry_data: { ProfilePage: { [0]: { graphql: { user: { edge_owner_to_timeline_media: { edges } } } } } } } = JSON.parse(script_regex[1]);
    
    let posts = [];

    for(let edge of edges) {
        let { node } = edge;

        posts.push({
            id: node.id,
            timestamp: node.taken_at_timestamp,
            shortcode: node.shortcode,
            likes: node.edge_liked_by.count,
            comments: node.edge_media_to_comment.count,
            caption: node.edge_media_to_caption.edges[0].node.text,
            image_url: node.display_url
        });
    }

    console.log(posts)
})()