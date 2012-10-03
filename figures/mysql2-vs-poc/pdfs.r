#!/usr/bin/env RScript

library(ggplot2)
library(scales)

outputWidth=8
outputHeight=6

files <- Sys.glob("results/*.tsv")

results <- lapply(files, function(.file){
  .in <- read.table(.file, sep="\t", header=T)
  .in$time = ISOdatetime(1970,1,1,0,0,0) + .in$time / 1000
  .in$mbit = (.in$bytes / (.in$duration / 1000) * 8) / 1024 / 1024
  .in
})

results <- do.call(rbind, results)

# Bar plot
mysql2 = subset(results, benchmark == 'mysql2')
poc = subset(results, benchmark == 'poc')

medians <- data.frame(
  lib = c('mysql2', 'poc'),
  mbit = c(median(mysql2$mbit), median(poc$mbit))
)

p <- ggplot(medians, aes(lib, mbit, fill=lib))
p <- p + scale_y_continuous(label=comma_format(),name="mbit (median)")
p + geom_bar()

ggsave(filename="pdfs/mbit-bar.pdf", width=outputWidth, height=outputHeight)

# Jitter Graph
p <- ggplot(results, aes(benchmark, mbit, color=benchmark))
p <- p + scale_y_continuous(label=comma_format())
p + geom_jitter()

ggsave(filename="pdfs/mbit-jitter.pdf", width=outputWidth, height=outputHeight)

# Line graph
p <- ggplot(results, aes(number, mbit, color=benchmark))
p <- p + scale_y_continuous(label=comma_format())
#p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

ggsave(filename="pdfs/mbit-line.pdf", width=outputWidth, height=outputHeight)

# Heap Used
p <- ggplot(results, aes(number, heapUsed / 1024 / 1024, color=benchmark))
p <- p + labs(y = "Heap Used (MB)")
#p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

ggsave(filename="pdfs/heap-used-line.pdf", width=outputWidth, height=outputHeight)

# Heap Total
p <- ggplot(results, aes(number, heapTotal / 1024 / 1024, color=benchmark))
p <- p + labs(y = "Heap Total (MB)")
#p <- p + scale_x_datetime(label=date_format("%H:%M:%S"))
p + geom_line()

ggsave(filename="pdfs/heap-total-line.pdf", width=outputWidth, height=outputHeight)
