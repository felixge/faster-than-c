# Faster than C? Parsing binary data in JavaScript.

This document contains the outline and code snippets for my 2012 JSConf.eu talk:
[Faster than C? Parsing binary data in JavaScript](http://2012.jsconf.eu/speaker/2012/09/05/faster-than-c-parsing-node-js-streams-.html)

## Introduction

Hi everybody, my name is [Felix Geisendörfer](http://twitter.com/felixge) and
today I'd like to talk about "Faster than C? Parsing Node.js Streams!".

I have this node.js module called
[node-mysql](https://github.com/felixge/node-mysql).  I started it because in
mid 2010 there were no MySQL modules for node.js.

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

I mean your first reaction to this should probably have been: MySQL uses a
binary protocol, implementing this in JavaScript must perform insanely bad
compared to C!

So for a long time I thought so as well. Shortly after I released my library,
other libraries based on libmysql were released, and they vastly outperformed
my library in many benchmarks.

Initially I thought I would have to accept this. But I always thought that my
library could perform at least a little bit better. So earlier this year I had
some time to work on this, and was able to release a new version of my library
that was much faster. So much faster in fact, that it was beating all other C
based libraries at that time.

At first I couldn't believe that, but after a lot of experiments, I now no
longer believe that binary parsers like this must be implemented in C for
performance reasons. JavaScript can be just as fast.

Later on I will explain in more detail what I mean by this.

## Benchmarking

But, before I get started, lets talk about benchmarking. Not because I want to,
but because it is kind of impossible to talk about performance without talking
about benchmarks.

The first question you may have is: What benchmarking library should I use?

My answer to that is: Probably none, most of them suck.

Now don't get me wrong, there are some nice and convenient libraries out there.
However, almost all of them do something very terrible: They mix data collection
and analysis into one step.

You know what this reminds me off? Performing SQL queries from within your HTML
templates. Sure, it's quick & easy, but it's certainly not the best approach
in many cases.

I mean some of the benchmarking libraries out there are really clever, they will
do a few warmup rounds on your code before using the results, they will calculate
statisticals properties such an mean, median, stand deviation and other things.
Some may even draw pretty graphs for you. However, most of them don't produce
raw data, and that's a problem.

I'll show you why. Here is a graph comparing my current node-mysql parser
with another experimental version I have been hacking on:

<a href="./faster-than-c/raw/master/data/mysql2-vs-poc/pdfs/bar.pdf">
  <img width="512" src="./faster-than-c/raw/master/data/mysql2-vs-poc/pngs/bar.png">
</a>

Great! It looks like my new parser is 2x as fast as the current one. And the
current one is already faster than many libmysql bindings. It must be great,
right?

Well, unfortunately this graph is exactly what is wrong with most benchmarks
you will see. It's the usual, here look, A is better than B, so you should use
that.  But it's completely lacking the raw data and more importantly, the
proper analysis, that you can only perform if you have the raw data.

So, if this kind of graph is all your benchmarking library can produce, you
should throw it away. Instead, all you really need is a standalone script
that produces the raw data set for you. In case of this graph, the data
set looks like this:

* [mysql2.tsv](./faster-than-c/raw/master/data/mysql2-vs-poc/results/mysql2.tsv)
* [poc.tsv](./faster-than-c/raw/master/data/mysql2-vs-poc/results/poc.tsv)

Now we can suddenly do much more with it, than comparing it based on median
performance. For example, we can plot the individual data points on a jitter
graph like this:

<a href="./faster-than-c/raw/master/data/mysql2-vs-poc/pdfs/jitter.pdf">
  <img width="512" src="./faster-than-c/raw/master/data/mysql2-vs-poc/pngs/jitter.png">
</a>

Oh, that's an odd distribution of data points. It seems like the results for
both parsers split into two categories: fast and slow. One thing is clear now,
this data can't be used to demonstrate anything until we figure out what
is going on. So let's plot those data points on a time scale:

<a href="./faster-than-c/raw/master/data/mysql2-vs-poc/pdfs/line.pdf">
  <img width="512" src="./faster-than-c/raw/master/data/mysql2-vs-poc/pngs/line.png">
</a>

Ok, this makes more sense now. It seems like both parsers start out fast, and
after a certain amount of time become slow from one moment to the next. Due
to the sudden nature of the drop, I first suspected that the V8 JIT was
de-optimizing my code after a while. However, I was unable to confirm this
even when starting my benchmark with `--trace-deopt --trace-bailout`.

So I started to plot the memory usage, and discovered something interesting
when plotting the heapTotal. The heapTotal is the amount of memory v8 reserves
storing you JavaScript objects in. V8 reserves this memory so it doesn't have
to do a new allocation whenever you create an object, which would be rather
slow. Anyway, when plotting the heapTotal, we get a graph like this:

<a href="./faster-than-c/raw/master/data/mysql2-vs-poc/pdfs/memory-line.pdf">
  <img width="512" src="./faster-than-c/raw/master/data/mysql2-vs-poc/pngs/memory-line.png">
</a>

Looking at this graph, it seems that there is a correlation between the maximum
heap total reached in between GC cycles, and the throughput of the benchmark. So
it now seems reasonable to hypothesize that there is a memory leak, either in
both parsers, or the setup of the benchmark, causing a performance regression
over time.

Anyway, the whole point of this example was to show you why it's important to
have benchmarks producing raw data, that you can analyze later.

## Benchmark Toolkit

So if you want to do any performance related work, in any language really, here
is what I suggest:

* Create a benchmark producing tab separated data points on stdout
* Cycles per second (Hz) and bytes per second (B/s) are generally good units
* Add plenty of useful meta data (time, memory, hardware, etc.) to each line
* Use the unix `tee` program to watch your output and record to a file at the
  same time.
* Use the [R Language](http://www.r-project.org/) and
  [ggplot2](http://ggplot2.org/) to analyze / plot your data
  (Check out [RStudio](http://rstudio.org/) and this
  [tutorial](https://github.com/echen/ggplot2-tutorial) to get started quickly)
* Write R scripts that produce PDF or other vector outputs
* Annotate your PDFs with [Skitch](http://skitch.com/) or similar
* Use [imagemagick](http://www.imagemagick.org/script/index.php) to convert your
  PDFs into PNGs or similar for the web
* Use Makefiles to automate your benchmark -> analysis pipeline

## Why JavaScript can parse the MySQL protocol as fast as C

@TODO
