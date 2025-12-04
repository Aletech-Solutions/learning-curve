#!/bin/bash

# XandLearning Deployment Script for Linux/Mac
# Usage: ./deploy.sh [dev|prod|stop|clean|logs|status]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${CYAN}  ╔═══════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}  ║         XandLearning Deployment           ║${NC}"
    echo -e "${CYAN}  ║      Algorithm Practice Platform          ║${NC}"
    echo -e "${CYAN}  ╚═══════════════════════════════════════════╝${NC}"
    echo ""
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker.${NC}"
        exit 1
    fi
}

init_environment() {
    if [ ! -f ".env" ]; then
        if [ -f "env.sample" ]; then
            cp env.sample .env
            echo -e "${GREEN}✅ Created .env file from env.sample${NC}"
        else
            echo -e "${YELLOW}⚠️  No env.sample found, creating default .env${NC}"
            cat > .env << EOF
FRONTEND_PORT=4173
BACKEND_PORT=4174
MONGODB_PORT=27117
NODE_ENV=development
EOF
            echo -e "${GREEN}✅ Created default .env file${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  Using existing .env file${NC}"
    fi
}

start_dev() {
    print_header
    echo -e "${YELLOW}🚀 Starting Development Environment...${NC}"
    echo ""

    check_docker
    init_environment

    echo -e "${CYAN}📦 Building containers...${NC}"
    docker-compose build

    echo ""
    echo -e "${CYAN}🐳 Starting services...${NC}"
    docker-compose up -d

    echo ""
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 5

    show_status

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ Development environment is ready!${NC}"
    echo ""
    echo -e "${CYAN}  🌐 Frontend:  http://localhost:4173${NC}"
    echo -e "${CYAN}  🔌 Backend:   http://localhost:4174${NC}"
    echo -e "${CYAN}  🗄️  MongoDB:   localhost:27117${NC}"
    echo ""
    echo -e "${YELLOW}  📝 Commands:${NC}"
    echo -e "     ./deploy.sh logs    - View logs"
    echo -e "     ./deploy.sh stop    - Stop services"
    echo -e "     ./deploy.sh status  - Check status"
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
}

start_prod() {
    print_header
    echo -e "${YELLOW}🚀 Starting Production Environment...${NC}"
    echo ""

    check_docker

    export NODE_ENV=production

    init_environment

    # Update for production
    sed -i.bak 's/NODE_ENV=development/NODE_ENV=production/' .env 2>/dev/null || \
    sed -i '' 's/NODE_ENV=development/NODE_ENV=production/' .env

    echo -e "${CYAN}📦 Building production containers...${NC}"
    docker-compose build --no-cache

    echo ""
    echo -e "${CYAN}🐳 Starting production services...${NC}"
    docker-compose up -d

    echo ""
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 10

    show_status

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ Production environment is ready!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
}

stop_services() {
    print_header
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"

    check_docker

    docker-compose down

    echo ""
    echo -e "${GREEN}✅ All services stopped${NC}"
}

clean_environment() {
    print_header
    echo -e "${YELLOW}🧹 Cleaning up environment...${NC}"
    echo ""

    check_docker

    read -p "⚠️  This will remove all containers, volumes, and data. Continue? (y/N) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${CYAN}Stopping containers...${NC}"
        docker-compose down -v --remove-orphans

        echo -e "${CYAN}Removing images...${NC}"
        docker-compose down --rmi local

        echo -e "${CYAN}Pruning unused resources...${NC}"
        docker system prune -f

        echo ""
        echo -e "${GREEN}✅ Cleanup complete${NC}"
    else
        echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
    fi
}

show_logs() {
    print_header
    echo -e "${YELLOW}📋 Showing logs (Ctrl+C to exit)...${NC}"
    echo ""

    check_docker

    docker-compose logs -f --tail=100
}

show_status() {
    echo ""
    echo -e "${CYAN}📊 Service Status:${NC}"
    echo ""

    check_docker

    docker-compose ps

    echo ""
    echo -e "${CYAN}🔍 Health Checks:${NC}"
    
    # Check Backend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:4174/api/health | grep -q "200"; then
        echo -e "  ${GREEN}✅ Backend API: Healthy${NC}"
    else
        echo -e "  ${RED}❌ Backend API: Not responding${NC}"
    fi

    # Check Frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:4173 | grep -q "200"; then
        echo -e "  ${GREEN}✅ Frontend: Healthy${NC}"
    else
        echo -e "  ${RED}❌ Frontend: Not responding${NC}"
    fi

    # Check MongoDB
    if docker exec xandlearning-mongodb mongosh --eval "db.runCommand('ping').ok" --quiet 2>/dev/null | grep -q "1"; then
        echo -e "  ${GREEN}✅ MongoDB: Healthy${NC}"
    else
        echo -e "  ${RED}❌ MongoDB: Not responding${NC}"
    fi
}

show_help() {
    print_header
    echo "Usage: ./deploy.sh <command>"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo "  dev     Start development environment"
    echo "  prod    Start production environment"
    echo "  stop    Stop all services"
    echo "  clean   Remove all containers, volumes, and images"
    echo "  logs    Show and follow container logs"
    echo "  status  Show service status and health"
    echo "  help    Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  ${BLUE}./deploy.sh dev${NC}     # Start development"
    echo -e "  ${BLUE}./deploy.sh logs${NC}    # View logs"
    echo -e "  ${BLUE}./deploy.sh stop${NC}    # Stop everything"
    echo ""
}

# Main
case "${1:-help}" in
    dev)    start_dev ;;
    prod)   start_prod ;;
    stop)   stop_services ;;
    clean)  clean_environment ;;
    logs)   show_logs ;;
    status) show_status ;;
    help)   show_help ;;
    *)      show_help ;;
esac

