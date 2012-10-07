#!/usr/bin/env RScript

library(ggplot2)
library(scales)

outputWidth=8
outputHeight=6

files <- Sys.glob("results/*.tsv")

results <- lapply(files, function(.file){
  .in <- read.table(.file, sep="\t", header=T)
  .in$time = ISOdatetime(1970,1,1,0,0,0) + .in$time / 1000
  .in$bytes = 180822241
  .in$mbit = (.in$bytes / (.in$duration / 1000) * 8) / 1000 / 1000
  .in
})

results <- do.call(rbind, results)

# a-b
a <- data.frame(benchmark = c('mysql-0.9.6'), mbit = c(median(subset(results, benchmark == "mysql-0.9.6")$mbit)))
b <- data.frame(benchmark = c('mysql-libmysqlclient-1.5.1'), mbit = c(median(subset(results, benchmark == "mysql-libmysqlclient-1.5.1")$mbit)))

p <- ggplot(rbind(a,b), aes(benchmark, mbit, fill=benchmark))
p <- p + scale_y_continuous(label=comma_format())
p + geom_bar()

ggsave(filename="pdfs/a-b.pdf", width=outputWidth, height=outputHeight)

# a-b-c
c <- data.frame(benchmark = c('mysql-2.0.0-alpha3'), mbit = c(median(subset(results, benchmark == "mysql-2.0.0-alpha3")$mbit)))

p <- ggplot(rbind(a,b,c), aes(benchmark, mbit, fill=benchmark))
p <- p + scale_y_continuous(label=comma_format())
p + geom_bar()

ggsave(filename="pdfs/a-b-c.pdf", width=outputWidth, height=outputHeight)

# a-b-c-d
d <- data.frame(benchmark = c('mariadb-0.1.7'), mbit = c(median(subset(results, benchmark == "mariadb-0.1.7")$mbit)))

p <- ggplot(rbind(a,b,c,d), aes(benchmark, mbit, fill=benchmark))
p <- p + scale_y_continuous(label=comma_format())
p + geom_bar()

ggsave(filename="pdfs/a-b-c-d.pdf", width=outputWidth, height=outputHeight)


# Jitter Graph
p <- ggplot(results, aes(benchmark, mbit, color=benchmark))
p <- p + scale_y_continuous(label=comma_format())
p + geom_jitter()

ggsave(filename="pdfs/mbit-jitter.pdf", width=outputWidth, height=outputHeight)

# Line graph
p <- ggplot(results, aes(number, mbit, color=benchmark))
p <- p + scale_y_continuous(label=comma_format())
p + geom_line()

ggsave(filename="pdfs/mbit-line.pdf", width=outputWidth, height=outputHeight)

# Heap Used
p <- ggplot(results, aes(number, heapUsed / 1024 / 1024, color=benchmark))
p <- p + labs(y = "Heap Used (MB)")
p + geom_line()

ggsave(filename="pdfs/heap-used-line.pdf", width=outputWidth, height=outputHeight)

# Heap Total
p <- ggplot(results, aes(number, heapTotal / 1024 / 1024, color=benchmark))
p <- p + labs(y = "Heap Total (MB)")
p + geom_line()

ggsave(filename="pdfs/heap-total-line.pdf", width=outputWidth, height=outputHeight)

# Heap Total
p <- ggplot(results, aes(number, heapTotal / 1024 / 1024, color=benchmark))
p <- p + labs(y = "Heap Total (MB)")
p + geom_line()

ggsave(filename="pdfs/heap-total-line.pdf", width=outputWidth, height=outputHeight)
