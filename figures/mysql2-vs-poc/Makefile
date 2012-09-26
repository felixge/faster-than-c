SHELL := /bin/bash

PNGS = $(addsuffix .png, $(basename $(wildcard *.pdf)))

ALL: $(PNGS)

%.png: %.pdf
	convert $^ -resize 512x $@

.PHONY: ALL
