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

    credentials = file("../experiment-231217-eba99ceda7e5.json")
}

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
        "name": "helloThere",
        "type": "STRING",
        "mode": "NULLABLE",
        "description": "Test column to verify schema"
    }
]
EOF
}

# resource "google_bigquery_table" "deadletter-table" {
#     dataset_id = google_bigquery_dataset.default.dataset_id
#     table_id = "deatletter-table"

#     deletion_protection = 
    
#     schema = <<EOF
# [
#     {

#     }
# ]
# EOF
# }