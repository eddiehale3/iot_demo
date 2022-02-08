terraform {
    required_providers {
        google = {
            source = "hashicorp/google"
            version = "3.82.0"
        }
    }
}

provider "google" {
    project = var.projectId
    region  = var.region

    credentials = file("../credentials.json")
}

#################
# IOT RESOURCES #
#################
resource "google_pubsub_topic" "default-telemetry" {
    name = "default-telemetry"
}

resource "google_pubsub_topic" "default-deviceStatus" {
    name = "default-deviceStatus"
}

resource "google_cloudiot_registry" "iot-registry" {
    name = "demo-iot-registry"

    event_notification_configs {
        pubsub_topic_name = google_pubsub_topic.default-telemetry.id
    }

    state_notification_config = {
        pubsub_topic_name = google_pubsub_topic.default-deviceStatus.id
    }

    mqtt_config = {
        mqtt_enabled_state = "MQTT_ENABLED"
    }

    http_config = {
        http_enabled_state = "HTTP_ENABLED"
    }
}

resource "google_cloudiot_device" "iot-device" {
    name = "demo-iot-device"
    registry = google_cloudiot_registry.iot-registry.id

    credentials {
        public_key {
            format = "RSA_PEM"
            key = file("../src/device/certs/rsa_public.pem")
        }
    }
}

######################
# FUNCTION RESOURCES #
######################

# Used to add a timestamp to archive object, allowing function deployment updates
locals {
    timestamp = formatdate("YYMMDDhhmmss", timestamp())
}

resource "google_storage_bucket" "functions-bucket" {
    name            = "function-bucket-demo-7382917"
    force_destroy   = true
}

resource "google_storage_bucket_object" "archive" {
    name = "index-${local.timestamp}.zip"
    bucket = google_storage_bucket.functions-bucket.name
    source = "../src/function/function.zip"
}

resource "google_cloudfunctions_function" "function" {
    name        = "command-function"
    description = "Sends commands to device"
    runtime     = "nodejs16"
    
    entry_point             = "handler"
    project                 = var.projectId
    available_memory_mb     = 128
    timeout                 = 60
    source_archive_bucket   = google_storage_bucket.functions-bucket.name
    source_archive_object   = google_storage_bucket_object.archive.name
    trigger_http            = true

    # event_trigger {
    #     event_type = "google.pubsub.topic.publish"
    #     resource = "${google_pubsub_topic.default-telemetry.name}"
    # }
}

# IAM entry for all users to invoke the function
resource "google_cloudfunctions_function_iam_member" "invoker" {
    depends_on = [
        google_cloudfunctions_function.function
    ]
    project         = google_cloudfunctions_function.function.project
    region          = google_cloudfunctions_function.function.region
    cloud_function  = google_cloudfunctions_function.function.name

    role    = "roles/cloudfunctions.invoker"
    member  = "allUsers"
}

##################
# DATA RESOURCES #
##################
resource "google_storage_bucket" "temp-job-location" {
    name            = "streaming-iot-dataflow-bucket"
    force_destroy   = true
}

resource "google_dataflow_job" "stream-data" {
    name                = "streamingIOTJob"
    template_gcs_path   = "gs://dataflow-templates/latest/PubSub_to_BigQuery"
    temp_gcs_location   = "gs://${google_storage_bucket.temp-job-location.name}/temp"
    parameters = {
        inputTopic      = google_pubsub_topic.default-telemetry.id
        outputTableSpec = "${var.projectId}:${google_bigquery_dataset.default.dataset_id}.${google_bigquery_table.iot-data.table_id}"
    }
    on_delete = "cancel"
}

resource "google_bigquery_dataset" "default" {
    project                     = var.projectId
    dataset_id                  = "iot_demo_dataset"
    friendly_name               = "iot_demo_dataset"
    description                 = "This is the BQ dataset for running the iot streaming demo"
    location                    = "US"
    default_table_expiration_ms = 3600000
}

resource "google_bigquery_table" "iot-data" {
    dataset_id = google_bigquery_dataset.default.dataset_id
    table_id = "iot-data"

    deletion_protection = false

    schema = <<EOF
[
    {
        "name": "data",
        "type": "INTEGER",
        "mode": "NULLABLE",
        "description": "Test data sent by device"
    }
]
EOF
}
