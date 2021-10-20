# IOT Core Streaming Demo

This project contains an example of streaming IOT data from IoT Core to BigQuery. 

# Usage

## Deploy GCP Resources

```bash
cd terraform/
terraform init
terraform apply 
```

When cloud resources are no longer necessary be sure to tear them down to not incur further charges. 

```bash
terraform destroy
```

## Requirements

Before using this project, you must ensure the following pre-requisites are fulfilled: 

1. Terraform is [installed](#software-dependencies) on the machine where Terraform is executed.
2. The Service Account you execute with has the right [permissions](#security)
3. The necessary APIs are active on the project


### Security 

In order to execute this project you must have a Service Account with the following project roles:

- roles/dataflow.admin

