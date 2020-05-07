const { expect } = require('chai');
const { startApiBuilder, stopApiBuilder, requestAsync, sendToElasticsearch, getRandomInt } = require('./_base');
const fs = require('fs');

describe('Endpoints', function () {
	this.timeout(30000);
	let server;
	let auth;
	const indexName = `test_index_${getRandomInt(9999)}`;

	/**
	 * Start API Builder.
	 */
	before(() => {
		return new Promise(function (resolve, reject) {
			server = startApiBuilder();
			auth = {
				user: server.apibuilder.config.apikey || 'test',
				password: ''
			};
			server.apibuilder.config.testElasticIndex = indexName;
			elasticConfig = server.apibuilder.config.pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'].elastic;
			server.started
				.then(() => {
					const entryset = require('./documents/basic/search_test_documents');
					sendToElasticsearch(elasticConfig, indexName, entryset)
						.then(() => {
							resolve();
						});
				});
		});
	});

	/**
	 * Stop API Builder after the tests.
	 */
	after(() => stopApiBuilder(server));

	describe('getinfo', () => {
		it('[getinfo-0001] Execute a search without a limit including all requests from instance-1', () => {
			return requestAsync({
				method: 'GET',
				uri: `http://localhost:${server.apibuilder.port}/api/elk/v1/api/router/service/instance-1/ops/any/c9705e5ecd000322778d2ec4/*/getinfo`,
				auth: auth,
				json: true
			}).then(({ response, body }) => {
				expect(response.statusCode).to.equal(200);
				expect(body).to.be.an('Array');
				expect(body).to.have.lengthOf(1);
				expect(body[0].details).to.be.an('Object');
				expect(body[0].details).to.have.property('uri');
				expect(body[0].details.uri).to.equal('/healthcheck');
				expect(body[0].details).to.have.property('status');
				expect(body[0].details.status).to.equal(200);
				expect(body[0].details).to.have.property('statustext');
				expect(body[0].details.statustext).to.equal('OK');
				expect(body[0].rheaders).to.be.an('Array');
				expect(body[0].rheaders).to.have.lengthOf(8);
				expect(body[0].rheaders[0].Host).to.equal('api-env.demo.axway.com:8080');
				expect(body[0].sheaders).to.be.an('Array');
				expect(body[0].sheaders).to.have.lengthOf(11);
				expect(body[0].sheaders[0].Date).to.equal('Tue, 05 May 2020 15:10:27 GMT');

			});
		});

		it.only('[getinfo-0002] should fail with corelation ID from a different instance', () => {
			debugger;
			return requestAsync({
				method: 'GET',
				uri: `http://localhost:${server.apibuilder.port}/api/elk/v1/api/router/service/instance-1/ops/any/c9705e5ecd000322778d2ec4/*/getinfo`,
				auth: auth,
				json: true
			}).then(({ response, body }) => {
				expect(response.statusCode).to.equal(200);
				expect(body).to.equal('invalid schema type: opevent');
				

			});
		});
	});


})

