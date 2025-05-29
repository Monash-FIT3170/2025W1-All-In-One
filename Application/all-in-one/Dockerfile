FROM --platform=linux/amd64 node:18

RUN apt-get update && apt-get install -y curl bash wget libstdc++6 ca-certificates gnupg libcurl4 openssl libgssapi-krb5-2

# Install Meteor
RUN curl https://install.meteor.com/ | sh

ENV METEOR_ALLOW_SUPERUSER=true
ENV ROOT_URL="http://localhost:3000"
ENV PATH="/root/.meteor:${PATH}"

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN meteor npm install

EXPOSE 3000
CMD ["meteor", "run", "--allow-superuser"]