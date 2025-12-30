#!/bin/sh

echo "Waiting for database..."
until nc -z database 5432; do
  sleep 1
done

echo "Database is up"

echo "Running migrations..."
npm run migrate

echo "Running seed data..."
npm run seed

echo "Starting backend..."
npm start
