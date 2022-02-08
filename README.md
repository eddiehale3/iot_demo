# GCP IOT Core Device Stream Ingest Demo

This project contains an example of streaming IOT data from IoT Core to BigQuery Cloud Pub/Sub and Dataflow. 

# Usage

## Architecture

![](/resources/IOT_Core_Device_Stream_Ingest_Demo.png)

## Requirements

Before using this project, you must ensure the following pre-requisites are fulfilled: 

1. Terraform is [installed](#software-dependencies) on the machine where Terraform is executed.
2. The Service Account you execute with has the right [permissions](#security)
3. The necessary APIs are active on the project

## Security 

In order to execute this project you must have:

1. A Service Account with roles to [deploy GCP resources](#deploy-gcp-resources) using Terraform.
    - Documentation on Service Accounts [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
    - Roles needed:
        - roles/bigquery.admin
        - roles/cloudfunctions.admin
        - roles/cloudiot.admin
        - roles/dataflow.admin
        - roles/pubsub.admin
        - roles/storage.admin
2. A Service Account Key associated with the Service Account from #1. Then update `credentials` under `terraform/main.tf` to point to this json file. 
    - [Creating and managing service account keys](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)


**NOTE:** The provided public/private key pairs under `src/device/certs` are for demonstration purposes and should ***NOT*** be used for production applications. To generate your own key pairs see [this documentation](https://cloud.google.com/iot/docs/how-tos/credentials/keys)

## Deploy GCP Resources

Before deploying resources, be sure to update PROJECT_ID with your Google Cloud Project ID in `terraform/variables.tf` and update the default region, if necessary. 

1. Build function archive file

```bash
make function
```

2. Deploy infrastructure
```bash
make infra
```

## Start Test Device

Before starting the device, be sure to update PROJECT_ID with your Google Cloud Project ID in `src/device/index.js`.  

```bash
cd src/device
npm i
npm start
```

To stop the device use CTRL + C to exit the process. 

## Update device 

To make the device start counting in the opposite direction, simply send a POST request to the URL provided by Cloud Functions with the below body:

```json
{
    "increment": false
}
```

The default device behavior starts at 50 and increments. 

## Cleanup

When cloud resources are no longer necessary be sure to tear them down to not incur further charges. 

```bash
make destroy
```
