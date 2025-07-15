#!/bin/bash

# Docker scripts for NaCinema

case "$1" in
  "build")
    echo "Building NaCinema Docker image..."
    docker build -t nacinema:latest .
    ;;
  
  "dev")
    echo "Starting NaCinema development environment..."
    docker-compose -f docker-compose.dev.yml up --build
    ;;
  
  "prod")
    echo "Starting NaCinema production environment..."
    docker-compose up --build -d
    ;;
  
  "stop")
    echo "Stopping NaCinema services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    ;;
  
  "logs")
    echo "Viewing logs..."
    docker-compose logs -f
    ;;
  
  "clean")
    echo "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    docker volume prune -f
    ;;
  
  "backup")
    echo "Creating MongoDB backup..."
    docker exec nacinema_mongo mongodump --out /backup/$(date +%Y%m%d_%H%M%S)
    ;;
  
  "restore")
    if [ -z "$2" ]; then
      echo "Usage: $0 restore <backup_directory>"
      exit 1
    fi
    echo "Restoring MongoDB from backup..."
    docker exec nacinema_mongo mongorestore /backup/$2
    ;;
  
  "shell")
    echo "Opening shell in app container..."
    docker exec -it nacinema_app /bin/sh
    ;;
  
  "mongo")
    echo "Opening MongoDB shell..."
    docker exec -it nacinema_mongo mongosh
    ;;
  
  *)
    echo "Usage: $0 {build|dev|prod|stop|logs|clean|backup|restore|shell|mongo}"
    echo ""
    echo "Commands:"
    echo "  build   - Build Docker image"
    echo "  dev     - Start development environment"
    echo "  prod    - Start production environment"
    echo "  stop    - Stop all services"
    echo "  logs    - View container logs"
    echo "  clean   - Clean up Docker resources"
    echo "  backup  - Create MongoDB backup"
    echo "  restore - Restore MongoDB from backup"
    echo "  shell   - Open shell in app container"
    echo "  mongo   - Open MongoDB shell"
    exit 1
    ;;
esac