
# handle dir var
sp       		:= $(sp).x
dirstack_$(sp) 	:= $(d)
d				:= $(dir)

# create the libplanconverter js library

NAME_$(d)=libplanconverter.js

SRCDIR_$(d)		:= $(d)/src
JSFILES_$(d) 	:= $(shell find $(SRCDIR_$(d)) -name "*.js")

all: $(JSPUBLIC)/$(NAME_$(d))

$(JSPUBLIC)/$(NAME_$(d)): $(JSFILES_$(d)) | $(JSPUBLIC)
	$(generate-js)

.SECONDEXPANSION:
CLEAN := $(CLEAN) $(d).clean
$(d).clean: | print.$$@
	@-$(RM) -f $(JSPUBLIC)/$(NAME_$(basename $@))

# reset dir var
d	:= $(dirstack_$(sp))
sp	:= $(basename $(sp))
