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
implementations would always outperform my pure JS version. I mean it was not
long after I released my library that libmysql bindings for node.js showed up,
and they were vastly outperforming my library.

However, after spending a good amount of time optimizing my library, I no
longer believe that C provides huges benefits in this problem domain, and in
this talk I'll try to show you on how to write very fast JavaScript programs
yourself.

## Benchmarking

Before I get started, lets talk about benchmarking. The first question you
may have is: What benchmarking library should I use?

My answer to that is: None, they all suck.

Now don't get me wrong, there are some nice and convenient libraries out there.
However, almost all of them do something very terrible: They mix data collection
and analysis into one step.

You know what this reminds me off? Performing SQL queries from within your HTML
templates. Sure, it's quick & easy, but it's certainly not the best approach
in many cases.

I mean some of the benchmarking libraries out there are really clever, they will
do a few warmup rounds on your code before using the results, they will calculate
statisticals properties such an mean, medium, stand deviation and other things.
Some may even draw pretty graphs for you. However, most of them don't produce
raw data, and that's a problem.

I'll show you why. Here is a graph comparing my current node-mysql parser
with another experimental version:

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/bar.pdf">
  <img src="./faster-than-c/raw/master/figures/mysql2-vs-poc/bar.png">
</a>

Great! It looks like my new parser is 2x as fast as the current one. But
unfortunately this graph is exactly what is wrong with most benchmarks you
will see. It's the usual, here look, A is better than B, so you should use that.
But it's completely lacking the raw data and any analysis whatsoever.

If this kind of results is all your benchmarking library can do, you should
throw it away. Because if it was producing the raw data set, it could be
analysed much further:

* [mysql2.tsv](./faster-than-c/raw/master/figures/mysql2-vs-poc/mysql2.tsv)
* [poc.tsv](./faster-than-c/raw/master/figures/mysql2-vs-poc/poc.tsv)

For example, when plotting the same data on a jitter graph, it would look
like this:

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/jitter.pdf">
  <img src="./faster-than-c/raw/master/figures/mysql2-vs-poc/jitter.png">
</a>

Oh, that's an odd distribution of data points. It seems like the results for
both parsers split into two categories: fast and slow. One thing is clear now,
this data can't be used to demonstrate anything until we figure out what
is going on. So let's plot those data points on a time scale:

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/line.pdf">
  <img src="./faster-than-c/raw/master/figures/mysql2-vs-poc/line.png">
</a>

Ok, this makes more sense now. It seems like both parsers start out fast, and
after a certain amount of time become slow from one moment to the next. Due
to the sudden nature of the drop, I first suspected that the V8 JIT was
de-optimizing my code after a while. However, I was unable to confirm this
even when starting my benchmark with `--trace-deopt --trace-bailout`.

So I started to plot the memory usage, and discovered something interesting
when plotting `process.memoryUsage().heapTotal`:

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/memory-line.pdf">
  <img src="./faster-than-c/raw/master/figures/mysql2-vs-poc/memory-line.png">
</a>

Looking at this graph, it seems that there is a correlation between the maximum
heap total reached in between GC cycles, and the throughput of the benchmark.


