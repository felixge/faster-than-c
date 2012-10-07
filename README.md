# Faster than C? Parsing binary data in JavaScript.

This document contains the outline and code snippets for my 2012 JSConf.eu talk:
[Faster than C? Parsing binary data in JavaScript](http://2012.jsconf.eu/speaker/2012/09/05/faster-than-c-parsing-node-js-streams-.html)

## Introduction

Hi everybody, my name is [Felix Geisendörfer](http://twitter.com/felixge) and
today I'd like to talk about "Faster than C? Parsing Node.js Streams!".

<!-- Add transloadit slide -->

So, I have this module I wrote that lets you talk to MySQL databases in
node.js. I started it because in early 2010 there were no MySQL modules for
node.js. Well, that's not quite true.  There was [one
module](https://github.com/masuidrive/node-mysql) by [Yuichiro
MASUI](http://twitter.com/masuidrive). But unfortunately he never finished it.

<img width="258" src="./faster-than-c/raw/master/figures/other/yuichiro-masui.png">
<img width="698" src="./faster-than-c/raw/master/figures/other/node-mysql-original.png">

However, there was something interesting about it. It was written in JavaScript.
I mean just JavaScript, no C/C++. In fact it was even crazier, because when
that module was started, node.js did not have Buffers. So this guys was doing
all the MySQL parsing using JavaScript Strings. WTF (What the Frühstück).

Btw. here is a piece of node.js trivia - did you know that Buffer was
originally named Blob in node.js? Thinking about it, Blob would have been a
much better name for it, because Buffer can have so many other meanings.
Unfortunately the name "Blob" died at a very young age. Merely 3 minutes and
15 seconds after landing the [Blob commit](https://github.com/joyent/node/commit/0afed523299515762e97ff40c12bf3285d24a38a),
Ryan decided to rename the object [to Buffer](https://github.com/joyent/node/commit/630bb7a0127df7606fc3d99d36170c378f09f6b9).
Oh well ... RIP Blob.

Anyway, back to mysql. So masui's module was really inspiring for me. Before I
saw it, I though the only way to get mysql working was to bind to libmysql.
However, the problem is that libmysql is a blocking library and the mechanics
of integrating a blocking library with node were not very clear back then.

<!-- Maybe add live coding mysql client section here -->

So in a rather compulsive move, I was like "FUCK THIS" and started to write a
new MySQL client from scratch. I did not continue with masui's code base
because it was based on strings.  Anyway, over a time span of about 3
months, this code base turned into a working library called
[node-mysql](http://github.com/felixge/node-mysql) and people started using it.

<img width="236" src="./faster-than-c/raw/master/figures/other/felix-geisendoerfer.png">
<img width="610" src="./faster-than-c/raw/master/figures/other/node-mysql.png">

But ... you know how it is in this universe. No good deed goes unpunished.
Newton already discovered this in 1687 and is now known as the third law of
motion:

> When a first body exerts a force F1 on a second body, the second body
> simultaneously exerts a force F2 = −F1 on the first body. This means that F1
> and F2 are equal in magnitude and opposite in direction.

Now, of course Github did no exist back then, but I'm pretty sure that if it
did, Newton would have become a programmer, and he would have discovered
something like this.

> When a first person pushes a library L1 into a remote repository, a second
> person simultaneously starts working on a second library L2 which will be
> equally awesome, but in a different way.

-- Third law of Github

And this is what happened, [Oleg Efimov](https://github.com/Sannis) released a
new library called [mysql-libmysqlclient](https://github.com/Sannis/node-mysql-libmysqlclient).

<img width="245" src="./faster-than-c/raw/master/figures/other/oleg-efimov.png">
<img width="614" src="./faster-than-c/raw/master/figures/other/node-mysql-libmysqlclient.png">

His library had a few disadvantages compared to mine, but it was awesome by
being much faster:

<img width="640" src="./faster-than-c/raw/master/figures/mysql-libs/pngs/a-b.png">

Initially I thought, fuck, of course. libmysql is written in C, that's why
Oleg's library is much faster. Maybe I can optimize mine and get another 10-20%
performance boost, but there is no way I can get a 300% increase.

But wait ... wasn't V8 supposed to turn my code into assembly? And was it not
supposed to be insanely fast? And wasn't node going to solve all of my problems
anyway? Had I been lied to?

Well, of course I had been lied to. Node and V8 don't make shit go fast. They
are just tools. Very capable tools, sure, but you still need to do the work.

So after I overcame my initial resignation, I set out to make my parser faster.
The current result of that is node-mysql 2.x, which can easily compete against
libmysql.

<img width="640" src="./faster-than-c/raw/master/figures/mysql-libs/pngs/a-b-c.png">

But again, it didn't take long for the third law of Github to kick in again, and
a few months ago a new library called [mariasql](https://github.com/mscdex/node-mariasql)
was released by [Brian White](https://github.com/mscdex).

<img width="237" src="./faster-than-c/raw/master/figures/other/brian-white.png">
<img width="698" src="./faster-than-c/raw/master/figures/other/node-mariasql.png">

And yet again, it was an amazing performance improvement. As you can see in this
graph, mariasql is kicking the shit out of my library:

<img width="640" src="./faster-than-c/raw/master/figures/mysql-libs/pngs/a-b-c-d.png">

So fuck - maybe it's time to finally give up and accept that I cannot compete
with a well engineered C binding. C must be faster after all.

Well - fuck this! This is unacceptable. Fuck this "C is the only choice if you
want the best performance" type of thinking. I want JavaScript to win this. Not
because I like JavaScript, oh it can be terrible. I want JavaScript to win this
because I want to be able to use a higher level language without worrying about
performance.

So ... I am hacking on a new parser again. And from the looks of it, it will
allow me to be as fast as the mariaqsql library:

<img width="640" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/bar.png">

Of course, the 3rd law of GitHub would predict that this won't last very long,

And from everything I have seen, this is when it will be over. JavaScript will
no longer be the bottleneck. At this point the main cost is turning network
data into JavaScript objects. This cost is equal for JavaScript libraries, as
well as for C++ addons making V8 calls. Also, when a single client can process
5000 MBit/s utilizing a single CPU, your MySQL server has long exploded.

Anyway, who cares. Let's stop talking about my unfinished new parser and mysql.
Let's talk about writing fast JavaScript programs, and what works, and what
does not.

## What does not work

### Profiling

The natural tool people reach for when fixing performance problems is the
profiler. In node this is done by starting your program with `node --prof`
which creates a `v8.log` file which you can then analyze with
`node/deps/v8/tools/mac-tick-processor`. This only works if you have `d8`, the
v8 command line interpreter, in your `$PATH`, but whatever, you will get an
analysis of what functions are consuming a high percentage of time (ticks) in
your program.

This works really well if your performance is lost in a small function
performing an inefficient algorithm with my iterations. The profiler will tell
you about this function, you fix the algorithm, and you win.

But, life is never this easy. Your code may not be very profilable. This was
the case with my mysql 0.9.6 library. My parser was basically one big function
with a huge switch statement. I thought this was a good idea because this is
how Ryan's http parser for node looks like and being a user of node, I have
a strong track record for joining cargo cults. Anyway, the big switch statement
meant that the profiler output was useless for me, "Parser#parse" was all it
told me about : (.

So this is when I discovered that profiling is a very limited tool. It works in
some situations, but in my case, and many other cases, it provided very little
value.

### Taking performance advice from strangers

Another thing that does not work is taking performance advise from strangers.
And by strangers I mean anybody who is not deeply familiar with your exact
problem. Sure, the VM engineers you will meet at this conference are amazing,
and they will be able to give you many good ideas and inspiration. However,
applying this knowledge blindly is never going to result in good performance.

So stop listening to specific performance tips, and instead listen to this.


## What does work

### Benchmark Driven Development

While working on my module, I have only found one technique that continuously
produced good results for me. Benchmark driven development.

So what is benchmark driven development, and how can you use it to write very
fast JavaScript programs. Well, first of all you have to accept that speeding
up your current code base will be very very hard. If performance is a really
important design goal for you, you have to integrate it into your development
work flow from the beginning. This is very similar to test driven development,
where you write tests from the beginning to achieve a high level of correctness
in your software.

So how does benchmark driven development work? Well, you start by creating
a function you want to benchmark. Let's call it `benchmark`:

```js
function benchmark() {
  // intentionally empty
}
````

Now you write a benchmark for it:

```js
while (true) {
  var start = Date.now();
  benchmark();
  var duration = Date.now() - start;
  console.log(duration);
}
```

Congratulations, you have just written the fastest function in the world.
Unfortunately it does not do anything. So the next step is to implement the
minimal amount of code that is useful to you. For the MySQL protocol, this would
mean parsing the packet headers. While you do this, keep running the benchmark
and tweak your code trying to make it stay fast while adding features.

Doing this will allow you to gain an intuitive understanding of the performance
impacts your coding decisions really have. You will learn that most performance
tips you have heard of are complete bullshit in your context, and some others
produce amazing results.

### Examples

Here are a few things I learned from applying this technique, but they are
just examples. Please do not attempt similar optimizations unless you are
solving the same problem as me:

* try...catch is ok
* big switch statements = bad
* function calls are *really* cheap

### Data analysis

The next thing you should do is analyze your data. And for the love of god,
please don't use a benchmarking library that mixes benchmarking and analysis
into one step. This is like a putting SQL queries into your templates - don't
do it.

No, a good benchmark produces raw data, for example tab separated values work
great. Each line should contain one data point of your benchmark, along with
any metrics you get can from your virtual machine or operating system.  Pipe
this data into a file for 1-2 minutes.

Now that you have the raw data, start to analyze it. The R language is a great
tool for this. Try to automate it as much as possible. My flow is like this:

* Use the unix `tee` program to watch your output and record to a file at the
  same time.
* Use the [R Language](http://www.r-project.org/) and
  [ggplot2](http://ggplot2.org/) to analyze / plot your data as pdfs
  (Check out [RStudio](http://rstudio.org/) and this
  [tutorial](https://github.com/echen/ggplot2-tutorial) to get started quickly)
* Annotate your PDFs with [Skitch](http://skitch.com/) or similar
* Use [imagemagick](http://www.imagemagick.org/script/index.php) to convert your
  PDFs into PNGs or similar for the web
* Use Makefiles to automate your benchmark -> analysis pipeline

So why should you analyze / graph your data? Can't I just use the median? Well,
no. Otherwise you end up with bullshit. In fact, all of the benchmark graphs
I have shown you so far are complete bullshit. Remember the benchmark showing
the performance of my new parser?

<img width="640" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/bar.png">

Well, let's look at it another way. Here is a jitter plot:

<img width="640" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/jitter.png">




<!-- Mention Buffering -->


## What does work

So after hitting a wall with profiling, I decided to try a new approach. And it
turns out this approach is working really well for me.


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

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/pdfs/bar.pdf">
  <img width="512" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/bar.png">
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

* [mysql2.tsv](./faster-than-c/raw/master/figures/mysql2-vs-poc/results/mysql2.tsv)
* [poc.tsv](./faster-than-c/raw/master/figures/mysql2-vs-poc/results/poc.tsv)

Now we can suddenly do much more with it, than comparing it based on median
performance. For example, we can plot the individual data points on a jitter
graph like this:

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/pdfs/jitter.pdf">
  <img width="512" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/jitter.png">
</a>

Oh, that's an odd distribution of data points. It seems like the results for
both parsers split into two categories: fast and slow. One thing is clear now,
this data can't be used to demonstrate anything until we figure out what
is going on. So let's plot those data points on a time scale:

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/pdfs/line.pdf">
  <img width="512" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/line.png">
</a>

Ok, this makes more sense now. It seems like both parsers start out fast, and
after a certain amount of time become slow from one moment to the next. Due
to the sudden nature of the drop, I first suspected that the V8 JIT was
de-optimizing my code after a while. However, I was unable to confirm this
even when starting my benchmark with `--trace-deopt --trace-bailout`.

So I started to plot the memory usage, and discovered something interesting
when plotting the heapUsed. That's the amount of memory V8 is currently using
to store my JavaScript objects in.

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/pdfs/heap-used-line.pdf">
  <img width="512" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/heap-used-line.png">
</a>

Looking at this graph, it seems that there is a correlation between the maximum
heap used in between GC cycles, and the throughput of the benchmark. This could
indicate a memory leak. However, after the first performance regression, it
seems like the heap is no longer growing.

Another look at the heapTotal, which is the total amount of memory allocated
by v8, some of it always empty, reveals a similar picture:

<a href="./faster-than-c/raw/master/figures/mysql2-vs-poc/pdfs/heap-total-line.pdf">
  <img width="512" src="./faster-than-c/raw/master/figures/mysql2-vs-poc/pngs/heap-total-line.png">
</a>

As we can see, our performance problem seem to be correlated with v8 deciding to
grow the heap total. From this data it is still unclear to me if v8 is making
the wrong decision by growing the heap total here, or if there is a problem in
my code, causing this performance issue.

Anyway, the whole point of this example was to show you why it's important to
have benchmarks producing raw data. If you don't have the raw data, you're never
going to to be able to analyze your benchmarks for problems like this, always
running the risk of fooling yourself.

## Benchmark Toolchain

So if you want to do any performance related work, in any language really, here
is a benchmarking toolchain that is working well for me:

* Create a benchmark producing tab separated data points on stdout
* Cycles per second (Hz) and bytes per second (B/s) are generally good units
* Add plenty of useful meta data (time, memory, hardware, etc.) to each line
* Use the unix `tee` program to watch your output and record to a file at the
  same time.
* Use the [R Language](http://www.r-project.org/) and
  [ggplot2](http://ggplot2.org/) to analyze / plot your data as pdfs
  (Check out [RStudio](http://rstudio.org/) and this
  [tutorial](https://github.com/echen/ggplot2-tutorial) to get started quickly)
* Annotate your PDFs with [Skitch](http://skitch.com/) or similar
* Use [imagemagick](http://www.imagemagick.org/script/index.php) to convert your
  PDFs into PNGs or similar for the web
* Use Makefiles to automate your benchmark -> analysis pipeline

## Parsing binary streams in node.js

Now let's talk about parsing binary streams in node.js. If you have not parsed
a binary stream in node.js or another plattform before, here is a quick example.

Let's say we want to write a MySQL client.

( Live coding, code available [here](./faster-than-c/raw/master/figures/mysql-client/client.js) )

So as you can see, parsing binary data itself is not so hard. What's hard is
keeping track of your internal state. Because the parser we just wrote is
inherently broken because it does not handle the case where we only receive
a partial handshake packet from our server in our first 'data' event. So in
my first node-mysql version, I tackled this with a huge state machine / switch
statement.
