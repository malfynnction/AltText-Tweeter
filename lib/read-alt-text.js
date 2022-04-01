const altForMedium = (medium) =>
  medium.ext_alt_text === null
    ? "There is no alt text for this image, I'm sorry."
    : medium.ext_alt_text

module.exports = (tweet) => {
  const media = tweet.extended_entities.media

  // unfortunately, it is impossible to add alt texts to videos
  const supportedMediaTypes = ['photo', 'animated_gif']
  const mediaType = media[0].type

  if (!supportedMediaTypes.includes(mediaType)) {
    return `This is a ${mediaType}. Unfortunately, twitter doesn't allow to add alt texts for ${mediaType}s yet.`
  } else if (media.length === 1) {
    return altForMedium(media[0])
  } else {
    return media.reduce(
      (alt, medium, i) => alt + `${i + 1}. Picture: ${altForMedium(medium)}\n`,
      ''
    )
  }
}
