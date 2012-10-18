SHELL := /bin/bash

tsv_files = $(addprefix results/,$(addsuffix .tsv,$(benchmarks)))
png_files = $(subst pdf,png,$(wildcard pdfs/*.pdf))

all: fixtures results pdfs pngs

$(tsv_files):
	./benchmark/run.js "`basename $@ .tsv`" | tee $@

results: $(tsv_files)

pdfs: $(tsv_files)
	./pdfs.r

pngs: $(png_files)

$(png_files): pngs/%.png: pdfs/%.pdf
	convert -density 300 $^ -resize 1024x $@

clean:
	rm -f results/*.tsv pngs/*.png pdfs/*.pdf

fixtures: $(fixtures)

$(fixtures):
	curl -z '$@' -o '$@' "http://felixge.s3.amazonaws.com/12/`basename $@`"

.PHONY: all fixtures pdfs pngs results clean
