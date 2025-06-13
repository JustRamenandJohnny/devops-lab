terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

# Образ для сервера
resource "docker_image" "server" {
  name = "devops-lab-server"
  build {
    context = "../server"  # Путь к папке сервера
    dockerfile = "Dockerfile"
  }
}

# Контейнер сервера
resource "docker_container" "server" {
  name  = "server"
  image = docker_image.server.latest
  ports {
    internal = 3000  # Порт сервера в контейнере
    external = 3000  # Порт на хосте (localhost:5000)
  }
  volumes {
    host_path      = "C:/Users/user/devops-lab/server/db.sqlite"  # Путь к SQLite на Windows
    container_path = "/app/db.sqlite"  # Путь в контейнере
  }
}

# Образ для клиента (опционально)
resource "docker_image" "client" {
  name = "devops-lab-client"
  build {
    context = "../client"  # Путь к папке клиента
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "client" {
  name  = "client"
  image = docker_image.client.latest
  ports {
    internal = 3001
    external = 3001  # localhost:3000
  }
  depends_on = [docker_container.server]  # Ждём запуска сервера
}