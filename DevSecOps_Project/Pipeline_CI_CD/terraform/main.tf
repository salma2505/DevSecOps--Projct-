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

    
