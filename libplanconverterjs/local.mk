
# handle dir var
sp       		:= $(sp).x
dirstack_$(sp) 	:= $(d)
d				:= $(dir)

# create the libplanconverter js library

NAME_$(d)=libplanconverter.js

SRCDIR_$(d)		:= $(d)/src
GENDIR_$(d)		:= $(TOP)/gen/$(d)
DIRS			:= $(DIRS) $(GENDIR_$(d))
JSFILES_$(d) 	:= $(shell find $(SRCDIR_$(d)) -name "*.js" | sort)
JSGEN_$(d)		:= config.js

all: $(JSPUBLIC)/$(NAME_$(d))

$(JSPUBLIC)/$(NAME_$(d)): $(JSFILES_$(d)) $(addprefix $(GENDIR_$(d))/,$(JSGEN_$(d))) | $(JSPUBLIC) 
	$(generate-js)

$(GENDIR_$(d))/config.js: | $(GENDIR_$(d))
	@$(RM) -f "$@"
	@$(ECHO) "planconverterjs.config = {};" >> "$@"
	@$(ECHO) "planconverterjs.config.host = '$(HOST)';" >> "$@"
	@$(ECHO) "planconverterjs.config.port = $(PORT);" >> "$@"
	@$(ECHO) "planconverterjs.config.external_port = $(EXT_PORT);" >> "$@"

.SECONDEXPANSION:
CLEAN := $(CLEAN) $(d).clean
$(d).clean: | print.$$@
	@-$(RM) -f $(JSPUBLIC)/$(NAME_$(basename $@))
	@-$(RM) -f $(addprefix $(GENDIR_$(basename $@))/,$(JSGEN_$(basename $@)))

# reset dir var
d	:= $(dirstack_$(sp))
sp	:= $(basename $(sp))
