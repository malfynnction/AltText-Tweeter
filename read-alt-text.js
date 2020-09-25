module.exports = (tw, original_user) => {
  let alt = ''

  const supportedMediaTypes = ['photo', 'animated_gif']

  //unfortunately, it is impossible to add alt texts to videos or gifs
  if (!supportedMediaTypes.includes(tw.extended_entities.media[0].type)) {
    alt =
      'This is a ' +
      tw.extended_entities.media[0].type +
      ". Unfortunately, twitter doesn't allow to add alt texts for " +
      tw.extended_entities.media[0].type +
      "s yet. \n @twitter, it'd be cool if you changed that!"
  } else {
    const media = tw.extended_entities['media']
    for (let i = 0; i < media.length; i++) {
      if (media.length > 1)
        alt += i + 1 + '. Picture: ' + media[i].ext_alt_text + '\n'
      else alt += media[i].ext_alt_text
    }
  }

  return alt.replace(
    /null/g,
    "There is no alt text for this image, I'm sorry. @" +
      original_user +
      " please add descriptions to your images in the future to improve the accessibility! Here's how you can do that: https://help.twitter.com/en/using-twitter/picture-descriptions"
  )
}
