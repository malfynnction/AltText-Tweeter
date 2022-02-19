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
      's yet.'
  } else {
    const media = tw.extended_entities['media']
    for (let i = 0; i < media.length; i++) {
      const mediumAlt =
        media[i].ext_alt_text === null
          ? "There is no alt text for this image, I'm sorry."
          : media[i].ext_alt_text

      if (media.length > 1) {
        alt += i + 1 + '. Picture: ' + mediumAlt + '\n'
      } else {
        alt += mediumAlt
      }
    }
  }

  return alt;
}
