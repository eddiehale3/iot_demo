
ROOT := $(shell pwd)
DEVICE := $(shell terraform output device_name) 
REGISTRY := $(shell terraform output device_registry) 
REGION := $(shell terraform output region) 

infra:
	@echo 'Deploying infrastructure...';
	@cd terraform && terraform apply -auto-approve && cd ..

device:
	@echo 'Updating device with default configuration...';
	cd terraform; \
	DEVICE := $(shell terraform output device_name)
	gcloud iot devices configs update --region=$(DEVICE) --registry=$(REGISTRY) \
		--device=$(DEVICE) --config-file=$(ROOT)/src/device/device-config.json;
destroy:
	@echo 'Destroying cloud resources...'
	@-cd terraform && terraform destroy -auto-approve && cd ../

test:
	@cd terraform; \
	DEVICE:=$(shell terraform output); \
	echo $(DEVICE)
