#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="ecommerce"
BACKEND_IMAGE="${1:-aslamdockerhub/ecommerce-backend:latest}"
FRONTEND_IMAGE="${2:-aslamdockerhub/ecommerce-frontend:latest}"

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

kubectl -n "${NAMESPACE}" set image deployment/ecommerce-backend backend="${BACKEND_IMAGE}"
kubectl -n "${NAMESPACE}" set image deployment/ecommerce-frontend frontend="${FRONTEND_IMAGE}"

kubectl -n "${NAMESPACE}" rollout status deployment/ecommerce-backend --timeout=180s
kubectl -n "${NAMESPACE}" rollout status deployment/ecommerce-frontend --timeout=180s

kubectl -n "${NAMESPACE}" get pods -o wide
kubectl -n "${NAMESPACE}" get svc
