DIRS := gateway live mailer media token user  # List all directories

.PHONY: all $(DIRS)

all: $(DIRS)  # Default target

$(DIRS):
	@echo "Running npm install in directory $@"
	cd $@ && npm install
