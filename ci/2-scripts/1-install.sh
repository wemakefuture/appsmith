set -o errexit
set -o xtrace

UBUNTU_RELEASE="$(lsb_release -dc | awk '$1 == "Codename:" { print $2 }')"
echo "UBUNTU_RELEASE: $UBUNTU_RELEASE"

wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" \
	| tee /etc/apt/sources.list.d/mongodb-org-4.4.list

add-apt-repository --yes ppa:redislabs/redis

apt-get update --yes

# Installing `gettext-base` just for `envsubst` command.
apt-get install --yes maven gettext-base curl mongodb-org-{server,shell} redis nginx postgresql

mkdir -p "$CODEBUILD_SRC_DIR/logs"

# Start a MongoDB server.
nohup mongod > "$CODEBUILD_SRC_DIR/logs/mongod.log" & disown $!
export APPSMITH_MONGODB_URI="mongodb://localhost:27017/appsmith"

# Start a Redis server.
nohup redis-server > "$CODEBUILD_SRC_DIR/logs/redis.log" & disown $!
export APPSMITH_REDIS_URL="redis://localhost:6379"

# Start a PostgreSQL server.
pg_ctlcluster 12 main start
su -c "psql --username=postgres --command=\"alter user postgres with password 'postgres'\"" postgres
PGPASSWORD=postgres psql \
	--username=postgres \
	--host=localhost \
	--single-transaction \
	--variable=ON_ERROR_STOP=ON \
	--file="$CODEBUILD_SRC_DIR/app/client/cypress/init-pg-dump-for-test.sql"

# Start an nginx server.
nginx
