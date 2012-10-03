#!/usr/bin/env RScript

library(ggplot2)
library(scales)

outputWidth=8
outputHeight=6

files <- Sys.glob("results/*.tsv")

results <- lapply(files, function(.file){
  .in <- read.table(.file, sep="\t", header=T)
  .in$time = ISOdatetime(1970,1,1,0,0,0) + .in$time / 1000
  .in$hz = .in$count / (.in$duration / 1000)
  .in
})

results <- do.call(rbind, results)

## Jitter Graph
p <- ggplot(results, aes(benchmark, hz, color=benchmark))
p <- p + scale_y_log10()
p + geom_jitter()

ggsave(filename="pdfs/jitter.pdf", width=outputWidth, height=outputHeight)

# Line graph
p <- ggplot(results, aes(time, hz, color=benchmark))
p <- p + scale_y_continuous(label=comma_format())
p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

ggsave(filename="pdfs/line.pdf", width=outputWidth, height=outputHeight)

# Heap Used
p <- ggplot(results, aes(time, heapUsed / 1024 / 1024, color=benchmark))
p <- p + labs(y = "Heap Used (MB)")
p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

ggsave(filename="pdfs/heap-used-line.pdf", width=outputWidth, height=outputHeight)

# Heap Total
p <- ggplot(results, aes(time, heapTotal / 1024 / 1024, color=benchmark))
p <- p + labs(y = "Heap Total (MB)")
p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

ggsave(filename="pdfs/heap-total-line.pdf", width=outputWidth, height=outputHeight)
