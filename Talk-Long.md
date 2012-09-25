# JSConf.eu Talk

## Introduction

Hi everybody, my name is "Felix Geisendörfer" and today I'd like to talk about
"Faster than C? Parsing Node.js Streams!".

So basically I will talk about parsing binary data in JavaScript while making
ridiculous performance claims along the way ...

To make this an even more frightening experience, I've also decided to attempt
to live code a MySQL client from scratch. Because, you know, what could go
wrong?

But, before I get started, let's have a quick look at the mistakes, err, decision
I have made in my life that forced me into implementing various stream parsers.

Up until 2008, I used to be a PHP developer, and that was actually quite ok.
You can say a lot of bad things about PHP, but for many tasks you can be quite
productive with it.

But then I had this idea for a file uploading and processing startup, and
suddenly PHP did not seem like the right tool for the job anymore. The product
we were building is called transloadit, and is basically a REST API that plugs
together dozens of command line utilities like ffmpeg, image magick, etc..

At this point technologies like redis or zeromq did not exist, so orchestrating
many worker processes with each other was very difficult. Luckily in early 2009
a new project appeared on my radar: It was called node.js.

Initially I just thought that it was a cute idea, but when Ryan added the ability
to execute other programs from within node, I got really excited.

This was node version 0.0.6, and the API for running another process looked
like this:

```js
var ls = new Process("ls -lh /usr");

console.log('pid is: ', ls.pid);

process.onOutput = function (chunk) { };
process.onError = function (chunk) { };
process.onExit = function (exit_code) { };

// ...
```

Have you ever tried executing other programs in PHP? Or for that matter, most
other platforms? And have you tried to do it in the background without blocking
your main thread? And have you tried to treat the stdout, stderr and stdin as
the streams they really are? And have you tried to capture the exit code, or
god forbid, the signal responsible for terminating your child? And have you
tried orchestrating multiple processes like this at once?

Well, I have, and suffice it to say, this was, and still is pretty ugly on most
platforms.

But node, oh node. The API was so cute, and JavaScript didn't seem all that bad
coming from PHP.  I was sold.  This was exactly the tool I wanted to use for
building transloadit.

So I did was seemed like a sensible idea to me at that point: I started
rewriting our code base in node.js.

And by node.js, I mean node.js version 0.0.6 ...

Day 1 with node.js was pretty fantastic. I solved a few previously hard problems
in a matter of minutes.  But unfortunately, that was only day 1.

On day 2 I started to discover that node still had a few bugs throughout the
code base, which eventually lead to me becoming an active contributor in the
early node days.

So I was still excited on day 2, but it wasn't until day 3 that I started to
realize the full consequences of jumping on a new platform this early.

That's because on day 3 I discovered that there were pretty much no libraries
available for node.js. Literally, nothing!

NPM did not exist yet, and I was #24 to join the mailing list of what was a
very tiny community at that point.

FUCK.

So this talk is the story of me wasting the next few years of my life
re-inventing the wheel in node.js instead of getting actual work done.

And don't get me wrong, this was actually a lot of fun, and we did somehow
manage to build a profitable product along the way.

But it certainly could have been easier if I had already known what I do now
about parsing stream data.

## Parsing Binary Data

So lets get to the meat of this talk - parsing binary data.

What's binary data you may ask? Everything on our computer is binary, 1 or 0,
right?

Well, here is my non-scientific explanation:

* Binary data: "Never Gonna Give You Up" video file opened in text edit
* Textual data: "Never Gonna Give You Up" Wikipedia Source Code

So basically binary data is the stuff that makes no sense until converted to
another human readable presentation.

What good is it then? Couldn't we present everything in plaintext or JSON?

We could, and I am fairly convinced that there are lots of formats and protocols
where the wrong decisions were made when it comes to choosing binary or textual
representation.

However, if efficiency really counts, for example when compressing a video file,
so we can squeeze it through the great tubes we call the internet, there really
is not much of a choice, we need to savor every byte, possibly even every bit.


