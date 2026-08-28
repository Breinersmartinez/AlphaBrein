.PHONY: help up down restart build logs ps clean clean-all env-example

# Default target
help:
	@echo "AlphaBrein - Docker Management Commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Main targets:"
	@echo "  up              Start all services (detached)"
	@echo "  down            Stop and remove all services"
	@echo "  restart         Restart all services"
	@echo "  build           Build all images (no cache)"
	@echo "  build-fast      Build all images (with cache)"
	@echo ""
	@echo "Monitoring:"
	@echo "  up-mon          Start with monitoring stack (Prometheus, Grafana, Graphite)"
	@echo "  down-mon        Stop monitoring stack only"
	@echo ""
	@echo "Logs & Status:"
	@echo "  logs            Show logs from all services"
	@echo "  logs-backend    Show backend logs"
	@echo "  logs-frontend   Show frontend logs"
	@echo "  logs-db         Show database logs"
	@echo "  logs-prom       Show Prometheus logs"
	@echo "  logs-grafana    Show Grafana logs"
	@echo "  ps              Show running containers"
	@echo "  status          Show service health status"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean           Remove stopped containers and unused networks"
	@echo "  clean-all       Remove everything (containers, volumes, images, networks)"
	@echo "  clean-volumes   Remove all volumes (DATA LOSS!)"
	@echo "  clean-images    Remove all project images"
	@echo ""
	@echo "Development:"
	@echo "  env-example     Copy .env.example to .env"
	@echo "  shell-backend   Open shell in backend container"
	@echo "  shell-frontend  Open shell in frontend container"
	@echo "  shell-db        Open psql in database"
	@echo ""
	@echo "Database:"
	@echo "  db-backup       Backup database to ./backups/"
	@echo "  db-restore      Restore database from ./backups/latest.dump"
	@echo "  db-migrate      Run Flyway/Liquibase migrations (if configured)"

# Main operations
up: env-check
	docker compose up -d

up-mon: env-check
	docker compose --profile monitoring up -d

down:
	docker compose down

down-mon:
	docker compose --profile monitoring down

restart: down up

restart-mon: down-mon up-mon

# Build operations
build:
	docker compose build --no-cache

build-fast:
	docker compose build

build-backend:
	docker compose build --no-cache backend

build-frontend:
	docker compose build --no-cache frontend

# Logs
logs:
	docker compose logs -f --tail=100

logs-backend:
	docker compose logs -f --tail=100 backend

logs-frontend:
	docker compose logs -f --tail=100 frontend

logs-db:
	docker compose logs -f --tail=100 postgres

logs-prom:
	docker compose logs -f --tail=100 prometheus

logs-grafana:
	docker compose logs -f --tail=100 grafana

logs-graphite:
	docker compose logs -f --tail=100 graphite

# Status
ps:
	docker compose ps

status:
	@echo "=== Container Status ==="
	@docker compose ps
	@echo ""
	@echo "=== Health Checks ==="
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Cleanup
clean:
	docker compose down --remove-orphans
	docker network prune -f

clean-all:
	docker compose down -v --remove-orphans --rmi all
	docker system prune -af --volumes

clean-volumes:
	@echo "WARNING: This will delete ALL data (database, prometheus, grafana, graphite)!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker volume prune -f; \
	fi

clean-images:
	docker compose down --rmi all
	docker image prune -af

# Environment
env-example:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env from .env.example - Please edit it with your values"; \
	else \
		echo ".env already exists"; \
	fi

env-check:
	@if [ ! -f .env ]; then \
		echo "ERROR: .env file not found. Run 'make env-example' first."; \
		exit 1; \
	fi

# Shell access
shell-backend:
	docker compose exec backend bash

shell-frontend:
	docker compose exec frontend sh

shell-db:
	docker compose exec postgres psql -U alphabrein -d alphabrein

shell-prom:
	docker compose exec prometheus sh

shell-grafana:
	docker compose exec grafana sh

# Database operations
db-backup:
	@mkdir -p backups
	@docker compose exec -T postgres pg_dump -U alphabrein -d alphabrein --no-owner --no-acl > backups/alphabrein_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup saved to backups/"

db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make db-restore FILE=backups/alphabrein_20240101_120000.sql"; \
		exit 1; \
	fi
	@docker compose exec -T postgres psql -U alphabrein -d alphabrein < $(FILE)
	@echo "Restored from $(FILE)"

db-migrate:
	@echo "No migration tool configured. Add Flyway/Liquibase to backend if needed."

# Quick development cycle
dev: up logs

dev-mon: up-mon logs

# Production-like
prod-build:
	docker compose -f docker compose.yml -f docker compose.prod.yml build --no-cache

prod-up:
	docker compose -f docker compose.yml -f docker compose.prod.yml up -d

prod-down:
	docker compose -f docker compose.yml -f docker compose.prod.yml down