# GCP IOT Core Device Stream Ingest Demo

This project contains an example of streaming IOT data from IoT Core to BigQuery Cloud Pub/Sub and Dataflow. 

# Usage

## Requirements

Before using this project, you must ensure the following pre-requisites are fulfilled: 

1. Terraform is [installed](#software-dependencies) on the machine where Terraform is executed.
2. The Service Account you execute with has the right [permissions](#security)
3. The necessary APIs are active on the project

## Security 

In order to execute this project you must have:

1. A Service Account with roles to [deploy GCP resources](#deploy-gcp-resources) using Terraform.
    - Documentation on Service Accounts can be found [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
2. A Service Account Key associated with the Service Account from #1. Then update `credentials` under `terraform/main.tf` to point to this file. 
    - [Creating and managing service account keys](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)


**NOTE:** The provided public/private key pairs under `src/device/certs` are for demonstration purposes and should ***NOT*** be used for production applications. To generate your own key pairs see [this documentation](https://cloud.google.com/iot/docs/how-tos/credentials/keys)

## Deploy GCP Resources

```bash
cd terraform/
terraform init
terraform apply -auto-approve
```

When cloud resources are no longer necessary be sure to tear them down to not incur further charges. 

```bash
terraform destroy
```

## Start Test Device

```bash
cd src/device
npm i
npm start
```

To stop the device use CTRL + C to exit the process. 
