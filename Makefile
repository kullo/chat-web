.PHONY: \
build build-prod build-for-electron \
serve serve-de \
test test-firefox test-safari testserver

NICE = nice -n 19
NG = node ./node_modules/@angular/cli/bin/ng
WEBPACK = node ./node_modules/webpack/bin/webpack.js
XLIFFMERGE = node ./node_modules/ngx-i18nsupport/dist/xliffmerge/xliffmerge

test: build-workers
	$(NG) test --sourcemaps=false --single-run

test-chromium: build-workers
	$(NG) test --sourcemaps=false --single-run --browsers Chromium

test-edge: build-workers
	$(NG) test --sourcemaps=false --single-run --browsers Edge

test-firefox: build-workers
	$(NG) test --sourcemaps=false --single-run --browsers Firefox

test-safari: build-workers
	$(NG) test --sourcemaps=false --single-run --browsers Safari

testserver: build-workers
	$(NICE) $(NG) test --poll 10000

serve: build-workers
	$(NICE) $(NG) serve --poll 10000

serve-de: build-workers
	$(NICE) $(NG) serve --poll 10000 --aot --i18nFile=src/locale/messages.de.xlf --locale=de

build: build-workers
	$(NG) build

build-prod: build-workers
	$(NG) build --prod

build-for-electron: build-workers
	$(NG) build --prod --base-href html

deploy: build-prod
	rsync -a --delete dist/ kullochads@ssh.cluster026.hosting.ovh.net:chat-web
	scp deployment/.htaccess kullochads@ssh.cluster026.hosting.ovh.net:chat-web

update-translations:
	$(NG) xi18n --output-path=src/locale --out-file=messages-source.xlf
	$(XLIFFMERGE) --profile src/locale/xliffmerge.profile.json

./workers/cryptoworker.js: ./workers/cryptoworker.ts \
	./workers/tsconfig.json \
	cryptoworker.webpack.conf.js \
	yarn.lock
	$(WEBPACK) --config cryptoworker.webpack.conf.js

build-workers: \
	./workers/cryptoworker.js
