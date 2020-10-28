const TwitterP = require('twitter')
const keys = require('./keys')
const sendTweet = require('./send-tweet')
const getReplyText = require('./get-reply-text')

const Twitter = new TwitterP(keys)

Twitter.stream('statuses/filter', { track: '@get_altText' }, function (stream) {
  stream.on('data', (tweet) => {
    const mentioning_id = tweet.id_str
    const mentioning_user = tweet.user.screen_name

    getReplyText(tweet)
      .then((reply) => {
        if (reply && reply.length > 0) {
          sendTweet(reply, mentioning_id, mentioning_user)
        }
      })
      .catch((err) => console.error(err))
  })

  stream.on('error', function (err) {
    console.log(err)
  })
})
