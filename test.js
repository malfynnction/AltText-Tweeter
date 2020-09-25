const test = require('ava')
const testTweets = require('./test-tweets.json')
const getReplyText = require('./get-reply-text')

const noAltText = "There is no alt text for this image, I'm sorry."
const pleaseDoInTheFuture =
  "please add descriptions to your images in the future to improve the accessibility! Here's how you can do that: https://help.twitter.com/en/using-twitter/picture-descriptions"
const video =
  "This is a video. Unfortunately, twitter doesn't allow to add alt texts for videos yet. \n @twitter, it'd be cool if you changed that!"

test('classic flow, with alt text', async (t) => {
  const reply = getReplyText(testTweets[1])
  t.is(
    await reply,
    '@SnoringDoggo Athena the fluffy white and brown cat looks up innocently in front of a plush'
  )
})

test('classic flow, no alt text', async (t) => {
  const reply = getReplyText(testTweets[2])
  t.is(
    await reply,
    `@solitaryrainbow ${noAltText} @IAStartingLine ${pleaseDoInTheFuture}`
  )
})

test('triggering = original, no alt text', async (t) => {
  const reply = getReplyText(testTweets[3])
  t.is(
    await reply,
    `@womensart1 ${noAltText} @womensart1 ${pleaseDoInTheFuture}`
  )
})

test('triggering = original, with alt text', async (t) => {
  const reply = getReplyText(testTweets[4])
  t.is(
    await reply,
    '@foxeen Winzige runde Tropfen entlang den fast unsichtbaren Fäden eines Spinnennetzes in Nahaufnahme - manche sind ganz scharf, manche unscharf, aber alle zusammen wirken wie feinste Perlen-Spitze, meisterlich geklöppelt.'
  )
})

test('image in quote, alt text', async (t) => {
  const reply = getReplyText(testTweets[5])
  t.is(
    await reply,
    '@SehrysFlausch a tabby cat (@skyescats #OhMyOllie) sits on a chair, with its head looking up over a kitchen table. on the table is an unfinished jigsaw puzzle, the picture also featuring two tabby cats.'
  )
})

test('image in quote, no alt text', async (t) => {
  const reply = getReplyText(testTweets[6])
  t.is(
    await reply,
    `@_cumasyouare_ ${noAltText} @BLURRYECHOPILOT ${pleaseDoInTheFuture}`
  )
})

test('no quote, no reply, no image', async (t) => {
  const reply = getReplyText(testTweets[7])
  t.is(await reply, undefined)
})

test('reply, but no image anywhere', async (t) => {
  const reply = getReplyText(testTweets[8])
  t.is(await reply, undefined)
})

test('quote, but no image anywhere', async (t) => {
  const reply = getReplyText(testTweets[9])
  t.is(await reply, undefined)
})

test('image in triggering as well as original', async (t) => {
  const reply = getReplyText(testTweets[10])
  t.is(
    await reply,
    '@malfynnction My new ID, stating that my first name is Fynn and my second name is Julius, everything else - except the photo - is blacked out'
  )
})

test('tweet by bot itself', async (t) => {
  const reply = getReplyText(testTweets[11])
  t.is(await reply, undefined)
})

test('video', async (t) => {
  const reply = getReplyText(testTweets[12])
  t.is(await reply, `@souplemur ${video}`)
})

test('multiple images', async (t) => {
  const reply = getReplyText(testTweets[13])
  t.is(
    await reply,
    `@solitaryrainbow 1. Picture: ${noAltText} @ryanlcooper ${pleaseDoInTheFuture}\n2. Picture: ${noAltText} @ryanlcooper ${pleaseDoInTheFuture}\n3. Picture: ${noAltText} @ryanlcooper ${pleaseDoInTheFuture}\n`
  )
})
