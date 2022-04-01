const censoredPhrases = require('../censored-phrases.json')

module.exports = (text) => {
  let isCensored = false

  censoredPhrases.forEach((phrase) => {
    const regex = new RegExp(phrase, 'g')
    const censoredVersion = phrase.replace(/a|e|i|o|u/, '*')

    if (!isCensored) {
      isCensored = regex.test(text)
    }

    text = text.replace(regex, censoredVersion)
  })

  if (isCensored) {
    text +=
      "\n\n(Note from the bot: I had to censor a part of the description to avoid suspension from twitter, I'm sorry.)"
  }

  return text
}
