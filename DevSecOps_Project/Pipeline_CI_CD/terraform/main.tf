provider "kubernetes" {
  host                   = "https://192.168.49.2:8443"
  cluster_ca_certificate = file("/home/devops/.minikube/profiles/minikube/apiserver.crt")
  client_key             = file("/home/devops/.minikube/profiles/minikube/client.key")
  client_certificate     = file("/home/devops/.minikube/profiles/minikube/client.crt")
}

# Define Kubernetes Namespace
resource "kubernetes_namespace" "devsecops" {
  metadata {
    name = "devsecops"
  }

  lifecycle {
    ignore_changes = [
      metadata,
    ]
  }
}

# Define Kubernetes Secret (Hardcoded in YAML)
resource "kubernetes_secret" "flask_secret" {
  metadata {
    name      = "flask-secret"
    namespace = kubernetes_namespace.devsecops.metadata[0].name
  }
  
  data = {
    "SECRET_KEY" = "Secret378@"
  }
}

# Define Kubernetes Deployment for Flask App
resource "kubernetes_deployment" "flask_app" {
  metadata {
    name      = "flask-app"
    namespace = kubernetes_namespace.devsecops.metadata[0].name
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

          env {
            name  = "SECRET_KEY"
            value_from {
              secret_key_ref {
                name = "flask-secret"
                key  = "SECRET_KEY"
              }
            }
          }
        }
      }
    }
  }
}

# Define Kubernetes Service for Flask App
resource "kubernetes_service" "flask_service" {
  metadata {
    name      = "flask-service"
    namespace = kubernetes_namespace.devsecops.metadata[0].name
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

