# Faster than C? Parsing binary data in JavaScript.

This document contains the outline and code snippets for my 2012 JSConf.eu talk:
[Faster than C? Parsing binary data in JavaScript](http://2012.jsconf.eu/speaker/2012/09/05/faster-than-c-parsing-node-js-streams-.html)

## Introduction

Hi everybody, my name is [Felix Geisendörfer](http://felixge.de/) and today I'd
like to talk about "Faster than C? Parsing Node.js Streams!".

I have this node.js module called node-mysql.  I started it because in mid 2010
there were no MySQL modules for node.js.

Unfortunately or fortunately, depending on how you look at it, I was not a very
sane person back then:

Because, if I was a sane person, I probably would have:

* Picked a platform that already had a MySQL client
* Waited for somebody else to do the work
* Created a binding for libmysql

I mean all of these are somewhat reasonable choices, given that my goal at that
point was to build a [company](http://transloadit.com/), not a database client.

But ... I decided to do none of the above. Instead I set out to re-implement
the MySQL protocol in node.js, using only JavaScript and no C/C++.

So if you would rather listen to a sane person presenting, I completely
understand. Now is still a good time to switch tracks.

I mean your first reaction to this should probably have been: MySQL uses a binary
protocol, implementing this in JavaScript must be insanely slow compared to C!

For a long time, I also thought that this would be the case, and that C based
implementations would always outperform my pure JS version.

However, after spending a good amount of time optimizing my library, I no
longer believe this to be the case, and would like to present you with the
results of my research.

## Benchmarking

Before I get started, lets talk about benchmarking. Or more specifically, why
most benchmarks you see are terrible.

Most benchmarks are created to show that one thing is faster than another.
Unfortunately however, creating good benchmarks is a lot of work. And 
