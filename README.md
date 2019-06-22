# Lambda Manager

[![Build Status](https://travis-ci.org/Kerron-Hutton/lambda-manager.svg?branch=master)](https://travis-ci.org/Kerron-Hutton/lambda-manager)
[![GitHub issues](https://img.shields.io/github/issues/Kerron-Hutton/lambda-manager.svg)](https://github.com/Kerron-Hutton/lambda-manager/issues)
[![GitHub stars](https://img.shields.io/github/stars/Kerron-Hutton/lambda-manager.svg)](https://github.com/Kerron-Hutton/lambda-manager/stargazers)
[![GitHub license](https://img.shields.io/github/license/Kerron-Hutton/lambda-manager.svg)](https://github.com/Kerron-Hutton/lambda-manager/blob/master/LICENSE)
[![GitHub forks](https://img.shields.io/github/forks/Kerron-Hutton/lambda-manager.svg)](https://github.com/Kerron-Hutton/lambda-manager/network)

Lambda Builder is a nodeJs cli that can be used to create a typescript lambda project consisting of TsLinting, serverless and npm configurations. The cli can also deploy/remove lambdas to/from aws using serverless architecture. Before lambdas are deployment the project is linted against rules specified inside a tslint.json file. If linting is failed the project will not be deployed.

### Prerequisites

* [Serverless](https://serverless.com/framework/docs/providers/aws/guide/installation/)

1. **Install**

```bash
$ npm install -g lambda-manager
```

2. **Create Lambda/Service**

```bash
# Creates a lambda with application name `my-app`, service name `my-app-service` in path `my-app-lambda`
lam create -a my-app -n my-app-service -p my-app-lambda
```

3. **Deploy Lambda/Service**

```bash
# Use this to quickly deploy changes to aws
lam deploy
```

4. **Remove Lambda/Service**

```bash
# Use this to remove all functions and resources configured in serverless.yml
lam remove
```

5. **Help**

```bash
# Use this to access help text
lam -h or lam --help
```

**Note**  The cli can be invoked with either `lam`or `lambda-manager`

## Contributing

1. Fork it!
1. Create your feature branch: git checkout -b my-new-feature
1. Commit your changes: git commit -am 'Add some feature'
1. Push to the branch: git push origin my-new-feature
1. Submit a pull request :D


## Licensing
Lambda Manager is licensed under the [Apache 2.0 License.](https://www.apache.org/licenses/LICENSE-2.0)

All files located in the node_modules and external directories are externally maintained libraries used by this software which have their own licenses; we recommend you read them, as their terms may differ from the terms in the Apache 2.0 License.