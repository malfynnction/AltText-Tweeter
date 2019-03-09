const getTweet = require('./get-tweet')
const read = require('./read-alt-text')

module.exports = (tweet) => {
  // do not reply to retweets
  if (typeof tweet.retweeted_status !== 'undefined') {
    return
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
    return
  }

  let content = `@${mentioning_user} `

  //get the tweet with the picture
  return getTweet(original_id).then(original_tweet => {
    //media in the original tweet
    if (
      original_tweet.extended_entities &&
      original_tweet.extended_entities['media']
    ) {
      content += read(
        original_tweet,
        original_user
      )
      return content
    }

    //media in the triggering tweet
    if (tweet.extended_entities && tweet.extended_entities['media']) {
      content += read(
        tweet,
        mentioning_user
      )
      return content
    }
    //in the quoted tweet?
    if (tweet.is_quote_status) {
      return getTweet(tweet.quoted_status_id_str).then(quoted_tweet => {
        //media in the quoted tweet
        if (
          quoted_tweet.extended_entities &&
          quoted_tweet.extended_entities['media']
        ) {
          content += read(
            quoted_tweet,
            quoted_tweet.user.screen_name
          )
          return content
        } else {
          //no media in quoted tweet
          return content + "I can't find any images in the tweet you're replying to, nor in your own tweet or the tweet you quoted, sorry."
        }
      }).catch(err => {
        console.log(err)
      })
    } 
    return content + "I can't find any images in the tweet you're replying to or in your own tweet, sorry."
  }).catch(err => console.log(err))
}