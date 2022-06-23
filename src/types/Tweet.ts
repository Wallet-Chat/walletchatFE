export default interface TweetType {
    id: string,
    user: {
        id: string,
        username: string,
        profile_image_url: string,
        name: string,
    }
    text: string,
    media?: string[],
    attachments?: {
        media_keys: string[]
    },
}

// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets