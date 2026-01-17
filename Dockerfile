# Dev mode with Bun
FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

EXPOSE 5174

# Run dev server with host binding for Docker
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
