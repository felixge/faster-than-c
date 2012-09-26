# JSConf.eu Talk

## Introduction

Hi everybody, my name is "Felix Geisendörfer" and today I'd like to talk about
"Faster than C? Parsing Node.js Streams!".

I have this node.js module called node-mysql.  I started it because in mid 2010
there were no MySQL modules for node.js.

Unfortunately or fortunately, depending on how you look at it, I was not a very
sane person back then:

Because, if I was a sane person, I probably would have:

a) Created a binding for libmysql
b) Waited for somebody else to do the work
c) Picked a platform that already had a MySQL client

I mean all of these are somewhat reasonable choices, given that my goal at
that point was to build a company, not a database client.

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


