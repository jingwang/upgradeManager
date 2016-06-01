# Upgrade Manager

The Upgrade Manager is a web application managing software upgrade for registered clients via mqtt.

## Installation

1. on a clean ubuntu 14.04 (64bit):
```
$ sudo su
$ apt-get install curl git vim
$ curl -sL https://deb.nodesource.com/setup_5.x | sudo bash -
$ apt-get update
$ apt-get install -y nodejs
$ apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
$ touch /etc/apt/sources.list.d/mongodb-org-3.0.list
$ echo 'deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
$ apt-get update
$ apt-get install g++ make mongodb-org libxml2-dev openssh-server tcpdump
```

2. install app
```
$ cd /usr/local/src
$ git clone https://github.com/jingwang/updateManager.git
$ cd updateManager
$ npm install
```

3. config app
```
$ cd /usr/local/src/updateManager
$ mkdir resources
$ npm run init-app
```

4. start up application in ssl mode (i.e., mqtt in ssl, application has user authentication)
```
$ cd /usr/local/src/updateManager
$ npm start
```
URL: http://localhost:5001
username: admin@gushenxing.com
password: gushenxing123

5. start up application in none-ssl mode (i.e., mqtt not in ssl, application does not have user authentication)
```
$ cd /usr/local/src/updateManager
$ npm run start-nossl
```
URL: http://localhost:5001

## Tools

#### to backup db:
```
$ cd /usr/local/src/updateManager
$ mkdir mongodump
$ mongodump -d upgradeManagerDev -o mongodump
```

#### to restore db:
```
$ mongorestore mongodump
```

#### to enable mqtt over tls, choose either METHOD 1 or METHOD 2.
* Note that the project contains all necessary files. The following instructions are for reference purpose.
* Note that for either method to work, you will need map your server's ip to the following domain name in your hosts file:
your_server_ip  mqtt.gushenxing.com

###### METHOD 1. Secure mqtt broker, with self-signed certificate
**Create mosca server ssl self-signed certificate for domain name: mqtt.gushenxing.com (openssl)**
```
$ openssl genrsa -out key.pem 2048
$ openssl req -new -key key.pem -out csr.pem
$ openssl req -x509 -days 365 -key key.pem -in csr.pem -out certificate.pem
```

**On the server**
1. Distribute the following files to the ssl folder:
key.perm
certificate.pem

2. Start broker with the following options:
keyPath: $path_to_key.perm
certPath: $path_to_certificate.pem

**On the client**
1. Connect to the mqtt.gushenxing.com (with self-signed certificate) with the following options:
username: (get username from config.js),
password: (get username from config.js),
rejectUnauthorized: false


###### METHOD 2. Secure mqtt broker, with CA signed certificate
**Create a self-sighed root certificate (i.e., becoming a ca (certificate authority)), and use this root certificate to sign server certificate request**

1. Create self-signed root certificate (ca certificate)
```
$ openssl req -new -x509 -days 3650 -keyout mqtt.gushenxing.com.ca.key -out mqtt.gushenxing.com.ca.crt
```
CN(Common Name): the ca's CN, use www.gushenxing.com
passphrase: this will be used every time you sign a certificate request, so remember this

2. Generate the private key for the server
```
$ openssl genrsa -des3 -out mqtt.gushenxing.com.server.key 1024
```

3. Generation of the certificate request for the server to be signed by the CA
```
$ openssl req -out mqtt.gushenxing.com.server.csr -key mqtt.gushenxing.com.server.key -new
```
CN(Common Name): this has to be the server's domain name or ip when it connects to the clients

4. Sign the server request through the CA and obtain the final certificate of the server
```
$ openssl x509 -req -in mqtt.gushenxing.com.server.csr -CA mqtt.gushenxing.com.ca.crt -CAkey mqtt.gushenxing.com.ca.key -CAcreateserial -out mqtt.gushenxing.com.server.crt -days 3650
```

5. Remove passphrase from server key (nodejs does not support passphrase at this point)
```
$ openssl rsa -in mqtt.gushenxing.com.server.key -out mqtt.gushenxing.com.server.unencripted.key
```

**On the server**

1. Distribute the following files to ssl folder:
mqtt.gushenxing.com.server.unencripted.key
mqtt.gushenxing.com.server.crt

2. Start broker with the following options:
```
-keyPath: $path_to_mqtt.gushenxing.com.server.unencripted.key
-certPath: $path_to_mqtt.gushenxing.com.server.crt
```

**On the Client**

1. Distribute the following file:
mqtt.gushenxing.com.ca.crt

2. This file will be used to check at connection if the server certificate is valid.

3. Connect to the mqtt.gushenxing.com broker with the following options:
username: $username_from_config.js,
password: $username_from_config.js,
caPaths: [$path_to_mqtt.gushenxing.com.ca.crt]
