DATABASE_URL:=postgres://postgres:postgres@localhost:5432/postgres

.PHONY: run-postgres
run-postgres:
	@echo Starting postgres container
	-docker run \
		-e POSTGRES_PASSWORD=postgres \
		-v pgdata:/var/lib/postgresql/data \
		-p 5432:5432 \
		postgres:15.1-alpine

.PHONY: run-api-python
run-api-python:
	@echo "Starting Django backend"
	cd api-python && \
	DATABASE_URL=${DATABASE_URL} \
	python manage.py run