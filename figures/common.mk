SHELL := /bin/bash

tsv_files = $(addprefix results/,$(addsuffix .tsv,$(benchmarks)))
png_files = $(subst pdf,png,$(wildcard pdfs/*.pdf))

all: pdfs pngs tsvs

$(tsv_files):
	./benchmark/run.js "`basename $@ .tsv`" | tee $@

tsvs: $(tsv_files)

pdfs: $(tsv_files)
	./pdfs.r

pngs: $(png_files)

$(png_files): pngs/%.png: pdfs/%.pdf
	convert -density 300 $^ -resize 1024x $@

clean:
	rm -f results/*.tsv pngs/*.png pdfs/*.pdf

.PHONY: all pdfs pngs tsvs clean
