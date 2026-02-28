FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 10001 app
USER app
ENV HOME=/home/app
ENV PATH="/home/app/.local/bin:${PATH}"

RUN curl -sSf https://install.spacetimedb.com | sh -s -- -y

EXPOSE 3000
CMD ["spacetime", "start", "--listen-addr", "0.0.0.0:3000", "--data-dir", "/home/app/.local/share/spacetime/data", "--non-interactive"]
