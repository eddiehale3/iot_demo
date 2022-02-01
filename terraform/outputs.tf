output "device_name" {
    value = google_cloudiot_device.iot-device.num_id
}

output "device_registry" {
    value = google_cloudiot_registry.iot-registry.id
}

output "region" {
    value = var.region
}

output "function_endpoint" {
    value = google_cloudfunctions_function.function.https_trigger_url
}