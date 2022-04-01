const getTweet = require('./get-tweet')
const readAltText = require('./read-alt-text')

module.exports = async (tweet) => {
  const mentioningTweetId = tweet.id_str
  const mentioningUsername = tweet.user.screen_name

  let content = `@${mentioningUsername} `

  try {
    if (!tweet) {
      console.log('🚨This should not happen🚨')
      throw 'No tweet found'
    }

    // do not reply to retweets
    if (typeof tweet.retweeted_status !== 'undefined') {
      return
    }

    let originalTweetId = tweet.in_reply_to_status_id_str
    let originalUsername = tweet.in_reply_to_screen_name

    // ppl posting the pic and triggering the bot within the same tweet
    if (originalTweetId == null) {
      originalTweetId = mentioningTweetId
      originalUsername = mentioningUsername
    }

    // pls no loops of death!
    if (mentioningUsername == 'get_altText') {
      return
    }

    const originalTweet = await getTweet(originalTweetId)

    // media in the original tweet
    if (
      originalTweet.extended_entities &&
      originalTweet.extended_entities.media
    ) {
      content += readAltText(originalTweet, originalUsername)
      return content
    }

    // media in the triggering tweet
    if (tweet.extended_entities && tweet.extended_entities.media) {
      content += readAltText(tweet, mentioningUsername)
      return content
    }

    // in the quoted tweet?
    if (tweet.is_quote_status) {
      const quotedTweet = await getTweet(tweet.quoted_status_id_str)
      // media in the quoted tweet
      if (
        quotedTweet.extended_entities &&
        quotedTweet.extended_entities.media
      ) {
        content += readAltText(quotedTweet, quotedTweet.user.screen_name)
        return content
      } else {
        // no media in quoted tweet => no tweet
        return
      }
    }

    return
  } catch (err) {
    console.log(JSON.stringify(err))
    if (err.length === 1) {
      return content + err[0].message.replace('you are', 'I am')
    } else {
      return (
        content +
        'There has been an error while trying to read the alt text, please try again later – @malfynnction, you should probably look into this!'
      )
    }
  }
}
