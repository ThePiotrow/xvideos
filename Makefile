DIRS := front gateway live mailer media permission token user  # List all directories

.PHONY: all $(DIRS)

all: $(DIRS)  # Default target

$(DIRS):
	@echo "Running npm install in directory $@"
	cd $@ && npm install
