DIRS := gateway live media token user  # List all directories

.PHONY: all $(DIRS) stop start build

# Default target

all: $(DIRS)  # Default target

$(DIRS):
	@echo "Running npm install in directory $@"
	cd $@ && npm install

stop:
	@for dir in $(DIRS); do \
		echo "Stopping $$dir"; \
		cd $$dir && npm run stop && cd ..; \
	done

start:
	@for dir in $(DIRS); do \
		echo "Starting $$dir"; \
		cd $$dir && npm run start && cd ..; \
	done

build:
	@for dir in $(DIRS); do \
		echo "Building $$dir"; \
		cd $$dir && npm run build && cd ..; \
	done

dev:
	@for dir in $(DIRS); do\
		echo "Starting Dev $$dir; \
		cd $$dir && npm run start:dev && cd ..;\
	done

# PM2 commands

pm2-start:
	@for dir in $(DIRS); do \
		echo "Starting $$dir"; \
		cd $$dir && npm run pm2:start && cd ..; \
	done

pm2-stop:
	@for dir in $(DIRS); do \
		echo "Stopping $$dir"; \
		cd $$dir && npm run pm2:stop && cd ..; \
	done
