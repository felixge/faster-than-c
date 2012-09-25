# JSConf.eu Talk

## Introduction

Hi everybody, my name is "Felix Geisendörfer" and today I'd like to talk about
"Faster than C? Parsing Node.js Streams!".

I have this node.js module called node-mysql.  I started it because in mid 2010
there were no MySQL modules for node.js.

Unfortunately or fortunately, depending on how you look at it, I was not a very
sane person back then:

Because, if I was a sane person, I probably would have:

a) Picked a platform that already had a MySQL client
b) Waited for somebody else to do the work
c) Created a binding for libmysql

I mean all of these are somewhat reasonable choices, given that my goal at
that point was to build a company, not a database client.

But ... I decided to do none of the above. Instead I set out to re-implement
the MySQL protocol in node.js, using only JavaScript and no C/C++.

So if you would rather listen to a sane person presenting, I completely
understand. Now is still a good time to switch tracks.

I mean your first reaction to this should probably have been: MySQL uses a binary
protocol, implementing this in JavaScript must be insanely slow compared to C!

And your second reaction might be: Why not just create a binding to libmysql,
it would be so much less work.

Well as I said earlier, there is a good chance I am not an entirely sane
person, so I don't think I can convince you of everything I do. But ... if
things go well, maybe I can convince you that JavaScript can be fast enough
for most stream parsing tasks you will encounter.

## MySQL Client Live Coding

Before we get into the performance part of this talk, let me give you a quick
introduction to parsing binary data in JavaScript.

But instead of making up some stupid example, let's try a real world example
for this. Let's try to implement a MySQL client from scratch.

Unfortunately this slot is only 30 minutes, and I also want to talk about
performance. So lets limit this to 5 minutes. Just enough time to write the
worlds shittiest MySQL client.


