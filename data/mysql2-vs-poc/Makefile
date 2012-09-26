SHELL := /bin/bash

tsv_files = $(wildcard esults/*.tsv)
png_files = $(subst pdf,png,$(wildcard pdfs/*.pdf))

$(info $(png_files))

all: pdfs pngs

pdfs: $(tsv_files)
	cd pdfs && ./generate.r

pngs: $(png_files)

pngs/%.png: pdfs/%.pdf
	convert -density 300 $^ -resize 512x $@

.PHONY: all pdfs pngs
