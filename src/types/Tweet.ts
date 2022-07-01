export default interface TweetType {
    id: string,
    author_id: string,
    user: {
        id: string,
        username: string,
        profile_image_url: string,
        name: string,
    }
    text: string,
    media?: {
        media_keys: string[]
    },
    attachments?: {
        media_keys: string[]
    },
    created_at: string
}

// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets