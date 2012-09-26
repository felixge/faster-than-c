SHELL := /bin/bash

png_files = $(addsuffix .png, $(basename $(wildcard *.pdf)))

all: pngs

pngs: $(png_files)

%.png: %.pdf
	convert -density 300 $^ -resize 512x $@

.PHONY: all pngs
