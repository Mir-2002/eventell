# Eventell in one image: nginx serves the SPA and proxies /api to Spring Boot and
# /realms, /resources and /admin to Keycloak; Postgres holds both databases.
#   docker build -t eventell .
#   docker run -p 8080:8080 -v eventell-data:/var/lib/postgresql/data eventell

ARG KEYCLOAK_VERSION=26.4

# --- Frontend SPA ---
FROM node:24-bookworm AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
# react-day-picker 8 declares a React <=18 peer; it works with React 19
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Keycloak login theme (keycloakify packages the jar with Maven) ---
FROM node:24-bookworm AS theme
RUN apt-get update \
    && apt-get install -y --no-install-recommends maven openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*
# The theme's CSS imports ../../frontend/src/index.css, which resolves packages from frontend/node_modules
COPY --from=frontend /src/frontend /src/frontend
WORKDIR /src/keycloak-theme
COPY keycloak-theme/package.json keycloak-theme/package-lock.json ./
RUN npm ci
COPY keycloak-theme/ ./
RUN npm run build-keycloak-theme

# --- Spring Boot API ---
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /src/backend
COPY backend/pom.xml ./
COPY backend/src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -DskipTests package

# --- Keycloak, pre-built for Postgres with the theme installed ---
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS keycloak
COPY --from=theme /src/keycloak-theme/dist_keycloak/eventell-keycloak-theme.jar /opt/keycloak/providers/
ENV KC_DB=postgres
RUN /opt/keycloak/bin/kc.sh build

# --- Runtime ---
FROM eclipse-temurin:21-jre-noble
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql nginx supervisor \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default \
    && ln -s /usr/lib/postgresql/*/bin /usr/local/pgbin

COPY --from=keycloak /opt/keycloak /opt/keycloak
COPY backend/keycloak/ /opt/keycloak/data/import/
COPY --from=backend /src/backend/target/*.jar /opt/eventell/eventell.jar
COPY --from=frontend /src/frontend/dist /usr/share/eventell

COPY docker/nginx.conf /etc/nginx/conf.d/eventell.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/eventell.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV DB_PASSWORD=eventell \
    KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak \
    KC_DB_USERNAME=postgres \
    KC_HTTP_ENABLED=true \
    KC_HTTP_PORT=9090 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded \
    KC_BOOTSTRAP_ADMIN_USERNAME=admin \
    KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
    JAVA_OPTS_KC_HEAP="-Xms64m -Xmx512m" \
    SERVER_PORT=8081 \
    SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/eventell \
    SPRING_DATASOURCE_USERNAME=postgres \
    SPRING_JPA_SHOW_SQL=false \
    SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWKSETURI=http://localhost:9090/realms/eventell-app/protocol/openid-connect/certs

VOLUME /var/lib/postgresql/data
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
