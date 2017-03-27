
#Development Configuration
1. Install Node JS
[Node JS Install](https://nodejs.org/en/)
2. If testing locally, install local http server
	1. Open command line and execute the following:

```
npm install http-server -g
```

2. Install Gulp
	1. Open command line and execute the following:

```
npm install -g gulp
```

3. Navigate to root folder and open command prompt at that location.
4. Install project dependencies from package.json

```
npm install --save-dev gulp
```

5. Install Gulp dependencies used in gulpfile.js

```
npm install jshint gulp-jshint gulp-concat gulp-inject gulp-jsbeautifier gulp-if yargs del gulp-debug run-sequence bluebird gulp-include gulp-uglify --save-dev
```

#Building Source Code
1. Navigate to root folder and open command prompt at that location.
2. Type the following and press enter:

```
gulp [build|build-min] --[production|staging] --[testing] --[nobundle=comma separated list of files]
```

| Option        | Description   | Required |
| ------------- |-------------| ----------|
| build     | Recreates target (staging/production) folder and injects required html/js into folder structure and index.html | Yes |
| build-min      | Same as build except for bundles non-vendor js into one file.  This is the more optimized build.  | Yes | 
| production     | Targets production folder. | No |
| staging     | Targets staging folder.  This is the default target if no target is specified in build. | No |
| testing     | Replaces web service calls with hard coded test data to test locally. | No |

**NOTE:** Your staging/production folder will be deleted and recreated locally.  However, this should not be an issue because these folders are not to be modified directly by you and are procedurally generated.

