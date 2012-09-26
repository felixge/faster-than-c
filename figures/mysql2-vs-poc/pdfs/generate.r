#!/usr/bin/env RScript

library(ggplot2)
library(scales)

outputWidth=8
outputHeight=6

mysql2 <- read.table("../results/mysql2.tsv", sep="\t", header=T)
poc <- read.table("../results/poc.tsv", sep="\t", header=T)

mysql2$time = ISOdatetime(1970,1,1,0,0,0) + mysql2$time / 1000
poc$time = ISOdatetime(1970,1,1,0,0,0) + poc$time / 1000

combined <- merge(mysql2, poc, all=T)

# Bar plot
pdf(file="bar.pdf", width=outputWidth, height=outputHeight)

medians <- data.frame(
  lib = c("mysql2", "poc"),
  hz = c(median(mysql2$hz), median(poc$hz))
)

p <- ggplot(medians, aes(lib, hz, fill=lib))
p <- p + scale_y_continuous(label=comma_format(),name="hz (median)")
p + geom_bar()

dev.off()

# Jitter Graph
pdf(file="jitter.pdf", width=outputWidth, height=outputHeight)

p <- ggplot(combined, aes(lib, hz, color=lib))
p <- p + scale_y_continuous(label=comma_format())
p + geom_jitter()

dev.off()

# Line graph
pdf(file="line.pdf", width=outputWidth, height=outputHeight)

p <- ggplot(combined, aes(time, hz, color=lib))
p <- p + scale_y_continuous(label=comma_format())
p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

dev.off()

# Memory Line graph
pdf(file="memory-line.pdf", width=outputWidth, height=outputHeight)

p <- ggplot(combined, aes(time, heapTotal / 1024 / 1024, color=lib))
p <- p + scale_y_continuous(name="Heap Total (MB)")
p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

dev.off()
