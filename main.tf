provider "kubernetes" {
  config_path = "/home/devops/.kube/config"
}

resource "kubernetes_namespace" "dev" {
  metadata {
    name = "dev-environment"
  }

  lifecycle {
    ignore_changes = [metadata]
  }
}

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

 
         
