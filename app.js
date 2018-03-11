var TwitterP = require('twitter');
var keys = require('./keys')

var Twitter = new TwitterP(keys);

Twitter.stream('statuses/filter', {track: '@get_altText'}, function(stream) {
  stream.on('data', function(tweet) {

    // do not reply to retweets
    if (typeof tweet.retweeted_status === 'undefined') {

      var m_id = tweet.id_str;
      var m_us = tweet.user.screen_name;
      var o_id = tweet.in_reply_to_status_id_str;

      if (o_id == null) {
        o_id = m_id;
      }

      Twitter.get('statuses/show', {id: o_id, include_ext_alt_text: 'true', tweet_mode: 'extended'}, function(err, o_tweet){
        if(err) {
          console.log(err);
        }

        if (o_tweet.extended_entities == undefined || o_tweet.extended_entities['media'] == undefined) {
          tweetThis('You don\'t seem to be replying to a tweet containing an image.', m_id, m_us);
        }

        else {
          var media = o_tweet.extended_entities['media'];
          var cont = '';
          for (var i = 0; i < media.length; i++) {
            if (media.length > 1) cont += (i+1) + '. Pic: ' + media[i].ext_alt_text + '\n';
            else cont += media[i].ext_alt_text;
          }
          tweetThis(cont, m_id, m_us);
        }
      })
    }
  });

  stream.on('err', function(err) {
    console.log(err);
  });
});

function tweetThis (content, to_id, to_us) {
  if (to_us == 'get_altText') {
    return;
  }

  content = content.replace(/null/g, 'There is no alt text for this image, i\'m sorry.');
  
  var content = '@' + to_us + ' ' + content;

  if (content.length <= 280) {
    var reply = {status: content, in_reply_to_status_id: to_id}
    Twitter.post('statuses/update', reply,  function(err, tweet){
      if(err){
        console.log(err);
      }
    });
  }

  else {
    var cont_arr = content.split(' ');
    var part = '';

    while(cont_arr.length > 0 && (part.length + cont_arr[0].length) <= 280){
      part += cont_arr[0] + ' ';
      cont_arr.splice(0,1);
    }

    var reply = {status: part, in_reply_to_status_id: to_id}
    Twitter.post('statuses/update', reply,  function(err, tweet){
      if(err){
        console.log(err);
      }
      tweetThis(cont_arr.join(' '), tweet.id_str, to_us);
    });
  }
}
