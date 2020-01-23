const TwitterP = require('twitter')
const keys = require('./keys')

const Twitter = new TwitterP(keys)

module.exports = async id => {
  return Twitter.get(
    'statuses/show',
    {
      id: id,
      include_ext_alt_text: 'true',
      tweet_mode: 'extended'
    })
}