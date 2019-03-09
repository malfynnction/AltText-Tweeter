const TwitterP = require('twitter')
const keys = require('./keys')

const Twitter = new TwitterP(keys)

const tweetThis = (content, toriginal_id, mentioning_user) => {
  if (content.length <= 280) {
    const reply = { status: content, in_reply_to_status_id: toriginal_id }
    Twitter.post('statuses/update', reply, function(err, tweet) {
      if (err) {
        console.log(err)
      }
    })
  } else {
    const cont_arr = content.split(' ')
    let part = ''

    while (cont_arr.length > 0 && part.length + cont_arr[0].length <= 280) {
      part += cont_arr[0] + ' '
      cont_arr.splice(0, 1)
    }

    const reply = { status: part, in_reply_to_status_id: toriginal_id }
    Twitter.post('statuses/update', reply, function(err, tweet) {
      if (err) {
        console.log(err)
      }
      tweetThis(`@${mentioning_user} ${cont_arr.join(' ')}`, tweet.id_str, mentioning_user)
    })
  }
}

module.exports = tweetThis