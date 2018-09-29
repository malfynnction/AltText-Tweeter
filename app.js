var TwitterP = require('twitter')
var keys = require('./keys')

var Twitter = new TwitterP(keys)

Twitter.stream('statuses/filter', { track: '@get_altText' }, function(stream) {
  stream.on('data', function(tweet) {
    // do not reply to retweets
    if (typeof tweet.retweeted_status === 'undefined') {
      var mentioning_id = tweet.id_str
      var mentioning_user = tweet.user.screen_name
      var original_id = tweet.in_reply_to_status_id_str
      var original_user = tweet.in_reply_to_screen_name

      //ppl posting the pic and triggering the bot within the same tweet
      if (original_id == null) {
        original_id = mentioning_id
        original_user = mentioning_user
      }

      //get the tweet with the picture
      Twitter.get(
        'statuses/show',
        {
          id: original_id,
          include_ext_alt_text: 'true',
          tweet_mode: 'extended'
        },
        function(err, original_tweet) {
          if (err) {
            console.log(err)
            return
          }

          //media in the original tweet
          if (
            original_tweet.extended_entities &&
            original_tweet.extended_entities['media']
          ) {
            var content = read(
              original_tweet,
              mentioning_id,
              mentioning_user,
              original_user
            )
            if (content !== '') {
              tweetThis(content, mentioning_id, mentioning_user, original_user)
            }
            return
          }

          //media in the triggering tweet
          if (tweet.extended_entities && tweet.extended_entities['media']) {
            var content = read(
              tweet,
              mentioning_id,
              mentioning_user,
              mentioning_user
            )
            if (content != '') {
              tweetThis(
                content,
                mentioning_id,
                mentioning_user,
                mentioning_user
              )
            }
            return
          }

          //in the quoted tweet?
          if (tweet.is_quote_status) {
            Twitter.get(
              'statuses/show',
              {
                id: tweet.quoted_status_id_str,
                include_ext_alt_text: 'true',
                tweet_mode: 'extended'
              },
              function(err, quoted_tweet) {
                if (err) {
                  console.log(err)
                  return
                }

                //media in the quoted tweet
                if (
                  quoted_tweet.extended_entities &&
                  quoted_tweet.extended_entities['media']
                ) {
                  var content = read(
                    quoted_tweet,
                    mentioning_id,
                    mentioning_user,
                    quoted_tweet.user.screen_name
                  )
                  if (content !== '') {
                    tweetThis(
                      content,
                      mentioning_id,
                      mentioning_user,
                      quoted_tweet.user.screen_name
                    )
                  }
                  return
                }

                //no media in quoted tweet
                tweetThis(
                  "I can't find any images in the tweet you're replying to, nor in your own tweet or the tweet you quoted, sorry.",
                  mentioning_id,
                  mentioning_user,
                  quoted_tweet.user.screen_name
                )
              }
            )
          } else {
            tweetThis(
              "I can't find any images in the tweet you're replying to or in your own tweet, sorry.",
              mentioning_id,
              mentioning_user,
              mentioning_user
            )
          }
        }
      )
    }
  })

  stream.on('err', function(err) {
    console.log(err)
  })
})

function read(tw, mentioning_id, mentioning_user, original_user) {
  var alt = ''

  //unfortunately, it is impossible to add alt texts to videos or gifs
  if (tw.extended_entities.media[0].type != 'photo') {
    alt =
      'This is a ' +
      tw.extended_entities.media[0].type +
      ". Unfortunately, twitter doesn't allow to add alt texts for " +
      tw.extended_entities.media[0].type +
      "s yet. \n @twitter, it'd be cool if you changed that!"
  } else {
    var media = tw.extended_entities['media']
    for (var i = 0; i < media.length; i++) {
      if (media.length > 1)
        alt += i + 1 + '. Pic: ' + media[i].ext_alt_text + '\n'
      else alt += media[i].ext_alt_text
    }
  }

  return alt
}

function tweetThis(content, toriginal_id, toriginal_user, original_user) {
  //pls no loops of death!
  if (toriginal_user == 'get_altText') {
    return
  }

  content = content.replace(
    /null/g,
    "There is no alt text for this image, i'm sorry. @" +
      original_user +
      " it'd be cool if you added descriptions to your images in the future to improve the accessibility! Here's how you can do that: https://help.twitter.com/en/using-twitter/picture-descriptions"
  )

  content = '@' + toriginal_user + ' ' + content

  if (content.length <= 280) {
    var reply = { status: content, in_reply_to_status_id: toriginal_id }
    Twitter.post('statuses/update', reply, function(err, tweet) {
      if (err) {
        console.log(err)
      }
    })
  } else {
    var cont_arr = content.split(' ')
    var part = ''

    while (cont_arr.length > 0 && part.length + cont_arr[0].length <= 280) {
      part += cont_arr[0] + ' '
      cont_arr.splice(0, 1)
    }

    var reply = { status: part, in_reply_to_status_id: toriginal_id }
    Twitter.post('statuses/update', reply, function(err, tweet) {
      if (err) {
        console.log(err)
      }
      tweetThis(cont_arr.join(' '), tweet.id_str, toriginal_user)
    })
  }
}
