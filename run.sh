docker compose down

rm -r database/data

# Ensure packages are installed in app directory
cd app
npm install
cd ..

docker compose build
docker compose up -d
