
ROOT := $(shell pwd)
DEVICE := $(shell terraform output device_name) 
REGISTRY := $(shell terraform output device_registry) 
REGION := $(shell terraform output region) 

function:
	@echo 'Compressing function...'
	@cd src/function && npm i && zip -r function.zip . -x "*.DS_Store"

infra:
	@echo 'Deploying infrastructure...';
	@cd terraform && terraform apply -auto-approve && cd ..

destroy:
	@echo 'Destroying cloud resources...'
	@-cd terraform && terraform destroy -auto-approve && cd ../

