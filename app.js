const TwitterP = require('twitter')
const keys = require('./keys')
const sendTweet = require('./send-tweet')
const getReplyText = require('./get-reply-text')
const getTweet = require('./get-tweet')

const Twitter = new TwitterP(keys)

Twitter.stream('statuses/filter', { track: '@get_altText' }, function (stream) {
  stream.on('data', (broken_tweet) => {
    const mentioning_id = broken_tweet.id_str
    const mentioning_user = broken_tweet.user.screen_name

    getTweet(mentioning_id).then((tweet) => {
      getReplyText(tweet)
        .then((reply) => {
          if (reply && reply.length > 0) {
            sendTweet(reply, mentioning_id, mentioning_user)
          }
        })
        .catch((err) => console.error(err))
    })
  })

  stream.on('error', function (err) {
    console.log(err)
  })
})
