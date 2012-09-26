SHELL := /bin/bash

tsv_files = $(wildcard 2-results/*.tsv)
png_files = $(addsuffix .png, $(basename $(wildcard *.pdf)))

$(info $(tsv_files))

all: pdfs pngs

pdfs: $(tsv_files)
	cd 3-pdfs && ./generate.r

pngs: $(png_files)

%.png: %.pdf
	convert -density 300 $^ -resize 512x $@

.PHONY: all pdfs pngs
