SHELL := /bin/bash

PNGS = $(addsuffix .png, $(basename $(wildcard *.pdf)))

ALL: $(PNGS)

%.png: %.pdf
	convert -density 300 $^ -resize 512x $@

.PHONY: ALL
