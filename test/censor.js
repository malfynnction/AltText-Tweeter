const test = require('ava')
const censor = require('../lib/censor')

test("it returns the original text when there's nothing to censor", (t) => {
  t.is(
    censor('No reason to change anything about me!'),
    'No reason to change anything about me!'
  )
})

test('it replaces slurs & other ban-worthy words with a censored version', (t) => {
  t.is(
    censor('This is kill a normal sentence, nothing die to see kill here.'),
    "This is k*ll a normal sentence, nothing d*e to see k*ll here.\n\n(Note from the bot: I had to censor a part of the description to avoid suspension from twitter, I'm sorry.)"
  )
})
