terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.21"
    }
  }
}

# Provider for Docker (Required for Minikube)
provider "docker" {}

# Create a Minikube container (Using Docker)
resource "docker_container" "minikube" {
  name  = "minikube"
  image = "kicbase/stable:v0.0.35"
  privileged = true
  restart    = "unless-stopped"

  volumes {
    volume_name    = "minikube-data"
    container_path = "/var/lib/minikube"
  }

  ports {
    internal = 8443
    external = 8443
  }
}

# Kubernetes Provider (After Minikube is Running)
provider "kubernetes" {
  config_path = "/home/devops/.kube/config"
}

# Kubernetes Namespace
resource "kubernetes_namespace" "dev" {
  metadata {
    name = "dev-environment"
  }

  lifecycle {
    ignore_changes = [metadata]
  }
}

# Flask App Deployment
resource "kubernetes_deployment" "flask_app" {
  metadata {
    name      = "flask-app"
    namespace = kubernetes_namespace.dev.metadata[0].name
    labels = {
      app = "flask"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "flask"
      }
    }

    template {
      metadata {
        labels = {
          app = "flask"
        }
      }

      spec {
        container {
          name  = "flask-container"
          image = "salma2505/flask-app:latest"

          port {
            container_port = 5000
          }

          resources {
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }
        }
      }
    }
  }
}

# Kubernetes Service for Flask App
resource "kubernetes_service" "flask_service" {
  metadata {
    name      = "flask-service"
    namespace = kubernetes_namespace.dev.metadata[0].name
  }

  spec {
    selector = {
      app = "flask"
    }

    port {
      port        = 80
      target_port = 5000
    }

    type = "NodePort"
  }
}

 
         
