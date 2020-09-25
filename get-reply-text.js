const getTweet = require('./get-tweet')
const read = require('./read-alt-text')

module.exports = (tweet) => {
  return new Promise(async (resolve) => {
    try {
      if (!tweet) {
        console.log('🚨This should not happen🚨')
        throw 'No tweet found'
      }

      // do not reply to retweets
      if (typeof tweet.retweeted_status !== 'undefined') {
        resolve('')
      }

      const mentioning_id = tweet.id_str
      const mentioning_user = tweet.user.screen_name
      let original_id = tweet.in_reply_to_status_id_str
      let original_user = tweet.in_reply_to_screen_name

      //ppl posting the pic and triggering the bot within the same tweet
      if (original_id == null) {
        original_id = mentioning_id
        original_user = mentioning_user
      }

      //pls no loops of death!
      if (mentioning_user == 'get_altText') {
        resolve()
      }

      let content = `@${mentioning_user} `

      const original_tweet = await getTweet(original_id)

      //media in the original tweet
      if (
        original_tweet.extended_entities &&
        original_tweet.extended_entities['media']
      ) {
        content += read(original_tweet, original_user)
        resolve(content)
      }

      //media in the triggering tweet
      if (tweet.extended_entities && tweet.extended_entities['media']) {
        content += read(tweet, mentioning_user)
        resolve(content)
      }

      //in the quoted tweet?
      if (tweet.is_quote_status) {
        const quoted_tweet = await getTweet(tweet.quoted_status_id_str)
        //media in the quoted tweet
        if (
          quoted_tweet.extended_entities &&
          quoted_tweet.extended_entities['media']
        ) {
          content += read(quoted_tweet, quoted_tweet.user.screen_name)
          resolve(content)
        } else {
          //no media in quoted tweet => no tweet
          resolve()
        }
      }

      resolve()
    } catch (err) {
      console.log(err)
      resolve(
        content +
          'There has been an error while trying to read the alt text, please try again later – @malfynnction, you should probably look into this!'
      )
    }
  })
}
