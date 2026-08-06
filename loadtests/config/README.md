# loadtests/config

k6 scripts read the target from `__ENV.BASE_URL` — never hardcode a host in a scenario file.

## Running locally (Windows/Mac Docker Desktop)

```
docker run --rm -e BASE_URL=http://host.docker.internal:5000 -v "$(pwd)/loadtests:/scripts" grafana/k6:latest run /scripts/scenarios/<scenario>.js
```

`host.docker.internal` is required (not `localhost`, and `--network host` is not supported the same
way as on Linux) when the target runs on the Docker Desktop host itself. On a native Linux runner
(GitHub Actions), `localhost` works directly, or point `BASE_URL` at whatever service network alias
the backend container uses in that job.

## Never target production

k6 must target the local docker-compose stack (or a future dedicated staging deploy) only. The
current Render/Neon hosting is free-tier and not sized for load testing, and `express-rate-limit`
will return 429s before real capacity is reached unless raised for the test environment. See the
production-readiness plan, Phase 4, for the full rationale.
