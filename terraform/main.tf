terraform {
    required_providers {
        google = {
            source = "hashicorp/google"
            version = "3.5.0"
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
}