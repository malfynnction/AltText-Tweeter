const TwitterP = require('twitter')
const keys = require('./keys')

const Twitter = new TwitterP(keys)

const tweetThis = (content, inReplyToTweetId, mentioningUsername) => {
  if (content.length <= 280) {
    const reply = { status: content, in_reply_to_status_id: inReplyToTweetId }
    Twitter.post('statuses/update', reply, (err) => {
      if (err) {
        console.log(err)
      }
    })
  } else {
    const contentWords = content.split(' ')
    let part = ''

    while (
      contentWords.length > 0 &&
      part.length + contentWords[0].length <= 279
    ) {
      part += contentWords[0] + ' '
      contentWords.splice(0, 1)
    }

    const reply = { status: part, in_reply_to_status_id: inReplyToTweetId }
    Twitter.post('statuses/update', reply, function (err, tweet) {
      if (err) {
        console.log(err)
      } else {
        tweetThis(
          `@${mentioningUsername} ${contentWords.join(' ')}`,
          tweet.id_str,
          mentioningUsername
        )
      }
    })
  }
}

module.exports = tweetThis
