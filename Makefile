
# set the top dir
TOP=$(CURDIR)
include $(TOP)/Makefile.defs

# include libplanconverterjs
dir := libplanconverterjs
include $(dir)/local.mk

# clean everything
.PHONY: clean $(CLEAN) $(addsuffix .clean, $(DIRS))
clean: $(CLEAN) $(addsuffix .clean, $(DIRS))

# clean the directories
.SECONDEXPANSION:
$(addsuffix .clean, $(DIRS)): $$(addsuffix .clean,$$(filter $$(basename $$@)/%,$(DIRS))) \
	| $(CLEAN)
	@echo "Remove $(subst $(TOP),,$(basename $@))."
	@-$(RMDIR) -f $(basename $@)

# include general targets
include $(TOP)/Makefile.targets
