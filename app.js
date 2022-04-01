const TwitterP = require('twitter')
const keys = require('./keys')
const sendTweet = require('./lib/send-tweet')
const getReplyText = require('./lib/get-reply-text')
const getTweet = require('./lib/get-tweet')

const Twitter = new TwitterP(keys)

Twitter.stream('statuses/filter', { track: '@get_altText' }, function (stream) {
  stream.on('data', (brokenTweet) => {
    const mentioningTweetId = brokenTweet.id_str
    const mentioningUsername = brokenTweet.user.screen_name

    getTweet(mentioningTweetId)
      .then(getReplyText)
      .then((reply) => {
        if (reply && reply.length > 0) {
          sendTweet(reply, mentioningTweetId, mentioningUsername)
        }
      })
      .catch((err) => console.error(err))

    stream.on('error', (err) => {
      console.log(err)
    })
  })

  stream.on('error', (err) => {
    console.log(err)
  })
})
