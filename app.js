var TwitterP = require('twitter');
var keys = require('./keys')

var Twitter = new TwitterP(keys);

Twitter.stream('statuses/filter', {track: '@get_altText'}, function(stream) {
  stream.on('data', function(tweet) {

    // do not reply to retweets & don't get triggered by people who reply to the bot
    if (typeof tweet.retweeted_status === 'undefined' && tweet.in_reply_to_screen_name !== 'get_altText') {

      //the tweet that triggered the bot
      var m_id = tweet.id_str;
      //the user who triggered the bot
      var m_us = tweet.user.screen_name;
      //the original tweet (with the pic)
      var o_id = tweet.in_reply_to_status_id_str;
      //the user who originally posted the pic
      var o_us = tweet.in_reply_to_screen_name;

      //ppl posting the pic and triggering the bot within the same tweet
      if (o_id == null) {
        o_id = m_id;
        o_us = m_us;
      }

      //get the tweet with the picture
      Twitter.get('statuses/show', {id: o_id, include_ext_alt_text: 'true', tweet_mode: 'extended'}, function(err, o_tweet){
        if(err) {
          console.log(err);
        }

        //no media in the original tweet
        if (o_tweet.extended_entities == undefined || o_tweet.extended_entities['media'] == undefined) {

          //no media in the triggering tweet
          if (tweet.extended_entities == undefined || tweet.extended_entities['media'] == undefined) {
            
            //in the quoted tweet?
            if (tweet.is_quote_status) {
              Twitter.get('statuses/show', {id: tweet.quoted_status_id_str, include_ext_alt_text: 'true', tweet_mode: 'extended'}, function(err, q_tweet){
                
                //no media in the quoted tweet
                if (q_tweet.extended_entities == undefined || q_tweet.extended_entities['media'] == undefined) {
                  tweetThis ('I can\'t find any images in the tweet you\'re replying to, nor in your own tweet or the tweet you quoted, sorry.', m_id, m_us, q_tweet.user.screen_name);
                }

                //found media in quoted tweet
                else {
                  var content = read(q_tweet, m_id, m_us, q_tweet.user.screen_name);
                  if (content !== '') {
                    tweetThis (content, m_id, m_us, q_tweet.user.screen_name);
                  }
                }
              });
            }

            else {
              tweetThis ('I can\'t find any images in the tweet you\'re replying to or in your own tweet, sorry.', m_id, m_us, m_us);
            }

          }
          //found media in triggering tweet
          else {
            var content = read(tweet, m_id, m_us, m_us);
            if (content != '') {
              tweetThis(content, m_id, m_us, m_us);
            }
          }
        }

        //found media in original tweet
        else {
          var content = read(o_tweet, m_id, m_us, o_us);
          if (content !== '') {
            tweetThis(content, m_id, m_us, o_us);
          }
        }
      });
    }
  });

  stream.on('err', function(err) {
    console.log(err);
  });
});

function read (tw, m_id, m_us, o_us) {
  var alt = '';
  var media = tw.extended_entities['media'];
  for (var i = 0; i < media.length; i++) {
    if (media.length > 1) alt += (i+1) + '. Pic: ' + media[i].ext_alt_text + '\n';
    else alt += media[i].ext_alt_text;
  }

  return alt;
}


function tweetThis (content, to_id, to_us, o_us) {
  //pls no loops of death!
  if (to_us == 'get_altText') {
    return;
  }

  content = content.replace(/null/g, 'There is no alt text for this image, i\'m sorry. @' + o_us + ' it\'d be cool if you added descriptions to your images in the future to improve the accessibility! Here\'s how you can do that: https://help.twitter.com/en/using-twitter/picture-descriptions');
  
  content = '@' + to_us + ' ' + content;

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
