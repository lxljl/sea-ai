const path = require('path')
var prod = process.env.NODE_ENV === 'production'

module.exports = {
	wpyExt: '.wpy',
	eslint: false,
	cliLogs: true,
	// build: {
	// 	web: {
	// 		htmlTemplate: path.join('src', 'index.template.html'),
	// 		htmlOutput: path.join('web', 'index.html'),
	// 		jsOutput: path.join('web', 'index.js')
	// 	}
	// },
	resolve: {
		alias: {
			'@': path.join(__dirname, 'src')
		},
		aliasFields: ['wepy', 'weapp'],
		modules: ['node_modules']
	},
	compilers: {
		pug: {},
		stylus: {
			compress: true
		},
		// typescript: {
        //     compilerOptions: {
        //         module: 'system'
        //     }
        // },
		babel: {
			sourceMap: true,
			presets: [
				'env'
			],
			plugins: [
				'babel-plugin-transform-class-properties',
				'transform-export-extensions',
				'syntax-export-extensions'
			]
		}
	},
	plugins: {
		axios: {},
		px2units: {
			filter: /\.wxss$/
		},
		autoprefixer: {
			filter: /\.(wxss|stylus|css)$/,
			config: {
				browsers: ['last 11 iOS versions']
			}
		},
	},
	appConfig: {
		noPromiseAPI: ['createSelectorQuery']
	}
}

if(prod){

	module.exports.cliLogs = false
	
	delete module.exports.compilers.babel.sourcesMap;

	// 压缩stylus
	module.exports.compilers['stylus'] = {
		compress: true
	}

	// 压缩js
	module.exports.plugins = {
		axios: {},
		uglifyjs: {
			filter: /\.js$/,
			config: {}
		},
		px2units: {
			filter: /\.wxss$/
		},
		autoprefixer: {
			filter: /\.(wxss|stylus|css)$/,
			config: {
				browsers: ['last 11 iOS versions']
			}
		},
		imagemin: {
			filter: /\.(jpg|png|jpeg)$/,
			config: {
				jpg: {
					quality: 80
				},
				png: {
					quality: 80
				}
			}
		}
	}
}

